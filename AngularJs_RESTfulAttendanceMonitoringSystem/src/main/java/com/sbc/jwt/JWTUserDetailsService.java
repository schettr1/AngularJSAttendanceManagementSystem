package com.sbc.jwt;

import java.util.Arrays;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.sbc.converter.EmployeeCredentials;
import com.sbc.entity.Employee;
import com.sbc.repository.EmployeeRepository;

@Service
@Transactional
public class JWTUserDetailsService implements UserDetailsService {

	@Autowired
	private EmployeeRepository employeeRepository;

	/* FIND EMPLOYEE USING USERNAME AND CONVERT IT TO EMPLOYEECREDENTIALS OBJECT  */
	public EmployeeCredentials findUserByUsername(String username) {
		Employee foundEmployee = employeeRepository.findByUsername(username);

		// convert Employee to EmployeeCredentials
		EmployeeCredentials employeeCredentials = new EmployeeCredentials();
		if (foundEmployee != null) {
			employeeCredentials.setUsername(foundEmployee.getUsername());
			String[] roles = new String[foundEmployee.getRoles().size()];		
			roles = foundEmployee.getRoles().stream().map(role -> role.getRole()).toArray(String[]::new);	// convert Set<Role> to Array of Strings that contains "Role.getRole()"
			System.out.println("\nROLES=" + Arrays.toString(roles)+"\n");
			employeeCredentials.setRoles(roles);
		}
		return employeeCredentials;
	}

	/* CREATE USERDETAILS FROM THE FOUND EMPLOYEE */
	@Override
	public UserDetails loadUserByUsername(String username) {

		/* search Employee by username */
		Employee foundEmployee = employeeRepository.findByUsername(username);

		/*
		 * convert Employee to UserDetails(which is understood by Spring Security) using
		 * UserBuilder
		 */
		UserBuilder userBuilder = null;
		if (foundEmployee != null) {
			userBuilder = org.springframework.security.core.userdetails.User.withUsername(username);
			userBuilder.disabled(!foundEmployee.isEnabled());
			userBuilder.password(foundEmployee.getPassword());
			String[] roles = foundEmployee.getRoles().stream().map(role -> role.getRole()).toArray(String[]::new);
			userBuilder.authorities(roles);
			System.out.println("\nROLES=" + Arrays.toString(roles)+"\n");
		} else {
			throw new UsernameNotFoundException(username + " is invalid username.");
		}

		return userBuilder.build();
	}

}
