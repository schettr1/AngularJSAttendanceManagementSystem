package com.sbc.entity;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value="3")
public class Medtech extends Employee {

	
}
