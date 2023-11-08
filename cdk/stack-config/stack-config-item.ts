import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export type StackConfigOptions =
  | {
      value?: never;
      cfnParameter?: cdk.CfnParameter;
      paramQuery?: string;
    }
  | {
      value?: string;
      cfnParameter?: never;
      paramQuery?: never;
    };

export class StackConfigItem {
  key: string;
  value?: string;
  cfnParameter?: cdk.CfnParameter;
  paramQuery?: string;

  parentScope: Construct;
  cfnParameterNotNullCondition: cdk.CfnCondition;

  constructor(scope, key, stackConfigOptions: StackConfigOptions) {
    this.parentScope = scope;
    this.key = key;
    this.value = stackConfigOptions.value;
    this.cfnParameter = stackConfigOptions.cfnParameter;
    this.cfnParameter?.overrideLogicalId(this.key);
    this.paramQuery = stackConfigOptions.paramQuery;

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
   * @note - if `value` is defined, that value is always returned, resolves at synth time
   * @note - if `cfnParameter` has a value (default or otherwise), paramQuery string will never be returned, resolves at deploy time
   * @note - `paramQuery` is lazily evaluated, resolves from ParamStore/SecretsManager at deploy time
   */
  get: () => string | cdk.ICfnRuleConditionExpression = () => {
    if (this.value) {
      return this.value;
    }
    if (this.cfnParameter && !this.paramQuery) {
      return this.cfnParameter.valueAsString;
    }
    if (this.cfnParameter && this.paramQuery) {
      return cdk.Fn.conditionIf(this.cfnParameterNotNullCondition.logicalId, this.cfnParameter, this.paramQuery);
    }
    if (this.paramQuery) {
      return this.paramQuery;
    }

    throw new Error("No value, cfnParameter, or paramQuery defined");
  };

  static create(scope: Construct, key: string, stackConfigOptions: StackConfigOptions) {
    return new StackConfigItem(scope, key, stackConfigOptions);
  }
}
