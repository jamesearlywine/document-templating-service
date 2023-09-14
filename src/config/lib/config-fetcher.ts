export abstract class ConfigFetcher {
  static get: (key: string) => Promise<unknown | Record<string, unknown>>;
}
