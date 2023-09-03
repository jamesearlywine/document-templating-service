import * as cdk from "aws-cdk-lib";


export class ApplicationStack {
    stack: cdk.Stack;
    constructor(app, id: string) {
        this.stack = new cdk.Stack(app, id);
    }
}


