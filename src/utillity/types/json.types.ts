export type JsonStringified<T> = string;

// this type borrowed from Ben Rosen. :)
export type JsonSerializable =
  | string
  | number
  | boolean
  | null
  | JsonSerializable[]
  | {
      [key: string]: JsonSerializable;
    };
