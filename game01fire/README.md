# 星焰 · Starry Firework

一款梦幻水彩风格的微信小程序烟花游戏。

## 目录结构

```
e:\MyGames\
├── game.js              # 游戏入口文件
├── game.json            # 小游戏全局配置
├── project.config.json  # 开发工具配置
├── js/
│   ├── config.js        # 游戏配置（烟花类型、颜色、物理参数）
│   ├── main.js          # 游戏主逻辑
│   ├── firework.js      # 烟花系统（爆炸效果）
│   ├── particle.js      # 粒子系统
│   ├── starBg.js        # 星空背景（星星、极光、流星）
│   ├── controller.js    # 交互控制（触摸、重力感应）
│   ├── audio.js         # 音频管理
│   ├── share.js         # 分享功能
│   └── unlock.js        # 解锁管理（VIP烟花）
├── utils/
│   └── util.js          # 工具函数
├── images/
│   └── icon.png         # 游戏图标（1024x1024）
├── audio/
│   ├── bgm.mp3          # 背景音乐（需自行添加）
│   ├── launch.mp3       # 发射音效（需自行添加）
│   └── explode.mp3      # 爆炸音效（需自行添加）
└── docs/
    ├── UI-UX-DESIGN.md      # 设计规范文档
    └── ui-prototype-v2.html # UI原型预览
```

---

## 一、开发环境准备

### 1. 下载微信开发者工具

访问官网下载地址：
```
https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
```

选择对应系统版本：
- Windows 64位
- Windows 32位
- macOS

### 2. 注册微信小程序账号

