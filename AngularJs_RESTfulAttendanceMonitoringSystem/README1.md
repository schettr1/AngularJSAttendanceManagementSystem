# This application uses JNDI to fetch dataSource object from the Tomcat Server.

Let's define dataSource inside the Tomcat Server.

1. Add the following lines of code in context.xml 

	<ResourceLink   
	  name="jdbc/j4s"   
	  global="jdbc/j4s"   
	  type="javax.sql.DataSource"/>  

2. Add the following lines of code in server.xml (must be placed within <GlobalNamingResources/> tags)

	<Resource auth="Container" 
		name="jdbc/j4s" 
		global="jdbc/j4s" 
		type="javax.sql.DataSource"		
		url="jdbc:mysql://localhost:3306/angularjs" 
		driverClassName="com.mysql.cj.jdbc.Driver"
		username="******" 
		password="******" 	
		maxActive="100" 
		maxIdle="20" 
		maxWait="10000" 
		minIdle="5" />        
