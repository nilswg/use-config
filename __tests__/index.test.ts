import fs from "fs";
import path from "path";
import { ProcessVariable, getConfig, getConfigFilePath, useConfig, parseCodeToConfig } from "@/core";

beforeEach(() => {
    jest.spyOn(console, "log");
});

afterEach(() => {
    jest.clearAllMocks();
});

describe("Test ProcessVariable", () => {
    it("成功讀取 process.env", () => {
        /**
         * @example
         * ```
         *  node test.js --test=false
         * ```
         */
        process.argv = ["node", "test.js", "--test", "false"];
        expect(
            ProcessVariable({
                delimiter: " ",
                flag: "--",
            })
        ).toBeTruthy();
    });
    it("正確讀取 process.env 中的參數, 有 delimeter", () => {
        /**
         * @example
         * ```
         *  node test.js --test=123
         * ```
         */
        process.argv = ["node", "test.js", "--test=123"];
        expect(ProcessVariable({ flag: "--", delimiter: "=" }).get("test")).toBe("123");
    });
    it("正確讀取 process.env 中的參數, 無 delimeter", () => {
        /**
         * @example
         * ```
         *  node test.js --test 123
         * ```
         */
        process.argv = ["node", "test.js", "--test", "123"];
        expect(ProcessVariable({ flag: "--", delimiter: "" }).get("test")).toBe("123");
    });
    it("正確讀取 process.env 中的參數, delimeter 為空值", () => {
        /**
         * @example
         * ```
         *  node test.js --test 123
         * ```
         */
        process.argv = ["node", "test.js", "--test", "123"];
        expect(ProcessVariable({ flag: "--", delimiter: null as any }).get("test")).toBe("123");
    });
    it("正確讀取 process.env 中的參數, delimeter 為空格", () => {
        /**
         * @example
         * ```
         *  node test.js --test 123
         * ```
         */
        process.argv = ["node", "test.js", "--test", "123"];
        expect(ProcessVariable({ flag: "--", delimiter: " " }).get("test")).toBe("123");
    });
    it("查無此參數時應回傳 undefined", () => {
        /**
         * @example
         * ```
         *  node test.js --test=false
         * ```
         */
        process.argv = ["node", "test.js", "--test", "123"];
        expect(ProcessVariable().get("not_exist")).toBeUndefined();
    });
    it("錯誤的輸入，應拋出 Invalid Process Variable.", () => {
        /**
         * @example
         * ```
         *  node test.js --test-123
         * ```
         */
        process.argv = ["node", "test.js", "--test=foo=bar"];
        expect(() => {
            ProcessVariable({ flag: "--", delimiter: "=" });
        }).toThrow("Invalid Process Variable.");
    });
});

describe("Test getConfigFilePath", () => {
    it("前置條件: existConfigDirPath 應存在", () => {
        const isExist = fs.existsSync(existConfigDirPath);
        expect(isExist).toBeTruthy();
    });
    it("前置條件: existConfigFilePath 應存在", () => {
        const isExist = fs.existsSync(existConfigFilePath);
        expect(isExist).toBeTruthy();
    });
    it("使用 getConfigPath 取得的路徑資訊，應與 existConfigFilePath 一致", () => {
        const result = getConfigFilePath("./configurations", "test");
        expect(result).toBe(existConfigFilePath);
    });
    it("應能取得 .ts 的 config 檔案路徑", () => {
        const result = getConfigFilePath("./configurations", "tsc");
        expect(fs.existsSync(result)).toBeTruthy();
    });
});

describe("Test getConfig", () => {
    it("查無該 config 檔案時應拋出錯誤", () => {
        expect(() => {
            const notExistConfig = "";
            getConfig(notExistConfig);
        }).toThrow();
    });
    it("前置條件: configPath 應存在", () => {
        const isExist = fs.existsSync(existConfigFilePath);
        expect(isExist).toBeTruthy();
    });
    it("取得 config 檔案，應正確", () => {
        const config = getConfig(existConfigFilePath);
        expect(config).toBeTruthy();
    });
    it("存在的 key 值應回傳 truthy", () => {
        const config = getConfig<{ some_key: string }>(existConfigFilePath);
        expect(config.some_key).toBeTruthy();
    });
    it("查無此 key 值時回傳 undefined", () => {
        const config = getConfig<any>(existConfigFilePath);
        expect(config.err_key).toBeUndefined();
    });
    it("透過 key 取得正確值", () => {
        const config = getConfig<{ some_key: "some_value" }>(existConfigFilePath);
        expect(config.some_key).toEqual("some_value");
    });
    it("應能取得 .ts 的 config 檔案", () => {
        const config = getConfig<{ some_key: "some_value" }>(getConfigFilePath("./configurations", "tsc"));
        expect(config).toBeTruthy();
    });
});

