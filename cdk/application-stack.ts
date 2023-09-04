import * as cdk from "aws-cdk-lib";

export class ApplicationStack {
    stack: cdk.Stack;
    mergeDocumentAndDataLambda: cdk.aws_lambda.Function;
    constructor(app, id: string) {
        this.stack = new cdk.Stack(app, id);
        this.mergeDocumentAndDataLambda = new cdk.aws_lambda.Function(this.stack, "mergeDocumentAndData", {
            runtime: cdk.aws_lambda.Runtime.NODEJS_18_X,
            handler: "mergeDocumentAndData.handler",
            code: cdk.aws_lambda.Code.fromAsset(`${__dirname}/../build/handlers/mergeDocumentAndData`),
        });
    }
}


