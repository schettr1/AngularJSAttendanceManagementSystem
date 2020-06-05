package com.sbc.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Use this class to get value from properties file
 *  which then can be used inside Controllers. Normally,
 *  we use @Value to read values from properties file but 
 *  that works only within Components and Services.
 * @author suny4
 *
 */
@Component
public class PropertiesUtil {

	@Value("${spring.mail.username}")		
	private String email;

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}
	
	
}
