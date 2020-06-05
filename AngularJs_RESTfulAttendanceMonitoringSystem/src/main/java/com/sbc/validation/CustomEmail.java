package com.sbc.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import javax.validation.Constraint;
import javax.validation.Payload;

import com.sbc.validation.EmailValidator;

@Constraint(validatedBy = EmailValidator.class)  
@Target( { ElementType.METHOD, ElementType.FIELD } )  
@Retention(RetentionPolicy.RUNTIME)  
public @interface CustomEmail {

	/* return this message if email is invalid */
	public String message() default "Invalid email! Email must contain @employee.com";
	   
    public Class<?>[] groups() default {};
    
    public Class<? extends Payload>[] payload() default {};  
}

