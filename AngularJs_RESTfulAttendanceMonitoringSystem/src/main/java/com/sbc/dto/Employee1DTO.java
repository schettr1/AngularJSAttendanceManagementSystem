package com.sbc.dto;

import java.util.Date;

import com.sbc.enums.EmployeeType;
import com.sbc.enums.GenderType;
import com.sbc.enums.ShiftType;

public class Employee1DTO {

	/** 
	 * DTO or Data Transfer Object are used to convert from Entity to Object and vice versa. 
	 * DTO works similar to Interface Projections. DTO contains field names(public), 
	 * setter and getters and constructor
	 **/
	
	private int employeeId;					
	private String firstname;		
	private String lastname;		
	private Date birth;			
	private String address;			
	private String email;			
	private String username;			
	private GenderType gender;		
	private ShiftType shift;		
	private boolean enabled;			
	private EmployeeType employee_type;
	
	/* CONSTRUCTOR + GETTER & SETTER */
	
	public Employee1DTO() {
		
	}
	
	public int getEmployeeId() {
		return employeeId;
	}
	public void setEmployeeId(int employeeId) {
		this.employeeId = employeeId;
	}
	public String getFirstname() {
		return firstname;
	}
	public void setFirstname(String firstname) {
		this.firstname = firstname;
	}
	public String getLastname() {
		return lastname;
	}
	public void setLastname(String lastname) {
		this.lastname = lastname;
	}
	public Date getBirth() {
		return birth;
	}
	public void setBirth(Date birth) {
		this.birth = birth;
	}
	public String getAddress() {
		return address;
	}
	public void setAddress(String address) {
		this.address = address;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public GenderType getGender() {
		return gender;
	}
	public void setGender(GenderType gender) {
		this.gender = gender;
	}
	public ShiftType getShift() {
		return shift;
	}
	public void setShift(ShiftType shift) {
		this.shift = shift;
	}
	public boolean isEnabled() {
		return enabled;
	}
	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}
	public EmployeeType getEmployee_type() {
		return employee_type;
	}
	public void setEmployee_type(EmployeeType employee_type) {
		this.employee_type = employee_type;
	}		
	
	

}
