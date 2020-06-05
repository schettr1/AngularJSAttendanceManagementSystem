package com.sbc.hateoas.resource;

import org.springframework.hateoas.ResourceSupport;

import com.sbc.projection.Event1;

public class EventResource1 extends ResourceSupport {

	public Event1 event;
	
	public EventResource1(Event1 event) {
		this.event = event;
	}
}
