package com.sbc.dto;

import com.sbc.enums.EmployeeType;
import com.sbc.enums.GenderType;
import com.sbc.enums.ShiftType;

public class EmployeeDTO  {

	/** 
	 * DTO or Data Transfer Object are used to convert from Entity to Object and vice versa. 
	 * DTO works similar to Interface Projections. DTO contains field names(public), 
	 * setter and getters and constructor
	 **/
	
	public int employeeId;
	public String firstname;
	public String lastname;
	public String birth;
	public String email;
	public GenderType gender;
	public boolean enabled;
	public EmployeeType employee_type;
	public ShiftType shift;
	public int eventId;
	
	/* constructor + setter and getter */
	
	public EmployeeDTO() {

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
	public String getBirth() {
		return birth;
	}
	public void setBirth(String birth) {
		this.birth = birth;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public GenderType getGender() {
		return gender;
	}
	public void setGender(GenderType gender) {
		this.gender = gender;
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
	public ShiftType getShift() {
		return shift;
	}
	public void setShift(ShiftType shift) {
		this.shift = shift;
	}
	public int getEventId() {
		return eventId;
	}
	public void setEventId(int eventId) {
		this.eventId = eventId;
	}
	
	
}
