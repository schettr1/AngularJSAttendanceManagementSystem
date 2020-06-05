package com.sbc.exception;

public class MissingFieldsException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public MissingFieldsException(String message) {
		super(message);
	}
}
