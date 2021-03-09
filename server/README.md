# Server Side API
Root Hosting URL: https://trash-talking-mksvgldida-uc.a.run.app/

## List of Endpoints
* Users
  * POST /users/new - Create new user
  * POST /users/login - Login user and get token
  * GET /users/profile - Get user profile
  * GET /users/bins - Get bins registered with logged in user
  * GET /users/goals - Get logged in user's goals
  * POST /users/goals/new - Create new goal for user
* Bins
  * POST /bins/create_bin - Admin create new bin
  * POST /bins/register - Register a bin with logged in user's account
  * POST /bins/update - Update the garbage values for a specific bin
  * GET /bins/current - Get current levels of garbage in bin
* Garbage
  * GET /garbage/entries - Get individual entries of garbage
  * GET /garbage/query - Get summation information about garbage production

## Users
### POST /users/new
Creates a new user.
#### Request Body
* user_id: Unique user id
* email: Email (does need to be unique)
* password: Password
* first_name: First name of user
* last_name: Last name of user
#### Result
200
#### Errors
* 400 - Error forwarded from firebase.

### POST /users/login
Logs user in and provides an auth token.
#### Request Body
* email: email
* password: password
#### Result
```$xslt
{
    action: Success
    description: Login successful.
    token: [AUTH_TOKEN]
}
```
#### Errors
* 400 - Incorrect credentials provided.


### GET /users/profile/
Allows the viewing of any user's profile. Requires login token but any logged-in user can view any other user's profile. 
#### Request Query
* user_id: User ID of the viewed profile.
#### Request Header
* token: Login token.
#### Result
```$xslt
{
    "user_id": test12345,
    "name": Ian Currie,
    "email": iancurrie08@gmail.com
}
```
#### Errors
* 400 - ```{"code":"auth/user-not-found", "message":...}```
* 400 - Access denied, no token specified

### GET /users/bins
Returns the details of all bins for the logged in user according to login token. Users can only view their own bins.
#### Request Header
* token: Login token.
#### Result
```$xslt
{
    num_bins: 2,
    bins:
        [BIN_ID1]: {
            bin_area: 5,
            activated: true,
            user_id: test12345,
            last_update: 1611099398517,
            last_distance: 5,
            last_weight: 16,
            bin_distance: 12 
            bin_weight: 2
        }
        [BIN_ID2]: {
            ...
        }
    }
}
```
Within bin objects:
* bin_area: the horizontal area of the bin, used to calculate volume.
* activated: whether or not the bin has been activated with a user account or not.
* user_id: If bin is activated, the user registered with the bin
* last_update: microseconds since January 1st 1970 to the update time
* last_distance: Latest update in the bin representing distance from top of bin to trash.
* last weight: latest measured weight of bin and garbage together
* bin_distance: distance of empty bin
* bin_weight: distance of empty bin

**Note: use current if looking for current levels of a given bin, not this.**
#### Errors
400 - Access denied, no token specified.


### GET /users/goals
Get the outstanding goals for the logged in user. Requires login, and users can only see their own goals.
#### Request Header
* token: login token.
#### Result
```$xslt
{
    num_goals: 2,
    goals: {
        [GOAL_ID1]: {
            "goal_desc": "I want to reduce my trash or something",
            "status": "Incomplete",
            "time_due": 1621099398517,
            "user_id": "test12345",
            "time_made": 1611105714698
        },
        [GOAL_ID2]: {...}
    }
}
```
#### Errors
400 - Access denied, no token specified.

### POST /users/goals/new
Creates a new goal. Authentication required.
#### Request Body
* goal_desc: Description of goal 
* time_due: Due date of the goal in seconds since epoch time.
#### Request Header
* token: Login token.
#### Result
200
#### Errors
400 - Access denied, no token specified.

## Bins
### POST /bins/create_bin
Admin only endpoint, used whenever a bin is created and shipped out to customers.  Bin ID would have to be included in the box for the user to use to register bin.  This will be changing shortly for security.
#### Request Body
* diameter: (Alternative to bin_area) Measured diameter of bin, used to calculate bin_area (assuming bin is cylindrical) and in volume calculations.
* area: (Alternative to diameter) Measured area of bottom of horizontal cross section of bin.  Used in volume calculations.
* admin_password: Admin password as irresponsibly included in .env file.
#### Result
200 - 
```$xslt
{
        status: "success",
        message: "Bin created",
        bin_id: [BIN_ID]
    }
```
#### Errors
400 - No admin_password specified
400 - Incorrect admin_password specified

