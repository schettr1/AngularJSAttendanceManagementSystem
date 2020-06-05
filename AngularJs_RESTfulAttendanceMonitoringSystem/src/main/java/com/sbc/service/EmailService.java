package com.sbc.service;

import java.io.File;

import javax.mail.internet.MimeBodyPart;
import javax.mail.internet.MimeMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.MailSender;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.sbc.entity.Email;
import com.sbc.exception.FailedEmailDeliveryException;

@Service
public class EmailService {

	/**
	 * Using Spring_MailAPI requires 3 jar files or API "spring-context-support"
	 * "javax-mail-api" "activation"
	 * 
	 * In Springboot, one jar "spring-boot-starter-mail" will do the magic!
	 */

	@Autowired
	private JavaMailSender javaMailSender; /* used for sending MimeMessage */


	/* MailSender is used for sending SimpleMailMessage only, it is not usable to send 'html/text' so use JavaMailSender instead */
	@Autowired
	private MailSender mailSender; 
	
	
	@Value("${spring.mail.username}")		
	private String my_gmail;
	
	public void EmailOnly(Email email) throws Exception {
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

	
	public void EmailwithAttachment(Email email, String[] filesLocation) throws Exception {
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