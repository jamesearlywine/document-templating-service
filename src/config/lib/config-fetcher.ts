export abstract class ConfigFetcher {
  static get: (key: string) => Promise<string>;
}
