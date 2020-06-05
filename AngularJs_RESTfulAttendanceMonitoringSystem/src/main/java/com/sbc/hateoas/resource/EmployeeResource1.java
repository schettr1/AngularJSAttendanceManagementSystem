package com.sbc.hateoas.resource;

import org.springframework.hateoas.ResourceSupport;

import com.sbc.projection.Employee1;

public class EmployeeResource1 extends ResourceSupport {

	public Employee1 employee;
	
	public EmployeeResource1(Employee1 employee) {
		this.employee = employee;
	}
}
