package com.sbc.service;

import java.util.List;
import java.util.Optional;

import javax.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sbc.entity.Employee;
import com.sbc.entity.Event;
import com.sbc.projection.Employee3;
import com.sbc.projection.Employee4;
import com.sbc.projection.Event1;
import com.sbc.repository.EventRepository;

@Service
@Transactional
public class EventService {

	private static final Logger LOG = LoggerFactory.getLogger(EventService.class); 
	
	@Autowired
	EventRepository eventRepository;

	@Autowired
	EmployeeService employeeService;
	

	/* CREATE EVENT */
	public Event save(Event event) {
		LOG.info("enter save() method."); 
		Event evt = eventRepository.save(event);
		return evt;
	}

	
	/* LIST ALL EVENTS */
	public List<Event> getAll() {
		LOG.info("enter getAll() method."); 
		return eventRepository.findAll();
	}

	
	/* FIND EVENT BY ID */
	public Event findById(int id) {
		LOG.info("enter findById() method."); 
		Optional<Event> optionalEvent = eventRepository.findById(id);
		if(optionalEvent.isPresent()) {
			Event event = optionalEvent.get();
			LOG.trace(event.toString()); 
			return event;	
		}
		LOG.info("exit findById() method."); 
		return null;
	}
	
	
	/* UPDATE EVENT */
	public Event update(int id, Event event) {
		LOG.info("enter update() method."); 
		event.setEventId(id);
		Event evt = eventRepository.save(event);
		LOG.info("updated data : " + evt.toString()); 
		LOG.info("exit update() method."); 
		return evt;
	}

	
	/* CHECK EVENT PENDING STATUS */
	public boolean isStatusPending(int eventid) {
		LOG.info("enter isStatusPending() method."); 
		int status = eventRepository.isStatusPending(eventid);
		if (status == 0)
			return true;
		else 
			return false;
	}
	
	
	/* DELETE PENDING EVENT ONLY */
	public void delete(int id) {
		LOG.info("enter delete() method."); 
		eventRepository.deleteById(id);
	}

	
	/* LIST EVENTS BY STATUS */
	public List<Event> getEventsByStatus(int statusCode) {
		LOG.info("enter getEventsByStatus() method.");
		return eventRepository.getEventsByStatus(statusCode);
	}

		
	/* LIST ALL EVENTS BY EMPLOYEE ID */
	public List<Event1> getAllEventsByEmployeeId(int employeeId) {
		LOG.info("enter getAllEventsByEmployeeId() method.");
		return eventRepository.getAllEventsByEmployeeId(employeeId);
	}
		

	/* ADD EMPLOYEE TO EVENT */
	public Event addEmployeeToEvent(int eventId, int employeeId) {
		LOG.info("enter addEmployeeToEvent() method.");		
		// check if medtech exists 
		Employee existEmployee = employeeService.findById(employeeId);		
		// check if event exists
		Event existEvent = findById(eventId);		
		/* 
		 * You must add/remove Event to the Employee instead of adding Employee to the Event because in many-to-many relation between
		 * Employee and Event, Event entity has 'mappedBy=' property which makes Employee entity the owning-side. Therefore,
		 * you can only add/remove Event from Employee and not the vice-versa.
		 */
		existEmployee.getEvents().add(existEvent);	
		return existEvent;
	}
	
	
	/* REMOVE EMPLOYEE FROM EVENT */
	public Event removeEmployeeFromEvent(int eventId, int employeeId) {
		LOG.info("enter removeEmployeeFromEvent() method.");
		// check if medtech exists 
		Employee existEmployee = employeeService.findById(employeeId);		
		// check if event exists
		Event existEvent = findById(eventId);		
		/* 
		 * You must add/remove Event to the Employee instead of adding Employee to the Event because in many-to-many relation between
		 * Employee and Event, Event entity has 'mappedBy=' property which makes Employee entity the owning-side. Therefore,
		 * you can only add/remove Event from Employee and not the vice-versa.
		 */
		existEmployee.getEvents().remove(existEvent);		
		return existEvent;			
	}	
	
	
	/* CALCULATE GENDER PERCENTAGE OF MEDTECHS BY EVENT ID */
	public List<Employee3> getGenderPercentageByEventId(int eventId) {
		return eventRepository.getGenderPercentageByEventId(eventId);
	}
	
	
	/* CALCULATE SHIFT PERCENTAGE BY EVENT ID */
	public List<Employee4> getShiftPercentageByEventId(int eventId) {
		return eventRepository.getShiftPercentageByEventId(eventId);
	}	
	
}
