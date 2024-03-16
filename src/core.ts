import fs from "fs";
import path from "path";
import { strip } from "@luxass/strip-json-comments";

/**
 * 使用 config
 * @param options
 * @returns
 */
export function useConfig<TConfig>(options?: Partial<Options>) {
    const args = { ...defaultOptions, ...options };
    const configName = ProcessVariable(args).get(args.configKey);
    if (!configName) {
        console.error(
            [
                logError("\n[nil-config] Config Process Variable Undefined.\n"),
                logError(`  Please set `) +
                    logWarn(`${args.flag}${args.configKey}${args.delimiter || " "}CONFIG_NAME`) +
                    logError(` in process.argv.\n\n`),
            ].join("\n")
        );
        throw new Error("Config Process Variable Undefined.");
    }
    return getConfig<TConfig>(getConfigFilePath(args.configDir, configName));
}

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
    const args = process.argv.slice(2);
    const result = args.reduce((acc, cur, i) => {
        if (cur.startsWith(options.flag)) {
            if (!options.delimiter || !options.delimiter.trim()) {
                const name = args[i].replace(options.flag, "");
                const value = args[i + 1];
                acc[name] = value;
            } else {
                const [name, value] = cur.replace(options.flag, "").split(options.delimiter);
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
    return JSON.parse(strip(configFile)) as TConfig;
};

/**
 * 取得 config 檔案路徑
 * @param configDir  config 檔案所在的資料夾
 * @param configName 根據環境變數來取得對應的 config 名稱
 * @returns
 */
export const getConfigFilePath = (configDir: string, configName: string) => {
    // 可能為 json 或是 jsonc
    const configPath = path.resolve(process.cwd(), configDir, `config.${configName}.json`);

    let res = "";
    [configPath, configPath + "c"].some((path) => {
        if (fs.existsSync(path)) {
            res = path;
            return true;
        }
    });
    if (res) {
        return res;
    }

    // 如果都沒有找到
    console.error(
        [
            logError("[nil-config] Config Files Not Found.\n"),
            logError("  Please check config info below:\n"),
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
};

export type UseConfigOptions = Partial<Options>;

export const defaultOptions: Options = {
    configDir: "./configurations",
    flag: "--",
    delimiter: "",
    configKey: "config",
};
