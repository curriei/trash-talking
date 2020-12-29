#!/bin/bash
# run-oon-gcp.sh

PROJECT_ID="trashtalking-96ed8"
BUILD_NAME="test"

gcloud builds submit --tag gcr.io/${PROJECT_ID}/${BUILD_NAME}

echo "+----------------------------------------------------------------------+"
echo "|                       BUILD COMPLETED                                |"
echo "+----------------------------------------------------------------------+"

gcloud beta run deploy --image gcr.io/${PROJECT_ID}/${BUILD_NAME} --platform managed

echo "+----------------------------------------------------------------------+"
echo "|                       CONTAINER RUNNING                              |"
echo "+----------------------------------------------------------------------+"

firebase deploy

#When build is completed, some options may come up.  If so, do the following:
#Service name: Type the name of the service, for us, I am using trash-talking
#Please choose a target platform: select 1 (Cloud Run (fully managed))
#Please specify a region: select 18 (us-central1)