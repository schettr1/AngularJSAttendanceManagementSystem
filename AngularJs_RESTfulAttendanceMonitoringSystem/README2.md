## AUTHENTICATE USER - 
When user logs in to the application, username and password is encoded using Base64Encoder ``` var authdata = Base64Service.encode(username + ':' + password) ``` and HTTP Post request is sent to the server. Server authenticates the user credentials and returns a JSON data in the response. 

Service Endpoint -
```bash 
  REST_SERVICE_URI + '/authorize' 
```

Request Header -
```bash
    headers: { 
	        	"Authorization": "Basic " + authdata 
	      }
```
Response Payload -
```bash
	{
		access_token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseWRpYSIsInNjb3BlcyI6WyJST0xFX0FETUlOIl0sImlzcyI6IkF1dGhvcml6YXRpb25fU2VydmVyIiwiaWF0IjoxNTY2ODUwMzg0LCJleHAiOjE1NjY4NTAzOTl9.AV3LYUFCClSi5Ccqxf8yPpzPiONNGaPLf1UYdeNvqSR46UqBye0WjkOYsM2oiCSsyjyR1B3DkwwuFLylL1eLuA',
		refresh_token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseWRpYSIsImlzcyI6IkF1dGhvcml6YXRpb25fU2VydmVyIiwianRpIjoiMDk2MDJmZDAtZTQ2YS00ODIwLTgzMzctZmY1YmYwNzM2Y2VjIiwiaWF0IjoxNTY2ODUwMzg0LCJleHAiOjE1NjY4NTA0NDR9.7DA6X4AWnPAtY6z1WsqFMeB7vCB6Qy_voMSUurxj7BfPxcExKdsZtVciVlo8k3HhZGyMm0ZI_r65Hdn-BcETIw',
		employeeId: 9999,
		roles: [ROLE_ADMIN]
	}
```

## INTERCEPTOR - 
Every outgoing request from the Client is intercepted and configured. If request needs authorization headers, we add it to the request.

```bash
	headers : { 
	         'Authorization': 'Bearer ' + access_token
	      }
```
	      
Every incoming responseError object from the Server is also intercepted. We do so because we want to handle 401 errors due to expired
access_token so that we can renew the access_token and re-send failed request one more time. Every other responseError is forwarded to the Controller
to be handled there.
Adding refresh_token to the request 

```bash
	headers : { 
				'Authorization': 'Bearer ' + refresh_token 
			} 
```
JSON data received with new access_token and original refresh_token

```bash
	{
		access_token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseWRpYSIsInNjb3BlcyI6WyJST0xFX0FETUlOIl0sImlzcyI6IkF1dGhvcml6YXRpb25fU2VydmVyIiwiaWF0IjoxNTY2ODUyNTkwLCJleHAiOjE1NjY4NTI2MDV9.lVO47xquwNP-M9Qha1TcoS9ErQSj9OB-d7NGOpJ7Uu9IvL53X-vX5O9GOSwzovAe83VR1D5HAsv3YGhBbXTpdg',
		refresh_token: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseWRpYSIsImlzcyI6IkF1dGhvcml6YXRpb25fU2VydmVyIiwianRpIjoiMDk2MDJmZDAtZTQ2YS00ODIwLTgzMzctZmY1YmYwNzM2Y2VjIiwiaWF0IjoxNTY2ODUwMzg0LCJleHAiOjE1NjY4NTA0NDR9.7DA6X4AWnPAtY6z1WsqFMeB7vCB6Qy_voMSUurxj7BfPxcExKdsZtVciVlo8k3HhZGyMm0ZI_r65Hdn-BcETIw',
		employeeId: 9999,
		roles: [ROLE_ADMIN]
	}
```

## TOKEN EXPIRATION - 
To monitor the expiration of refresh_token, $interval service is used. It calls the method checkTokenExpiration every 1 min.

```properties
$rootScope.interval = $interval(checkTokenExpiration, 1 * 1000);
```
If refresh_token is expired user is logged out.



## FORGOT PASSWORD - 
* User clicks on forgot password link.
* Front-end application (Client) returns "reset_password_link" page.
* User submits valid email.
* Client sends GET request to path "/reset-password?email=xyz@gmail.com"
* Server verifies email exists, generate token and send link to rest password to the email.
* User signs into gmail account. 
* User clicks on the link to reset password.
* Client sends GET request to path ``` /verify-change-password-token?token=eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJseWRpYSIsInNjb3BlcyI6WyJST0xFX0FETUlOIl0sImlzcyI6IkF1dGhvcml6YXRpb25fU2VydmVyIiwiaWF0IjoxNTY2ODUyNTkwLCJleHAiOjE1NjY4NTI2MDV9.lVO47xquwNP-M9Qha1TcoS9ErQSj9OB-d7NGOpJ7Uu9IvL53X-vX5O9GOSwzovAe83VR1D5HAsv3YGhBbXTpdg ``` 
* Server verifies token validity and expiration.
* Retrieve username from the token.
* Retrieve employee by using that username.
* Server returns employee to the client and client returns "change_password_form" page to the User.
* User submits new password.
* Client sends POST request to path ``` "/token-based-update-password" ``` with ``` employee = {employeeId: '', username: '', password: new_password} ```
* Server verifies the employee.
* Server encodes password using BCryptPasswordEncoder() and updates password to the database.
* Server returns response status 200 and client returns message "Your password has been updated. Please sign in again!" to the user.

   		
   		
