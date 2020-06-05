package com.sbc.service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import javax.persistence.CascadeType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.sbc.converter.EmployeeCredentials;
import com.sbc.entity.Admin;
import com.sbc.entity.Employee;
import com.sbc.entity.Medtech;
import com.sbc.entity.Role;
import com.sbc.entity.Supervisor;
import com.sbc.enums.EmployeeType;
import com.sbc.enums.ShiftType;
import com.sbc.exception.EmployeeNotFoundException;
import com.sbc.exception.InvalidEmployeeException;
import com.sbc.exception.InvalidRequestException;
import com.sbc.exception.InvalidUsernameException;
import com.sbc.exception.MissingFieldsException;
import com.sbc.projection.Employee1;
import com.sbc.projection.Employee2;
import com.sbc.projection.Employee5;
import com.sbc.projection.Employee6;
import com.sbc.repository.EmployeeRepository;
import com.sbc.repository.RoleRepository;

@Service
@Transactional
public class EmployeeService {

	private static final Logger LOG = LoggerFactory.getLogger(EmployeeService.class); 
	
	@Autowired
	EmployeeRepository employeeRepository;
	
	@Autowired
	RoleRepository roleRepository;
	
	@Autowired
	EventService eventService;
	

	//********************************** FIND USER CREDENTIALS *******************************************//
	public EmployeeCredentials findUserCredentials(String username) {
		LOG.info("enter listRoles() method.");
		Employee foundEmployee = employeeRepository.findByUsername(username);
		
		EmployeeCredentials employeeConverter = new EmployeeCredentials();
		if (foundEmployee != null) {
			employeeConverter.setEmployeeId(foundEmployee.getEmployeeId());
			employeeConverter.setUsername(foundEmployee.getUsername());
			employeeConverter.setPassword(foundEmployee.getPassword());
			String[] roles = new String[foundEmployee.getRoles().size()];		// String[] array = new String[length]	
			roles = foundEmployee.getRoles().stream().map(role -> role.getRole()).toArray(String[]::new);	// convert Set<Role> to Array of Strings that contains "Role.getRole()"
			LOG.info("\nROLES=" + Arrays.toString(roles)+"\n");
			employeeConverter.setRoles(roles);
		}
		return employeeConverter;
	}
	
	
	//*********************************** TOKEN BASED PASSWORD CHANGE - FIND BY USERNAME ***********************************//
	public Employee findByUsername(String username) {
		// must retun Employee1DTO which is same for all employee types.
		// returning Employee will give proxy error for Medtech since supervisor will be extra column 
		// solved by setSupervisor == null 
		// new problem resetting password removed employee supervisorId
		LOG.info("inside findByUsername() method.");
		Employee emp = employeeRepository.findByUsername(username);
		LOG.info("emp=" + emp.toString());
		//emp.setSupervisor(null);
		return emp;
	}
		
	
	//********************************** FIND BY ID - authService only **********************************//
	/**
	 *  FIND BY ID 
	 * @param id
	 * @return Employee
	 * used in Auth Service to get {employeeId, username, password and roles}
	 * used to check if Employee is present or not
	 */
	public Employee findById(int id) {
		LOG.info("enter findById() method."); 
		Optional<Employee> optionalEmployee = employeeRepository.findById(id);
		if(optionalEmployee.isPresent()) {
			Employee employee = optionalEmployee.get();
			LOG.trace(employee.toString()); 
			return employee;	
		}
		LOG.info("exit findById() method."); 
		return null;
	}
	

