package com.sbc.hateoas.resource;

import org.springframework.hateoas.ResourceSupport;

import com.sbc.dto.EmployeeDTO;

public class EmployeeDTOResource extends ResourceSupport {

	public EmployeeDTO employee;
	
	public EmployeeDTOResource(EmployeeDTO employee) {
		this.employee = employee;
	}
}
