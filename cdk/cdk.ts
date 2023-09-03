import * as cdk from "aws-cdk-lib";
import {ApplicationStack} from "./application-stack";

export const app: cdk.App = new cdk.App();
export const applicationStack = new ApplicationStack(app, "PdfTemplatingService");
