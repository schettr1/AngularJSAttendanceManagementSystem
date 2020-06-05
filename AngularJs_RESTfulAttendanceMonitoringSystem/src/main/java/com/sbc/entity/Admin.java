package com.sbc.entity;

import javax.persistence.DiscriminatorValue;
import javax.persistence.Entity;

@Entity
@DiscriminatorValue(value="1")
public class Admin extends Employee {

}
