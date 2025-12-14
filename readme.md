# HHAExchange Smart Assistant

大幅提升家庭护理协调员在 HHAExchange 平台上的工作效率

## 功能特性

### 一键表单填写
- **Missed In/Out** - 一键填写护理员未打卡的处理记录
- **POC (Plan of Care)** - 一键处理任务不符合护理计划的情况
- **New QA / Welcome Call** - 快速创建质量保证通话和欢迎电话记录

### 智能电话交互 (Highlight2Call)
- 自动高亮页面上的电话号码
- 点击即可选择打电话或发短信
- 无缝连接电脑电话系统

### 来电智能识别
- 监控 VoiceTech WebSocket 来电事件
- 自动在 HHAExchange 搜索来电号码
- 病人 + 护理员双数据源搜索

### Visit Monitor 实时监控
- 悬浮式状态追踪面板
- 监控 Missed-In / Missed-Out / 异常打钟
- 支持多 Coordinator 同时追踪
- 跨 Tab 数据同步 - 减少 80%+ 重复 API 请求

### 快捷筛选
- 首页快速筛选（协调员、通讯类型、状态）
- Prebilling 页面快速筛选

## 安装

### 前置要求
- Chrome 浏览器（推荐最新版本）
- [Tampermonkey](https://www.tampermonkey.net/) 扩展

### 安装脚本

**自动更新（推荐）**

[点击安装 index.prod.user.js](https://raw.githubusercontent.com/KurosakiRei/HHAExchange-Smart-Assistant/dist/index.prod.user.js)

## 使用场景

| 功能 | 操作 | 节省时间 |
|------|------|----------|
| Missed Call 处理 | 一键填写 | 2-5 分钟 → 5 秒 |
| 来电识别 | 自动搜索 | 30 秒 → 即时 |
| Visit 状态查看 | 悬浮面板 | 无需切换页面 |
| 多 Tab 监控 | 数据同步 | 无重复请求 |

## 开发

### 技术栈
- Webpack 5 + Vue3 + TypeScript
- LESS 样式预处理
- GM_fetch 跨域请求

### 本地开发

```bash
# 安装依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产构建
npm run build
```

### 项目结构

```
src/
├── index.ts                    # 主入口
├── js/
│   ├── VisitMonitor.ts         # Visit 状态监控
│   ├── Highlight2Call.ts       # 电话号码高亮
│   ├── IncomingCallHandler.ts  # 来电监控
│   ├── MissedCall.ts           # Missed Call 处理
│   └── ...
├── style/                      # 样式文件
└── utils/                      # 工具函数
```

## License

[MIT](LICENSE) © KurosakiRei
