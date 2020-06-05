package com.sbc.projection;

import com.sbc.enums.EmployeeType;
import com.sbc.enums.GenderType;
import com.sbc.enums.ShiftType;

/**
 * Projections are used in Spring JPA to retrieve object from the database which may be different than the entity defined.
 * Because the columns do not match, spring will throw ERROR "No converter found capable of converting from Type [java.lang.Integer] to [com.sbc.model.Medtech]" 
 * If database column has NULL values then use String datatype to repsesent NULL values.
 */

public interface Employee1 {
	
	public int getEmployeeId();					// getter method must match column name 'employeeid'
	public String getFirstname();		// getter method must match column name 'firstname'
	public String getLastname();		// getter method must match column name 'lastname'
	public String getBirth();			// getter method must match column name 'birth'
	public String getAddress();			// getter method must match column name 'address'
	public String getEmail();			// getter method must match column name 'email'
	public String getUsername();			// getter method must match column name 'username'
	public GenderType getGender();		// getter method must match column name 'gender'
	public ShiftType getShift();		// getter method must match column name 'shift'
	public boolean getEnabled();			// getter method must match column name 'enabled'
	public EmployeeType getEmployee_type();			// getter method must match column name 'employee_type'

	
}
