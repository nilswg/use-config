import fs from "fs";
import path from "path";
import { ProcessVariable, defaultOptions, getConfig, getConfigFilePath, useConfig, parseCodeToConfig } from "@/core";

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
    it("ESM named export，應回傳正確", () => {
        const code = `export const Config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toBeTruthy();
    });
    it("ESM named export，應取得正確 config", () => {
        const code = `export const Config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("ESM named export，有註解下，應取得正確 config", () => {
        const code = `export const Config = {
            // 這是一個註解 🤗
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("ESM default export，應回傳正確", () => {
        const code = `export default const Config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toBeTruthy();
    });
    it("ESM default export，應取得正確 config", () => {
        const code = `export default const Config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("ESM default export，應取得正確 config", () => {
        const code = `export default const Config = {
            // 這是一個註解 🤗
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("CJS named export，應回傳正確", () => {
        const code = `module.exports.config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toBeTruthy();
    });
    it("CJS named export，應取得正確 config", () => {
        const code = `module.exports.config = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("CJS named export，應取得正確 config", () => {
        const code = `module.exports.config = {
            // 這是一個註解 🤗
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });

    it("CJS default export，應回傳正確", () => {
        const code = `module.exports = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toBeTruthy();
    });
    it("CJS default export，應取得正確 config", () => {
        const code = `module.exports = {
            "some_key": "some_value"
        };
        `;
        const config = parseCodeToConfig(code);
        expect(config).toEqual({ some_key: "some_value" });
    });
    it("CJS default export，應取得正確 config", () => {
        const code = `module.exports = {
            // 這是一個註解 🤗
            "some_key": "some_value"
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
});

const existConfigName = "test";
const existConfigDirPath = path.resolve(process.cwd(), "./configurations");
const existConfigFilePath = path.resolve(process.cwd(), "./configurations", "config.test.jsonc");
