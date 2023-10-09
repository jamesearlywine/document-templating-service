export abstract class ServiceConfig {
  static DEFAULT_VALUES = {};

  static reset() {
    Object.assign(this, this.DEFAULT_VALUES);
  }

  static set(options: Partial<ServiceConfig>) {
    Object.assign(this, options);
  }

  static initialized;
  static initialize(values: Partial<ServiceConfig>) {
    this.reset();
    this.set(values);
  }
}
