# pdf-templating-service

## Infrastructural DFD
https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076

## How to run
- `cdk bootstrap aws://{YOUR_AWS_ACCOUNT_NUMBER}/us-east-1` (or your preferred aws region)
- `npm run build`
- `npm run build:template`
- `npm run deploy`

Then go to your aws web console and find the cloudformation stack "PdfTemplatingService" in your specified region.