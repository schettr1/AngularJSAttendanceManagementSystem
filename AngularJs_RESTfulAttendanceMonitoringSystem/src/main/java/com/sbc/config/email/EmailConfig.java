package com.sbc.config.email;

import java.util.Properties;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

@Configuration
public class EmailConfig {
	
	@Value("${spring.mail.username}")		
	private String SENDER_USERNAME;
	
	@Value("${spring.mail.password}")		
	private String SENDER_PASSWORD;
	
	@Value("${spring.mail.host}")		
	private String SENDER_HOST;
	
	@Value("${spring.mail.port}")		
	private int SENDER_PORT;
	
	@Value("${spring.mail.properties.mail.smtp.auth}")		
	private boolean MAIL_SMTP_AUTH;
	
	@Value("${spring.mail.properties.mail.smtp.starttls.enable}")		
	private boolean MAIL_SMTP_STARTTLS_ENABLE;
	
	@Bean
	public MailSender mailSender() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

		Properties props = new Properties();
		props.put("mail.smtp.auth", MAIL_SMTP_AUTH);							// Outgoing server requires authentication
		props.put("mail.smtp.starttls.enable", MAIL_SMTP_STARTTLS_ENABLE);		// TLS must be activated
		//props.put("mail.smtp.allow8bitmime", "true");							// allow {HTML, UTF-8} message type instead of plain/text
		//props.put("mail.mime.charset", "utf8");
		mailSender.setJavaMailProperties(props);

		mailSender.setUsername(SENDER_USERNAME);
		mailSender.setPassword(SENDER_PASSWORD);			// change with your sender email password
		mailSender.setHost(SENDER_HOST); 					// Outgoing smtp server - change it to your SMTP server
		mailSender.setPort(SENDER_PORT);					// Outgoing port
		//mailSender.setDefaultEncoding("UTF-8");			// allow {HTML, UTF-8} message type instead of plain/text
		return mailSender;
	}

	
	@Bean
	public SimpleMailMessage defaultMessage() {
		SimpleMailMessage smm = new SimpleMailMessage();
		smm.setTo("suny4evers@hotmail.com");
		smm.setFrom(SENDER_USERNAME);
		smm.setSubject("Test");
		smm.setText("This is testing!");
		return smm;
	}
	

	@Bean(name = "multipartResolver")
	public CommonsMultipartResolver multipartResolver() {
	    CommonsMultipartResolver multipartResolver = new CommonsMultipartResolver();
	    multipartResolver.setMaxUploadSize(26214400);	// for Gmail max upload size is 25 MB = 25 x 1024 x 1024 = 26214400 Bytes
	    return multipartResolver;
	}
}
