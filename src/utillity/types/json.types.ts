export type JsonStringified<T> = string;

// this recursive type borrowed from Ben Rosen. :)
export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | JsonSerializable[]
  | {
      [key: string]: JsonSerializable;
    };
