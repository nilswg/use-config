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

目前可以同時兼容 json、jsonc 兩種，例如:

```bash
👌 

config.dev.json 
config.prod.jsonc
```

但是，請不要取同樣的名稱，例如:

```bash
💀 

config.dev.json 
config.dev.jsonc
```

## configKey

你如果也使用了 `--config` ，你可以調整為其他的

```js

// ex: node ./test.js -c dev
const config = useConfig({ flag: '-', configKey: "c" });
//                                ^ other flag    ^ other config key

```


## configName

可直接指定 configName，因此，不會從環境中獲取。

```js

const config = useConfig({ configName: "dev" });

```


## 推薦的使用方式

定義 defaultConfigName，並透過環境中獲取的 configName 來切換

```js

const config = useConfig({ defaultConfigName: "dev" });

```

如此一來，預設情況下，沒有從環境中獲取時，他也會將 config.dev.json 作為默認的情況。

例如，配合你在 package.json 中的設置。

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