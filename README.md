# @nilswg/use-config

Easy to use and manage your configurations



## 🛫 開發

```bash
pnpm install
pnpm run dev
```

## ⚔️ 測試

```bash
pnpm run test
```

## 🛠️ 建置

```bash
pnpm run build
```

## 🚀 發佈

```bash
pnpm run publish
```



## 使用範例

在你當前的專案目錄下，創建一個專門用來放置 config 的目錄。如 ./configurations

```bash
./YOUR_PROJECT
   v configurations (在你的專案下創建)
     - config.dev.jsonc
     - config.prod.jsonc
   v src
     - ...
   - package.json
```

請使用 `--config` 來傳入環境變數，如下

```js

node ./test.js --config dev
                    //  ^ config variable: dev

```

使用 useConfig 會根據 `--config` 的設置取出對應的 config.{env}.jsonc

```js

const config = useConfig({ configDir: "./configurations" });
//    ^ config.dev.json

```

## config 的類型

目前可以支援 json、jsonc、ts 的 config 文件類型，例如:

```bash

config.dev.json
config.stage.jsonc
config.prod.ts
```

但是 config 的名稱不可以重複，例如:

```bash
# 💀 下方重複定義的名稱為 dev 的 config

config.dev.json
config.dev.jsonc
```

## configKey

有些情況 `--config` 可能已經被使用。這時你可以設置 `flag` `configKey` `delimiter` 來避免衝突，例如:

```js

// ✅ node ./test.js $c=dev
const config = useConfig({ flag: '$', configKey: "c", delimiter: "=" });

```


## configName

當然，你也可直接指定 `configName`，而不是從環境變數中獲取。

```js

const config = useConfig({ configName: "dev" });

```


## 推薦的使用方式

當你需要在不同情況下，也能對應上一個預設的 config 文件，你可以設置 `defaultConfigName`。

```js

const config = useConfig({ defaultConfigName: "dev" });

```

如此一來，預設情況下，沒有從環境中獲取時，他也會將 config.dev.json 作為預選配置。例如:

```json
//@file: ./package.json

{
  "scripts" : {
    "dev": "astro dev",
    "build:local": "astro build",
    "build:staging" : "astro build -- -c staging",
    "build:production" : "astro build -- -c production",
    //                                ^ 使用 -- 隔開
  }
}

```