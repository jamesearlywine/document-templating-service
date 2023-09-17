#!/usr/bin/env bash
export CREDS=$(curl 169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI)
export AWS_ACCESS_KEY_ID=$(echo $CREDS | jq -r .AccessKeyId)
export AWS_SECRET_ACCESS_KEY=$(echo $CREDS | jq -r .SecretAccessKey)
export AWS_SESSION_TOKEN=$(echo $CREDS | jq -r .Token)
export AWS_SDK_LOAD_CONFIG=1
export AWS_DEFAULT_REGION=us-east-2