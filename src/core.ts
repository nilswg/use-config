import fs from "fs";
import path from "path";
import { strip } from "@luxass/strip-json-comments";
import ts from "typescript";

/**
 * 使用 config
 * @param options
 * @returns
 */
export function useConfig<TConfig>(options?: Partial<Options>) {
    const args = { ...defaultOptions, ...options };
    return getConfig<TConfig>(getConfigFilePath(getConfigDir(args.configDir), getConfigName(args)));
}

function getConfigName(args: Options) {
    const configName = args.configName || ProcessVariable(args).get(args.configKey) || args.defaultConfigName;
    if (!!configName) return configName;

    // else throw error
    console.error(
        [
            logError("\n[nil-config] Config Name Undefined.\n"),
            logError(`  Please set `) +
                logWarn(`${args.flag}${args.configKey}${args.delimiter || " "}CONFIG_NAME`) +
                logError(` in process.argv.\n\n`),
        ].join("\n")
    );
    throw new Error("Config Name Undefined.");
}

function getConfigDir(configDir: string) {
    if (fs.existsSync(configDir)) return configDir;

    // else throw error
    console.error(
        [
            logError("\n[nil-config] Config Folder Not Found.\n"),
            logError("  Please check error message below:\n"),
            logError("    " + "wrong folder path: ") + logWarn(path.resolve(process.cwd(), configDir)) + "\n",
            "  \n\n",
        ].join("\n")
    );
    throw new Error("Config Folder Not Found.");
}

let instance: ReturnType<typeof _ProcessVariable> | null = null;
let instanceOptions: Parameters<typeof _ProcessVariable>[0] | null = null;

/**
 * 讀取 process.argv 中的變數
 * @param variableName
 * @returns
 */
export function ProcessVariable(
    options: Pick<Options, "delimiter" | "flag"> = {
        delimiter: defaultOptions.delimiter,
        flag: defaultOptions.flag,
    }
) {
    if (!instance || instanceOptions !== options) {
        instanceOptions = options;
        instance = _ProcessVariable(options);
    }
    return instance;
}

/**
 * 讀取 process.argv 中的變數
 * @param variableName
 * @returns
 */
function _ProcessVariable(
    options: Pick<Options, "delimiter" | "flag"> = {
        delimiter: defaultOptions.delimiter,
        flag: defaultOptions.flag,
    }
) {
    if (typeof process === "undefined") {
        return { get: () => undefined };
    }

    const args = process.argv.slice(2);
    const result = args.reduce((acc, cur, i) => {
        if (cur.startsWith(options.flag)) {
            if (!options.delimiter || !options.delimiter.trim()) {
                const name = args[i].replace(options.flag, "");
                const value = args[i + 1];
                acc[name] = value;
            } else {
                const [name, value] = $pair(cur, options.flag, options.delimiter);
                acc[name] = value;
            }
        }
        return acc;
    }, {} as { [key: string]: string });

    return {
        /**
         * @example
         * ```
         * node test.js --test 123
         *
         * ProcessArgv().get('test') // 123
         *
         *
         * node test.js --test=123
         *
         * ProcessArgv().get('test') // 123
         * ```
         */
        get: (variableName: string) => {
            return result?.[variableName] || undefined;
        },
    };
}

/**
 * 解析 process.argv 中，arg 型式為 `[flag][key][delimiter][value]` 的字串
 */
const $pair = (argStr: string, flag: string, delimiter: string) => {
    const pair = argStr.replace(flag, "").split(delimiter);
    if (pair.length === 2) {
        return pair;
    }

    // else throw error
    console.error(
        [
            logError("[nil-config] Invalid Process Variable.\n"),
            logError("  Please check error message below:\n"),
            logError("    " + "wrong pattern: ") + logWarn(argStr) + "\n",
            "  \n\n",
        ].join("\n")
    );
    throw new Error("Invalid Process Variable.");
};

