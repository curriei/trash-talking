#Server Side API
Root Hosting URL: https://trashtalking-96ed8.web.app

##Users
###POST /users
Creates a new user, returns a unique ID for that user.
###GET /users/:userID 
Returns mass of garbage production for the last month for that user.  Will continue to be developed for data processing purposes.
##Bins
###POST /bins
Registers a new bin.  Need to figure out how to link this to a specific bin.
###POST /bins/:binID
Posts a garbage update for bin with binID 

#To Run on GCP
I have set up a simple script to go through all the steps of running through cloud run and routing the firebase hosting to the app.  You should be able to run it on your computer too using run-on-gcp.sh