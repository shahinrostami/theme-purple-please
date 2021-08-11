#! /bin/bash

JOB_NAME="$@"

curl -X POST -H 'Content-Type:application/json' -d '{"attachments": [{"color": "#EE0000", "fallback": "Build Notification: '$CIRCLE_BUILD_URL'", "title": ":warning: snyk-docker-plugin merge failure :warning:", "text": ":x: CircleCI job `'"${JOB_NAME}"'` failed :x:\n'$CIRCLE_BUILD_URL'"}]}' $SLACK_WEBHOOK
