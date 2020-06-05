package com.sbc.config.test;

import org.springframework.web.bind.annotation.RequestMapping;

public class AngularJSTestConfig {

	@RequestMapping("/")
	public String home() {
		return "/appTest.html";
	}

	public static void main(String[] args) {
		/*
		new SpringApplicationBuilder(AngularJSTestConfig.class)
				.properties("server.port=9999", "security.basic.enabled=false").run(args);
				*/
	}

}