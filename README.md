## 1. 起步

`npm install html-page-version`

该库主要提供页面更新检查功能，适用场景为客户端页面缓存页面有更新时，用户不能及时更新导致适用老版本的问题

## 2. 使用方法

css样式引入
```javascript
import "html-page-version/dist/style.css";
```

在需要检查更新的地方，一般是app.vue中使用
```javascript
import { HtmlPageVersion } from "html-page-version";

const v = new HtmlPageVersion("html", "v");

//用法一：启用自动检测
v.setAutoCheck(1);

//方法二：检测是否有更新, 该方法不带预设更新提示，只有仅使用该方法需要时，无需引入CSS
const hasNewVer = await v.hasNewVersion();

//方法三：检查一次更新，当有更新时提示用户刷新, 同步返回是否有更新
const hasNewVer = await v.checkUpdate();
```