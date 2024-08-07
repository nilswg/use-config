import { useConfig } from "../../dist";

process.argv.push("$c=tsc");
console.log(useConfig({ flag: "$", configKey: "c", delimiter: "=" }));
