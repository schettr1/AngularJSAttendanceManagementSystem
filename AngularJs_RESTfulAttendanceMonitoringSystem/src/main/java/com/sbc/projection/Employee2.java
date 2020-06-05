package com.sbc.projection;

import com.sbc.enums.EmployeeType;
import com.sbc.enums.GenderType;
import com.sbc.enums.ShiftType;

/**
 * If column has NULL values then use String datatype to repsesent NULL values.
 * Projection Interface works like a custom entity that maps to the database query objects because query objects may look 
 * slightly different than our entities.
 * DTO or Data Transfer Object are similar to Projection Interface.
 * DTO contains all the fields of the query object, setter and getters and constructor
 * 
 */

public interface Employee2 {
	
	// All getter method must match database column names
	
	public int getEmployeeId();					
	public String getFirstname();		
	public String getLastname();		
	public String getBirth();			
	public String getEmail();			
	public GenderType getGender();		
	public boolean getEnabled();			
	public EmployeeType getEmployee_type();			
	public ShiftType getShift();
	public int getEventId();		
	
}