/**
 * 取得 config 檔案
 *
 * 透過 process.env 取得環境變數，再組出對應的 config 名稱
 *
 * @example
 * ```js
 *
 * const config = getConfig(process.env);
 *
 * // 對應的 config 檔案為:
 * //
 * // v ./my-configs
 * //   - config.{env}.json
 * ```
 * @param env 環境變數
 * @param options 設定
 *
 */
export const getConfig = <TConfig>(configFilePath: string) => {
    const configFile = fs.readFileSync(configFilePath, "utf-8");
    return parseCodeToConfig(configFile) as TConfig;
};

/**
 * 取得 config 檔案路徑
 * @param configDir  config 檔案所在的資料夾
 * @param configName 根據環境變數來取得對應的 config 名稱
 * @returns
 */
export const getConfigFilePath = (configDir: string, configName: string) => {
    for (const ext of [".json", ".jsonc", ".ts", ".js", ".mjs", ".cjs"]) {
        const res = path.resolve(process.cwd(), configDir, `config.${configName}`) + ext;
        if (fs.existsSync(res)) return res;
    }

    // else throw error
    console.error(
        [
            logError("[nil-config] Config Files Not Found.\n"),
            logError("  Please check error message below:\n"),
            logError("    " + "config variable: ") + logWarn(configName) + "\n",
            logError("    " + "folder path: ") + logWarn(path.resolve(process.cwd(), configDir)) + "\n",
            logError("    " + "allowed extension: ") + logWarn(".json") + logError(" or ") + logWarn(".jsonc") + "\n",
            "  \n\n",
        ].join("\n")
    );
    throw new Error("Config Files Not Found.");
};

/**
 * delimeter
 */
// export const $delimeter = (delimiter: string) => {
//     return !delimiter ? " " : delimiter;
// };

const logError = (msg: string) => `\x1b[31m${msg}\x1b[0m`;
const logWarn = (msg: string) => `\x1b[33m${msg}\x1b[0m`;

export type Options = {
    configDir: string;
    delimiter: string; // 分隔符號, ex: --test=123, = 就是 delimiter
    flag: string; // 標誌符號, ex: --test=123, -- 就是 flag
    configKey: string;

    /**
     * 直接指定 config 名稱
     */
    configName?: string;

    /**
     * 當無設置 configName 且 process.env 亦無法找到正確的名稱時，使用此最為預設值的 configName
     */
    defaultConfigName?: string;
};

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
export const parseCodeToConfig = (code: string) => {
    let res = code;
    try {
        const result = ts.transpileModule(code, {
            compilerOptions: {
                module: ts.ModuleKind.ESNext,
                target: ts.ScriptTarget.ESNext,
            },
        });
        // 檢查是否為 module 例如: .ts, .js, .mjs, .cjs
        for (const keyword of ["module.exports", "export "]) {
            if (result.outputText.includes(keyword)) {
                res = result.outputText.split(keyword)[1].split("=")[1].trim().replace(";", "");
                res = ts.parseJsonText('config', stringify(res)).text;

                // res 去除最後多餘的逗號
                res= res.replace(/,(?=[^,]*$)/, '');

                res = JSON.parse(strip(res))
                return res;
            }
        }
        // 一般的 json, jsonc 檔案
        return JSON.parse(strip(code));
    } catch (error) {
        // 轉換過程中發生錯誤，代表該 config 檔案不符合規範
        console.log(
            [
                logError("[nil-config] Invalid Config File.\n"),
                logError("  Please check error message below:\n"),
                logError("    " + "wrong code:\n\n     ") + res + "\n",
                "  \n\n",
            ].join("\n")
        );
        throw new Error("Invalid Config File.");
    }
};

// 幫物件字串的 key 加上雙引號
export const stringify = (objStr: string) => {
    return objStr.replace(/([a-zA-Z0-9_]+)(:)/g, '"$1"$2');
};

export type UseConfigOptions = Partial<Options>;
export const defaultOptions: Options = {
    configDir: "./configurations",
    flag: "--",
    delimiter: "",
    configKey: "config",
};
