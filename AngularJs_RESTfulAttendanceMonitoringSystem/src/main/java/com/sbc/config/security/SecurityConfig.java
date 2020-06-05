package com.sbc.config.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.firewall.DefaultHttpFirewall;
import org.springframework.security.web.firewall.HttpFirewall;
import org.springframework.security.web.firewall.StrictHttpFirewall;

import com.sbc.jwt.JWTRequestFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig extends WebSecurityConfigurerAdapter {
		
	@Autowired
	private UserDetailsService userDetailsService; 

	@Autowired
	private JWTRequestFilter jwtRequestFilter;
	
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(userDetailsService).passwordEncoder(getPasswordEncoder());	
	}
       
    @Override 
    protected void configure(HttpSecurity http) throws Exception {
    	
		http
		.authorizeRequests()	
		.antMatchers("/", "/authorize").permitAll()		// don't authenticate these requests	
		.antMatchers("/employees", "/events").authenticated()		// authenticate requests that contains these pathname
		// even when authenticated, authenticated but unauthorized user can access secured resources. Supervisor can update Medtech if you don't authorize users by role.
		.antMatchers("/admin/**").access("hasRole('ROLE_ADMIN')")  			// user with ROLE_ADMIN can only access this url
		.antMatchers("/supervisor/**").access("hasRole('ROLE_SUPERVISOR')") 		// user with ROLE_SUPERVISOR can only access this url
		.antMatchers("/medtech/**").access("hasRole('ROLE_MEDTECH')") 					// user with ROLE_USER can only access this url
		.antMatchers("/admin-or-supervisor").access("hasRole('ROLE_ADMIN') or hasRole('ROLE_SUPERVISOR')")    				// user with ROLE_USER or ROLE_ADMIN can only access this url
		.antMatchers("/admin-and-supervisor").access("hasRole('ROLE_ADMIN') and hasRole('ROLE_SUPERVISOR')")     		// user with ROLE_USER and ROLE_ADMIN can only access this url
        .and().httpBasic().realmName("MY_TEST_REALM").authenticationEntryPoint(getBasicAuthEntryPoint())	// calling method 'getBasicAuthEntryPoint'
		.and().exceptionHandling().accessDeniedHandler(getAccessDeniedHandler())
        .and().sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)					// No session creation needed for REST web service
        .and().csrf().disable();

		http
		.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);			// add a filter which intercepts every request to validate the token
    }
    
    
    /**
     * AuthenticationManager is autowired/needed in Employee Controller 
     * to authenticate UsernamePasswordAuthenticationToken(username, password)
     */
	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}
	
	
	/**
	 * Encoder helps to convert the password from String to Base64 so that 
	 * it is difficult to understand it.
	 */
	@Bean
	public PasswordEncoder getPasswordEncoder() {
		System.out.println("\nB-encrypted value of 'password' is " + new BCryptPasswordEncoder().encode("password")+"\n");
		return new BCryptPasswordEncoder();
	}
	
	
	/**
	 * AuthenticationEntryPoint is used to throw exception when users enter
	 * invalid credentials for authentication
	 */
    @Bean
    public CustomBasicAuthenticationEntryPoint getBasicAuthEntryPoint(){
        return new CustomBasicAuthenticationEntryPoint();
    }
     
    
	/**
	 * CustomAccessDeniedHandler is used to throw exception when user have
	 * no authority/role to access the resources
	 */
    @Bean
    public CustomAccessDeniedHandler getAccessDeniedHandler(){
        return new CustomAccessDeniedHandler();
    }
    
    
    /**
     * To allow using multiple slashes '/, /' in URLs 
     * Select either of these two methods 
     * defaultHttpFirewall() or
     * allowUrlEncodedSlashHttpFirewall() 
     * Spring Security 5.1x has this bug!!
     */
    @Override 
    public void configure(WebSecurity web) throws Exception {
    	//web.httpFirewall(allowUrlEncodedSlashHttpFirewall());
    	web.httpFirewall(defaultHttpFirewall());
    }
    
    
	/**
	 * Default FireWall 
	 */
    @Bean
    public HttpFirewall defaultHttpFirewall() {
        return new DefaultHttpFirewall();
    }
    
    
	/**
	 * Custom FireWall allows to use multiple '/'s in the URL.
	 * It is used because spring security sometimes throws error 
	 * "The request was rejected because the URL was not normalized" 
	 * if the URL has multiple '/'s
	 */
    @Bean
    public HttpFirewall allowUrlEncodedSlashHttpFirewall() {
        StrictHttpFirewall fireWall = new StrictHttpFirewall();
        fireWall.setAllowUrlEncodedSlash(true);    
        return fireWall;
    }

	
}
