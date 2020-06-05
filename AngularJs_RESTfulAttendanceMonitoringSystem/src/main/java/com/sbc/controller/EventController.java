package com.sbc.controller;

import java.time.ZoneId;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

import javax.validation.Valid;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.Link;
import org.springframework.hateoas.mvc.ControllerLinkBuilder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.sbc.entity.Event;
import com.sbc.enums.EventStatus;
import com.sbc.exception.CompletedEventException;
import com.sbc.exception.EventNotFoundException;
import com.sbc.exception.MissingFieldsException;
import com.sbc.hateoas.resource.EventResource;
import com.sbc.hateoas.resource.EventResource1;
import com.sbc.projection.Employee3;
import com.sbc.projection.Employee4;
import com.sbc.projection.Event1;
import com.sbc.service.EventService;


@RestController
@RequestMapping(path="")
public class EventController {

	@Autowired
	private EventService eventService; 
	
	private static final Logger LOG = LoggerFactory.getLogger(EventController.class); 
	
	
	// ================================================== CREATE EVENT ==================================================== //
	
	/**
	 * save Event 
	 * @return HttpStatus.CREATED and created Event 
	 */
	@PostMapping(path="/admin/events", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EventResource> save(@Valid @RequestBody Event event) {	
		LOG.info("enter save() method."); 
		
		// add 'PENDING' status to new event
		event.setStatus(EventStatus.PENDING);
		
		// throw exception if fields are missing
		if((event.getName() == null || event.getName().isEmpty()) ||
				(event.getCe() == 0) ||
				(event.getType() == null) ||
				(event.getSpeaker() == null || event.getSpeaker().isEmpty()) ||
				(event.getStartTimeStamp() == null) || 
				(event.getStatus() == null) ||
				(event.getEndTimeStamp() == null)
		) {
			throw new MissingFieldsException("Unable to save Event. Fields are missing.");
		}
		Event evt = eventService.save(event);
		
		/* EventResource instance */
		EventResource eventResource = new EventResource(evt);
		
		/* initialize resource variable event */
		eventResource.event = evt;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(evt.getEventId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.CREATED)).body(eventResource);
	}
	
	 
	// ================================================== FIND EVENT BY ID ==================================================== //
	
	/**
	 * find Event by ID  
	 * @return HttpStatus.FOUND and searched Event 
	 */
	@GetMapping(path="/events/{id}", produces = "application/json")
	public ResponseEntity<EventResource> findByID(@PathVariable int id) {	
		LOG.info("enter findByID() method.");   
		
		Event foundEvent = eventService.findById(id);
		
		if(foundEvent == null) {
			LOG.warn("Id " + id + " is not present in the Database.");
			throw new EventNotFoundException("Event with id " + id + " is not present in the Database");
		}
		
		/* EventResource instance */
		EventResource eventResource = new EventResource(foundEvent);
		
		/* initialize resource variable event */
		eventResource.event = foundEvent;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(EventController.class).findByID(foundEvent.getEventId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResource);
	}
	
	
	// ================================================== UPDATE EVENT ==================================================== //
	
	/**
	 * update Event by ID
	 * @return HttpStatus.OK and updated Event
	 */
	@PutMapping(path="/admin/events/{id}", consumes = "application/json", produces = "application/json")
	public ResponseEntity<EventResource> update(@Valid @RequestBody Event event, @PathVariable int id) {
		LOG.info("enter update() method.");   
	
		Event foundEvent = eventService.findById(id);
	
		if(foundEvent == null) {
			LOG.warn("Id " + id + " is not present in the Database.");
			throw new EventNotFoundException("Event with id " + id + " is not present in the Database");
		}
		
		if(foundEvent.getStatus().equals(EventStatus.COMPLETED)) {
			throw new CompletedEventException("Event with id " + id + " is completed and cannot be edited.");
		}
		
		Event updatedEvent = eventService.update(id, event);
	
		/* EventResource instance */
		EventResource eventResource = new EventResource(updatedEvent);
		
		/* initialize resource variable event */
		eventResource.event = updatedEvent;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(updatedEvent.getEventId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResource);
	}
	

	// ================================================== UPDATE EVENT STATUS ==================================================== //
	
