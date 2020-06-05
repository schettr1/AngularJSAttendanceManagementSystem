package com.sbc.controller;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.sbc.converter.EmployeeCredentials;
import com.sbc.dto.Employee1DTO;
import com.sbc.entity.Admin;
import com.sbc.entity.Employee;
import com.sbc.entity.Medtech;
import com.sbc.entity.Supervisor;
import com.sbc.enums.ShiftType;
import com.sbc.exception.EmployeeNotFoundException;
import com.sbc.exception.InvalidEmployeeException;
import com.sbc.exception.InvalidTokenException;
import com.sbc.exception.MissingFieldsException;
import com.sbc.hateoas.resource.EmployeeResource;
import com.sbc.hateoas.resource.EmployeeResource1;
import com.sbc.jwt.JWTResponse;
import com.sbc.jwt.JWTUtil;
import com.sbc.projection.Employee1;
import com.sbc.projection.Employee2;
import com.sbc.projection.Employee5;
import com.sbc.service.EmployeeService;

import io.jsonwebtoken.ExpiredJwtException;

@RestController
@RequestMapping(path="")
public class EmployeeController {
	
	/**
	 * Any request to the REST api will be intercepted by the JWTRequestFilter.
	 * After access_token is validated, the request reaches the resource location uri.
	 */
	private static final Logger LOG = LoggerFactory.getLogger(EmployeeController.class); 
	
	@Autowired
	private EmployeeService employeeService;  
	
	@Autowired
	private AuthenticationManager authenticationManager;

	@Autowired
	private JWTUtil jwtUtil; 

	@Autowired
	private UserDetailsService userDetailsService;
	
	
	// ================================= AUTHORIZE USER - GENERATE ACCESS TOKEN & REFRESH TOKEN ================================== //
	
	/**
	 * AUTHORIZATION SERVER - generate access_token and refresh_token
	 * @param jwtRequest(username, password) inside Authorization Header
	 * @return jwtResponse(access_token, refresh_token)
	 */
	@RequestMapping(value = "/authorize", method = RequestMethod.POST)
	public ResponseEntity<JWTResponse> authorizationServer(HttpServletRequest request) throws Exception {
		
		// get username and password from the Authorization Header
		String username="", password="";
		// Get Username and Password from Authorization-Header
		String authorization = request.getHeader("Authorization");
		if (authorization != null && authorization.toLowerCase().startsWith("basic")) {
		    String base64Credentials = authorization.substring("Basic".length()).trim();
		    byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
		    String credentials = new String(credDecoded, StandardCharsets.UTF_8);
		    final String[] values = credentials.split(":", 2);
		    username = values[0];
		    password = values[1];
		}
		
		// authenticate user credentials
		authenticateUserCredentials(username, password);		// call method
		
		EmployeeCredentials foundEmployee = employeeService.findUserCredentials(username);
		
		// generate access_token & refresh_token
		final UserDetails userDetails = userDetailsService.loadUserByUsername(username);		// call method
		System.out.println("userDetails=" + userDetails.getUsername() + ", " + userDetails.getPassword());	
		final String access_token = jwtUtil.generateAccessToken(userDetails);		// call method
		System.out.println("access_token=" + access_token);		
		final String refresh_token = jwtUtil.generateRefreshToken(userDetails);		// call method
		System.out.println("refresh_token=" + refresh_token);
		JWTResponse jwtResponse = new JWTResponse(access_token, refresh_token, foundEmployee.getEmployeeId(), foundEmployee.getRoles());
		
		return ResponseEntity.ok(jwtResponse);
	}
	
	
	// ======================================= RE-NEW ACCESS TOKEN USING REFRESH TOKEN ======================================== //
	/**
	 * AUTHORIZATION SERVER - renew access_token using refresh_token
	 * @param refresh_token
	 * @return jwtResponse(access_token, refresh_token)
	 */
	@RequestMapping(value = "/renew-access-token", method = RequestMethod.POST)
	public ResponseEntity<JWTResponse> renew_accessToken(HttpServletRequest request) {
		
		final String requestTokenHeader = request.getHeader("Authorization");

		String username = null;
		String jwtToken = null;

		if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
			jwtToken = requestTokenHeader.substring(7);
			try {
				username = jwtUtil.getUsernameFromToken(jwtToken);	// call method
			} catch (IllegalArgumentException e) {
				System.out.println("\nUnable to get JWT Token");
			} catch (ExpiredJwtException e) {
				System.out.println("\nJWT Token has expired");
			}
		} 
		else {
			throw new InvalidTokenException("JWT Token does not begin with String Bearer");
		}
		
