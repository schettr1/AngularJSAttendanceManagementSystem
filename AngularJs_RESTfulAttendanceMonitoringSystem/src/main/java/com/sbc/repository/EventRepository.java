package com.sbc.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.sbc.entity.Event;
import com.sbc.projection.Employee3;
import com.sbc.projection.Employee4;
import com.sbc.projection.Event1;

@Repository
public interface EventRepository extends JpaRepository<Event, Integer>{


	/* CHECK EVENT PENDING STATUS */
	@Query(value="Select events.status from EVENTS where eventId = :eventId", nativeQuery = true)
	int isStatusPending(@Param("eventId") int eventId);
		
	
	/* LIST EVENTS BY EVENTSTATUS */
	@Query(value="Select * from EVENTS where status = :statusCode", nativeQuery = true)
	List<Event> getEventsByStatus(@Param("statusCode") int statusCode);
		
	
	/* LIST ALL EVENTS BY EMPLOYEE ID */
	@Query(value="Select e.eventId, e.name, e.ce, e.location, e.event_type, e.duration, e.speaker, e.starttimestamp, e.endtimestamp from EVENTS as e " + 
				"inner join EVENTS_EMPLOYEES as ee " + 
				"on ee.eventId_FK = e.eventId and ee.employeeId_FK = :employeeId", 
				nativeQuery = true)
	List<Event1> getAllEventsByEmployeeId(@Param("employeeId") int employeeId);

	
	/* CALCULATE GENDER COUNT AND PERCENTAGE OF EMPLOYEES ATTENDING THE EVENT */
	@Query(value="SELECT gender AS gender, COUNT(employeeid_fk) AS count, " + 
				"concat((count( * ) * 100 / (SELECT count( * ) " + 
					"from EMPLOYEES as E " + 
					"inner join EVENTS_EMPLOYEES as EE " + 
					"on E.employeeId = EE.employeeId_FK and EE.eventId_FK = :eventId))) as percent " + 
				"FROM EMPLOYEES AS E " + 
				"INNER JOIN EVENTS_EMPLOYEES AS EE " + 
				"ON E.employeeId = EE.employeeId_FK AND EE.eventId_FK = :eventId " + 
				"GROUP BY gender",
				nativeQuery = true)
	List<Employee3> getGenderPercentageByEventId(@Param("eventId") int eventId);
	
	
	/* CALCULATE SHIFT PERCENTAGE BY EVENT ID */
	@Query(value="SELECT shift, count(shift) as count, concat((count( * ) * 100 / (SELECT count( * ) " + 
					"from EMPLOYEES as E " + 
					"inner join EVENTS_EMPLOYEES as EE " + 
					"on E.employeeid = EE.employeeId_FK and EE.eventId_FK = :eventId))) AS percent " + 
				"FROM EMPLOYEES as E " + 
				"inner join EVENTS_EMPLOYEES as EE " + 
				"on E.employeeid = EE.employeeId_FK and EE.eventId_FK = :eventId " + 
				"GROUP BY shift",
				nativeQuery = true)
	List<Employee4> getShiftPercentageByEventId(@Param("eventId") int eventId);	
	
	
	
}