	//*********************************** FIND EMPLOYEE BY ID ************************************//
	public Employee1 findByEmployeeId(int id) {
		LOG.info("enter findByEmployeeId() method."); 
		return employeeRepository.findByEmployeeId(id);
	}
	
	
	//*********************************** FIND SUPERVISOR BY ID ************************************//
	public Employee1 findSupervisorById(int id) {
		LOG.info("enter findSupervisorById() method."); 
		return employeeRepository.findSupervisorById(id);
	}
	
	
	//************************************ CREATE ADMIN (method overloading) ***********************************//
	public Employee save(Admin newAdmin) {
		LOG.info("enter save() admin method.");		
		// validate username, email and bcrypt password
		validateUsernameAndEmailAndBcryptPassword(newAdmin);			
		// set status to true 
		newAdmin.setEnabled(true);
		Employee employee = employeeRepository.save(newAdmin);	
		// save role for newAdmin
		Role role = new Role();
		role.setRole("ROLE_ADMIN");
		role.setEmployee(newAdmin);
		roleRepository.save(role);
		return employee;
	}
	
	
	//*********************************** CREATE MEDTECH (method overloading) ***********************************//
	public Employee save(Medtech newMtech) {
		LOG.info("enter save() medtech method.");		
		// validate username, email and bcrypt password
		validateUsernameAndEmailAndBcryptPassword(newMtech);			
		// set status to true 
		newMtech.setEnabled(true);	
		// find active supervisor of that shift
		Employee activeSupervisor = employeeRepository.getActiveSupervisorByShift(getShiftFromShiftType(newMtech.getShift()));
		// add supervisor to the medtech
		newMtech.setSupervisor(activeSupervisor);
		Employee employee = employeeRepository.save(newMtech);		
		// save role for newMtech
		Role role = new Role();
		role.setRole("ROLE_MEDTECH");
		role.setEmployee(newMtech);
		roleRepository.save(role);
		return employee;
	}
	
	
	//*********************************** CREATE SUPERVISOR (method overloading) ***********************************//
	/***
	 * @NOTE There can be multiple Supervisors in a shift but only one Supervisor can be active in a shift at any given time
  	 * @Steps
  	 * 1. Find shift of new supervisor.
     * 2. Find current supervisor of that shift.
     * 3. Transfer all subordinates from current supervisor to new supervisor.
     * 4. Inactivate current supervisor.	
     * 5. Activate and save new supervisor.
	 */
	public Employee save(Supervisor newSupervisor) {
		LOG.info("enter save() supervisor method."); 
		// validate username, email and bcrypt password
		validateUsernameAndEmailAndBcryptPassword(newSupervisor);
		// find active supervisor for the shift
		Employee activeSupervisor = employeeRepository.getActiveSupervisorByShift(getShiftFromShiftType(newSupervisor.getShift()));
		
		// transfer subordinates from activeSupervisor to newSupervisor
		if(activeSupervisor != null) {
			replaceCurrentSupervisorWithNewSupervisor(activeSupervisor, newSupervisor);
		}	
		// disable activeSupervisor  
		activeSupervisor.setEnabled(false);		
		// enable newSupervisor  
		newSupervisor.setEnabled(true);	
		// save newSupervisor
		Employee updatedSupervisor = employeeRepository.save(newSupervisor);						
		// save role for newSupervisor
		Role role = new Role();
		role.setRole("ROLE_ADMIN");
		role.setEmployee(newSupervisor);
		roleRepository.save(role);
		return updatedSupervisor;
	}	
	
	
	
