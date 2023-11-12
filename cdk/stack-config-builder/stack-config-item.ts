import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export type StackConfigItemOptions = {
  value?: string;
  cfnParameter?: cdk.CfnParameter;
  query?: string;
} & (
  | {
      value: string;
    }
  | {
      query: string;
    }
  | {
      cfnParameter: cdk.CfnParameter;
    }
);

export class StackConfigItem {
  key: string;
  value?: string;
  cfnParameter?: cdk.CfnParameter;
  query?: string;

  parentScope: Construct;
  isCfnParameterValueEmptyCondition: cdk.CfnCondition;

  constructor(scope, key, stackConfigItemOptions: StackConfigItemOptions) {
    this.parentScope = scope;
    this.key = key;
    this.value = stackConfigItemOptions.value;
    this.cfnParameter = stackConfigItemOptions.cfnParameter;
    this.cfnParameter?.overrideLogicalId(`${this.key}`);

    if (this.cfnParameter) {
      this.isCfnParameterValueEmptyCondition = new cdk.CfnCondition(
        this.parentScope,
        `${this.key}_isParameterEmptyCondition`,
        {
          expression: cdk.Fn.conditionNot(cdk.Fn.conditionEquals(this.cfnParameter, "")),
        },
      );
    }

    this.query = stackConfigItemOptions.query;
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
    if (this.value !== null && this.value !== undefined) {
      return this.value;
    }

    if (this.cfnParameter && !this.query) {
      return this.cfnParameter.valueAsString;
    }
    if (this.cfnParameter && this.query) {
      return cdk.Fn.conditionIf(this.isCfnParameterValueEmptyCondition.logicalId, this.cfnParameter, this.query);
    }

    return this.query;
  };

  static create(scope: Construct, key: string, stackConfigItemOptions: StackConfigItemOptions) {
    return new StackConfigItem(scope, key, stackConfigItemOptions);
  }
}
