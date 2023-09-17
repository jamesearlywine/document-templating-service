#!/usr/bin/env bash
mkdir ~/.aws
echo "[default]" > ~/.aws/config
echo "aws_access_key_id = ${AWS_ACCESS_KEY_ID}" >> ~/.aws/config
echo "aws_secret_access_key = ${AWS_SECRET_ACCESS_KEY}" >> ~/.aws/config
echo "region = us-east-2" >> ~/.aws/config
echo "output = json" >> ~/.aws/config
