# @nilswg/use-config



## 🛫 快速開始

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

node ./test.js --config prod
                    //  ^ config variable: prod

```

使用 useConfig 會根據 `--config` 的設置取出對應的 config.{env}.jsonc

```js

const config = await useConfig({ configDir: "./configurations" });
//    ^ config.prod.json

```

## config 的類型

目前可以同時兼容 json、jsonc 兩種，例如:

```bash
👌 

config.foo.json 
config.bar.jsonc
```

但是，請不要取同樣的名稱，例如:

```bash
💀 

config.foo.json 
config.foo.jsonc
```

## configKey

你如果也使用了 `--config` ，你可以調整為其他的

```js

// ex: node ./test.js -c dev
const config = await useConfig({ flag: '-', configKey: "c" });
//                                                      ^ other config key

```
