# FlowZ

原作者大佬开源地址：https://github.com/zhangjh/FlowZ

简洁现代的跨平台代理客户端，基于 sing-box 核心。  
支持 NaïveProxy、VLESS、VMess、Trojan、Shadowsocks、Hysteria2、Anytls、TUIC、Shadows-tls 协议。  

主打：

- 配置简单
- 规则明确
- 所见即所得
- 稳定好用

---

## ✨ 功能特性

- ✅ 支持 NaïveProxy、VLESS、VMess、Trojan、Hysteria2、Shadowsocks、Anytls、TUIC、Shadows-tls协议等。
- ✅ 强大的路由规则系统（支持 geosite / geoip 规则集）
- ✅ 多种代理模式（全局 / 智能 / 直连）
- ✅ 应用分流策略组模块
- ✅ 支持订阅链接
- ✅ TUN 透明代理模式（支持 System / gVisor / Mixed 堆栈）
- ✅ 系统级代理自动接管
- ✅ 支持仅本地代理模式
- ✅ 实时流量统计与测速
- ✅ 支持前置代理，完美实现代理链功能
- ✅ 亮色 / 暗色主题切换
- ✅ 开机自启动与自动连接
- ✅ 现代化 UI（基于 shadcn/ui）
- ✅ 支持连接拓扑展示功能
- ✅ 支持隐私保护模式
- ✅ 支持排除进程代理模式
- ✅ 跨平台支持（Windows / macOS / Linux（测试））
- ✅ 支持中英文语言切换
---

## 🖼 界面预览

<img src="https://cdn.nodeimage.com/i/YvkiEO6sI7ex8UzWTGobq2U3UCwo7pnv.webp" alt="YvkiEO6sI7ex8UzWTGobq2U3UCwo7pnv.webp">
<img src="https://cdn.nodeimage.com/i/JjgOVR72FVDe8IdenWOvQgYmRmy3XljX.webp" alt="JjgOVR72FVDe8IdenWOvQgYmRmy3XljX.webp">
<img src="https://cdn.nodeimage.com/i/OkMsmCuA4kTzOxpUfI5kbHrctJgou781.webp" alt="OkMsmCuA4kTzOxpUfI5kbHrctJgou781.webp">
<img src="https://cdn.nodeimage.com/i/ZfewzdJUYN3wkLbLL3DieXND5DD63lhT.webp" alt="ZfewzdJUYN3wkLbLL3DieXND5DD63lhT.webp">
<img src="https://cdn.nodeimage.com/i/7Th2DdFQ52V3xNg67ecS88zOfqV5KWJ1.webp" alt="7Th2DdFQ52V3xNg67ecS88zOfqV5KWJ1.webp">
<img src="https://cdn.nodeimage.com/i/eF2PxEG9figyhXJe6EqRbu7TtcucVDLH.webp" alt="eF2PxEG9figyhXJe6EqRbu7TtcucVDLH.webp">
<img src="https://cdn.nodeimage.com/i/ihpRZpWuW3MgQR8kkEKmZl2u6ANrXXcw.webp" alt="ihpRZpWuW3MgQR8kkEKmZl2u6ANrXXcw.webp">
<img src="https://cdn.nodeimage.com/i/sicWxjH9z3ZyVFWPEDNYvYWl0cYMASdR.webp" alt="sicWxjH9z3ZyVFWPEDNYvYWl0cYMASdR.webp">
<img src="https://cdn.nodeimage.com/i/CyL0QX2SvBCPZxonMkVws5pSPGpNtPVm.webp" alt="CyL0QX2SvBCPZxonMkVws5pSPGpNtPVm.webp">

---

## 📋 系统要求

- Windows 10 (1809+) 或 Windows 11
- macOS 12+

---

## 📥 安装

从 Releases 页面下载最新版本。

### Windows
运行 `.exe` 安装包

### macOS (Apple Silicon)
打开 `.dmg` 并拖入 Applications

### macOS (Intel)
需要从源码构建

若 macOS 提示“软件已损坏”：

```bash
xattr -cr /Applications/FlowZ.app
```

---

## 🛠 从源码构建

```bash
git clone https://github.com/zhangjh/FlowZ.git
cd FlowZ

npm install
npm run dev
npm run build
npm run package:win
npm run package:mac
```

macOS Intel 用户需要修改 `electron-builder.json`：

```json
"arch": ["x64"]
```

---

## 🚀 快速开始

### 1. 配置服务器

- 打开应用 → 服务器标签
- 选择协议
- 填写服务器信息
- 保存配置

### 2. 启用代理

- 返回首页
- 点击“启用代理”

### 3. 选择代理模式

默认使用 代理 模式。

可选模式：

- 全局模式：所有流量走代理
- 智能模式：自动分流（推荐）
- 直连模式：不使用代理

如不希望使用 TUN，可在设置中切换为“系统代理模式”。

---

## 📱 应用分流详解

应用分流可以为特定应用（如 YouTube、Telegram、币安等）单独指定流量走向，不受全局代理模式的影响。

### 基本概念

应用分流由两层结构组成：

1. **应用预设** — 定义"这个应用是什么"，包含域名规则、IP 规则、进程名等匹配条件
2. **应用规则** — 定义"这个应用的流量怎么走"，即代理 / 直连 / 屏蔽

系统内置了 YouTube、Netflix、TikTok、Telegram、Twitter、OpenAI、Claude、Steam 等常用应用预设。如果需要的应用不在预设列表中，可以通过自定义预设添加。

### UI 表单与数据字段的对应关系

在 UI 中点击「新增自定义应用分流」时，弹窗有以下输入项：