	/**
	 * update Event status
	 * @return updated Event
	 */
	@PutMapping(path="/admin/events/{id}/status/{status}", produces = "application/json")
	public ResponseEntity<EventResource> updateEventStatus(@PathVariable int id, @PathVariable int status) {
		LOG.info("enter updateEventStatus() method.");   
	
		Event foundEvent = eventService.findById(id);
	
		if(foundEvent == null) {
			LOG.warn("Id " + id + " is not present in the Database.");
			throw new EventNotFoundException("Event with id " + id + " is not present in the Database");
		}
		
		foundEvent.setStatus(EventStatus.COMPLETED);

		Event updatedEvent = eventService.update(id, foundEvent);
	
		/* EventResource instance */
		EventResource eventResource = new EventResource(updatedEvent);
		
		/* initialize resource variable event */
		eventResource.event = updatedEvent;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(updatedEvent.getEventId()))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResource);
	}
	
	
	
	// ================================================== DELETE PENDING EVENTS ONLY ==================================================== //
	
	/**
	 * delete Event by ID 
	 * @return HttpStatus.OK with no body
	 */
	@DeleteMapping(path="/admin/events/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {	
		LOG.info("enter delete() method.");   
		
		Event foundEvent = eventService.findById(id);
	
		if(foundEvent == null) {
			LOG.warn("Id " + id + " is not present in the Database.");
			throw new EventNotFoundException("Event with id " + id + " is not present in the Database");
		}
		
		boolean isPending = eventService.isStatusPending(id);
		
		if(isPending == false) {
			LOG.warn("Event Id " + id + " status is already complete.");
			throw new CompletedEventException("Event Id " + id + " is already complete.");
		}
		
		eventService.delete(id);
		return ResponseEntity.status((HttpStatus.OK)).body(null);
	}


	// ================================================== LIST ALL EVENTS ==================================================== //
	
	/**
	 * list Events   
	 * @return HttpStatus.FOUND and list of Events
	 */
	@GetMapping(path="/events", produces="application/json")
	public ResponseEntity<List<EventResource>> listAll() {
		LOG.info("enter listAll() method."); 

		List<Event> eventList = eventService.getAll();
		
		/* declare list of ConferenceResource */
		List<EventResource> eventResourceList = new LinkedList<>();
		
		/* iterate list of Event */
		for(Event evt: eventList) {
			
			/* EventResource Instance */
			EventResource eventResource = new EventResource(evt);
			
			/* initialize resource variable event */
			eventResource.event = evt;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EventController.class).findByID(evt.getEventId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			eventResource.add(selfLink);	
			
			/* add resource to the EventResource list */
			eventResourceList.add(eventResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResourceList);
	}
	

	// ========================================= LIST EVENTS PER YEAR BY EMPLOYEE =========================================== //
	
	/**
	 * @param int year, int employeeId
	 * @return HttpStatus.FOUND and list of Events
	 */
	@GetMapping(path="/events/year/{year}/employeeId/{employeeId}", produces="application/json")
	public ResponseEntity<List<EventResource1>> listEventsPerYearByEmployee(@PathVariable int year, @PathVariable int employeeId) {
		LOG.info("enter listEventsPerYearByEmployee() method."); 

		List<Event1> eventList = eventService.getAllEventsByEmployeeId(employeeId);
		
		List<Event1> filteredEventList = eventList.stream()
											.filter(x -> x.getStartTimeStamp().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().getYear() == year)
											.collect(Collectors.toList());
				
		filteredEventList.forEach(x -> System.out.println(x.getEventId() + ", " + x.getName() + ", " + x.getEvent_type()));
		
		/* declare list of ConferenceResource */
		List<EventResource1> eventResourceList = new LinkedList<>();
		
		/* iterate list of Event */
		for(Event1 evt: filteredEventList) {
			
			/* EventResource Instance */
			EventResource1 eventResource = new EventResource1(evt);
			
			/* initialize resource variable event */
			eventResource.event = evt;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(evt.getEventId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			eventResource.add(selfLink);	
			
			/* add resource to the EventResource list */
			eventResourceList.add(eventResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResourceList);
	}
	
	
	// ================================================== LIST EVENTS BY YEAR ==================================================== //
	
	/**
	 * @param int year
	 * @return HttpStatus.FOUND and list of Events
	 */
	@GetMapping(path="/events/year/{year}", produces="application/json")
	public ResponseEntity<List<EventResource>> listEventsByYear(@PathVariable int year) {
		LOG.info("enter listEventsByYear() method."); 

		List<Event> eventList = eventService.getAll();
		eventList.forEach(x -> System.out.println(x));
		
		List<Event> filteredEventList = eventList.stream()
											.filter(x -> x.getStartTimeStamp().toInstant().atZone(ZoneId.systemDefault()).toLocalDate().getYear() == year)
											.collect(Collectors.toList());
				
		filteredEventList.forEach(x -> System.out.println(x));
		
		/* declare list of ConferenceResource */
		List<EventResource> eventResourceList = new LinkedList<>();
		
		/* iterate list of Event */
		for(Event evt: filteredEventList) {
			
			/* EventResource Instance */
			EventResource eventResource = new EventResource(evt);
			
			/* initialize resource variable event */
			eventResource.event = evt;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(EventController.class).findByID(evt.getEventId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			eventResource.add(selfLink);	
			
			/* add resource to the EventResource list */
			eventResourceList.add(eventResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResourceList);
	}
	

	// ======================================= LIST EVENTS BY STATUS ======================================== //
	
	/**
	 * @param status
	 * @return HttpStatus.FOUND and list of Completed Events
	 */
	@GetMapping(path="/events/status/{statusCode}", produces="application/json")
	public ResponseEntity<List<EventResource>> listEventsByStatus(@PathVariable int statusCode) {
		LOG.info("enter listCompletedEventsOnly() method."); 

		List<Event> eventList = eventService.getEventsByStatus(statusCode);
		
		/* declare list of EventResource */
		List<EventResource> eventResourceList = new LinkedList<>();
		
		/* iterate list of Events */
		for(Event evt: eventList) {
			
			/* EventResource Instance */
			EventResource eventResource = new EventResource(evt);
			
			/* initialize resource variable conference */
			eventResource.event = evt;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(evt.getEventId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			eventResource.add(selfLink);	
			
			/* add resource to the EventResource list */
			eventResourceList.add(eventResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResourceList);
	}	

	
	// ======================================= LIST EVENTS BY EMPLOYEE ID ========================================= //
	
	/**
	 * list Events by EmployeeId
	 * @return HttpStatus.FOUND and list of Events
	 */
	@GetMapping(path="/events/employees/{employeeId}", produces="application/json")
	public ResponseEntity<List<EventResource1>> getAllEventsByEmployeeId(@PathVariable int employeeId) {
		LOG.info("enter getAllEventsByEmployeeId() method."); 

		List<Event1> eventList = eventService.getAllEventsByEmployeeId(employeeId);
		
		/* declare list of EventResource */
		List<EventResource1> eventResourceList = new LinkedList<>();
		
		/* iterate list of Events */
		for(Event1 evt: eventList) {
			
			/* EventResource Instance */
			EventResource1 eventResource = new EventResource1(evt);
			
			/* initialize resource variable conference */
			eventResource.event = evt;
			
			/* create selfLink */
			Link selfLink = ControllerLinkBuilder
							.linkTo(ControllerLinkBuilder.methodOn(this.getClass()).findByID(evt.getEventId()))
							.withSelfRel();
			
			/* add selfLink to the resource */
			eventResource.add(selfLink);	
			
			/* add resource to the EventResource list */
			eventResourceList.add(eventResource);
		}
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResourceList);
	}	
	

	// ============================================== ADD EMPLOYEE TO THE EVENT ================================================ //
	
	/**
	 * EventId and EmployeeId 
	 * @return HttpStatus.OK with no body
	 */
	@PutMapping(path="/admin/events/{eventId}/add/employees/{employeeId}", produces="application/json")
	public ResponseEntity<EventResource> addEmployeeToEvent(@PathVariable int eventId, @PathVariable int employeeId) {	
		LOG.info("enter addEmployeeToEvent() method.");   
		
		Event updatedEvent = eventService.addEmployeeToEvent(eventId, employeeId);

		/* EmployeeResource instance */
		EventResource eventResource = new EventResource(updatedEvent);
		
		/* initialize resource variable employee */
		eventResource.event = updatedEvent;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(EventController.class).addEmployeeToEvent(eventId, employeeId))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResource);
	}
	
	
	// ========================================== REMOVE EMPLOYEE FROM THE EVENT ============================================== //
	
	/**
	 * EventId and EmployeeId 
	 * @return HttpStatus.OK with no body
	 */
	@PutMapping(path="/admin/events/{eventId}/remove/employees/{employeeId}", produces="application/json")
	public ResponseEntity<EventResource> removeEmployeeFromEvent(@PathVariable int eventId, @PathVariable int employeeId) {	
		LOG.info("enter removeEmployeeFromEvent() method.");   
		
		Event updatedEvent = eventService.removeEmployeeFromEvent(eventId, employeeId);

		/* EmployeeResource instance */
		EventResource eventResource = new EventResource(updatedEvent);
		
		/* initialize resource variable event */
		eventResource.event = updatedEvent;
		
		/* create selfLink */
		Link selfLink = ControllerLinkBuilder
						.linkTo(ControllerLinkBuilder.methodOn(EventController.class).removeEmployeeFromEvent(eventId, employeeId))
						.withSelfRel();
		
		/* add selfLink to the resource */
		eventResource.add(selfLink);
		
		return ResponseEntity.status((HttpStatus.OK)).body(eventResource);
	}
	
	
	//======================== CALCULATE GENDER PERCENTAGE OF EMPLOYEES ATTENDING EVENT BY EVENT ID =============================//
	
	/**
	 * @param eventId
	 * @return List of Medtech3 (contains Gender and its percentage)
	 */
	@GetMapping(path="/events/{eventId}/gender", produces="application/json")
	public List<Employee3> getGenderPercentageByEventId(@PathVariable int eventId) {
		LOG.info("enter getGenderPercentageByEventId() method."); 
		return eventService.getGenderPercentageByEventId(eventId);
	}
	
	
	
	//======================== CALCULATE SHIFT PERCENTAGE OF EMPLOYEES ATTENDING EVENT BY EVENT ID =============================//
	
	/**
	 * @param eventId
	 * @return List of Medtech4 (contains Shift and its percentage)
	 */
	@GetMapping(path="/events/{eventId}/shift", produces="application/json")
	public List<Employee4> getShiftPercentageByEventId(@PathVariable int eventId) {
		LOG.info("enter getShiftPercentageByEventId() method."); 
		return eventService.getShiftPercentageByEventId(eventId);
	}
	
	
}
