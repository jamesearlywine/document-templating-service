import { StackConfigItem, StackConfigItemOptions } from "./stack-config-item";
import { Construct } from "constructs";
import { CfnParameter, ICfnRuleConditionExpression } from "aws-cdk-lib";

export class StackConfig {
  parentScope: Construct;
  stackConfigItems: Record<string, StackConfigItem> = {};

  constructor(scope: Construct) {
    this.parentScope = scope;
  }

  set(key: string, stackConfigItemOptions: StackConfigItemOptions | string) {
    if (stackConfigItemOptions === null || stackConfigItemOptions === undefined) {
      stackConfigItemOptions = "";
    }
    if (typeof stackConfigItemOptions === "string") {
      stackConfigItemOptions = { value: stackConfigItemOptions };
    }
    this.stackConfigItems[key] = StackConfigItem.create(this.parentScope, key, stackConfigItemOptions);
    return this;
  }

  get(key: string) {
    const stackConfigItem = this.stackConfigItems[key];
    if (!stackConfigItem) {
      throw new Error(`No stack config item found for key ${key}`);
    }

    return stackConfigItem.get();
  }

  /**
   * Typecasts the stack config item to a CfnParameter
   * @param key
   */
  getCfnParameter(key: string) {
    return this.get(key) as CfnParameter;
  }

  /**
   * Typecasts the stack config item to a ICfnRuleConditionExpression
   * @param key
   */
  getConditionalCfnParameter(key: string) {
    return this.get(key) as ICfnRuleConditionExpression;
  }

  /**
   * Typecasts the stack config item to a string
   * @param key
   */
  getStringValue(key: string) {
    return this.get(key) as string;
  }

  static create(scope: Construct) {
    return new StackConfig(scope);
  }
}
