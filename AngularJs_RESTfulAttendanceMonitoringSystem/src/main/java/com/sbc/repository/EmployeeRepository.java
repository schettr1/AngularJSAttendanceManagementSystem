package com.sbc.repository;

import java.util.List;

import javax.persistence.NamedQuery;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sbc.entity.Employee;
import com.sbc.projection.Employee1;
import com.sbc.projection.Employee2;
import com.sbc.projection.Employee5;
import com.sbc.projection.Employee6;

/**
 * @Query(value=" ", nativeQuery=true) == Native Query that can be directly used in MySQL or other database
 * @Query( ) == Hibernate's query such as HCQL or JPQL
 */

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

	
	/* FIND BY USERNAME */
	Employee findByUsername(String username);
	
	
	/* CHANGE EMPLOYEE TYPE - Use @Modifying if you perform insert, update or delete. And modifying queries can only have void or int as return type */
	@Modifying
	@Query(value="UPDATE employees SET employee_type = :employee_type WHERE employeeId = :employeeId", nativeQuery = true)
	int changeEmployeeType(int employeeId, int employee_type);
	
	
	/* DELETE EMPLOYEE ROLES - Use @Modifying if you perform insert, update or delete. And modifying queries can only have void or int as return type */
	@Modifying
	@Query(value="DELETE from roles WHERE employeeid_fk = :employeeId", nativeQuery = true)
	void deleteEmployeeRoles(int employeeId);
	
	
	/* FIND BY EMPLOYEE ID */
	@Query(value="Select * from EMPLOYEES where employeeId = :employeeId", nativeQuery = true)
	Employee1 findByEmployeeId(@Param("employeeId") int employeeId);
	
	
	/* GET ACTIVE SUPERVISOR BY SHIFT */
	@Query(value="Select * from EMPLOYEES where employee_type = 2 and enabled = true and shift = :shiftId", nativeQuery = true)
	Employee getActiveSupervisorByShift(@Param("shiftId") int shiftId);	
	
	
	/* FIND EMPLOYEE BY EMAIL */
	@Query(value="Select * from EMPLOYEES where email = :email", nativeQuery = true)
	Employee6 findEmployeeByEmail(@Param("email") String email);
	
	
	/* LIST EMPLOYEES BY SHIFT */
	@Query(value="Select * from EMPLOYEES where shift = :shiftId ", nativeQuery = true)
	List<Employee1> getEmployeesByShift(@Param("shiftId") int shiftId);	
	
	
	/* FIND SUPERVISOR BY ID */
	@Query(value="Select DISTINCT S.employeeid, S.firstname, S.lastname, S.email, S.username, S.gender, S.shift, S.enabled, S.employee_type " + 
			"from EMPLOYEES as S, EMPLOYEES as E " + 
			"where E.supervisorId = S.employeeId " + 
			"and S.employeeId = :supervisorId ", nativeQuery = true)
	Employee1 findSupervisorById(int supervisorId);
	
	
	/* LIST ALL EMPLOYEES */
	@Query(value="Select * from EMPLOYEES", 
			nativeQuery = true)
	List<Employee1> findAllEmployees();
	
	
	/* LIST ALL EMPLOYEES BY TYPE */
	@Query(value="Select * from EMPLOYEES where employee_type = :type", 
			nativeQuery = true)
	List<Employee1> listEmployeesByType(@Param("type") int type);
	
	
	/* LIST EMPLOYEES BY SUPERVISOR ID */
	@Query(value="Select E.employeeId, E.firstname, E.lastname, E.email, E.username, E.gender, E.shift, E.enabled, E.employee_type " + 
			"from EMPLOYEES as E, EMPLOYEES as S " +  
			"where S.employeeId = E.supervisorId " + 
			"and S.employeeId = :employeeId", 
			nativeQuery = true)
	List<Employee1> getAllEmployeesBySupervisorId(@Param("employeeId") int employeeId);


	/* LIST EMPLOYEES BY SUPERVISOR ID - to replace supervisor only */
	@Query(value="Select * from EMPLOYEES as E, EMPLOYEES as S " +  
			"where S.employeeId = E.supervisorId " + 
			"and S.employeeId = :supervisorId", 
			nativeQuery = true)
	List<Employee> getEmployeesBySupervisorId(@Param("supervisorId") int supervisorId);
	
	
	/* LIST EMPLOYEES BY EVENT ID */
	@Query(value="Select * from EMPLOYEES as E inner join EVENTS_EMPLOYEES as EE on "
			+ "EE.employeeId_FK = E.employeeId and EE.eventId_FK = :id"
			, nativeQuery = true)
	List<Employee1> getAllEmployeesByEventId(@Param("id") int id);

	
	/* LIST ALL ACTIVE MEDTECHS AND IDENTIFY THOSE WHO ATTENDED THE EVENT */
	@Query(value="Select e.employeeId, e.firstname, e.lastname, e.birth, e.email, e.gender, e.enabled, e.employee_type, e.shift, COALESCE(ee.eventId_FK, 0) as eventId "
			+ "from EMPLOYEES as e "
			+ "left outer join EVENTS_EMPLOYEES as ee "
			+ "on e.employeeId = ee.employeeId_FK and ee.eventId_FK = :eventId "
			+ "where e.employee_type = :type "
			+ "and e.enabled = true ",
			nativeQuery = true)
	List<Employee2> listAllActiveMedtechsAndIdentifyThoseWhoAttendedTheEvent(@Param("type") int type, @Param("eventId") int eventId);


	/* LIST ALL MEDTECHS BY EVENT ID AND BY SHIFT */
	@Query(value="Select e.employeeId, e.firstname, e.lastname, e.birth, e.email, e.gender, e.enabled, e.employee_type, e.shift, COALESCE(ee.eventId_FK, 0) as eventId "
			+ "from EMPLOYEES as e "
			+ "left outer join EVENTS_EMPLOYEES as ee "
			+ "on e.employeeId = ee.employeeId_FK and ee.eventId_FK = :eventId "
			+ "where e.employee_type = :type AND e.shift = :shift", 
			nativeQuery = true)
	List<Employee2> listAllMedtechsByEventIdAndByShift(@Param("type") int type, @Param("shift") int shift, @Param("eventId") int eventId);

	
	/* LIST ALL EMAILS */
	@Query(value="Select email from EMPLOYEES", nativeQuery = true)
	List<String> getAllEmails();
	

	/* GET EMPLOYEE ID, TOTAL EVENTS AND TOTAL CEs BY YEAR */
	@Query(value="Select ee.employeeId_FK as employeeID, count(ev.ce) as totalEvents, sum(ev.ce) as totalCEs " + 
				"from EVENTS as ev " + 
				"inner join EVENTS_EMPLOYEES as ee " + 
				"on ee.eventId_FK = ev.eventId and year(ev.starttimestamp) = :year ", 
				nativeQuery = true)
	Employee5 getEmployeeIdTotalEventsAndTotalCEsByYear(@Param("year") int year);


	/* DETERMINE THE LARGEST EMPLOYEE ID VALUE */
	@Query(value="Select max(employeeId) from EMPLOYEES", nativeQuery = true)
	int findMaxEmployeeId();



}

