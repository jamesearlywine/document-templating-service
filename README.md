# processproof-document-templating-service
<img src="https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoidSt5Q3RoblEwcUFkSDlyQTB6bzJQTDI2OWtWWDhzdklidVZ3SFU5T3puWTMwZC9CemV3a3NyR0tjRWJzVHp1aTJxVzlmMDF2UXVqVUVWbkFqcGhzT2JZPSIsIml2UGFyYW1ldGVyU3BlYyI6Ik5oOElxUWkyWTZ1OThaNXoiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main"/>

## Infrastructural DFD
https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076

## Confluence
https://jamesearlywine.atlassian.net/wiki/spaces/ProcessPro/pages/1822556161/Document+Templating+Service

## How to run locally
- Unit Testing
  - `npm run test`
- Integration Testing
  - `npm run test:integration`
    - You can edit the docxtemplater template in `testing/test-templates`
    - to view test-generated-files: 
      - edit `*.integration-test.ts` to `REMOVE_TEST_GENERATED_FILES=false`
      - watch `testing/test-generated-files/*` for test-generated files
- Load testing
  - `npm install -g artillery`
  - `./testing/artillery/post-generated-documents.yaml`
    - config: 
      - target: {apiBaseUrl}
  - `npm run test:load`
  - reports: `./testing/artillery/reports`

## How to configure
  - Pass in Cloudformation parameters to configure the service
    - Pipeline injection of parameters
      - key/values specified in the pipeline
        - edit Deploy Stage -> Advanced -> Parameter overrides via Web Console
      - template configuration file specified in the pipeline
        - `template.config.{env}.json`
    - when deploying from the command line, 
      - `cdk deploy --parameters {key}={value} ...`
        - (optional) update `npm run deploy` script
    - default values for cloudformation parameters
      - `cdk/stack-config.ts`
    - fetch param/secret from ssm
      - `cdk/stack-config.ts`
        - value resolved when cloudformation parameter-value is not specified

## How to deploy
- edit `ephemeralPrefix` and hard-coded config values in: 
  - `cdk/cdk.json`
  - `cdk/application-stack.cdk.ts`
- `cdk bootstrap aws://{YOUR_AWS_ACCOUNT_NUMBER}/us-east-1` (or your preferred aws region)
- `npm run build`
  - `npm run build:watch` (if you want to watch for changes)
- `npm run build:template`
- `npm run deploy` 
  - `cdk watch` (if you want to watch for changes)



Then go to your aws web console and find the cloudformation stack "{ephemeralPrefix}DocumentTemplatingService" in your specified aws region.