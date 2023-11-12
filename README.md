# processproof-document-templating-service
<img src="https://codebuild.us-east-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoidSt5Q3RoblEwcUFkSDlyQTB6bzJQTDI2OWtWWDhzdklidVZ3SFU5T3puWTMwZC9CemV3a3NyR0tjRWJzVHp1aTJxVzlmMDF2UXVqVUVWbkFqcGhzT2JZPSIsIml2UGFyYW1ldGVyU3BlYyI6Ik5oOElxUWkyWTZ1OThaNXoiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=main"/>

## Infrastructural DFD
https://miro.com/app/board/uXjVMomNJfU=/?share_link_id=936300575076

## Confluence
https://jamesearlywine.atlassian.net/wiki/spaces/ProcessPro/pages/1822556161/Document+Templating+Service

## How to Test
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
  - `cdk/stack-config.ts`
    - Define a ConfigKey on StackConfig
    - Set a ConfigValue on stack-config
      - this can be a simple string value: "some-config-value"
      - this can be an ssm query: "{{resolve:ssm:/path/to/ssm/parameter:1}}"
    - Define a CfnParameter on StackConfig with a default value
      - this can have a simple string default value
      - this can be overriden:
        - when deploying from the command line
          - overrides specified in a config file
          - overrides specifies  in cli args
          - `cdk.json`
        - when deploying from pipeline 
          - overrides specified in pipeline
          - overrides specified in a template.config.{env}.json file (must enable this in pipeline)
        
## How to deploy
- to deploy an ephemeral stack 
  - `cdk/cdk.ts`
    - set `ephemeralPrefix` to a unique value, AWS_ENV will be "dev"
- `cdk bootstrap aws://{YOUR_AWS_ACCOUNT_NUMBER}/us-east-2` (or your preferred aws region)
- `npm run build`
  - `npm run build:watch` (if you want to watch for changes)
- `npm run build:template`
- `npm run deploy` 
  - `cdk watch` (if you want to watch for changes)

Then go to your aws web console and find the cloudformation stack "{ephemeralPrefix}DocumentTemplatingService" in your specified aws region.