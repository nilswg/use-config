// export { ProcessVariable, useConfig } from "./core";
// export type { UseConfigOptions } from "./core";

import fs from "fs";
import path from "path";
import ts from "typescript";

const code = fs.readFileSync(path.resolve(process.cwd(), "src/test.js"), "utf-8");

const result = parseCodeToConfig(code);

// eval(result.outputText);

console.log(result);

/**
 * 請完成一個函式，讓無論是 commonjs、esm、ts 皆能正確讀取該 config 檔案
 *
 * @example
 * ```
 * module.exports.Config = {
 *     delimiter: "--",
 *     flag: "-",
 * };
 * ```
 *
 * ```
 * export const Config = {
 *    delimiter: "--",
 *    flag: "-",
 * }
 * ```
 */
function parseCodeToConfig(code: string) {
    // const result = ts.transpileModule(code, {
    //     compilerOptions: {
    //         module: ts.ModuleKind.ESNext,
    //         target: ts.ScriptTarget.ESNext,
    //     },
    // });

    if (code.includes("module.exports")) {
        return code.split("module.exports")[1].split("=")[1].trim().replace(";", "");
    }

    if (code.includes("export")) {
        return code.split("export")[1].split("=")[1].trim().replace(";", "");
    }

    return code;
}
