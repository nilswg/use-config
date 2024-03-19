import { defineConfig } from "tsup";
import fs from "fs";
import pkg from "./package.json";

export default defineConfig({
    clean: true,
    dts: true,
    entry: ["./src/index.ts"],
    format: ["cjs", "esm"], //
    minify: false,
    outDir: "dist",
    splitting: true,
    sourcemap: true,
    treeshake: true,
    esbuildOptions(options) {
        options.drop = ['console', 'debugger'];
    },
    onSuccess: async () => {
        fs.writeFileSync(
            "dist/package.json",
            JSON.stringify(
                {
                    ...pkg,
                    private: undefined,
                    main: undefined,
                    scripts: undefined,
                    devDependencies: undefined,
                    type: undefined,
                    dependencies: undefined,
                    peerDependencies: pkg.dependencies,
                },
                null,
                2
            )
        );
        const readme = fs.readFileSync("README.md", "utf-8").split("\n\n\n");
        // 間隔 \n\n\n 取一段，發佈時忽略建置環境的相關步驟說明
        fs.writeFileSync("dist/README.md", readme.filter((_, i) => i !== 1).join("\n\n\n"));
    },
});
