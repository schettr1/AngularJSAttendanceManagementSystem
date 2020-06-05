package com.sbc.exception;

public class InvalidShiftException extends RuntimeException {

	private static final long serialVersionUID = 1L;

	public InvalidShiftException(String message) {
		super(message);
	}
}