		final UserDetails userDetails = userDetailsService.loadUserByUsername(username);		// call method
		final String access_token = jwtUtil.generateAccessToken(userDetails);		// call method	
		EmployeeCredentials foundEmployee = employeeService.findUserCredentials(username);	// call method
		/* create JWTResponse object */
		JWTResponse jwtResponse = new JWTResponse(access_token, jwtToken, foundEmployee.getEmployeeId(), foundEmployee.getRoles());
		
		return ResponseEntity.ok(jwtResponse);
	}
	
	
	
	// ============================ VERIFY TOKEN & RETURN EMPLOYEE ================================ //	
	/** 
	 * verify token to reset password
	 * @param token
	 * @return employee
	 */
	@RequestMapping(value = "/verify-change-password-token", produces="application/json", method = RequestMethod.GET)
	public ResponseEntity<Employee1DTO> verifyTokenToResetPassword(@RequestParam("token") String token) {	
		LOG.info("inside verifyTokenToResetPassword() method");
		// must retun Employee1DTO which is same for all employee types.
		// returning Employee will give proxy error for Medtech since supervisor will be extra column 
		// solved by setSupervisor == null 
		// new problem resetting password removed employee supervisorId
		String username = null;
		LOG.info("token=" + token);
		// return employee after validating the token 
		try {
			username = jwtUtil.getUsernameFromToken(token);	// call method
			LOG.info("username=" + username);
		} catch (IllegalArgumentException e) {
			LOG.info("\nUnable to get JWT Token");
			throw new InvalidTokenException("Unable to get JWT Token");
		} catch (ExpiredJwtException e) {
			LOG.info("\nJWT Token has expired");
			throw new InvalidTokenException("Expired JWT Token");
		}
		
		LOG.info("username=" + username);
		Employee foundEmployee = null;
		if(username != null) {
			foundEmployee = employeeService.findByUsername(username);
		}
		
		// Because employee object is mapped to events and roles, it returns infinte loop; therefore, we convert it to Employee1DTO
		Employee1DTO emp = new Employee1DTO();
		emp.setEmployeeId(foundEmployee.getEmployeeId());
		emp.setFirstname(foundEmployee.getFirstname());
		emp.setLastname(foundEmployee.getLastname());
		emp.setBirth(foundEmployee.getBirth());
		emp.setEmail(foundEmployee.getEmail());
		emp.setEnabled(foundEmployee.isEnabled());
		emp.setGender(foundEmployee.getGender());
		emp.setAddress(foundEmployee.getAddress());
		emp.setShift(foundEmployee.getShift());
		emp.setUsername(foundEmployee.getUsername());		
		
		return ResponseEntity.status((HttpStatus.OK)).body(emp);
	}
		

	// ============================ UPDATE PASSWORD USING TOKEN ================================ //	
	/** 
	 * UPDATE PASSWORD USING TOKEN
	 * @param password
	 * CAUTION: updating password using token does not require validating token. Token is validated calling url '/verify-change-password-token" 
	 * where client request employee data from token. If token is invalid client deines access to the page "new-password.html". However, anybody  
	 * can send employee data to url "http://localhost:8080/AngularJS_REST_SingleTableInheritence_JWT/#!/change-password" and change the user password.
	 * Additional security measure would be needed that require token validation when submitting new password to the url "/update-password".
	 * In the case of url "/logged-user-update-password", the request has Bearer Token in AUTH_DATA.
	 */
	@RequestMapping(value = "/token-based-update-password", consumes="application/json", produces="application/json", method = RequestMethod.POST)
	public ResponseEntity<Employee> tokenBasedUpdatePassword(@RequestBody Employee employee) {	
		LOG.info("inside updatePassword() method");
		LOG.info("employee=" + employee.getEmployeeId() + ", " + employee.getFirstname() + ", " + employee.getLastname() + ", " + employee.getPassword());
		
		// update password
		Employee foundEmployee = employeeService.findById(employee.getEmployeeId());
		if(foundEmployee == null) {
			LOG.info("Employee not found.");
			throw new InvalidEmployeeException("Employee not found.");
		}
		
		// encrypt password 
		String BCryptedPassword = new BCryptPasswordEncoder().encode(employee.getPassword());
		employee.setPassword(BCryptedPassword);
		LOG.info(employee.getPassword() + " = " + BCryptedPassword);
				
		Employee updatedEmployee = employeeService.updatePassword(employee.getEmployeeId(), employee);
		LOG.info("updatedEmployee ID, Password=" + updatedEmployee.getEmployeeId() + ", " + updatedEmployee.getPassword());
		return ResponseEntity.status((HttpStatus.OK)).body(updatedEmployee);
	}
	
		
	// ============================ UPDATE PASSWORD USING LOGGED USER ================================ //	
	/** 
	 * UPDATE PASSWORD USING LOGGED USER
	 * @param password
	 * 
	 */
	@RequestMapping(value = "/logged-user-update-password", consumes="application/json", produces="application/json", method = RequestMethod.POST)
	public ResponseEntity<Employee> loggedUserUpdatePassword(@RequestBody Employee employee) {	
		
		System.out.println("\n EmployeeId=" + employee.getEmployeeId());
		System.out.println("\n New Password=" + employee.getPassword());
		
		// update password
		Employee foundEmployee = employeeService.findById(employee.getEmployeeId());
		if(foundEmployee == null) {
			throw new InvalidEmployeeException("Employee not found.");
		}
		
		// encrypt password 
		String BCryptedPassword = new BCryptPasswordEncoder().encode(employee.getPassword());
		employee.setPassword(BCryptedPassword);
		System.out.println(employee.getPassword() + " = " + BCryptedPassword);
				
		employeeService.updatePassword(employee.getEmployeeId(), employee);
		
		return ResponseEntity.status((HttpStatus.OK)).body(null);
	}
	
	
	/* 
	 * FUNCTION: AUTHENTICATE USER CREDENTIALS (FOR TOKEN BASED AUTHENTICATION) 
	 * @param username, password
	 */
	private void authenticateUserCredentials(String username, String password) throws Exception {
		try {
			authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		} catch (DisabledException ex) {
			throw new Exception("USER_DISABLED", ex);
		} catch (BadCredentialsException ex) {
			throw new Exception("INVALID_CREDENTIALS", ex);
		}
	}
	 
	 
	// ===================== AUTHENTICATE USER CREDENTIALS (FOR BASIC AUTHENTICATION USE ONLY) ===================== //	
	/**
	 * @Param authorization-header
	 * @return EmployeeCredentials {username, password, roles[]}
	 * 
	 */
	@PostMapping(path="/employees/authenticate-user", produces="application/json")
	public EmployeeCredentials authenticateUser(HttpServletRequest request) {	
		LOG.info("enter authenticateUser() method.");  

		String username="", password="";
		// Get Username and Password from Authorization-Header
		String authorization = request.getHeader("Authorization");
		if (authorization != null && authorization.toLowerCase().startsWith("basic")) {
		    String base64Credentials = authorization.substring("Basic".length()).trim();
		    byte[] credDecoded = Base64.getDecoder().decode(base64Credentials);
		    String credentials = new String(credDecoded, StandardCharsets.UTF_8);
		    final String[] values = credentials.split(":", 2);
		    username = values[0];
		    password = values[1];
		}
		
		EmployeeCredentials foundEmployee = employeeService.findUserCredentials(username);
		if(foundEmployee == null) {
			LOG.warn("Invalid username or password.");
			throw new EmployeeNotFoundException("Invalid Username.");
		}	
		
		//System.out.println("Username: " + username); System.out.println("Password: " + password); System.out.println("hashed_password: " + hashPassword(password));
		//System.out.println("foundEmployee.getPassword(): " + foundEmployee.getPassword()); System.out.println("Password match 1? " + checkPassword(password, hashed_password));
		//System.out.println("Password match 2? " + checkPassword(password, foundEmployee.getPassword()));
				
		if(checkPassword(password, foundEmployee.getPassword())) {
			return foundEmployee;
		}
		else {
			throw new EmployeeNotFoundException("Invalid Password.");
		}		
	}	
	

	
	// ================================================== CREATE ADMIN ==================================================== //	
	/**
	 * save Admin 
	 * @return HttpStatus.CREATED and created Employee 
	 */
	@PostMapping(path="/admin/admins", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EmployeeResource> save(@Valid @RequestBody Admin admin) {	
		LOG.info("enter save() method."); 		
		//validateEmployee(admin);

		Employee emp = employeeService.save(admin);    // method overloading
		
		/* EmployeeResource instance */
		EmployeeResource employeeResource = new EmployeeResource(emp);
		
		/* initialize resource variable employee */
		employeeResource.employee = emp;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByEmployeeId(emp.getEmployeeId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		employeeResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.CREATED)).body(employeeResource);
	}
	

	// ================================================== CREATE SUPERVISOR ==================================================== //	
	/**
	 * save Supervisor 
	 * @return HttpStatus.CREATED and created Employee 
	 */
	@PostMapping(path="/admin/supervisors", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EmployeeResource> save(@Valid @RequestBody Supervisor supervisor) {	
		LOG.info("enter save() method."); 

		//validateEmployee(supervisor);				
		
		Employee emp = employeeService.save(supervisor);    // method overloading
		
		/* EmployeeResource instance */
		EmployeeResource employeeResource = new EmployeeResource(emp);
		
		/* initialize resource variable employee */
		employeeResource.employee = emp;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByEmployeeId(emp.getEmployeeId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		employeeResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.CREATED)).body(employeeResource);
	}
	
	
	// ================================================== CREATE MEDTECH ==================================================== //	
	/**
	 * save Medtech 
	 * @return HttpStatus.CREATED and created Employee 
	 */
	@PostMapping(path="/admin/medtechs", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EmployeeResource> save(@RequestBody Medtech medtech) {	
		// If '@Valid' annotation is used and invalid email is POSTED, AngularJS would give error "Bad Request 400" and will not throw InvalidEmailException. 
		// But Error "Cannot read property 'then' of undefined at createEmployee()" is still present in AngularJS.
		LOG.info("enter save() method."); 

		//validateEmployee(medtech);
		
		Employee emp = employeeService.save(medtech);       // method overloading
	
		/* EmployeeResource instance */
		EmployeeResource employeeResource = new EmployeeResource(emp);
		
		/* initialize resource variable employee */
		employeeResource.employee = emp;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByEmployeeId(emp.getEmployeeId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		employeeResource.add(selfLink);		
		
		return ResponseEntity.status((HttpStatus.CREATED)).body(employeeResource);
	}
	
	
	// ================================================== UPDATE EMPLOYEE ==================================================== //
	
	/**
	 * update Employee by ID
	 * @return HttpStatus.OK and updated Employee
	 */
	@PutMapping(path="/employees/employee_type", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EmployeeResource> update(@Valid @RequestBody Employee emp, @RequestParam("employee_type") String employee_type) {
		LOG.info("enter update() method.");   

		Employee updatedEmployee = employeeService.update(emp, employee_type);
		
		/* EmployeeResource instance */
		EmployeeResource medtechResource = new EmployeeResource(updatedEmployee);
		
		/* initialize resource variable employee */
		medtechResource.employee = updatedEmployee;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByEmployeeId(updatedEmployee.getEmployeeId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		medtechResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(medtechResource);
	}
	
		
	// ================================================== LIST ALL EMPLOYEES ==================================================== //
	/**
	 * list Employees   
	 * @return HttpStatus.FOUND and list of Employees
	 */
	@GetMapping(path="/admin/employees", produces="application/json")
	public ResponseEntity<List<EmployeeResource1>> listAll() {
		LOG.info("enter listAll() method."); 

		List<Employee1> employeeList = employeeService.getAllEmployees();		
		
		/* declare list of EmployeeResource1 */
		List<EmployeeResource1> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */ 
		for(Employee1 emp: employeeList) {
			
			/* EmployeeResource1 Instance */
			EmployeeResource1 employeeResource = new EmployeeResource1(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the EmployeeResource1 list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
	
	
	// ================================================== FIND EMPLOYEE BY ID ==================================================== //
	
	/**
	 * find Employee by ID  
	 * @return HttpStatus.FOUND and found Employee 
	 */
	@GetMapping(path="/employees/{employeeId}", produces = "application/json")
	public ResponseEntity<EmployeeResource1> findByEmployeeId(@PathVariable int employeeId) {	
		LOG.info("enter findByEmployeeId() method.");   
		
		Employee1 foundEmployee = employeeService.findByEmployeeId(employeeId);
		
		if(foundEmployee == null) {
			LOG.warn("Id " + employeeId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + employeeId + " is not present in the Database");
		}
		
		
		/* EmployeeResource instance */
		EmployeeResource1 employeeResource = new EmployeeResource1(foundEmployee);
		
		/* initialize resource variable employee */
		employeeResource.employee = foundEmployee;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByEmployeeId(foundEmployee.getEmployeeId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		employeeResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResource);
	}

	
	// ==================================== DELETE EMPLOYEE WHO HAVE NOT ATTENDED ANY EVENTS ====================================== //
	
	/**
	 * delete Employee by ID 
	 * @return HttpStatus.OK with no body
	 */
	@DeleteMapping(path="admin/employees/{employeeId}")
	public ResponseEntity<?> delete(@PathVariable int employeeId) {	
		LOG.info("enter delete() method.");   
		
		Employee foundEmployee = employeeService.findById(employeeId);
	
		if(foundEmployee == null) {
			LOG.warn("Id " + employeeId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + employeeId + " is not present in the Database");
		}
	
		employeeService.delete(employeeId);
		return ResponseEntity.status((HttpStatus.OK)).body(null);
	}
	

	// ======================================= CHANGE EMPLOYEE STATUS =========================================== //
	
	/**
	 * change Employee status 
	 * @param employeeId
	 * @return HttpStatus.OK with no body
	 */
	@PutMapping(path="admin/employees/{employeeId}/status")
	public ResponseEntity<?> changeEmployeeStatus(@PathVariable int employeeId) {	
		LOG.info("enter changeEmployeeStatus() method.");   

		List<Employee> employeeList = employeeService.changeEmployeeStatus(employeeId);
		
		/* declare list of EmployeeResource */
		List<EmployeeResource> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */ 
		for(Employee emp: employeeList) {
			
			/* EmployeeResource Instance */
			EmployeeResource employeeResource = new EmployeeResource(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the MedtechResource list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
	

	// ================================================== LIST EMPLOYEES BY TYPE ==================================================== //
	
	/**
	 * list Employees   
	 * @return HttpStatus.FOUND and list of Employees
	 */
	@GetMapping(path="/admin/employees/type", produces="application/json")
	public ResponseEntity<List<EmployeeResource1>> listEmployeesByType(@RequestParam("value") int value) {
		LOG.info("enter listEmployeesByType() method."); 

		List<Employee1> employeeList = employeeService.listEmployeesByType(value);
		
		/* declare list of EmployeeResource */
		List<EmployeeResource1> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */ 
		for(Employee1 emp: employeeList) {
			
			/* EmployeeResource Instance */
			EmployeeResource1 employeeResource = new EmployeeResource1(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the EmployeeResource list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
	
	
	// ======================================= LIST EMPLOYEES BY EVENTID ========================================= //
	
	/**
	 * list Employees by EventId
	 * @return HttpStatus.FOUND and list of Medtechs
	 */
	@GetMapping(path="/employees/events/{eventId}", produces="application/json")
	public ResponseEntity<List<EmployeeResource1>> listAllEmployeesByEventId(@PathVariable int eventId) {
		LOG.info("enter listAllEmployeesByEventId() method."); 

		List<Employee1> employeeList = employeeService.getAllEmployeesByEventId(eventId);
		
		/* declare list of EmployeeResource */
		List<EmployeeResource1> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */
		for(Employee1 emp: employeeList) {
			
			/* EmployeeResource Instance */
			EmployeeResource1 employeeResource = new EmployeeResource1(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the EmployeeResource list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
	
		
	// ======================================= LIST EMPLOYEES BY SHIFT ========================================= //
	
	/**
	 * list Employees by ShiftId
	 * @return HttpStatus.FOUND and list of Employees
	 */
	@GetMapping(path="/employees/shift/{shiftId}", produces="application/json")
	public ResponseEntity<List<EmployeeResource1>> getEmployeesByShift(@PathVariable int shiftId) {
		LOG.info("enter getEmployeesByShift() method."); 

		List<Employee1> employeeList = employeeService.getEmployeesByShift(shiftId);
		
		/* declare list of EmployeeResource */
		List<EmployeeResource1> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */
		for(Employee1 emp: employeeList) {
			
			/* EmployeeResource Instance */
			EmployeeResource1 employeeResource = new EmployeeResource1(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the MedtechResource list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
	

	// ======================================= LIST EMPLOYEES BY SUPERVISOR ID ========================================= //
	
	/**
	 * list Employees by SupervisorId
	 * @return HttpStatus.FOUND and list of Employees
	 */
	@GetMapping(path="/employees/supervisors/{supervisorId}", produces="application/json")
	public ResponseEntity<List<EmployeeResource1>> listAllEmployeesBySupervisorId(@PathVariable int supervisorId) {
		LOG.info("enter listAllEmployeesBySupervisorId() method."); 

		/* check whether supervisor is present */
		Employee1 foundSupervisor = employeeService.findSupervisorById(supervisorId);
		if(foundSupervisor == null) {
			LOG.warn("Id " + supervisorId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Supervisor id " + supervisorId + " does not exist in the database");
		}
		
		List<Employee1> employeeList = employeeService.listAllEmployeesBySupervisorId(supervisorId);
		
		/* declare list of EmployeeResource */
		List<EmployeeResource1> employeeResourceList = new LinkedList<>();
		
		/* iterate list of Employees */
		for(Employee1 emp: employeeList) {
			
			/* EmployeeResource Instance */
			EmployeeResource1 employeeResource = new EmployeeResource1(emp);
			
			/* initialize resource variable employee */
			employeeResource.employee = emp;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EmployeeController.class).findByEmployeeId(emp.getEmployeeId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			employeeResource.add(selfLink);	
			
			/* add resource to the MedtechResource list */
			employeeResourceList.add(employeeResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(employeeResourceList);
	}
		
				
	
	// ==================== LIST ALL ACTIVE MEDTECHS AND IDENTIFY THOSE WHO ATTENDED THE EVENT (for attendance) ======================== //
	
	/**
	 * EventId
	 * @return HttpStatus.OK with List of Medtechs
	 * @throws IllegalAccessException 
	 * @throws IllegalArgumentException 
	 */
	@GetMapping(path="admin-or-supervisor/employees/type/{type}/events/{eventId}", produces="application/json")
	public List<Employee2> listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent(@PathVariable int type, @PathVariable int eventId) {	
		
		LOG.info("enter listAllMedtechsByEventId() method.");   
		
		List<Employee2> employeeList = employeeService.listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent(type, eventId);		
		
		return employeeList;
	}
	

	// ==================== LIST ALL MEDTECHS BY EVENT ID AND SHIFT ======================== //
	
	/**
	 * EventId
	 * @return HttpStatus.OK with List of Medtechs
	 * @throws IllegalAccessException 
	 * @throws IllegalArgumentException 
	 */
	@GetMapping(path="admin-or-supervisor/employees/type/{type}/shift/{shift}/events/{eventId}", produces="application/json")
	public List<Employee2> listAllMedtechsByEventIdAndByShift(@PathVariable int type, @PathVariable int shift, @PathVariable int eventId) {	
		
		LOG.info("enter listAllMedtechsByEventIdAndByShift() method.");   
		
		List<Employee2> employeeList = employeeService.listAllMedtechsByEventIdAndByShift(type, shift, eventId);		
		
		return employeeList;
	}
	
	
	// ==================== GET EMPLOYEE ID, TOTAL EVENTS AND TOTAL CEs BY YEAR ======================== //
	
	/**
	 * @Param year (YYYY)
	 * @return EmployeeId, total Events, total CEs
	 * 
	 */
	@GetMapping(path="admin/employees/events/year/{year}", produces="application/json")
	public Employee5 getEmployeeIdTotalEventsAndTotalCEsByYear(@PathVariable int year) {	
		
		LOG.info("enter getEmployeeIdTotalEventsAndTotalCEsByYear() method.");   
		
		Employee5 employee = employeeService.getEmployeeIdTotalEventsAndTotalCEsByYear(year);		
		
		return employee;
	}	
	
	
	
	// ==================== GET ALL EMAILS ======================== //
	
	/**
	 * @param null
	 * @return list of emails
	 * 
	 */
	@GetMapping(path="employees/get-emails", produces="application/json")
	public List<String> getAllEmails() {	
		
		LOG.info("enter getAllEmails() method.");   
		
		return employeeService.getAllEmails();		
	}
	
	
	
	/**
	 * convert String_text to hashed_value
	 * @param password_plaintext
	 * @return hashed_password
	 */
	public static String hashPassword(String password_plaintext) {
		String salt = BCrypt.gensalt(12);
		String hashed_password = BCrypt.hashpw(password_plaintext, salt);
		return(hashed_password);
	}
	
	
	/**
	 * check whether password_plaintext matches hashed_password
	 * @param password_plaintext, hashed_password
	 * @return true or false
	 */
	public static boolean checkPassword(String password_plaintext, String hashed_password) {
		boolean isMatch = false;

		if(hashed_password == null || !hashed_password.startsWith("$2a$"))
			throw new EmployeeNotFoundException("User password do not match with hash_password");

		isMatch = BCrypt.checkpw(password_plaintext, hashed_password);

		return(isMatch);
	}
	
	
	/**
	 * VALIDATE EMPLOYEE CREDENTIALS
	 * @check employeeId is unique
	 * @check username is unique
	 * @check email contains '@employee.com'
	 * @set isEnabled() to true
	 * @encrypt password
	 * @param employee
	 */
	private void validateEmployee(Employee employee) {

		// check if employeeId is uniqe
		Employee emp2 = employeeService.findById(employee.getEmployeeId());
		if(emp2 != null) {
			throw new InvalidEmployeeException("employeeId already exist");
		}
		
		// check if username is unique
		Employee emp1 = employeeService.findByUsername(employee.getUsername());
		if(emp1 != null) {
			throw new InvalidEmployeeException("username already exist");
		}
		
		// check if email contains '@employee.com'			
		if(!employee.getEmail().contains("@employee.com")) {
			throw new InvalidEmployeeException("invalid email domain");
		}				
		
		// set 'enabled' property 
		employee.setEnabled(true);
		
		// encrypt password 
		String BCryptedPassword = new BCryptPasswordEncoder().encode(employee.getPassword());
		employee.setPassword(BCryptedPassword);
		System.out.println(employee.getPassword() + " = " + BCryptedPassword);
	}
	
	
	
	
}
