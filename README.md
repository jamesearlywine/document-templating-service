# processproof-document-templating-service
<img src="https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoidSt5Q3RoblEwcUFkSDlyQTB6bzJQTDI2OWtWWDhzdklidVZ3SFU5T3puWTMwZC9CemV3a3NyR0tjRWJzVHp1aTJxVzlmMDF2UXVqVUVWbkFqcGhzT2JZPSIsIml2UGFyYW1ldGVyU3BlYyI6Ik5oOElxUWkyWTZ1OThaNXoiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main"/>

## Infrastructural DFD
https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076

## How to run
- `cdk bootstrap aws://{YOUR_AWS_ACCOUNT_NUMBER}/us-east-1` (or your preferred aws region)
- `npm run build`
- `npm run build:template`
- `npm run deploy`

Then go to your aws web console and find the cloudformation stack "DocumentTemplatingService" in your specified aws region.