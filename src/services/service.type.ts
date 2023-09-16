export type Service = {
  initialize: () => Promise<void>;
  [x: string | number | symbol]: unknown;
};
