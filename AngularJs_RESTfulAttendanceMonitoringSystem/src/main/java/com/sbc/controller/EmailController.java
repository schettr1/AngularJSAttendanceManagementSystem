package com.sbc.controller;

import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileOutputStream;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jms.core.JmsTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.gson.Gson;
import com.sbc.entity.Email;
import com.sbc.exception.FileUploadException;
import com.sbc.exception.InvalidEmailException;
import com.sbc.exception.InvalidEmployeeException;
import com.sbc.jwt.JWTUtil;
import com.sbc.projection.Employee6;
import com.sbc.service.EmailService;
import com.sbc.service.EmployeeService;
import com.sbc.util.PropertiesUtil;

/**
 * Enable spring.mail properties in application.properties file
 * @author suny4
 *
 */
@RestController
@RequestMapping(path="")
public class EmailController {
	
	@Autowired
	EmailService emailService;
	
	@Autowired
	EmployeeService employeeService;
	
	@Autowired
	private UserDetailsService userDetailsService;
	
	@Autowired
	private JWTUtil jwtUtil; 	
	
	@Autowired
	private PropertiesUtil propertiesUtil;
	
	@Autowired  
    JmsTemplate jmsTemplate; 
	
	private static final Logger LOG = LoggerFactory.getLogger(EmailController.class); 


	//************************************* SEND EMAIL w/ ATTACHMENTS *****************************************//
	/**
	 * SEND EMAIL w/ ATTACHMENTS
	 * @param {model: jsonString, file: files[]}
	 * @param file (contains files[])
	 * 
	 */
	@PostMapping(value="/employees/send-email", consumes="multipart/form-data", produces = "application/json")
	public ResponseEntity<?> sendEmail(@RequestParam("model") String jsonString, @RequestPart("files") MultipartFile[] files,
			HttpServletRequest request) throws Exception {
		LOG.info("enter sendEmail() method.");
		
		// convert String to JSON Object
		Email email = new ObjectMapper().readValue(jsonString, Email.class);

		File[] savedFiles = new File[files.length];
		String[] filesLocation = new String[files.length];
		
		double totalFileBytes = 0;
		
		if(files.length > 10) {
			throw new FileUploadException("You cannot upload more than 10 files.");
		}
		
		else if(files.length > 0) {
			String fileLocation = "";
			File savedFile = null;
			double fileBytes = 0;
			
			int num = 0;
			for (MultipartFile file: files) {
				String filename = file.getOriginalFilename();

				byte bytes[] = file.getBytes(); 
				
				// If file exists, temporarily save aFile inside 'images'
				if(bytes != null && bytes.length != 0) {
					String contextPath = request.getServletContext().getRealPath("/");
					System.out.println("realPath=" + contextPath);     
					// output = "C:\\Users\\suny4\\eclipse-workspace\\AngularJs_RESTfulAttendanceMonitoringSystem"
					String serverLocation = contextPath + "\\static\\images\\";
					savedFile = new File(serverLocation + filename); 
					fileBytes = savedFile.length();
					totalFileBytes += fileBytes;
					if(totalFileBytes > 26000000) {
						throw new FileUploadException("File(s) too large. Maximum size allowed is 25MB");
					}
					
					savedFiles[num] = savedFile;
					FileOutputStream fos = new FileOutputStream(savedFile);
					BufferedOutputStream bos = new BufferedOutputStream(fos);
					bos.write(bytes);
					bos.close();
					
					fileLocation = serverLocation + filename;
					filesLocation[num] = fileLocation;	
					num++;
				}
			}			
			emailService.EmailwithAttachment(email, savedFiles, filesLocation);						
		} 		
		else {
			System.out.println("files.length() == 0");
			emailService.EmailOnly(email);
		}
 
		return ResponseEntity.status((HttpStatus.OK)).body(null);
	} 

	
	//************************************* PASSWORD RESET LINK *****************************************//
	/**
	 * SEND LINK TO RESET EMAIL
	 * @param String email
	 * @return link
	 * 
	 */
	@GetMapping(value="/reset-password", produces = "application/json")
	public ResponseEntity<?> sendPasswordResetLink(@RequestParam("email") String email) throws Exception {		
		LOG.info("enter sendPasswordResetLink() method.");

		//Employee6 emp = employeeService.findEmployeeByEmail(email);   use this line if every employees email login-credentials were available to the server
		Employee6 emp = employeeService.findEmployeeByEmail(propertiesUtil.getEmail());			
		
		String urlToResetPassword = null;
		
		if(emp != null) {				
			LOG.info("email=" + propertiesUtil.getEmail());
			String username = emp.getUsername();
			LOG.info("username=" + username);
			final UserDetails userDetails = userDetailsService.loadUserByUsername(username);		// call method
			final String access_token = jwtUtil.generateTokenForPasswordReset(userDetails);			// call method	
			LOG.info("access_token=" + access_token);
			
			urlToResetPassword = "http://localhost:8080/AngularJs_RESTfulAttendanceMonitoringSystem/#!/change_password_form/" + access_token;			
		}	
				
		String urlLink =
		"<p>If you have not requested to reset your password, then ignore this email.</p>"
		+
		"<p>Click on the link below to reset your password. This link will expire in 2 mins.</p> \r\n"
		+ "<a href='" + urlToResetPassword + "'>" + urlToResetPassword + "</a>";
		LOG.info("link=" + urlLink);
		
		Email emailEntity = new Email();
		emailEntity.setFrom(propertiesUtil.getEmail());
		emailEntity.setTo(propertiesUtil.getEmail());
		emailEntity.setSubject("Password reset link"); emailEntity.setText(urlLink);
		//emailService.EmailOnly(emailEntity);
		 	
		
		/* 
         * Message can be sent through JMS in text or String only. 
         * Using MessageConverter can be complicated sometimes. 
         * Therefore, use GSON to convert java object to json string.  
         * Java Object = Email [from=suchettri1@gmail.com, to=suny4evers@hotmail.com, message=Hello Mister!, date=Wed Aug 05 14:12:06 EDT 202           0] 
         * jsonString = {"from":"suchettri1@gmail.com","to":"suny4evers@hotmail.com","message":"Hello Mister!","date":"Aug 5, 2020 2:12:06 PM           "} 
         */       
        Gson gson = new Gson();  
        String jsonString = gson.toJson(emailEntity);  
        jmsTemplate.convertAndSend(jsonString);   
        System.out.println("<Email Object> jsonString = " + jsonString);             
        
		return ResponseEntity.status((HttpStatus.OK)).body(null);		
	}	
	
	
}

