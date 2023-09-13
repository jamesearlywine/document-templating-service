export abstract class ServiceConfig {
  static DEFAULT_VALUES = {};

  static set(options: Record<string, unknown>) {
    Object.assign(this, options);
  }

  static reset() {
    Object.assign(this, this.DEFAULT_VALUES);
  }

  static initialize(values: Record<string, unknown>) {
    this.reset();
    Object.assign(this, values);
  }
}
