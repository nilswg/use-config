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
    it("無對應的Config環境變數，應拋出 Config Process Variable Undefined.", () => {
        expect(() => {
            useConfig();
        }).toThrow("Config Process Variable Undefined.");
    });
    it("錯誤的Config檔案名稱，應拋出錯誤 Config Files Not Found.", () => {
        process.argv = ["node", "test.js", "--config", "config-notfound"];
        expect(() => {
            useConfig();
        }).toThrow("Config Files Not Found.");
    });
    it("錯誤的Config目錄，應拋出錯誤 Config Files Not Found.", () => {
        process.argv = ["node", "test.js", "--config", "test"];
        expect(() => {
            useConfig({ configDir: "./wrong-path" });
        }).toThrow();
    });
    it("以正確的參數，使用 useConfig 應正確", () => {
        process.argv = ["node", "test.js", "--config", "test"];
        const config = useConfig({ configDir: path.resolve(process.cwd(), "./configurations") });
        expect(config).toBeTruthy();
    });
    it("以預設的參數，使用 useConfig 應正確", () => {
        process.argv = ["node", "test.js", "--config", "test"];
        const config = useConfig();
        expect(config).toBeTruthy();
    });
    it("useConfig 取得 config 的內容應完全符合", () => {
        process.argv = ["node", "test.js", "--config", "test"];
        const config = useConfig<{ some_key: string }>();
        expect(config).toEqual({ some_key: "some_value" });
    });
});

const existConfigDirPath = path.resolve(process.cwd(), "./configurations");
const existConfigFilePath = path.resolve(process.cwd(), "./configurations", "config.test.jsonc");
