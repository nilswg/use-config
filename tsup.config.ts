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
    onSuccess: async () => {
        fs.writeFileSync(
            "dist/package.json",
            JSON.stringify(
                {
                    ...pkg,
                    private: undefined,
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
        fs.writeFileSync(
            "dist/README.md",
            fs.readFileSync("README.md", "utf-8")
        );
    },
});