	//***********************************  UPDATE EMPLOYEE INFORMATION  ************************************//
	public Employee update(Employee updatedEmp, String updatedEmployee_Type) {
		LOG.info("enter update() method."); 
		
		// do not allow to update default Admin & Supervisors
		if(updatedEmp.getEmployeeId() == 100 || updatedEmp.getEmployeeId() == 200 || updatedEmp.getEmployeeId() == 300 || updatedEmp.getEmployeeId() == 400) {
			throw new InvalidRequestException("Do not have permission to update the employee");
		}
		
		// 1. Find current employee using updatedEmp employeeId 
		Employee currentEmployee = findById(updatedEmp.getEmployeeId());
		
		if(currentEmployee == null) {
			LOG.warn("Id " + updatedEmp.getEmployeeId() + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + updatedEmp.getEmployeeId() + " is not present in the Database");
		}				
		

		System.out.println("\n currentEmployee=" + currentEmployee.toString());
		
		/*
		 * 2. Transfer properties from updatedEmp to currentEmployee 
		 * Update only those properties that are allowed; username is not allowed to update, password reset has separate API resource 
		 * Role/Shift are updated only after updating employee_type and/or replacing activeSupervisor.
		 * When medtech become admin and later become medtech again, events of that employee will be still available
		 */
		currentEmployee.setFirstname(updatedEmp.getFirstname()); 		
		currentEmployee.setLastname(updatedEmp.getLastname());		
		currentEmployee.setBirth(updatedEmp.getBirth()); 			
		currentEmployee.setAddress(updatedEmp.getAddress());			
		currentEmployee.setEmail(updatedEmp.getEmail()); 				
		currentEmployee.setGender(updatedEmp.getGender());					
		
		// 3a. Employee role changes from MEDTECH to ADMIN
		if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_MEDTECH") && updatedEmployee_Type.equals("ADMIN")) {
			LOG.info("Employee role changes from MEDTECH to ADMIN");
			// 3. change employee_type of Medtech to Admin
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 1);
			// 4. set supervisor of employee to null
			currentEmployee.setSupervisor(null);
			System.out.println("admin.getEmployeeId()=" + currentEmployee.getEmployeeId());
			// 5. Set role to ROLE_ADMIN
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_ADMIN");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);
			// 6. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift());  			
		}
		
		// 3b. Employee role changes from MEDTECH to SUPERVISOR
		else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_MEDTECH") && updatedEmployee_Type.equals("SUPERVISOR")) {
			LOG.info("Employee role changes from MEDTECH to SUPERVISOR");
			// 3. Find current Supervisor of updatedEmp shift
			Employee currentSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());
			// 4. Transfer all subordinates from current supervisor to new Supervisor
			replaceCurrentSupervisorWithNewSupervisor(currentSupervisor, currentEmployee);
			// 5. Disable current Supervisor
			currentSupervisor.setEnabled(false); 
			// 6. change employee_type of Medtech to Supervisor
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 2);
			// 7. set supervisor of employee to null
			currentEmployee.setSupervisor(null);
			// 8. Set role of employee to ROLE_SUPERVISOR
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_SUPERVISOR");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);
			// 9. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift()); 
		}
		
		
		// 3c. Employee role changes from ADMIN to MEDTECH - Admin  to medtech works if it is same shift but admin to medtech in different shift returns admin of updated shift.
		else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_ADMIN") && updatedEmployee_Type.equals("MEDTECH")) {
			LOG.info("Employee role changes from ADMIN to MEDTECH");
			// 3. Change employee_type of employee to Medtech
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 3);
			// 4. Find current supervisor of updated Admin
			Employee currentSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());
			// 5. Set supervisor of employee to current supervisor
			currentEmployee.setSupervisor(currentSupervisor);
			// 6. Set role of employee to ROLE_MEDTECH
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_MEDTECH");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);	
			// 7. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift()); 
		}
		
		// 3d. Employee role changes from ADMIN to SUPERVISOR
		else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_ADMIN") && updatedEmployee_Type.equals("SUPERVISOR")) {
			LOG.info("Employee role changes from ADMIN to SUPERVISOR");
			// 4. Find current supervisor of updated Admin
			Employee currentSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());
			// 5. Transfer all subordinates from current supervisor to new Supervisor
			replaceCurrentSupervisorWithNewSupervisor(currentSupervisor, currentEmployee);
			// 6. Disable current Supervisor
			currentSupervisor.setEnabled(false); 
			// 7. Change employee_type of employee to Supervisor
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 2);	
			// 8. Set supervisor or employee to null
			currentEmployee.setSupervisor(null);
			// 9. Set role of employee to ROLE_SUPERVISOR
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_SUPERVISOR");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);	
			// 10. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift()); 						
		}
		
		// 3e. Employee role changes from SUPERVISOR to ADMIN		
		else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_SUPERVISOR") && updatedEmployee_Type.equals("ADMIN")) {
			LOG.info("Employee role changes from SUPERVISOR to ADMIN");
			// 3. Make default supervisor as supervisor of current shift of employee.
			Employee newSupervisor = null;
			if(currentEmployee.getShift() == ShiftType.DAY) {
				newSupervisor = findById(100);
			}
			else if(currentEmployee.getShift() == ShiftType.EVENING) {
				newSupervisor = findById(200);
			}
			else {   // if(currentEmployee.getShift() == ShiftType.EVENING)
				newSupervisor = findById(300);
			}
			// 4. Transfer subordinates from currentEmployee to newSupervisor
			replaceCurrentSupervisorWithNewSupervisor(currentEmployee, newSupervisor);
			// 5. Enable new supervisor
			newSupervisor.setEnabled(true);
			// 6. Change employee_type of Supervisor to Admin
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 1);
			// 7. Set supervisor of employee to null
			currentEmployee.setSupervisor(null);
			// 8. Set role of employee as ROLE_ADMIN
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_ADMIN");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);
			// 9. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift()); 			
		}
		
		// 3f. Employee role changes from SUPERVISOR to MEDTECH		
		else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_SUPERVISOR") && updatedEmployee_Type.equals("MEDTECH")) {		
			LOG.info("Employee role changes from SUPERVISOR to MEDTECH");
			// 3. Make default supervisor as supervisor of current shift of employee.
			Employee newSupervisor = null;
			if(currentEmployee.getShift() == ShiftType.DAY) {
				newSupervisor = findById(100);
				LOG.info("\n newSupervisor= [" + newSupervisor.getEmployeeId() + ", " + newSupervisor.getFirstname() + ", " + newSupervisor.getLastname() + "]");
			}
			else if(currentEmployee.getShift() == ShiftType.EVENING) {
				newSupervisor = findById(200);
				LOG.info("\n newSupervisor= [" + newSupervisor.getEmployeeId() + ", " + newSupervisor.getFirstname() + ", " + newSupervisor.getLastname() + "]");
			}
			else {
				newSupervisor = findById(300);
				LOG.info("\n newSupervisor= [" + newSupervisor.getEmployeeId() + ", " + newSupervisor.getFirstname() + ", " + newSupervisor.getLastname() + "]");
			}
			// 4. Transfer subordinates from currentEmployee to newSupervisor
			replaceCurrentSupervisorWithNewSupervisor(currentEmployee, newSupervisor);
			// 5. Change employee_type of Supervisor to Medtech
			employeeRepository.changeEmployeeType(currentEmployee.getEmployeeId(), 3);
			// 6. Enable new supervisor
			newSupervisor.setEnabled(true);
			// 7. Find active Supervisor of the updatedEmployee
			Employee activeSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());        
			// 8. Set activeSupervisor as supervisor of employee
			currentEmployee.setSupervisor(activeSupervisor);
			// 9. Set role of employee as ROLE_MEDTECH
			employeeRepository.deleteEmployeeRoles(currentEmployee.getEmployeeId());
			Role role = new Role();
			role.setRole("ROLE_MEDTECH");
			role.setEmployee(currentEmployee);
			roleRepository.save(role);
			// 10. Set shift of employee
			currentEmployee.setShift(updatedEmp.getShift()); 			
		}
		
		// 4. Employee shift changes but not role
		else {	
			LOG.info("Employee role did not change");	
			if(!currentEmployee.getShift().equals(updatedEmp.getShift())) {
				LOG.info("Employee shift changed but not role");
				
				// 4a. ADMIN shift changes but not the role
				if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_ADMIN")) {
					LOG.info("Admin shift changed but not role");
					// 3. Set shift of employee
					currentEmployee.setShift(updatedEmp.getShift());
				}
				
				// 4b. SUPERVISOR shift changes but not the role
				else if(currentEmployee.getRoles().iterator().next().getRole().equals("ROLE_SUPERVISOR")) {
					LOG.info("Supervisor shift changed but not role");
					// 3. Make default supervisor as supervisor of current shift of employee.
					Employee newSupervisor = null;
					if(currentEmployee.getShift() == ShiftType.DAY) {
						newSupervisor = findById(100);
					}
					else if(currentEmployee.getShift() == ShiftType.EVENING) {
						newSupervisor = findById(200);
					}
					else {
						newSupervisor = findById(300);
					}
					// 4. Transfer subordinates from currentEmployee to newSupervisor
					replaceCurrentSupervisorWithNewSupervisor(currentEmployee, newSupervisor);
					// 5. Enable new supervisor
					newSupervisor.setEnabled(true);
					// 6. Find activeSupervisor of the shift of updated Supervisor.
					Employee activeSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());
					// 7. Transfer all subordinates from activeSupervisor to employee.
					replaceCurrentSupervisorWithNewSupervisor(activeSupervisor, currentEmployee);
					// 8. Disable activeSupervisor
					activeSupervisor.setEnabled(false);
					// 9. Set shift of employee
					currentEmployee.setShift(updatedEmp.getShift());
				}
				
				// 4c. MEDTECH shift changes but not the role
				else { 	
					LOG.info("Medtech shift changed but not role");
					// 3. Find activeSupervisor of the shift that employee is getting updated to.
					Employee activeSupervisor = findActiveSupervisorByShift(updatedEmp.getShift());
					// 4. Set activeSupervisor as supervisor of Medtech.
					currentEmployee.setSupervisor(activeSupervisor);
					// 5. Set shift of employee
					currentEmployee.setShift(updatedEmp.getShift());
				}
			}
			// Neither Role nor Shift has changes
			else {
				LOG.info("Neither role nor shift changes");
				currentEmployee.setShift(updatedEmp.getShift()); 
			}
		}
		
		LOG.info("\n currentEmployee=" + currentEmployee.toString());
		return currentEmployee;
	}
	
	
	
	//*********************************** UPDATE EMPLOYEE PASSWORD (TOKEN-BASED) ************************************//
	
	public Employee updatePassword(int employeeId, Employee employee) {
		LOG.info("enter updatePassword() method."); 
		
		Employee foundEmployee = findById(employeeId);	
		if(foundEmployee == null) {
			LOG.warn("Id " + employeeId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + employeeId + " is not present in the Database");
		}
				
		// find supervisor by shift and set the supervisor (only for medtechs)
		Employee supervisorByShift = findActiveSupervisorByShift(foundEmployee.getShift());
		if(foundEmployee instanceof Medtech) {
			LOG.info("Employee is a Medtech Type");
			LOG.info("shift supervisorID=" + supervisorByShift.getEmployeeId());
			foundEmployee.setSupervisor(supervisorByShift);
		}
		
		// enable employee status
		foundEmployee.setEnabled(true);
		
		foundEmployee.setPassword(employee.getPassword());			// persisting the foundEmployee object	
		return foundEmployee;
	}
	
	
	//*********************************** DELETE EMPLOYEE ************************************//
	public void delete(int id) {
		LOG.info("enter delete() method."); 
		employeeRepository.deleteById(id);
	}
	

	//*********************************** CHANGE EMPLOYEE ACTIVE STATUS ************************************//
	public List<Employee> changeEmployeeStatus(int employeeId) {
		LOG.info("enter changeEmployeeStatus() method."); 
		
		Employee foundEmployee = findById(employeeId);
		
		if(foundEmployee == null) {
			LOG.warn("Id " + employeeId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + employeeId + " is not present in the Database");
		}

		// if employee is Supervisor
		if(foundEmployee instanceof Supervisor) {
			System.out.println("\nSelected employee is a supervisor");
			LOG.info("Selected employee is a supervisor");
			
			// Do not allow disabling default supervisor or default admin
			if((foundEmployee.getEmployeeId() == 100 || foundEmployee.getEmployeeId() == 200 
					|| foundEmployee.getEmployeeId() == 300 || foundEmployee.getEmployeeId() == 400) && foundEmployee.isEnabled()) {
				throw new InvalidRequestException("disable supervisor not permitted");
			}
			
			// disable supervisor if previous status is enabled
			else if(foundEmployee.isEnabled()) {
				Employee currentSupervisor = foundEmployee;
				// find newSupervisor of that shift
				Employee newSupervisor = null;
				if(currentSupervisor.getShift() == ShiftType.DAY) {
					newSupervisor = findById(100);
				}
				else if(currentSupervisor.getShift() == ShiftType.EVENING) {
					newSupervisor = findById(200);
				}
				else {
					newSupervisor = findById(300);
				}
				// transfer subordinates from currentSupervisor to newSupervisor
				replaceCurrentSupervisorWithNewSupervisor(currentSupervisor, newSupervisor);
				// enable new supervisor
				newSupervisor.setEnabled(true);
				// disable current supervisor
				currentSupervisor.setEnabled(false);
			}						
			else {  // enable supervisor if previous status is disabled
				Employee newSupervisor = foundEmployee;
				// find activeSupervisor of that shift
				Employee activeSupervisor = findActiveSupervisorByShift(newSupervisor.getShift());			
				// transfer subordinates from activeSupervisor to newSupervisor
				replaceCurrentSupervisorWithNewSupervisor(activeSupervisor, newSupervisor);
				// enable new supervisor
				newSupervisor.setEnabled(true);
				// disable current supervisor
				activeSupervisor.setEnabled(false);
			}	
			
		}
		else {  // if employee is either Admin or Medtech
			foundEmployee.setEnabled(!foundEmployee.isEnabled());
		}
		
		return employeeRepository.findAll();
	}
	
	
	//*********************************** FIND ALL EMPLOYEES ************************************//
	public List<Employee1> getAllEmployees() {
		LOG.info("enter getAll() method."); 
		List<Employee1> employees = employeeRepository.findAllEmployees();
		return employees;
	}


	//*********************************** FIND EMPLOYEES BY TYPE ************************************//
	public List<Employee1> listEmployeesByType(int type) {
		LOG.info("enter listEmployeesByRole() method."); 
		return employeeRepository.listEmployeesByType(type);
	}


	//*********************************** FIND SUPERVISOR BY SHIFT ************************************//
	public Employee getActiveSupervisorByShift(int shiftId) {
		LOG.info("enter getSupervisorByShift() method."); 
		return employeeRepository.getActiveSupervisorByShift(shiftId);
	}	
	
	
	//*********************************** FIND ALL EMPLOYEES BY SHIFT ************************************//
	public List<Employee1> getEmployeesByShift(int shiftId) {
		LOG.info("enter getEmployeesByShift() method."); 
		return employeeRepository.getEmployeesByShift(shiftId);
	}	
	
	
	//*********************************** LIST ALL EMPLOYEES BY SUPERVISOR ID ************************************//
	public List<Employee1> listAllEmployeesBySupervisorId(int supervisorId) {
		LOG.info("enter listAllEmployeesBySupervisorId() method."); 
		return employeeRepository.getAllEmployeesBySupervisorId(supervisorId);
	}
	
	
	//*********************************** LIST EMPLOYEES BY SUPERVISOR ID - to replace supervisor only ************************************//
	public List<Employee> listEmployeesBySupervisorId(int supervisorId) {
		LOG.info("enter listEmployeesBySupervisorId() method."); 
		return employeeRepository.getEmployeesBySupervisorId(supervisorId);
	}
	

	//*********************************** FIND ALL EMPLOYEES BY EVENT ID ************************************//
	public List<Employee1> getAllEmployeesByEventId(int id) {
		LOG.info("enter getAllEmployeesByEventId() method."); 
		return employeeRepository.getAllEmployeesByEventId(id);
	}


	
	//***************** LIST ALL ACTIVE MEDTECHS AND IDENTIFY THOSE WHO ATTENDED THE EVENT **************************//
	public List<Employee2> listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent(int type, int eventId) {
		LOG.info("enter listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent() method.");		
		List<Employee2> employees = employeeRepository.listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent(type, eventId);			
		return employees;
	}	


	//*********************************** LIST ALL MEDTECHS BY EVENT ID AND SHIFT ************************************//
	public List<Employee2> listAllMedtechsByEventIdAndByShift(int type, int shift, int eventId) {
		LOG.info("enter listAllMedtechsByEventIdAndByShift() method.");		
		List<Employee2> employees = employeeRepository.listAllMedtechsByEventIdAndByShift(type, shift, eventId);			
		return employees;
	}
	
	
	//*********************************** FIND EMPLOYEE BY EMAIL ************************************//
	public Employee6 findEmployeeByEmail(String email) {
		LOG.info("enter findEmployeeByEmail() method.");		
		Employee6 employee = employeeRepository.findEmployeeByEmail(email);			
		return employee;
	}
	
	
	//*********************************** GET EMPLOYEE ID, TOTAL EVENTS AND TOTAL CEs BY YEAR ************************************//
	public Employee5 getEmployeeIdTotalEventsAndTotalCEsByYear(int year) {
		LOG.info("enter getEmployeeIdTotalEventsAndTotalCEsByYear() method.");		
		Employee5 employee = employeeRepository.getEmployeeIdTotalEventsAndTotalCEsByYear(year);			
		return employee;
	}	
	
	
	/**
	 * FUNCTION - CONVERT SHIFTTYPE TO INT
	 * convert ShiftType to int
	 * @param shiftType
	 * @return int
	 */
	public int convertShiftTypeToShiftId(Object shiftType) {
		if(shiftType.equals(ShiftType.DAY)) {
			return 0;
		}
		else if(shiftType.equals(ShiftType.EVENING)) {
			return 1;
		}
		else {
			return 2;
		}
	}
	
	
	/**
	 * FUNCTION - CHANGE SUPERVISOR IF MEDTECH CHANGES SHIFT 
	 * convert ShiftType to int
	 * @param shiftType
	 * @return int
	 */ 
	public void changeSupervisor(Employee foundEmp, Employee updatedEmp, Employee oldSupervisor, Employee newSupervisor) {
		oldSupervisor.getSubordinates().remove(foundEmp);
		newSupervisor.getSubordinates().add(updatedEmp);
	}
	
	
	/**
	 * FUNCTION - FIND CURRENT SUPERVISOR BY SHIFT
	 * @param shiftType
	 * @return oldSupervisor
	 */
	public Employee findActiveSupervisorByShift(Object shiftType) {
		// find shiftId of newSupervisor
		int shiftId;
		if(shiftType.equals(ShiftType.DAY)) {
			shiftId = 0;
		}
		else if(shiftType.equals(ShiftType.EVENING)) {
			shiftId = 1;
		} 
		else if(shiftType.equals(ShiftType.NIGHT)){
			shiftId = 2;
		}
		else {
			LOG.info("Invalid shift name " + shiftType);
			throw new MissingFieldsException("Invalid shift name " + shiftType); 
		}				
		// search activeSupervisor of that shiftId
		LOG.info("getActiveSupervisorByShift(" + shiftId + ")");
		Employee activeSupervisor = getActiveSupervisorByShift(shiftId); 
		LOG.info("activeSupervisor=" + activeSupervisor.toString());
		return activeSupervisor;
	}


	/**
	 * FUNCTION - GET ALL EMAILS
	 * @return list of emails
	 */
	public List<String> getAllEmails() {		
		return employeeRepository.getAllEmails();
	}
	
	
	
	/**
	 * Validate Username, Email & Bcrypt Password
	 * @param employee
	 * @return employee
	 */
	public Employee validateUsernameAndEmailAndBcryptPassword(Employee emp) {		 
		// check if username already exist
		Employee existingEmployee = employeeRepository.findByUsername(emp.getUsername());
		if(existingEmployee != null) {
			throw new InvalidUsernameException("username already exist");
		}
		// check if email contains '@gmail.com'			
		if(!emp.getEmail().contains("@gmail.com")) {
			throw new InvalidEmployeeException("invalid email domain");
		}			
		// Bcrypt password
		emp.setPassword(getBCryptPasswordEncode(emp.getPassword()));
		
		return emp;
	}
	
	
	/**
	 * BCRYPT PASSWORD
	 * @return bcrypted password
	 */
	public String getBCryptPasswordEncode(String password) {		 
		String BCryptedValue = new BCryptPasswordEncoder().encode(password);
		return BCryptedValue;
	}

	
	public int getShiftFromShiftType(ShiftType shift) {
		switch(shift) {
		case DAY:
			return 0;
		case EVENING:
			return 1;
		default:   // case: NIGHT
			return 2;
		}
	}
	
	
	
	
	/**
	 * Replaces current supervisor with new supervisor
	 * @used when creating or updating employee
	 */
	public void replaceCurrentSupervisorWithNewSupervisor(Employee currentSupervisor, Employee newSupervisor) {
		LOG.info("Entering replaceCurrentSupervisorWithNewSupervisor()");
		List<Employee> subordinates = listEmployeesBySupervisorId(currentSupervisor.getEmployeeId());
		for(Employee subordinate: subordinates) {
			subordinate.setSupervisor(currentSupervisor);
			updateSupervisorOfSubordinates(subordinate.getEmployeeId(), subordinate, newSupervisor);		// calling method
		}
		
	}
	
	
	/**
	 * @used inside replaceCurrentSupervisorWithNewSupervisor()
	 */
	public Employee updateSupervisorOfSubordinates(int subordinateId, Employee subordinate, Employee savedSupervisor) {
		LOG.info("Entering updateSubordinatesSupervisor()");
		Employee foundSubordinate = findById(subordinateId);		
		if(foundSubordinate == null) {
			LOG.warn("Id " + subordinateId + " is not present in the Database.");
			throw new EmployeeNotFoundException("Employee with id " + subordinateId + " is not present in the Database");
		}				
		foundSubordinate.setFirstname(subordinate.getFirstname());
		foundSubordinate.setLastname(subordinate.getLastname());
		foundSubordinate.setAddress(subordinate.getAddress());
		foundSubordinate.setEmail(subordinate.getEmail());
		foundSubordinate.setBirth(subordinate.getBirth());
		foundSubordinate.setGender(subordinate.getGender());
		foundSubordinate.setShift(subordinate.getShift());
		foundSubordinate.setEnabled(subordinate.isEnabled());
		foundSubordinate.setUsername(subordinate.getUsername());			
		// update Supervisor 
		foundSubordinate.setSupervisor(savedSupervisor);
		return foundSubordinate;
	}

	
	/**
	 * Using @GeneratedValue(strategy=GenerationType.AUTO) or (GenerationType.IDENTITY) or (GenerationType.SEQUENCE)
	 * does not allow user made IDs to be saved in database tables. These strategies automatically generate IDs which 
	 * overwrites any ID provided by the user. While updating employee from ADMIN to MEDTECH, we must create new Medtech
	 * object, transfer all the properties values from Admin to Medtech and save Medtech object to the database. But these
	 * @GeneratedValue strategies will overwrite the existing ID with newly genereated value which is not acceptable.
	 * @return Next EmployeeId value from Employees table
	 */
	public int nextId() {
		return 1 + employeeRepository.findMaxEmployeeId();
	}
}