1. 访问 [微信公众平台](https://mp.weixin.qq.com/)
2. 点击「立即注册」→ 选择「小程序」
3. 填写账号信息，完成注册
4. 登录后台，获取 AppID（设置 → 开发设置 → AppID）

### 3. 准备音频资源

在 `audio/` 目录下添加以下音频文件：

| 文件名 | 用途 | 建议时长 | 获取方式 |
|--------|------|----------|----------|
| bgm.mp3 | 背景音乐 | 2-3分钟循环 | [免费音乐网站](https://freepd.com/) |
| launch.mp3 | 发射音效 | 0.5秒 | [免费音效网站](https://freesound.org/) |
| explode.mp3 | 爆炸音效 | 1秒 | [免费音效网站](https://freesound.org/) |

---

## 二、本地运行调试

### 1. 打开项目

1. 启动微信开发者工具
2. 选择「小程序」→「导入项目」
3. 选择项目目录：`e:\MyGames`
4. 填写 AppID（可先使用测试号）
5. 点击「导入」

### 2. 配置项目

修改 `project.config.json`，填入你的 AppID：

```json
{
  "miniprogramRoot": "./",
  "setting": {
    "es6": true,
    "postcss": true,
    "minified": true
  },
  "compileType": "game",
  "appid": "你的AppID",
  "projectname": "starry-firework",
  "libVersion": "2.25.3"
}
```

### 3. 调试运行

在开发者工具中：

| 功能 | 操作 |
|------|------|
| 编译 | 点击工具栏「编译」按钮 |
| 预览 | 点击「预览」→ 扫码在手机体验 |
| 真机调试 | 点击「真机调试」→ 扫码连接 |
| 性能分析 | 调试器 → Performance 面板 |
| 控制台日志 | 调试器 → Console 面板 |

### 4. 模拟器设置

- 设备选择：iPhone 6/7/8 或其他机型
- 网络模拟：可选择 2G/3G/4G/WiFi
- 分辨率：375 x 667（默认）

---

## 三、功能测试清单

### 基础功能测试

- [ ] 游戏启动正常，星空背景显示
- [ ] 触摸屏幕发射烟花
- [ ] 4种基础烟花正常显示（心形、双重、水彩、流星）
- [ ] 烟花爆炸音效播放
- [ ] 背景音乐播放/暂停

### 交互功能测试

- [ ] 重力感应：倾斜手机改变烟花方向
- [ ] 摇晃手机触发随机烟花
- [ ] 长按屏幕连续发射

### VIP功能测试

- [ ] 点击VIP烟花弹出解锁弹窗
- [ ] 观看广告解锁（需配置广告单元ID）
- [ ] 分享解锁功能
- [ ] 解锁状态持久化（重启游戏保留）

### 分享功能测试

- [ ] 点击分享按钮
- [ ] 分享图片生成正确
- [ ] 分享到好友/朋友圈

---

## 四、发布上线流程

### 1. 准备工作

#### 1.1 配置广告单元（可选）

如需广告变现，在微信公众平台创建广告位：

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 推广 → 流量主 → 新建广告位
3. 选择「激励视频广告」
4. 获取广告单元ID

修改 `js/unlock.js`：

```javascript
rewardedVideoAd = wx.createRewardedVideoAd({
  adUnitId: '你的广告单元ID' // 替换 adunit-xxx
})
```

#### 1.2 配置服务器域名

在微信公众平台设置：

设置 → 开发设置 → 服务器域名

如无后端服务，可跳过此步骤。

#### 1.3 隐私协议

在微信公众平台配置用户隐私保护指引：

设置 → 基本设置 → 服务内容声明 → 用户隐私保护指引

### 2. 上传代码

在微信开发者工具中：

1. 点击工具栏「上传」按钮
2. 填写版本号（如 1.0.0）
3. 填写项目备注（如「首次发布」）
4. 点击「上传」

### 3. 提交审核

1. 登录 [微信公众平台](https://mp.weixin.qq.com/)
2. 管理 → 版本管理
3. 找到刚上传的开发版本
4. 点击「提交审核」
5. 填写审核信息：
   - 功能页面：游戏首页
   - 功能介绍：休闲烟花游戏
   - 截图：上传游戏截图

### 4. 审核注意事项

| 审核项 | 要求 |
|--------|------|
| 内容合规 | 无违规内容 |
| 隐私协议 | 需配置隐私指引 |
| 广告合规 | 广告需可关闭，不得诱导点击 |
| 功能完整 | 所有按钮功能正常 |
| 兼容性 | 支持主流机型 |

审核时间：通常 1-3 个工作日

### 5. 发布上线

审核通过后：

1. 微信公众平台 → 管理 → 版本管理
2. 点击「全量发布」
3. 游戏正式上线

---

## 五、版本更新

### 更新流程

1. 修改代码
2. 修改 `project.config.json` 中的版本号
3. 开发者工具点击「上传」
4. 微信公众平台提交审核
5. 审核通过后发布

### 版本号规范

```
主版本.功能版本.修复版本

例如：
1.0.0 - 首次发布
1.1.0 - 新增烟花类型
1.1.1 - 修复bug
```

---

## 六、常见问题

### Q1: 开发者工具报错 "game.js not found"

确保项目根目录有 `game.js` 文件，且 `project.config.json` 中 `compileType` 为 `"game"`。

### Q2: 音频无法播放

1. 确认音频文件已放入 `audio/` 目录
2. 检查文件格式（支持 mp3、aac、wav）
3. 真机测试（模拟器可能不支持音频）

### Q3: 重力感应不工作

1. 真机测试（模拟器不支持重力感应）
2. 检查权限设置
3. 确认 `controller.js` 中已调用 `wx.onDeviceMotionChange()`

### Q4: 广告无法显示

1. 确认已创建广告单元
2. 确认广告单元ID正确
3. 真机测试（模拟器广告可能不显示）
4. 检查是否在审核中（审核期间广告不展示）

### Q5: 分享功能无响应

1. 真机测试
2. 检查 `wx.shareAppMessage()` 调用
3. 确认分享图片路径正确

---

## 七、性能优化建议

### 1. 粒子数量控制

`js/config.js` 中调整：

```javascript
export const PARTICLE_MAX_COUNT = 500  // 最大粒子数
export const FIREWORK_EXPLODE_PARTICLES = 80  // 每次爆炸粒子数
```

### 2. 降低帧率（低端机）

`game.js` 中修改：

```javascript
const TARGET_FPS = 30  // 从60降至30
```

### 3. 减少背景元素

`js/config.js` 中调整：

```javascript
export const STAR_COUNT = 100  // 减少星星数量
```

---

## 八、联系与支持

- 微信小程序文档：https://developers.weixin.qq.com/miniprogram/dev/framework/
- 小游戏开发指南：https://developers.weixin.qq.com/minigame/dev/guide/
- 问题反馈：微信公众平台 → 帮助中心

---

**祝开发顺利！**
