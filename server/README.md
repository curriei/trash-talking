#Server Side API
Root Hosting URL: https://trashtalking-96ed8.web.app

##Users
###POST /users/new
Creates a new user.
####Request Body
* username: Username (does not need to be unique)
* email: Email (does need to be unique)
* password: Password
####Result
200

###POST /users/login
Logs user in and provides an auth token.
####Request Body
* email: email
* password: password
####Result
```$xslt
{
    action: Success
    description: Login successful.
    token: [AUTH_TOKEN]
}
```
###GET /users/goals
Get the outstanding goals for the user. Requires login.
####Request Body
* token: login token.
####Result
```$xslt
{
    num_goals: 2,
    goals: [
        {
            date: November 5th 2020,
            goal: I want to reduce my trash by 50%,
            user_id: long-gross-uuidv4-string
        },
        {...}
    ]
}
```

###POST /users/goals/new
Creates a new goal. Authentication required.
####Request Body
* token: Login token.
* goal_desc: Description of goal 
* date_due: Due date of the goal. (Eg "Sat Jan 16 2021")
####Result
200

###GET /users/profile/
Allows the viewing of any user's profile. Requires login but any logged in user can view any other user's profile. 
####Request Body
* user_name: unique ID of the viewed profile.
* token: Login token.
####Result
Ian needs to finish this implementation.

###GET /users/bins
Returns the details of all bins for the given user.
####Request Body
* token: Login token.
####Result
```$xslt
{
    binId : {
        bin_area: 5,
        last_distance: 5,
        last_weight: 16,
        user_id: uid
    }
}
```


##Bins
###POST /bins/create_bin
Admin only endpoint, used whenever a bin is created and shipped out to customers.  Bin ID would have to be included in the box.
####Request Body
* diameter: Measured diameter of bin in metres.
* admin_password: Admin password as included in .env file.
####Result
"Bin created with ID: [binID]"

###POST /bins/register
Login required for this endpoint, registers a bin which was purchased with a specific account.  User needs to open and close the lid when the register (to get initial measurements of the bin).
####Request Body
* bin_id: Bin ID from bin creation.
* token: Token given by users/login endpoint.
####Result
200

###POST /bins/update
Endpoint for a bin to send to whenever an update is required. Checks to see if bag is removed, and if not gets an update on the weight and volume of garbage in the bin.
####Request Body
* bin_id: Bin ID from bin creation.
* weight: Absolute weight measurement.
* distance: Absolute distance measurement.
####Result
200

###GET /bins/current
Returns current weight and volume in bin.  Checks for login and that bin is owned by current user.
####Request Body
* bin_id: Bin ID from bin creation.
* token: token from user/login.
####Result
```
{
current_weight:[weight],
current_volume: [volume]
}
```


##Garbage 
###GET /garbage
Basically a big garbage query endpoint.
####Request Body
* token: Login token.
* date_start: Starting date for query.
* date_end: Ending date for query.
* bins: OPTIONAL, can be a list of binIDs to look for. If empty will just return totals for all bins relating to the user.
####Result
Ian needs to implement this.

#To Run on GCP
I have set up a simple script to go through all the steps of running through cloud run and routing the firebase hosting to the app.  You should be able to get it going using run-on-gcp.sh, however you will need the .env and google key json files with the following fields in the .env file:

TOKEN_SECRET: Random string of digits for JWT authentication secret.

GOOGLE_API_KEY: API key from google for firebase admin API.

ADMIN_PASSWORD: Password for admin only endpoints.

GOOGLE_OAUTH_FILE: File name of google oauth json file for firebase admin service account.


