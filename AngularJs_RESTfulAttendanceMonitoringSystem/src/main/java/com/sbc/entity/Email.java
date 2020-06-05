package com.sbc.entity;

import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.annotation.JsonIgnore;

public class Email {

	private String from;
	private String to;
	private String subject;
	private String text;
	@JsonIgnore
	private MultipartFile file;
	
	public Email() {
		super();
	}
	public Email(String from, String to, String subject, String text) {
		this.from = from;
		this.to = to;
		this.subject = subject;
		this.text = text;
	}
	public Email(String from, String to, String subject, String text, MultipartFile file) {
		this.from = from;
		this.to = to;
		this.subject = subject;
		this.text = text;
		this.file = file;
	}
	public String getFrom() {
		return from;
	}
	public void setFrom(String from) {
		this.from = from;
	}
	public String getTo() {
		return to;
	}
	public void setTo(String to) {
		this.to = to;
	}
	public String getSubject() {
		return subject;
	}
	public void setSubject(String subject) {
		this.subject = subject;
	}
	public String getText() {
		return text;
	}
	public void setText(String text) {
		this.text = text;
	}
	public MultipartFile getFile() {
		return file;
	}
	public void setFile(MultipartFile file) {
		this.file = file;
	}


	
	
	
	
	
	
}
