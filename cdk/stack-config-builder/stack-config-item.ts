import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export type StackConfigOptions = {
  value?: string;
  cfnParameter?: cdk.CfnParameter;
} & (
  | {
      value: string;
    }
  | {
      cfnParameter: cdk.CfnParameter;
    }
);

export class StackConfigItem {
  key: string;
  value?: string;
  cfnParameter?: cdk.CfnParameter;

  parentScope: Construct;
  cfnParameterNotNullCondition: cdk.CfnCondition;

  constructor(scope, key, stackConfigOptions: StackConfigOptions) {
    this.parentScope = scope;
    this.key = key;
    this.value = stackConfigOptions.value;
    this.cfnParameter = stackConfigOptions.cfnParameter;
    this.cfnParameter?.overrideLogicalId(this.key);

    if (this.cfnParameter) {
      this.cfnParameterNotNullCondition = new cdk.CfnCondition(
        this.parentScope,
        `${this.key}_ParameterNotNullCondition`,
        {
          expression: cdk.Fn.conditionNot(cdk.Fn.conditionEquals(this.cfnParameter, "")),
        },
      );
    }
  }

  /**
   * Returns the value of the stack config item. If the value is not defined, the cfnParameter is used. If the cfnParameter is not defined, the paramQuery is used.
   * @note - if only `cfnParameter` is defined, returns cfnParamter.valueAsString
   * @note - if `cfnParameter` and `value` are defined, returns ifNotNullCondition
   *  - resolves to cfnParameter || value
   * @note - if only `value` is defined, value string is returned
   *  - can be a {{resolve:ssm:}} query

   */
  get: () => string | cdk.ICfnRuleConditionExpression = () => {
    if (this.cfnParameter && !this.value) {
      return this.cfnParameter.valueAsString;
    }
    if (this.cfnParameter && this.value) {
      return cdk.Fn.conditionIf(this.cfnParameterNotNullCondition.logicalId, this.cfnParameter, this.value);
    }

    return this.value;
  };

  static create(scope: Construct, key: string, stackConfigOptions: StackConfigOptions) {
    return new StackConfigItem(scope, key, stackConfigOptions);
  }
}
