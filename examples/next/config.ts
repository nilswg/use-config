import { useConfig } from "../../dist";

export const $config = () => useConfig({ configName: process.env.USE_CONFIG_NAME });

console.log({ config: $config() });
