package com.sbc.validation;

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;

import com.sbc.validation.CustomEmail;

/**
 * @ add Employee entity only if email contains "@gmail.com"
 *
 */
public class EmailValidator implements ConstraintValidator<CustomEmail, String> {


	@Override
	public void initialize(CustomEmail constraintAnnotation) {
		// TODO Auto-generated method stub
		
	}

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {

		boolean result = value.contains("@gmail.com");
		return result;
	}

}