package com.sbc.config.email;

import java.util.Properties;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.web.multipart.commons.CommonsMultipartResolver;

@Configuration
public class EmailConfig {

	private static final String SENDER_EMAIL = "suchettri1@gmail.com";//change with your sender email
	
	@Bean
	public MailSender mailSender() {
		JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

		Properties props = new Properties();
		props.put("mail.smtp.auth", "true");				// Outgoing server requires authentication
		props.put("mail.smtp.starttls.enable", "true");		// TLS must be activated
		//props.put("mail.smtp.allow8bitmime", "true");		// allow {HTML, UTF-8} message type instead of plain/text
		//props.put("mail.mime.charset", "utf8");
		mailSender.setJavaMailProperties(props);

		mailSender.setUsername(SENDER_EMAIL);
		mailSender.setPassword("333Network");			// change with your sender email password
		mailSender.setHost("smtp.gmail.com"); 			// Outgoing smtp server - change it to your SMTP server
		mailSender.setPort(587);						// Outgoing port
		//mailSender.setDefaultEncoding("UTF-8");			// allow {HTML, UTF-8} message type instead of plain/text
		return mailSender;
	}

	
	@Bean
	public SimpleMailMessage defaultMessage() {
		SimpleMailMessage smm = new SimpleMailMessage();
		smm.setTo("suny4evers@hotmail.com");
		smm.setFrom(SENDER_EMAIL);
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
