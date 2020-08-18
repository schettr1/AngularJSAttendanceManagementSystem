package com.sbc.config.jms;

import org.apache.activemq.ActiveMQConnectionFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jms.core.JmsTemplate;

@Configuration  
public class JMSMessageSenderConfig {  
   
    public static final String DEFAULT_BROKER_URL = "tcp://localhost:61616";  
       
    public static final String PASSWORD_RESET_LINK_QUEUE = "password-reset-link-queue"; 
    public static final String SEND_EMAIL_ONLY_QUEUE = "send-email-only-queue";  
    public static final String SEND_EMAIL_wATTACHMENTS_QUEUE = "send-email-with-attachements-queue";  
   
    /* 
     * In order to connect to a Message broker (and eventually able to send receive messages),  
     * we need to configure a ConnectionFactory. ActiveMQConnectionFactory is the ConnectionFactory  
     * implementation from Apache ActiveMQ. 
     */  
    @Bean  
    public ActiveMQConnectionFactory connectionFactory(){  
        ActiveMQConnectionFactory connectionFactory = new ActiveMQConnectionFactory();  
        connectionFactory.setBrokerURL(DEFAULT_BROKER_URL);  
        //connectionFactory.setTrustedPackages(Arrays.asList("com.sbc"));  
        return connectionFactory;  
    }  
       
      
    /* 
     * Additionally, we have configured a JmsTemplate which provides an abstraction ,  
     * hiding all the complexities of JMS communication. Without JmsTemplate, you will  
     * be forced to create connections/sessions/MessageProducers/MessageConsumers and  
     * catch all the nasty exception platform may throw. With JmsTemplate, you get  
     * simple API’s to work with, and spring behind-the-scenes take care of all the  
     * JMS complexities. It takes care of creating a connection, obtaining a session,  
     * and finally sending [as well as synchronous receiving] of message.  
     * We will be using JmsTemplate for only sending messages. JmsTemplate also provides  
     * possibilities for receiving message but that is synchronous[blocks the listening application],  
     * and usually not preferred when asynchronous communication is possible. 
     */  
    @Bean  
    public JmsTemplate jmsTemplate(){  
        JmsTemplate template = new JmsTemplate();  
        template.setConnectionFactory(connectionFactory());  
        template.setDefaultDestinationName(PASSWORD_RESET_LINK_QUEUE);  
        return template;  
    }  
       
}  