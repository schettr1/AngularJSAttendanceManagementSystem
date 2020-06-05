package com.sbc.projection;

import java.util.Date;

import com.sbc.enums.EventType;

public interface Event1 {

	// getter methods must match column name of the database table
	public int getEventId();					
	public String getName();
	public int getCe();
	public String getLocation();
	public EventType getEvent_type();
	public String getDuration();
	public String getSpeaker();
	public Date getStartTimeStamp();
	public Date getEndTimeStamp();
	
}
