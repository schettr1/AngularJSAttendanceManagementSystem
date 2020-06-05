package com.sbc.entity;

import java.util.Date;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.DiscriminatorColumn;
import javax.persistence.DiscriminatorType;
import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Inheritance;
import javax.persistence.InheritanceType;
import javax.persistence.JoinColumn;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.NamedQuery;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.Proxy;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.sbc.entity.Role;
import com.sbc.enums.GenderType;
import com.sbc.enums.ShiftType;
import com.sbc.validation.CustomEmail;

/**
 * Using @GeneratedValue(strategy=GenerationType.AUTO) or (GenerationType.IDENTITY) or (GenerationType.SEQUENCE)
 * does not allow user made IDs to be saved in database tables. These strategies automatically generate IDs which 
 * overwrites any ID provided by the user. While updating employee from ADMIN to MEDTECH, we must create new Medtech
 * object, transfer all the properties values from Admin to Medtech and save Medtech object to the database. But these
 * @GeneratedValue strategies will overwrite the existing ID with newly genereated value which is not acceptable.
 */

@Entity
@Table(name="EMPLOYEES")
@Inheritance(strategy=InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="EMPLOYEE_TYPE", discriminatorType=DiscriminatorType.INTEGER)
@DiscriminatorValue(value="0")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "subordinates", "supervisor", "events", "roles"})  
/**
 * @JsonIgnoreProperties do not participate in JSON serialization/deserialization. It prevents circular mapping between employee and role objects
 * while fetching employee object. Error related to such problem is - 
 * Resolved [org.springframework.http.converter.HttpMessageNotWritableException: Could not write JSON: could not initialize proxy [com.sbc.entity.Employee#1000] - 
 * no Session; nested exception is com.fasterxml.jackson.databind.JsonMappingException: could not initialize proxy [com.sbc.entity.Employee#1000] - 
 * no Session (through reference chain: com.sbc.hateoas.resource.EmployeeResource["employee"]->com.sbc.entity.Medtech["supervisor"]->com.sbc.entity.Employee$HibernateProxy$y8vYuhOy["firstname"])]
 * @author suny4
 */
public class Employee {

	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
	@Column(name="EMPLOYEEID")
	private int employeeId;
	
	@Column(name="FIRSTNAME")
	private String firstname;
	
	@Column(name="LASTNAME")
	private String lastname;
	
	@Column(name="BIRTH")
	private Date birth;
	
	@Column(name="GENDER")
	private GenderType gender;
	
	@Column(name="SHIFT")
	private ShiftType shift;
	
	@Column(name="ENABLED")
	private boolean enabled;

	@Column(name="ADDRESS")
	private String address;

	@CustomEmail
	@Column(name="EMAIL")
    private String email;
	
	@Column(name="USERNAME")
    private String username;
	
	@Column(name="PASSWORD")
    private String password;
	
	@ManyToMany(cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, fetch=FetchType.LAZY)
	@JoinTable(name="EVENTS_EMPLOYEES", 
		joinColumns={@JoinColumn(name="EMPLOYEEID_FK", insertable=false, updatable=false, nullable=false)}, 
		inverseJoinColumns={@JoinColumn(name="EVENTID_FK", insertable=false, updatable=false, nullable=false)
	})
	private Set<Event> events;
	
	@ManyToOne(cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, fetch=FetchType.LAZY)	// Refer to 'subordinates'
	@JoinColumn(name="SUPERVISORID")
	private Employee supervisor;
	
	@OneToMany(mappedBy="supervisor", cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, fetch=FetchType.LAZY)	// Refer to 'supervisor'
	private Set<Employee> subordinates;

	@OneToMany(cascade={CascadeType.MERGE, CascadeType.PERSIST, CascadeType.REFRESH}, mappedBy = "employee")	
	private Set<Role> roles;
	
	
	
	/* constructor + setters and getters */
	
	public Employee() {		
	}	
	
	public Employee(int employeeId, String firstname, String lastname, Date birth, GenderType gender, ShiftType shift,
			boolean enabled, String address, String email, String username, String password) {
		this.employeeId = employeeId;
		this.firstname = firstname;
		this.lastname = lastname;
		this.birth = birth;
		this.gender = gender;
		this.shift = shift;
		this.enabled = enabled;
		this.address = address;
		this.email = email;
		this.username = username;
		this.password = password;
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
	public String getPassword() {
		return password;
	}
	public void setPassword(String password) {
		this.password = password;
	}
	public Set<Event> getEvents() {
		return events;
	}
	public void setEvents(Set<Event> events) {
		this.events = events;
	}
	public Employee getSupervisor() {
		return supervisor;
	}
	public void setSupervisor(Employee supervisor) {
		this.supervisor = supervisor;
	}
	public Set<Employee> getSubordinates() {
		return subordinates;
	}
	public void setSubordinates(Set<Employee> subordinates) {
		this.subordinates = subordinates;
	}
	public Set<Role> getRoles() {
		return roles;
	}
	public void setRoles(Set<Role> roles) {
		this.roles = roles;
	}

	@Override
	public String toString() {
		return "Employee [employeeId=" + employeeId + ", firstname=" + firstname + ", lastname=" + lastname + ", birth="
				+ birth + ", gender=" + gender + ", shift=" + shift + ", enabled=" + enabled + ", address=" + address
				+ ", email=" + email + ", username=" + username + ", password=" + password + ", roles=" + roles + "]";
	}
	
	
	
}
