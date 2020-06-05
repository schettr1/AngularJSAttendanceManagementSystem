package com.sbc.exception;

public class InvalidUsernameException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public InvalidUsernameException(String message) {
		super(message);
	}
}
