# Local Community API
This is a web API built using JavaScript and Node, using the Koa framework. The API is designed to be used by all residents of a city or area, allowing them to make an account and post on route issues, report new issues related to anything road works, potholes, littering, dog poo, etc.

## Routes
The API has the following routes:



- Users:
> POST /users - Create a new user account

> GET /users/:id - Get a user account by their ID

> GET /users/:username - Get a user account by their username

> GET /users/:email - Get a user account by their email

> PUT /users - Create a new user account

> DELETE /users/:id - Delete a user account (only the user can delete their own account)


- Issues:
> POST /issues - Create a new issue report

> GET /issues - Get a list of all issue reports.

> GET /issues{id} - Get a single issue report, including the exact location of the issue being reported as retrieved from the Google Maps API.

> DELETE /issues/:id - Delete an issue report (only the user who created the report can delete it)


- Meetings:
> POST /meetings - Create a new meeting

> GET /meetings - Get a list of all meetings along with the AccuWeather information of the next 5 days at the meeting location.

> GET /meetings{id} - Get a list of all meetings along with the exact location retrived from Google maps API

> PUT /meetings/:id - Update a meeting (only the user who created the meeting can update it)

> DELETE /meetings/:id - Delete a meeting (only the user who created the meeting can delete it)



- Announcements:
> POST /announcements - Create a new announcement (admin only)

> GET /announcements - Get a list of all announcements

> GET /announcements/:id - Get a list of all announcements

> PUT /announcements/:id - Update an announcement (admin only)

> DELETE /announcements/:id - Delete an announcement (admin only)

------------

## Authentication
To make requests to the API, users need to authenticate themselves using Basic Authentication. When a user makes a request, they must provide their username and password in the Authorization header using the following format:

## Authorization
Users are only authorized to perform certain actions on the API, based on their role. Regular users can create and delete their own accounts, create issue reports, create meetings, and view announcements. Admin users have access to all resources and can also update and delete announcements, and update and delete user accounts. When a user account is deleted, their posts are transferred to a placeholder user name > deletedUser.

## Issue Details
When a user requests the /issues route, the API responds with a list of all issue reports along with the exact location of the issue being reported. This information is retrieved from the Google Maps API using the latitude and longitude coordinates of the issue location stored in the database.

If a user selects a specific issue by its ID, the API will extract the latitude and longitude coordinates from the database and use the Google Maps API to retrieve the exact address of the location.

## Meeting Details
When a user requests the /meetings route, the API responds with a list of all meetings along with the AccuWeather information of the next 5 days at the meeting location. This information is retrieved from the AccuWeather API using the latitude and longitude coordinates of the meeting location stored in the database.

If a user selects a specific meeting by its ID, the API will extract the latitude and longitude coordinates from the database and use the Google Maps API to retrieve the exact address of the location.

----------
## Conclusion
This API provides a platform for local community members to report issues, organize meetings, and receive important announcements. With proper authentication and authorization mechanisms, it ensures that only authorized