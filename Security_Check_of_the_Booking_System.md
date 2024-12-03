# Security Check of the Booking System

Date: 3.12.2024

The topic of this document is to report 5 most important security issues 
found in the Booking System web-application that should be fixed as soon as possible.

In phase 3 of the Booking System Project the specs are the following:
* Booking system
* Users cand register
* A registered user can be a reserver or an administrator
* An administrator can add resources and reservations
* A reserver (and of course also the administrator) can book a resourse if they are over 15 years old
* The reservation system allows viewing booked resources without logging in, but the reserver's identity is not shown

The task was to find the 5 most important points that should be fixed as soon as possible.
To find these security issues manual testing of different user work flows and 
automated vulnerability testing of the system were performed. Manual testing was performed to compare 
the specs to the working system to find out possible contradictions or other security related issues.
More in depth code related security vulnerabilities were searched by using dynamic application security testing tool called Zap.

The findings are separated into issues ranging from 1-5.
In each issue there is explanations for:
* What is wrong?
* How the issue was found?
* How should it work/What should be fixed?
Issues are not arranged based on the severity of the problem.

## Issue 1.
### What is wrong?
Only a user that has registered as an administrator should be able to add resources. However, a user registered as a reserver can also add resources not just make reservations. 
This is a failure in Role-Based Access control. (Current system doesn’t adhere to the Principle of Least Privilege)

### How the issue was found?
I created a user john@doe.com as reserver and added a new resource called reserver-cottage. The resource was saved and the user can make a reservation for it.

### How it should work/What should be fixed?
According to the specs, only an administrator should be able to add resources. To begin fixing the issue is to hide the link to the resource addition page from the reservers index page view. 
Simply hiding the link is not enough because logged in reserver might guess the structure of the url-addresses and simply type “http://localhost:8000/resources” in place of “http://localhost:8000/reservation” and gain access to the add recourses functionality. 
Code must be altered to validate that only users registered as administrators are authorized to view the resources-page. 


## Issue 2.
### What is wrong?
There is no control over who can register as an administrator and gain access to resource management. 
Although there is no functionality to delete resources yet and it is not good that anyone can become an administrator if they choose so. This would be a huge security risk that cybercriminals could take advantage of. 

### How the issue was found?
The option to freely choose administrator role can be found in the register page. I completed registration where I chose the role as administrator. After registration I tested adding resources and making reservations which both were successful.

### How it should work/What should be fixed?
Public registration should only have the option to register as reserver. Registering as an administrator should be separated from the public registration page. New administrator candidates register as reservers first. First admin could be super-admin who manually reviews reservers who have applied to be administrators. Super-Admin verifies the candidate’s identity e.g. external authentication process. If the candidate is approved the super-admin updates the user’s role in the booking system.


## Issue 3. 
### What Is Wrong
Problem with registration validation. Users under 15 years of age can register and add resources. 
However, if a user under 15 years of age tries to make a reservation the reservation fails and show unambiguous error message “Error during reservations”. 
Users will find it difficult to deduct from the error message what went wrong. This is a security issue in the code as the age is not validated early enough. 
If a user under 15 is not supposed to be able to create resources or make reservations then there is no use for them to be able to register.

### How the issue was found?
I tested user flow for the application manually by registering as a username “jonnet@eimuista.fi” of under 15 years of age and with the role of reserver. 
I logged in as the user and created a resource and tried to make a reservation for it.

### How it should work/What should be fixed?
The application should validate users age in the register functionality and prevent users from completing registering successfully If they are under 15 years old. 
Registration failure should result in a clear message such as “Registration failed. You must be at least 15 years old to use this application”.
To fix this, modify code to validate age in the registering phase. Add error message “Registration failed. You must be at least 15 years old to use this application” for the case when the user is under 15. 
Possibly restrict the birth date calendar to show only dates that define the user as over 15 years old.


## Issue 4.
### What is wrong?
Code is vulnerable to Format String Attack because submitted data of an input string is evaluated as a command by the application and the resource.js accepts inputs with any kind of character without proper string sanitization. 

### How the issue was found?
The issue was found by using dynamic application security testing tool called Zap. The website was used through full user flow (register, login, create resource, make reservation and logout) in the Zap’s “manual explore” browser functionality. After this Zap was used to conduct tests  which were four active scan rounds and one spider attack after the first active scan. The Zap alert was 30002 – Format string error.

### How it should work/What should be fixed?
Input should be validated and sanitized by using a library like validator.js to prevent malicious or malformed strings (e.g., containing format spesifiers like %s, %d, etc.) , they could trigger unexpected behavior in downstream processing or loggin. Inputs should not be directly included in console.error() calls without sanitization. 
Instead of “console.error(‘Error fetching resources:’, error);” use for example “console.error(‘Error fetching resources:’, String(error));” This converts the input into a string representation which won’t behave as a command.


## Issue 5.
### What is wrong?
Zap attack alert states that the site has Cross Site Scripting Weakness (Persistent in JSON response). The alert’s description is the following “A XSS attack was found in a JSON response, this might leave content consumers vulnerable to attack if they don't appropriately handle the data (response)”. 

### How the issue was found?
The issue was found by using dynamic application security testing tool called Zap. The same amount and type of scans that were used in finding the Format String Attack -alert was used in finding this alert. The Zap alert ID was 40014, Cross Site Scripting (Persistent).

### How it should work/What should be fixed?
ChatGPT was used to summarize the solution given by Zap into a more concise form.
* Sanitize and Validate input, similarly as in Format String error fix explanations.
* Encode output
  * Properly escape all non-alphanumeric characters when user generated data is included in JSON responses.
  * Use libraries or frameworks to handle encoding
  * for example Microsoft’s Anti-XXS library
  * OWASP ESAPI Encoding module
* Specify Character encoding for HTTP responses (e.g., UTF-8)
* Use secure HTTP headers
  * CSP default-src ‘self’  <- Already implemented in the code
  * X-Content-Type-Options: nosniff <-<- Already implemented in the code
  * HttpOnly Cookies: Set cookies as HttpOnly
    * Not supported by all browsers
* Validate all inputs also on the server to ensure they meet  the requirements made in the application. (length, data format etc.) 	 
* Ensure user inputs are not directly embedded in responses without sanitization.


## Issue 6.
Next issue would be zap alert about Private IP disclosure, but that is listed as low risk at this point and will be left out of the Top 5 things to fix.

