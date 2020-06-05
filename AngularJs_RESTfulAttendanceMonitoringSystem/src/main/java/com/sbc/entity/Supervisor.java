package com.sbc.entity;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value="2")
public class Supervisor extends Employee {

}
