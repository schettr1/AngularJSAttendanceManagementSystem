package com.sbc.converter;

import java.util.Arrays;

/**
 * It is used in AuthService and EmployeeService.
 * It is different from projection because projection has methods that match the columns of resultSet.
 * but Converter is a class that contains specific parameters. EmployeeCredentials has username, password and roles only. 
 *
 * 	{
 * 		"employeeId": 3001,
 *    	"username": "surya",
 *    	"password": "$2a$10$aRwVeemUfr2bzos2G6cjeOi0VfMc8NWu9ckS7XAzgRlzh5PKDEcaK",
 *    	"roles": [ "ROLE_ADMIN", "ROLE_USER" ]
 * 	}
 * 
 */

public class EmployeeCredentials {

	private int employeeId;
	private String username;
	private String password;
	private String[] roles;
	
	/* constructor + setter and getter + toString */
	
	public EmployeeCredentials() {
		
	}	
	public int getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(int employeeId) {
		this.employeeId = employeeId;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public String[] getRoles() {
		return roles;
	}
	public void setRoles(String[] roles) {
		this.roles = roles;
	}
	@Override
	public String toString() {
		return "EmployeeConverter [username=" + username + ", password=" + password + ", roles=" + Arrays.toString(roles) + "]\n";
	}
	
	
	
}
