package com.sbc.service;

import java.io.File;

import javax.jms.JMSException;
import javax.jms.Message;
import javax.jms.TextMessage;
import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jms.annotation.JmsListener;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.stereotype.Service;

import com.google.gson.Gson;
import com.sbc.entity.Email;
import com.sbc.exception.FailedEmailDeliveryException;

@Service
@EnableAsync
public class EmailService {

	/**
	 * Using Spring_MailAPI requires 3 jar files or API "spring-context-support"
	 * "javax-mail-api" "activation"
	 * 
	 * In Springboot, one jar "spring-boot-starter-mail" will do the magic!
	 */

	public static final String PASSWORD_RESET_LINK_QUEUE = "password-reset-link-queue";  

	/* MailSender is used for sending SimpleMailMessage only, it is not usable to send 'html/text' so use JavaMailSender instead 
	 * (either remove this dependency or place it before JavaMailSender bean) 
	 */
	@Autowired
	private MailSender mailSender; 
	
	
	/* used for sending MimeMessage */
	@Autowired
	private JavaMailSender javaMailSender; 
	
	
	@Value("${spring.mail.username}")		
	private String my_gmail;
    
	
	
	@Async
	public void EmailOnly(Email email) throws Exception {
		
		Thread.sleep(10000);
		System.out.println("\n******************** Thread starting after 10 seconds (EmailOnly) *****************");
		
		/* MimeMessage - with Attachment */
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
		MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);		// set 'true' to change 'plain/text' to 'html/text'
		//mimeMessageHelper.setFrom(email.getFrom());
		//mimeMessageHelper.setTo(email.getTo());
		mimeMessageHelper.setFrom(my_gmail);
		mimeMessageHelper.setTo(my_gmail);
		mimeMessageHelper.setSubject(email.getSubject());
		mimeMessageHelper.setText(email.getText(), true);		// set 'true' to change 'plain/text' to 'html/text'		
		try {
			javaMailSender.send(mimeMessage);
		} catch(FailedEmailDeliveryException e) {System.out.println("FailedEmailDeliveryException");}		
		System.out.println("Only Message sent!");
	}

	
	
	@Async
	public void EmailwithAttachment(Email email, File[] savedFiles, String[] filesLocation) throws Exception {
		
		Thread.sleep(10000);
		System.out.println("\n******************** Thread starting after 10 seconds (EmailwithAttachment) *****************");
		System.out.println("filesLocation=" + filesLocation);
		
		/* MimeMessage - with Attachment */
		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
		MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);		// set 'true' to change 'plain/text' to 'html/text'
		//mimeMessageHelper.setFrom(email.getFrom());
		//mimeMessageHelper.setTo(email.getTo());
		mimeMessageHelper.setFrom(my_gmail);
		mimeMessageHelper.setTo(my_gmail);
		mimeMessageHelper.setSubject(email.getSubject());
		mimeMessageHelper.setText(email.getText(), true);		// set 'true' to change 'plain/text' to 'html/text'
		for (String fileLocation : filesLocation) {
			FileSystemResource file = new FileSystemResource(new File(fileLocation));
			mimeMessageHelper.addAttachment(fileLocation, file);
		}	
		try {
			javaMailSender.send(mimeMessage);
		} catch(FailedEmailDeliveryException e) {System.out.println("FailedEmailDeliveryException");}		
		System.out.println("Message sent with attachment!");
		// Delete files from fileLocation
		Thread.sleep(4000);	// allow 4 seconds for email to be sent					
		for(int i=0; i<savedFiles.length; i++) {	
			savedFiles[i].delete();
		}
	}
	
	
	
	/** 
     * Listener of JMS Messaging Service
     * @queue - EMAIL_QUEUE
     * @param - Message message (which is equal to ActiveMQTextMessage 
     * {commandId = 5, responseRequired = true, messageId = "", ..., jmsXGroupFirstForConsumer = false, text = 111} )
     */  
    @JmsListener(destination = PASSWORD_RESET_LINK_QUEUE)
	public void PasswordResetEmail(Message jmsMessage) throws Exception {
    	
    	try {  
    		Thread.sleep(10000);
    		System.out.println("\n******************** Thread starting after 10 seconds *****************");
            // get jsonString from javax.jms.Message using getText() from TextMessage 
            String jsonString = ((TextMessage) jmsMessage).getText();  
            // convert jsonString to Java Object  
            Gson gson = new Gson();  
            Email emailObject = gson.fromJson(jsonString, Email.class);  
            System.out.println("email = " + emailObject); 
            
            /* MimeMessage - with Attachment */
    		MimeMessage mimeMessage = javaMailSender.createMimeMessage();
    		MimeMessageHelper mimeMessageHelper = new MimeMessageHelper(mimeMessage, true);		// set 'true' to change 'plain/text' to 'html/text'
    		//mimeMessageHelper.setFrom(email.getFrom());
    		//mimeMessageHelper.setTo(email.getTo());
    		mimeMessageHelper.setFrom(emailObject.getFrom());
    		mimeMessageHelper.setTo(emailObject.getTo());
    		mimeMessageHelper.setSubject(emailObject.getSubject());
    		mimeMessageHelper.setText(emailObject.getText(), true);		// set 'true' to change 'plain/text' to 'html/text'		

    		javaMailSender.send(mimeMessage);
    		
    	} catch(FailedEmailDeliveryException e) {
    		System.out.println("FailedEmailDeliveryException");		
        } catch (JMSException e) {  
            // TODO Auto-generated catch block  
            e.printStackTrace();  
        } 
    	
    	System.out.println("Password reset link sent successfully!");
	}
	
    

}


		/* SIMPLE MAIL MESSAGE - without Attachment 
		SimpleMailMessage simpleMailMessage = new SimpleMailMessage();
		simpleMailMessage.setFrom(email.getFrom());
		simpleMailMessage.setTo(email.getTo());
		simpleMailMessage.setSubject(email.getSubject());
		simpleMailMessage.setText(email.getText());
		try {
			mailSender.send(simpleMailMessage);
		} catch(FailedEmailDeliveryException e) {System.out.println("FailedEmailDeliveryException");}		
		System.out.println("Message sent!");
		*/