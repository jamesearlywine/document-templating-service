# processproof-document-templating-service

## Infrastructural DFD
<a href="https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076" target="_blank">https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076</a>

## How to run
- `cdk bootstrap aws://{YOUR_AWS_ACCOUNT_NUMBER}/us-east-1` (or your preferred aws region)
- `npm run build`
- `npm run build:template`
- `npm run deploy`

Then go to your aws web console and find the cloudformation stack "PdfTemplatingService" in your specified region.