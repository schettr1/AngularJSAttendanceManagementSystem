package com.sbc.controller_advice;

import java.util.Date;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import com.sbc.exception.EventNotFoundException;
import com.sbc.exception.FailedEmailDeliveryException;
import com.sbc.exception.FileUploadException;
import com.sbc.exception.InvalidEmailException;
import com.sbc.exception.InvalidShiftException;
import com.sbc.exception.InvalidTokenException;
import com.sbc.exception.InvalidUsernameException;
import com.sbc.exception.InvalidEmployeeException;
import com.sbc.exception.InvalidRequestException;
import com.sbc.exception.CompletedEventException;
import com.sbc.exception.CustomExceptionMessage;
import com.sbc.exception.EmployeeNotFoundException;
import com.sbc.exception.MissingFieldsException;

@ControllerAdvice
public class ExceptionControllerAdvice {

	private static final Logger LOG = LoggerFactory.getLogger(ExceptionControllerAdvice.class); 
	
	private static final int CODE_NOT_FOUND = 404;
	private static final int CODE_BAD_REQUEST = 400;
	private static final int UNAUTHORIZED = 401;
	
	
	@ExceptionHandler({
		InvalidTokenException.class
	})
	public ResponseEntity<Object> handleInvalidTokenException(InvalidTokenException e) {
		LOG.info("enter handleInvalidTokenException() method."); 	
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = 
				new CustomExceptionMessage(UNAUTHORIZED, HttpStatus.UNAUTHORIZED, new Date(), e.getMessage());
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		EmployeeNotFoundException.class
	})
	public ResponseEntity<Object> handleEmployeeNotFoundException(EmployeeNotFoundException e) {
		LOG.info("enter handleEmployeeNotFoundException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_NOT_FOUND, HttpStatus.NOT_FOUND, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		EventNotFoundException.class
	})
	public ResponseEntity<Object> handleEventNotFoundException(EventNotFoundException e) {
		LOG.info("enter handleEventNotFoundException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_NOT_FOUND, HttpStatus.NOT_FOUND, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		MissingFieldsException.class
	})
	public ResponseEntity<Object> handleMissingFieldsException(MissingFieldsException e) {
		LOG.info("enter handleMissingFieldsException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		InvalidShiftException.class
	})
	public ResponseEntity<Object> handleInvalidShiftException(InvalidShiftException e) {
		LOG.info("enter handleInvalidShiftException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_NOT_FOUND, HttpStatus.NOT_FOUND, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		CompletedEventException.class
	})
	public ResponseEntity<Object> handleCompletedEventException(CompletedEventException e) {
		LOG.info("enter handleCompletedEventException() method"); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		FileUploadException.class
	})
	public ResponseEntity<Object> handleFileUploadException(FileUploadException e) {
		LOG.info("enter handleFileUploadException() method"); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		FailedEmailDeliveryException.class
	})
	public ResponseEntity<Object> handleFailedEmailDeliveryException(FailedEmailDeliveryException e) {
		LOG.info("enter handleFailedEmailDeliveryException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		InvalidEmployeeException.class
	})
	public ResponseEntity<Object> handleInvalidUsernameException(InvalidEmployeeException e) {
		LOG.info("enter handleMissingFieldsException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}

	
	@ExceptionHandler({
		InvalidEmailException.class
	})
	public ResponseEntity<Object> handleInvalidEmailException(InvalidEmailException e) {
		LOG.info("enter handleInvalidEmailException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_NOT_FOUND, HttpStatus.NOT_FOUND, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.NOT_FOUND).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		InvalidUsernameException.class
	})
	public ResponseEntity<Object> handleInvalidUsernameException(InvalidUsernameException e) {
		LOG.info("enter handleInvalidEmailException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
	
	
	@ExceptionHandler({
		InvalidRequestException.class
	})
	public ResponseEntity<Object> handleInvalidRequestException(InvalidRequestException e) {
		LOG.info("enter handleInvalidRequestException() method."); 
		// send CustomExceptionMessage object in the response body.
		CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage(CODE_BAD_REQUEST, HttpStatus.BAD_REQUEST, new Date(), e.getMessage());
		
		LOG.warn("custom exception message thrown in the response"); 
		// attach the status code along with the response body 
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(customExceptionMessage);	
	}
}

