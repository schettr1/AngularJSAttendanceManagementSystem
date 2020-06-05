package com.sbc.jwt;

import java.io.Serializable;
import java.util.List;

public class JWTResponse implements Serializable {

	private static final long serialVersionUID = 1L;
	
	private final String access_token;
	private final String refresh_token;
	private final int employeeId;
	private final String[] roles;
	
	// constructor + getter method
	
	public JWTResponse(String access_token, String refresh_token, int employeeId, String[] roles) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;
		this.employeeId = employeeId;
		this.roles = roles;
	}

	public String getAccess_token() {
		return access_token;
	}

	public String getRefresh_token() {
		return refresh_token;
	}

	public int getEmployeeId() {
		return employeeId;
	}

	public String[] getRoles() {
		return roles;
	}
	
	
}
