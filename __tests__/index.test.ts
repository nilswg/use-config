import fs from "fs";
import path from "path";
import { ProcessVariable, defaultOptions, getConfig, getConfigPath, useConfig } from "@/core";

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

describe("Test getConfigPath", () => {
    it("前置條件: ./configurations 應存在", () => {
        const dir = path.resolve(process.cwd(), "./configurations");
        expect(fs.existsSync(dir)).toBeTruthy();
    });
    it("前置條件: ./configurations/config.test.jsonc 應存在", () => {
        const dir = path.resolve(process.cwd(), "./configurations/config.test.jsonc");
        expect(fs.existsSync(dir)).toBeTruthy();
    });
    it("使用 getConfigPath 取得 ./configurations/config.test.jsonc 位置，應存在", () => {
        const configPath = getConfigPath(path.resolve(process.cwd(), "./configurations"), "test");
        expect(configPath).toBeTruthy();
    });
    it("使用 getConfigPath 取得 ./configurations/config.test.jsonc 位置，應正確", () => {
        const configPath = getConfigPath(path.resolve(process.cwd(), "./configurations"), "test");
        const expected = path.resolve(process.cwd(), "./configurations", "config.test.jsonc");
        expect(configPath).toBe(expected);
    });
    it("檢查該 config 檔案是否存在", () => {
        const config = getConfig("test", { ...defaultOptions, configDir: "./configurations" });
        expect(config).toBeTruthy();
    });
});

describe("Test getConfig", () => {
    it("查無該 config 檔案時應拋出錯誤", () => {
        expect(() => {
            getConfig("config-not-exist");
        }).toThrow();
    });
    it("取得 config 檔案，應正確", () => {
        const config = getConfig("test", { configDir: "./configurations" });
        expect(config).toBeTruthy();
    });
    it("使用預設的參數取得 config 檔案，應正確", () => {
        const config = getConfig("test", { configDir: "./configurations" });
        expect(config).toBeTruthy();
    });
    it("存在的 key 值應回傳 truthy", () => {
        const config = getConfig<{ some_key: string }>("test");
        expect(config.some_key).toBeTruthy();
    });
    it("查無此 key 值時回傳 undefined", () => {
        const config = getConfig<any>("test");
        expect(config.err_key).toBeUndefined();
    });
    it("透過 key 取得正確值", () => {
        const config = getConfig<{ some_key: string }>("test");
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
