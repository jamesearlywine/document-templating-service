import { StackConfigItem, StackConfigOptions } from "./stack-config-item";
import { Construct } from "constructs";

export class StackConfig {
  parentScope: Construct;
  stackConfigItems: Record<string, StackConfigItem> = {};

  constructor(scope: Construct) {
    this.parentScope = scope;
  }

  set(key: string, stackConfigOptions: StackConfigOptions) {
    this.stackConfigItems[key] = StackConfigItem.create(this.parentScope, key, stackConfigOptions);
    return this;
  }

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
