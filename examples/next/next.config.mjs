import { useConfig } from "../../dist/index.mjs";

// ✅ 這也可以用
// process.argv.push("$c=tsc");
// const config = useConfig({ flag: "$", configKey: "c", delimiter: "=" })

// ✅ 配合 Next.js 本身就帶有的 .env 文件來使用會比較合適。
const configName = process.env.USE_CONFIG_NAME;
const config = useConfig({ configName });

console.log({ config });

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: Object.fromEntries(Object.entries(config)),
};

export default nextConfig;
