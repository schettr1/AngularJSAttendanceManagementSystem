package com.sbc.hateoas.resource;

import org.springframework.hateoas.ResourceSupport;

import com.sbc.entity.Employee;

public class EmployeeResource extends ResourceSupport {

	public Employee employee;
	
	public EmployeeResource(Employee employee) {
		this.employee = employee;
	}
}