| UI 表单标签 | 对应数据字段 | 说明 |
|---|---|---|
| **图标** | `emoji` + `iconUrl` | 点击可从 Qure / EDC 图标库选择彩色图标（写入 `iconUrl`）；未选择时使用 emoji 兜底 |
| **名称** | `name` | 纯显示用途，在应用列表中展示的名称。**不参与任何路由匹配**，不是 `id` 也不是 `processNames`。`id` 由系统自动生成（格式 `custom-{timestamp}`） |
| **Geosite** | `geositeTags` | 核心匹配字段，多个标签用英文逗号分隔。如填 `binance` 则匹配 `geosite-binance` 域名规则集 |
| **GeoIP** | `geoipTags` | 可选，按目标 IP 段匹配，多个标签用英文逗号分隔 |

> `processNames`（进程名匹配）目前仅系统内置预设支持，自定义预设暂不提供该输入项。自定义应用的流量匹配完全依赖 Geosite 和 GeoIP 规则集。

### 匹配字段详解

| 字段 | 含义 |
|---|---|
| `geositeTags` | sing-box geosite 规则集标签，按域名匹配流量。如 `["youtube"]` 会匹配所有 YouTube 相关域名（youtube.com、googlevideo.com 等）。**TUN 和系统代理模式都生效** |
| `geoipTags` | sing-box geoip 规则集标签，按目标 IP 段匹配流量。如 `["twitter"]` 包含 Twitter 的 IP 段。**TUN 和系统代理模式都生效** |
| `processNames` | 进程名列表，按操作系统进程名匹配。如 `["Telegram", "Telegram.exe"]`。**仅 TUN 模式生效**，系统代理模式下 sing-box 无法获取进程信息。仅内置预设可用 |

### 三个字段如何协同工作

每个启用的应用规则会生成 **两条独立的 sing-box 路由规则**：

```
规则 1: { process_name: [...], outbound: "xxx" }   ← 由 processNames 生成
规则 2: { rule_set: ["geosite-xxx", "geoip-xxx"], outbound: "xxx" }  ← 由 geositeTags + geoipTags 生成
```

- **进程名规则排在域名/IP 规则之前**，优先级更高
- sing-box 路由采用 **first-match** 机制（第一条匹配即生效，后续不再检查）
- 两条规则指向同一个出口，是**互补关系**而非竞争关系

**实际效果**：TUN 模式下，进程名规则先命中，覆盖面更广（进程的所有流量，包括非标准域名）；如果进程名没命中（系统代理模式，或进程名不在列表中），域名/IP 规则兜底。

### 规则优先级（从高到低）

```
1. 自定义规则（用户手动添加的域名/IP 规则）
2. 应用分流 - 进程名规则（processNames）
3. 应用分流 - 域名/IP 规则（geositeTags + geoipTags）
4. QUIC 阻断（UDP 443 reject）
5. 智能分流 / 全局分流的兜底规则
```

自定义规则优先级最高，可以用来覆盖应用分流的行为。例如：应用分流将 Binance 设为代理，但你可以添加一条自定义规则将 `binance.com` 强制直连。

### 规则字段说明

| 字段 | 含义 |
|---|---|
| `action` | 流量策略：`proxy`（走代理）/ `direct`（直连）/ `block`（屏蔽） |
| `enabled` | 是否启用这条规则 |
| `targetServerId` | 指定代理服务器（仅 action 为 proxy 时有效），不填则走默认选中的服务器 |

### 示例：添加币安 (Binance) 应用分流

币安不在系统预设中，需要通过自定义预设添加。以下是完整的 UI 操作步骤：

**第一步：创建自定义应用预设**

打开规则页面 → 点击「新增自定义应用分流」，在弹窗中填写：

| 表单项 | 填写内容 | 说明 |
|---|---|---|
| 图标 | 从图标库选择 Binance 图标，或保持默认 emoji | 仅影响显示 |
| 名称 | `Binance 币安` | 列表中的显示名称，不影响路由匹配 |
| Geosite | `binance` | 匹配 `binance.com`、`binance.cloud`、`bnbstatic.com` 等域名 |
| GeoIP | 留空 | 币安没有专属 IP 段 |

点击确认后，币安会出现在应用分流列表中。

**第二步：设置流量策略**

在应用列表中找到刚添加的「Binance 币安」，选择流量策略：

- **代理** — 币安流量走代理服务器（可进一步指定特定服务器）
- **直连** — 币安流量不经过代理
- **屏蔽** — 拦截币安流量

**对应的 JSON 配置（供参考）**

自定义预设保存在 `UserConfig.customAppPresets` 中：

```json
{
  "id": "custom-1714800000000",
  "name": "Binance 币安",
  "emoji": "💰",
  "geositeTags": ["binance"],
  "geoipTags": []
}
```

应用规则保存在 `UserConfig.appRules` 中：

```json
{
  "appId": "custom-1714800000000",
  "action": "proxy",
  "enabled": true
}
```

`id` 和 `appId` 由系统自动生成，格式为 `custom-{时间戳}`，两者必须一致才能关联。如需指定特定代理服务器，添加 `"targetServerId": "服务器ID"`。

---

## 🔧 技术栈

- Electron
- React 18 + TypeScript
- sing-box
- Tailwind CSS
- shadcn/ui

---

## 📄 开源协议

MIT License

---

## ⚠️ 免责声明

本软件仅供学习与研究使用。  
请遵守当地法律法规。  
使用本软件所产生的任何后果由使用者自行承担。

---

## ⭐ Star 趋势

[![Star History Chart](https://api.star-history.com/svg?repos=dododook/FlowZ&type=Date)](https://star-history.com/#dododook/FlowZ&Date)