(NOTE: There can be multiple supervisors in a shift but there can be only one active supervisor for any shift at any given time)
EmployeeId 100, 200 and 300 are default Supervisors. They cannot be updated or disabled.
EmployeeId 400 is default Admin. It cannot be updated or disabled.
Employee whose status is inActive or disabled is cannot be updated.

## CREATE NEW ADMIN - 
  * Enable and save new admin.
 
## CREATE NEW MEDTECH - 
  * Find supervisor of that shift
  * Add supervisor to new medtech.
  * Enable and save new medtech.
  
## CREATE NEW SUPERVISOR - 
  * Find shift of new supervisor.
  * Find current supervisor of that shift.
  * Transfer all subordinates from current supervisor to new supervisor.
  * Inactivate current supervisor.	
  * Enable and save new supervisor.

## DISABLE ADMIN/MEDTECH -
  * Find admin/medtech.
  * Disable admin/medtech.  
  
## DISABLE SUPERVISOR - 
  * If supervisorId = 100, 200 or 300, response message "disable supervisor not permitted."
  * Else, find shift of current supervisor.
  * If shift = DAY, find DaySupervisor. 		
  * Transfer all subordinates from current supervisor to DaySupervisor.
  * Disable current supervisor.	
  * Enable DaySupervisor.

## ENABLE SUPERVISOR - 
  * Find shift of new supervisor(enabled supervisor).
  * Find current supervisor of that shift. 		
  * Transfer all subordinates from current supervisor to new supervisor.
  * Disable current supervisor.	
  * Enable new supervisor.
    		

## INHERITANCE -
EMPLOYEE is a parent class. ADMIN, SUPERVISOR and MEDTECH are children class.
Therefore, ADMIN, SUPERVISOR and MEDTECH inherits properties from EMPLOYEE class.
Create a single table EMPLOYEES that can save all child objects using InheritenceType=SINGLE_TABLE.
Admin, Supervisor and Medtech can be distinguished by using DiscriminatorColumn(name='employee_type').
Employee has employee_type=0, Admin has employee_type=1, Supervisor has employee_type=2 and Medtech has employee_type=3
To persist Admin to the database, use Admin = new Admin();
To persist Supervisor to the database, use Supervisor = new Supervisor();
To persist Medtech to the database, use Medtech = new Medtech();

EMPLOYEES has many-to-many relation with EVENTS and has one-to-many relation with ROLES.
Use CascadeType.REMOVE only in relation between EMPLOYEES and ROLES as this will also remove roles if employee is removed.
Use FetchType.LAZY as it will improve performance when loading child classes.

TO UPDATE EMPLOYEE 
Check whether employee role has changed or only shift has changed.

i. If Role has changed -
* Medtech to Admin
* Medtech to Supervisor
* Admin to Medtech
* Admin to Supervisor
* Supervisor to Admin
* Supervisor to Medtech

ii. If Shift has changed but no Role changed -
* Medtech to Medtech
* Admin to Admin
* Supervisor to Supervisor


## REMEMBER -
* Employee status won't change from inactive(disabled) to active(enabled) by updating employee information. To enable employee, Admin must change 
the employee status from inactive to active. Disabled employee information cannot be updated. You must enable employee status first.

* Always return response object from the Service.js. Do not return response.data/response.data.event/response.data.employee from the Service.js
This is because if there is a response error, you will not be able to get response.status in the Controller.js which you will need to display error message.
In Controller.js use map() function to retrieve data.
                self.list = response.data;
                self.list = self.list.map(x=> x.event);
                
* While sending email, user can search emails by typing a letter in 'To' textbox which will display list of user emails beginning with that letter.

* During attendance, list of active medtechs is retrieved from the database and those medtechs who attended the event are identified with 
'eventId' = 5001 and those who did not attend the event are identified as 'eventId' = 0. 

* There are 2 ways of sending and receiving URL parameter. 

```bash
	  Using '$location'
		$location.path('/home').search({empId: String(empId)});  ---------> for sending parameter
		urlParams = $location.search().empId;                    ---------> for receiving parameter
```

```bash
	  Using '$routerparam'
		$location.path('/home/'+empId);                ---------> for sending parameter
		empId = parseInt($routeParams.empId);          ---------> for receiving parameter
```

* Difference between ``` data-ng-show='!ctrl.employee.enabled' ``` and ``` data-ng-show='ctrl.employee.enabled == false' ``` 
First one will display element when ``` employee.enabled == false || employee.enabled == undefined ``` 
Second one will show element only when ``` employee.enabled == false ```

* For file upload use 'ng-file-upload'. Follow instructions in this link https://github.com/danialfarid/ng-file-upload





