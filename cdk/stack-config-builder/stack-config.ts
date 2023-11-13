import { StackConfigItem, StackConfigItemOptions } from "./stack-config-item";
import { Construct } from "constructs";

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

  // @todo query from lambda for param store values, don't set them in cdk
  get(key: string) {
    const stackConfigItem = this.stackConfigItems[key];
    if (!stackConfigItem) {
      throw new Error(`No stack config item found for key ${key}`);
    }

    return stackConfigItem.get();
  }

  static create(scope: Construct) {
    return new StackConfig(scope);
  }
}
