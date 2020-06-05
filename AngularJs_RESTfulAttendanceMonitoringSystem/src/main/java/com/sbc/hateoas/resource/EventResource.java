package com.sbc.hateoas.resource;

import org.springframework.hateoas.ResourceSupport;

import com.sbc.entity.Event;

public class EventResource extends ResourceSupport {

	public Event event;
	
	public EventResource(Event event) {
		this.event = event;
	}
}
