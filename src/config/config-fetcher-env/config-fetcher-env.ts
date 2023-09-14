import "dotenv/config";
import { ConfigFetcher } from "src/config/lib";

export class ConfigFetcherEnv extends ConfigFetcher {
  static get = async (
    keyOrKeys: string | string[],
  ): Promise<unknown | Record<string, unknown>> => {
    let key, keys;

    if (Array.isArray(keyOrKeys)) {
      keys = keyOrKeys;
    } else {
      key = keyOrKeys;
    }

    return keys
      ? ConfigFetcherEnv.getMultiple(keys)
      : Promise.resolve(process.env[key]);
  };

  static getMultiple = async (
    keys: string[],
  ): Promise<Record<string, unknown>> => {
    const values = await Promise.all(keys.map(ConfigFetcherEnv.get));
    const valuesMap = keys.reduce((acc, key, index) => {
      acc[key] = values[index];
      return acc;
    }, {});

    return Promise.resolve(valuesMap);
  };
}
