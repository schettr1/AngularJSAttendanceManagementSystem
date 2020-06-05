package com.sbc.config.security;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sbc.exception.CustomExceptionMessage;

/**
 * AuthenticationEntryPoint is where all http response arrives.
 * It allows us to customize the Http response by setting the headers and body in the response. 
 * Lets suppose two APIs are communicating instead of 
 * a human client trying to consume web services. If authentication fails a response is 
 * expected in JSON/text format and not a jsp/html page.
 */

@Component
public class CustomBasicAuthenticationEntryPoint extends BasicAuthenticationEntryPoint {
	
	private static final int CODE_UNAUTHORIZED = 401;
	
	@Override
    public void commence(final HttpServletRequest request, final HttpServletResponse response, final AuthenticationException authException) 
    																		throws IOException, ServletException {
        // If Authentication failed, send this message in response.
		
		// set Response Header
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        // 'WWW-Authenticate' header will prompt browser to pop up login message
        //response.addHeader("WWW-Authenticate", "Basic realm=" + getRealmName() + "");
         
        CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage
        		(CODE_UNAUTHORIZED, HttpStatus.UNAUTHORIZED, new Date(), authException.getMessage());
        
        PrintWriter writer = response.getWriter();
        writer.println(convertJavaObjectToJSONString(customExceptionMessage));
    }
     
	
    @Override
    public void afterPropertiesSet() throws Exception {
        setRealmName("MY_TEST_REALM");
        super.afterPropertiesSet();
    }
    
    
    /** 
     * convert Exception Java Object to JSON String 
     * @param Object 
     * @return String 
     */  
    private String convertJavaObjectToJSONString(Object obj) {  
        ObjectMapper mapper = new ObjectMapper();  
        String JSON = "";  
        try {  
            JSON = mapper.writeValueAsString(obj);  
        } catch (JsonProcessingException e) {  
            e.printStackTrace();  
        }            
        return JSON;         
    }  
}
