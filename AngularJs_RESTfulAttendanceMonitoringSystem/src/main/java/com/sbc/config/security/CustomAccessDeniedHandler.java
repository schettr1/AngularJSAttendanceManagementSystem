package com.sbc.config.security;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
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
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
	
	private static final int CODE_FORBIDDEN = 403;
	
	@Override
	public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) 
															throws IOException, ServletException {
         
        CustomExceptionMessage customExceptionMessage = new CustomExceptionMessage
        		(CODE_FORBIDDEN, HttpStatus.FORBIDDEN, new Date(), accessDeniedException.getMessage());
        
        PrintWriter writer = response.getWriter();
        writer.println(convertJavaObjectToJSONString(customExceptionMessage));
		
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
