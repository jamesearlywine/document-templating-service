#!/usr/bin/env bash
mkdir ~/.aws
echo "[default]" > ~/.aws/credentials
echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.aws/credentials
echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.aws/credentials
echo "region = us-east-2" >> ~/.aws/credentials
echo "output = json" >> ~/.aws/credentials
