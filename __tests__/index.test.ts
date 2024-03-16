import fs from "fs";
import path from "path";
import { ProcessVariable, defaultOptions, getConfig, getConfigFilePath, useConfig } from "@/core";

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
});

const existConfigName = "test";
const existConfigDirPath = path.resolve(process.cwd(), "./configurations");
const existConfigFilePath = path.resolve(process.cwd(), "./configurations", "config.test.jsonc");