### POST /bins/register
Login required for this endpoint, registers a bin which was purchased with a specific account.  User needs to open and close the lid when the register (to get initial measurements of the bin).
#### Request Body
* bin_id: Bin ID from bin creation.
#### Request Header
* token: Token given by users/login endpoint.
#### Result
200 - Bin with id [BIN_ID] registered. 
#### Errors
* 400 - Bin does not exist
* 400 - Bin has already been registered.

### POST /bins/update
Endpoint for a bin to send to whenever an update is required. Checks to see if bag is removed, and if not gets an update on the weight and volume of garbage in the bin.
#### Request Body
* bin_id: Bin ID from bin creation.
* weight: Absolute weight measurement.
* distance: Absolute distance measurement.
#### Result
* 200 - Bag added, no garbage recorded
* 200 - [WEIGHT] weight, [VOLUME] volume added for bin [BIN_ID].
#### Errors
* 400 - Bin does not exist
* 400 - Firebase error: [ERROR]

### GET /bins/current
Returns current weight and volume in bin.  Checks for login and that bin is owned by current user.
#### Request Query
* bin_id: Bin ID from bin creation.
#### Request Header
* token: token from user/login.
#### Result
```
{
current_weight: 12,
current_volume: 5,
last_update: 1611099398517
}
```
#### Errors
* 400 - No/unknown token provided.
* 400 - Bin does not exist
* 400 - Bin does not belong to this user
* 400 - Bin has never been updated before


## Garbage 
### GET /garbage/entries
Returns all entries for the relevant bins between time_start and time_end.  Entries will be ordered in ascending order by time_stamp.
#### Request Query
* time_start: Starting date for query.
* time_end: Ending date for query.
* bins: OPTIONAL, can be a list of binIDs to look for. If empty will just return entries for all bins registered to logged in user.
#### Request Header
* token: Login token.
#### Result
* 200 - 
```
{
    num_entries: 5,
    data: [
        {
            bin_id: "7106d7e7-3966-41b6-bcc2-c7ce573d0514",
            time_stamp: 1611099398517,
            weight: 5.213,
            volume: 2.23
        },
        {...},{...},{...},{...}
    ]
}
```
* 200 - No data entries within parameters found

#### Errors
* 400 - Bin with id [BIN_ID] does not exist
* 400 - User has no registered bins
* 400 - User not permitted to view bin [BIN_ID]

### GET /garbage/query
Returns summary data about the entries over the time interval specified.  Returns data in the form of objects named by the first time of the period with weight and volume for that period represented within the object (see example result).  

Will always make periods outside of the bounds of the start/end time, but only include entries within the start/end time in the totals. Eg. If interval type is year and start and end times are only between Jan 15 2021 and Feb 15 2021, the period will be Jan 1 2021 - Dec 31 2021, but any entry from before Jan 15 or before Feb 15 will not be included in the total for that year.

Let Ian know if you would like to talk more about this behaviour, happy to change it if there is a better way.
 
#### Request Body
* time_start: Start time for the query interval in microseconds since epoch time.
* time_end: End time for the query interval in microseconds since epoch time.
* interval: (OPTIONAL) One of [day, week, month, or year].  If anything else or left undefined, will default to not segmenting data (eg. giving sum of all weight and volume over entire period specified with time_start and time_end)
* bins: OPTIONAL, can be a list of binIDs to look for. If empty will just return entries for all bins registered to logged in user.
#### Request Header
* token: Login token.

#### Result
200 - 
```
{
    interval_type: "month",
    num_intervals: 9
    data: {
        "1609477200000": {
            "weight": 5,
            "volume": 1145
        },
        "1612155600000": {
            "weight": 0,
            "volume": 0
        },
        "1614574800000": {
            "weight": 0,
            "volume": 0
        }, {...}, {...}, {...}, ...
    }
}
```
#### Errors
* 400 - Bin with id [BIN_ID] does not exist
* 400 - User has no registered bins
* 400 - User not permitted to view bin [BIN_ID]

# To Run on GCP
I have set up a simple script to go through all the steps of running through cloud run and routing the firebase hosting to the app.  You should be able to get it going using run-on-gcp.sh, however you will need the .env and google key json files with the following fields in the .env file:

TOKEN_SECRET: Random string of digits for JWT authentication secret.

GOOGLE_API_KEY: API key from google for firebase admin API.

ADMIN_PASSWORD: Password for admin only endpoints.

GOOGLE_OAUTH_FILE: File name of google oauth json file for firebase admin service account.

