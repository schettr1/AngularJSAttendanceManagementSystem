<%@ page language="java" contentType="text/html; charset=ISO-8859-1" pageEncoding="ISO-8859-1"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>  
<html>
  <!-- ALWAYS LOAD THE SCRIPTS BEFORE THE HTML CONTENT OR ELSE THE NAVBAR CONTENT WILL DISPLAY AND DISAPPEAR FOR FRACTION OF A SECOND BEFORE LOGIN FORM IS DISPLAYED -->
  <head>
  
  	<!-- CSS files -->
	<link rel="stylesheet" type="text/css" href='<c:url value="/static/css/style.css"/>' >
	<link rel="stylesheet" type="text/css" href="<c:url value="/static/css/bootstrap-3.3.7.min.css" />">
		
	<!-- Libraries -->	
	<script type="text/javascript" src="<c:url value="/static/lib/jquery-3.3.1.min.js" />"></script>
	<script type="text/javascript" src="<c:url value="/static/lib/bootstrap-3.3.7.min.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/lib/angular-1.7.8.min.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/lib/moment-2.24.0.min.js" />"></script>
    <script type="text/javascript" src="<c:url value="/static/lib/pdfmake.min.js" />"></script> 
    <script type="text/javascript" src="<c:url value="/static/lib/vfs_fonts.js" />"></script>   
    <script type="text/javascript" src="<c:url value="/static/lib/ng-file-upload.min.js" />"></script>    
    <script type="text/javascript" src="<c:url value="/static/lib/ng-file-upload-shim.min.js" />"></script>   
    <script type="text/javascript" src="<c:url value="/static/lib/ui-bootstrap-tpls-2.5.0.min.js" />"></script>  
	<!--<script src="https://cdn.rawgit.com/angular-ui/bootstrap/gh-pages/ui-bootstrap-tpls-2.5.0.js"></script>  -->
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.6.9/angular-route.js"></script> 
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ngStorage/0.3.6/ngStorage.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.4.0/angular-cookies.js"></script>    
    <script src="https://cdn.zingchart.com/zingchart.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/zingchart-angularjs/1.2.0/zingchart-angularjs.min.js"></script> 
	<script src="https://cdnjs.cloudflare.com/ajax/libs/ng-idle/1.3.2/angular-idle.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/0.10.0/lodash.min.js"></script> 	
    
	<!-- Services --> 
	<script type="text/javascript" src='<c:url value="/static/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/service/httpInterceptor.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/service/base64Service.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/service/PDFMakeService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/service/jwtService.js" />'></script>	
	<script type="text/javascript" src='<c:url value="/static/service/rootStorage.js" />'></script>	
	<script type="text/javascript" src='<c:url value="/static/service/paginationService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/filter/appFilter.js" />'></script>    
	<script type="application/json" src='<c:url value="/static/service/properties.js" />'></script>  
	<script type="application/json" src='<c:url value="/static/data/data.json" />'></script>
	
	<!-- Modules -->
	<script type="text/javascript" src='<c:url value="/static/modules/register-employee/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/register-employee/employeeService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/register-employee/employeeController.js" />'></script>
	 
	<script type="text/javascript" src='<c:url value="/static/modules/employees/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/employees/employeesService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/employees/employeesController.js" />'></script> 
	
	<script type="text/javascript" src='<c:url value="/static/modules/register-event/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/register-event/eventService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/register-event/eventController.js" />'></script> 
	
	<script type="text/javascript" src='<c:url value="/static/modules/events/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/events/eventsService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/events/eventsController.js" />'></script>

	<script type="text/javascript" src='<c:url value="/static/modules/event-piechart/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/event-piechart/piechartService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/event-piechart/piechartController.js" />'></script>
	
	<script type="text/javascript" src='<c:url value="/static/modules/event-barchart/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/event-barchart/barchartService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/event-barchart/barchartController.js" />'></script>
			 	
	<script type="text/javascript" src='<c:url value="/static/modules/attendance/app.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/attendance/attendanceService.js" />'></script>
	<script type="text/javascript" src='<c:url value="/static/modules/attendance/attendanceController.js" />'></script> 
	     
	<script type="text/javascript" src='<c:url value="/static/modules/login/app.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/login/loginController.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/login/loginService.js" />'></script> 
	
	<script type="text/javascript" src='<c:url value="/static/modules/email/app.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/email/emailController.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/email/emailService.js" />'></script> 

	<script type="text/javascript" src='<c:url value="/static/modules/home/app.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/home/homeController.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/home/homeService.js" />'></script> 

	<script type="text/javascript" src='<c:url value="/static/modules/reset-password/app.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/reset-password/resetPasswordController.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/reset-password/resetPasswordService.js" />'></script> 
		
	<script type="text/javascript" src='<c:url value="/static/modules/logout/app.js" />'></script> 
	<script type="text/javascript" src='<c:url value="/static/modules/logout/logoutController.js" />'></script> 
	
  </head>
  <body data-ng-app="app-module">  	  
  	<div class="app-container"> 	
  			                      
		<div class="navbar" 
	  		data-ng-if="!(location.path()=='/' || location.path()=='/login' || location.path()=='/reset_password_link' || location.path().includes('change_password_form'))">                                
	  		<%@ include file="/static/views/navbar.html"%>   					    				    
	    </div>
	    		    
		<div class="content">                            
	  		<div data-ng-view></div>
	  	</div>	
	    
	    <!-- HEADER is placed after NAVBAR & CONTENT so that its stacking order would be greater than NAVBAR & CONTENT --> 
	       
	    <div class="header">                                  
			<%@ include file="/static/views/header.html"%>	
		</div>	
	        
		<div class="footer">                              
			<%@ include file="/static/views/footer.html"%>	
		</div>		  	  	
  	</div>
  </body>
  
</html>