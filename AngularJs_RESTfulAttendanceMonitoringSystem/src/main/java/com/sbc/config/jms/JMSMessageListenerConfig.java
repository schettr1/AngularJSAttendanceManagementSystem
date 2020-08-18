package com.sbc.config.jms;

import javax.jms.ConnectionFactory;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.annotation.EnableJms;
import org.springframework.jms.config.DefaultJmsListenerContainerFactory;

@Configuration  
@EnableJms   /* enables detection of @JmsListener on any Spring-managed bean in the container */  
public class JMSMessageListenerConfig {  
   
    @Autowired  
    ConnectionFactory connectionFactory;  
       
      
    /* 
     * DefaultJmsListenerContainerFactory is a JmsListenerContainerFactory implementation to build  
     * a regular DefaultMessageListenerContainer. You can configure several properties. At the very  
     * least, it needs a connection factory. Additionally, we have specified the concurrency  
     * [max number of concurrent users/consumers] using setConcurrency(“lowwe-upper”).  
     * You can also use setConcurrency(“upper”) which means lower will be 1. 
     */  
    @Bean  
    public DefaultJmsListenerContainerFactory jmsListenerContainerFactory() {  
        DefaultJmsListenerContainerFactory factory = new DefaultJmsListenerContainerFactory();  
        System.out.println("connectionFactory=" + connectionFactory);  
        factory.setConnectionFactory(connectionFactory);  
        factory.setConcurrency("1-1");  
        return factory;  
    }  
   
}  