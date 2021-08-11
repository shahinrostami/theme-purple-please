#! /bin/bash

curl -X POST -H 'Content-Type:application/json' -d '{"attachments": [{"color": "#7CD197", "fallback": "Build Notification: '$CIRCLE_BUILD_URL'", "title": "Snyk-Docker-Plugin Build Notification", "text": ":krotik-yay: Snyk-Docker-Plugin Successful Master Build :krotik-yay:"}]}' $SLACK_WEBHOOK
