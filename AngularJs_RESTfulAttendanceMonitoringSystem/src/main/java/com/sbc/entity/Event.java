package com.sbc.entity;

import java.util.Calendar;
import java.util.Date;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sbc.enums.EventStatus;
import com.sbc.enums.EventType;

@Entity
@Table(name="EVENTS")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "employees"})    // ignore these properties while fetching Event object to prevent infinite loop

public class Event {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="EVENTID")
	private int eventId;
	
	@Column(name="NAME")
	private String name;
	
	@Column(name="CE")
	private int ce;
	
	@Column(name="EVENT_TYPE")
	private EventType type;
	
	@Column(name="STATUS")
	private EventStatus status;
	
	@Column(name="SPEAKER")
	private String speaker;
	
	@Column(name="LOCATION")
	private String location;
	
	@Column(name="STARTTIMESTAMP")
	private Date startTimeStamp;
	
	@Column(name="ENDTIMESTAMP")
	private Date endTimeStamp;
	
	@Column(name="DURATION")
	private String duration;

	@ManyToMany(mappedBy="events", cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, fetch=FetchType.LAZY)
	private Set<Employee> employees;
	
	
	// Getter and Setter + Constructor + hashCode and Equals

	public Event() {
	}
	public int getEventId() {
		return eventId;
	}
	public void setEventId(int eventId) {
		this.eventId = eventId;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public int getCe() {
		return ce;
	}
	public void setCe(int ce) {
		this.ce = ce;
	}
	public EventType getType() {
		return type;
	}
	public void setType(EventType type) {
		this.type = type;
	}
	public EventStatus getStatus() {
		return status;
	}
	public void setStatus(EventStatus status) {
		this.status = status;
	}
	public String getSpeaker() {
		return speaker;
	}
	public void setSpeaker(String speaker) {
		this.speaker = speaker;
	}
	public String getLocation() {
		return location;
	}
	public void setLocation(String location) {
		this.location = location;
	}
	public Date getStartTimeStamp() {
		return startTimeStamp;
	}
	public void setStartTimeStamp(Date startTimeStamp) {
		this.startTimeStamp = startTimeStamp;
	}
	public Date getEndTimeStamp() {
		return endTimeStamp;
	}
	public void setEndTimeStamp(Date endTimeStamp) {
		this.endTimeStamp = endTimeStamp;
	}
	public String getDuration() {
	     // create a calendar and assign it the same time
	    Calendar cal = Calendar.getInstance();
	    cal.setTimeInMillis(this.startTimeStamp.getTime());
	 
	    // add a bunch of random seconds to the calendar 
	    cal.add(Calendar.SECOND, 98765);
	 
	    // get time difference in seconds
	    long milliseconds = this.endTimeStamp.getTime() - this.startTimeStamp.getTime();
	    int seconds = (int) milliseconds / 1000;
	 
	    // calculate hours minutes and seconds
	    int hours = seconds / 3600;
	    int minutes = (seconds % 3600) / 60;
	    seconds = (seconds % 3600) % 60;
	    
	    String duration = hours + "HH : " + minutes + "MM";
		return duration;
	}
	public void setDuration(String duration) {
		/* WHEN USER ENTERS STARTTIMESTAMP AND ENDTIMESTAMP, DURATION IS CALCULATED AND INSERTED TO DATABASE */
	     // create a calendar and assign it the same time
	    Calendar cal = Calendar.getInstance();
	    cal.setTimeInMillis(this.startTimeStamp.getTime());
	 
	    // add a bunch of random seconds to the calendar 
	    cal.add(Calendar.SECOND, 98765);
	 
	    // get time difference in seconds
	    long milliseconds = this.endTimeStamp.getTime() - this.startTimeStamp.getTime();
	    int seconds = (int) milliseconds / 1000;
	 
	    // calculate hours minutes and seconds
	    int hours = seconds / 3600;
	    int minutes = (seconds % 3600) / 60;
	    seconds = (seconds % 3600) % 60;
	 
	 
	    System.out.println("startTimeStamp: " + this.startTimeStamp);
	    System.out.println("endTimeStamp: " + this.endTimeStamp);
	 
	    System.out.print("Difference :");
	    System.out.print(" Hours: " + hours);
	    System.out.print(", Minutes: " + minutes);
	    System.out.print(", Seconds: " + seconds);
	    
	    String calcDuration = hours + "HH : " + minutes + "MM";
	    System.out.println("duration : " + calcDuration);
		this.duration = calcDuration;
	}
	
	public Set<Employee> getEmployees() {
		return employees;
	}
	public void setEmployees(Set<Employee> employees) {
		this.employees = employees;
	}
	
	
	
	@Override
	public String toString() {
		return "Event [eventId=" + eventId + ", name=" + name + ", ce=" + ce + ", type=" + type + ", status=" + status
				+ ", speaker=" + speaker + ", location=" + location + ", startTimeStamp=" + startTimeStamp
				+ ", endTimeStamp=" + endTimeStamp + ", duration=" + duration + "]\n";
	}
	
	
	
}
