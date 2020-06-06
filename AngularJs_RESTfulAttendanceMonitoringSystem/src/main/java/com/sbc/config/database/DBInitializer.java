package com.sbc.config.database;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;
import org.springframework.core.env.Environment;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.jdbc.datasource.init.DataSourceInitializer;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

/**
 * We use DataSourceInitializer to upload dummy data from 'data.sql'
 * to the database when application is started. Once you load 
 * dummy data to the database, change 
 * hibernate.hbm2ddl.auto=create -> hibernate.hbm2ddl.auto=update
 * and comment out all the lines inside DBInitializer.class
 * so that dummy data won't load again whenever
 * you restarted the application.
 *
 */

@Configuration
@PropertySource(value = { "classpath:application.properties" })
public class DBInitializer {

	 
    @Autowired
    private Environment environment;
    
	@Bean
	public DataSourceInitializer dataSourceInitializer() {
	    ResourceDatabasePopulator resourceDatabasePopulator = new ResourceDatabasePopulator();
	    // location of the 'sql' file must be inside src/main/resources folder 
	    resourceDatabasePopulator.addScript(new ClassPathResource("/data.sql"));
	    
        DataSourceInitializer dataSourceInitializer = new DataSourceInitializer();
        dataSourceInitializer.setDataSource(dataSource());
        dataSourceInitializer.setDatabasePopulator(resourceDatabasePopulator);
        return dataSourceInitializer;
    }

	@Bean
	public DataSource dataSource(){
	    SingleConnectionDataSource dataSource = new SingleConnectionDataSource();
	    dataSource.setDriverClassName(environment.getRequiredProperty("jdbc.driverClassName"));
	    dataSource.setUrl(environment.getRequiredProperty("jdbc.url"));
	    dataSource.setUsername(environment.getRequiredProperty("jdbc.username"));
	    dataSource.setPassword(environment.getRequiredProperty("jdbc.password"));
	    dataSource.setSuppressClose(true);
	    dataSource.setAutoCommit(true);
	    return dataSource;
	}
	
	
}