describe("Test parseCodeToConfig", () => {
    it("ESM named export，應取得正確 config", () => {
        const code = `export const Config = {
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("ESM named export，有註解下，應取得正確 config", () => {
        const code = `export const Config = {
            // 這是一個註解 🤗
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("ESM default export，應取得正確 config", () => {
        const code = `export default {
            // 這是一個註解 🤗
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("ESM default export，應取得正確 config", () => {
        const code = `export default {
            // 這是一個註解 🤗
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("CJS named export，應取得正確 config", () => {
        const code = `module.exports.config = {
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("CJS named export，應取得正確 config", () => {
        const code = `module.exports.config = {
            // 這是一個註解 🤗
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("CJS default export，應取得正確 config", () => {
        const code = `module.exports = {
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("CJS default export，應取得正確 config", () => {
        const code = `module.exports = {
            // 這是一個註解 🤗
            some_key: "some_value",
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("轉換過程中發生錯誤，代表該 config 檔案不符合規範，應拋出錯誤", () => {
        const errCode = `module.exports =
            // 這是一個註解 🤗
            "some_key": "some_value"
        };
        `;
        expect(() => {
            parseCodeToConfig(errCode);
        }).toThrow("Invalid Config File.");
    });
});

describe("Test NilConfig", () => {
    beforeEach(() => {
        process.argv = ["node", "test.js"]; // 清空 process.argv
    });
    it("錯誤的 configDir，應拋出錯誤 Config Folder Not Found.", () => {
        expect(() => {
            useConfig({ configDir: "./wrong-config-forder-path" });
        }).toThrow("Config Folder Not Found.");
    });
    it("錯誤的 ConfigName 導致查找 config 檔案失敗，應拋出錯誤 Config Files Not Found.", () => {
        expect(() => {
            useConfig({
                configDir: existConfigDirPath,
                configName: "wrongConfigName",
            });
        }).toThrow("Config Files Not Found.");
    });
    it("正確的 ConfigName，應正確取得 config 檔案", () => {
        const config = useConfig({
            configDir: existConfigDirPath,
            configName: existConfigName,
        });
        expect(config).toBeTruthy();
    });
    it("未定義 configName 時，正確的 defaultConfigName，應正確取得 config 檔案", () => {
        const config = useConfig({
            configDir: existConfigDirPath,
            configName: undefined,
            defaultConfigName: existConfigName,
        });
        expect(config).toBeTruthy();
    });
    it("未定義 configName 時，錯誤的 defaultConfigName，應拋出錯誤 Config Files Not Found.", () => {
        expect(() => {
            useConfig({
                configDir: existConfigDirPath,
                configName: undefined,
                defaultConfigName: "wrongConfigName",
            });
        }).toThrow("Config Files Not Found.");
    });
    it("皆未定義 configName, defaultConfigName 時，應拋出 Config Name Undefined.", () => {
        expect(() => {
            useConfig({
                configDir: existConfigDirPath,
                configName: undefined,
                defaultConfigName: undefined,
            });
        }).toThrow("Config Name Undefined.");
    });
    it("應可讀取 .ts 檔案作為 config 檔案", () => {
        const config = useConfig({
            configDir: existConfigDirPath,
            configName: "tsc",
        });
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("環境變數讀取 tsc, 應可讀取 .ts 檔案作為 config 檔案", () => {
        process.argv = ["node", "test.js", "-c=tsc"];
        const config = useConfig({
            configDir: existConfigDirPath,
            flag: "-",
            configKey: "c",
            delimiter: "=",
        });
        expect(config).toEqual({ some_key: "some_value" });
    });

    test.each(["ex1", "ex2", "ex3", "ex4", "ex5"])("讀取 %s 的 config 檔案", (configName) => {
        // process.argv = ["node", "test.js", "-c", configName];
        const config = useConfig({
            configDir: existConfigDirPath,
            flag: "-",
            configKey: "c",
            configName,
        });
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("讀取含有網址的 config 檔案", () => {
        const config = useConfig<{ EMAIL_URL: String; WEBSITE_URL: string; LOCAL_URL: string }>({
            configDir: existConfigDirPath,
            flag: "-",
            configKey: "c",
            configName: "ex6",
        });
        expect(config["EMAIL_URL"]).toEqual("xxxxxx-xxxxxxx@aaaaaaaa.iam.gserviceaccount.com");
        expect(config["WEBSITE_URL"]).toEqual("https://aaaaaaaa-default-setting.abcd.com/");
        expect(config["LOCAL_URL"]).toEqual("http://localhost:5000");
    });

    it("讀取使用單引號的 config 檔案", () => {
        const config = useConfig<{ first_key: string; second_key: string; third_key: string; forth_key: string }>({
            configDir: existConfigDirPath,
            flag: "-",
            configKey: "c",
            configName: "ex7",
        });
        expect(config).toBeTruthy();
        expect(config["first_key"]).toEqual("some_value");
        expect(config["second_key"]).toEqual("some_value");
        expect(config["third_key"]).toEqual("some_value");
        expect(config["forth_key"]).toEqual("\"some_value'''");
    });

    it("值含有使用單引號，卻沒有使用跳脫字元保護時，應拋出錯誤", () => {
        const run = () => {
            const config = useConfig<{ some_key: string }>({
                configDir: existConfigDirPath,
                flag: "-",
                configKey: "c",
                configName: "ex8",
            });
        };

        expect(run).toThrow("Invalid Config File.");
    });

    it("範例 DATABASE_URL", () => {
        const config = useConfig<{ DATABASE_URL_1: string, DATABASE_URL_2: string, DATABASE_URL_3: string, DATABASE_URL_4: string }>({
            configDir: existConfigDirPath,
            flag: "-",
            configKey: "c",
            configName: "ex9",
        });

        expect(config.DATABASE_URL_1).toStrictEqual("postgresql://postgres:passWord=@localhost:54322/wmox-postgres")
        expect(config.DATABASE_URL_2).toStrictEqual("postgresql://postgres:passWord=@localhost:54322/wmox-postgres")
        expect(config.DATABASE_URL_3).toStrictEqual("postgres://postgres:passWord=@localhost:54322/wmox-postgres")
        expect(config.DATABASE_URL_4).toStrictEqual("postgres://postgres:passWord=@localhost:54322/wmox-postgres")
    })
});

const existConfigName = "test";
const existConfigDirPath = path.resolve(process.cwd(), "./configurations");
const existConfigFilePath = path.resolve(process.cwd(), "./configurations", "config.test.jsonc");
