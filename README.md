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
- ✅ TUN 模式优化（重启仅需一次密码授权）
- ✅ 实时日志路由命中高亮显示
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

## 🔀 代理模式与规则生效机制

FlowZ 提供三种代理模式，每种模式下应用分流和路由规则的生效方式不同。

### 三种代理模式

| 模式 | 默认出口 | 说明 |
|---|---|---|
| **全局代理** (`global`) | 代理服务器 | 所有流量默认走代理，适合需要全部翻墙的场景 |
| **智能分流** (`smart`) | 代理服务器 | 国内流量直连，国外流量走代理（推荐日常使用） |
| **直接连接** (`direct`) | 直连 | 所有流量直连，不经过代理服务器 |

### 各模式下规则生效情况

#### 全局代理模式

- ✅ **自定义路由规则**生效 — 可将特定域名/IP 设为直连或屏蔽
- ✅ **排除进程**生效 — 指定进程强制直连
- ✅ **应用分流**生效 — 可为特定应用指定直连/代理/屏蔽
- ❌ **智能分流规则**不生效 — 没有 geosite-cn / geoip-cn 的国内直连判断
- 🔚 **兜底规则**：未匹配的流量 → 代理服务器

#### 智能分流模式

- ✅ **自定义路由规则**生效
- ✅ **排除进程**生效
- ✅ **应用分流**生效
- ✅ **智能分流规则**生效 — `geosite-geolocation-!cn` → 代理，`geosite-cn` / `geoip-cn` → 直连
- 🔚 **兜底规则**：未匹配的流量 → 代理服务器（即"未知流量走代理"）

#### 直接连接模式

- ❌ **自定义路由规则**不生效
- ❌ **排除进程**不生效
- ❌ **应用分流**不生效
- ❌ **智能分流规则**不生效
- 🔚 **兜底规则**：所有流量 → 直连

> 直连模式下不加载任何规则集，所有流量直接走物理网卡。

### 完整路由规则优先级（从高到低）

sing-box 采用 **first-match** 机制：从上到下逐条匹配，第一条命中即生效，后续规则不再检查。

```
 ① 嗅探规则 (sniff)                    — 识别流量中的域名信息
 ② FlowZ/sing-box 自身进程直连          — 防止 DNS 回流死循环
 ③ DNS 劫持 (hijack-dns, port 53)      — 接管所有 DNS 请求
 ④ 局域网 IP 直连 (127.0.0.0/8 等)      — 本地流量不进代理
 ⑤ 国内 DNS 服务器直连                   — 阿里/腾讯/114 DNS 走直连
 ⑥ ICMP 拒绝                           — FakeIP 下 ping 无意义
 ⑦ 代理工具/系统进程直连                  — Surge/Clash 等不走代理
 ⑧ 公共 DNS 直连 + 浏览器 DoH 阻断       — 防止 DNS 泄漏
 ⑨ 代理服务器域名/IP 直连                 — 防止代理连接自身死循环
 ⑩ 银行/证券/U盾域名直连                  — 金融安全
 ⑪ 私有 IP 段直连                        — 内网地址不走代理
 ⑫ 自定义路由规则 (customRules)           — 用户手动添加的域名/IP 规则
 ⑬ 排除进程 (bypassProcesses)           — 用户指定的直连进程
 ⑭ 应用分流 - 进程名 (processNames)      — 按进程精准匹配（仅 TUN 模式）
 ⑮ 应用分流 - 域名/IP (geositeTags等)    — 按域名/IP 规则集匹配
 ⑯ QUIC 阻断 (UDP 443 reject)          — 迫使浏览器回退 TCP
 ⑰ 智能分流规则（仅 smart 模式）          — geosite/geoip 国内外分流
 ⑱ 兜底规则 (final)                     — global/smart → 代理，direct → 直连
```

### 关键设计说明

- **①-⑪ 是系统保护规则**，所有模式下都生效，确保 DNS 不泄漏、内网可达、代理不死循环
- **⑫-⑮ 是用户规则**，仅在全局代理和智能分流模式下生效，直连模式跳过
- **⑫ 自定义规则优先于 ⑭⑮ 应用分流**，可以用来覆盖应用分流的行为
- **⑬ 排除进程优先于 ⑭ 应用分流进程名**，确保用户明确排除的进程不被应用分流覆盖
- **⑯ QUIC 阻断放在应用分流之后**，这样应用分流中设为直连的应用（如游戏）的 UDP 流量不会被误拦
- **⑰ 智能分流规则仅在 smart 模式下存在**，全局模式没有这些规则，所以未匹配的流量直接走兜底（代理）

### 配置变更自动生效

修改应用分流或路由规则后，代理会自动重启以应用新配置：
- 仅路由相关的配置变更会触发重启（规则、服务器、端口、TUN 配置等）
- UI 相关的变更（主题、语言）不会触发重启
- 快速连续修改多条规则时，有 1 秒防抖，只触发一次重启

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
| **进程名** | `processNames` | 可选，按操作系统进程名匹配，多个进程名用英文逗号分隔。如填 `Binance,Binance.exe`。**仅 TUN 模式生效** |

### 匹配字段详解

| 字段 | 含义 |
|---|---|
| `geositeTags` | sing-box geosite 规则集标签，按域名匹配流量。如 `["youtube"]` 会匹配所有 YouTube 相关域名（youtube.com、googlevideo.com 等）。**TUN 和系统代理模式都生效** |
| `geoipTags` | sing-box geoip 规则集标签，按目标 IP 段匹配流量。如 `["twitter"]` 包含 Twitter 的 IP 段。**TUN 和系统代理模式都生效** |
| `processNames` | 进程名列表，按操作系统进程名匹配。如 `["Telegram", "Telegram.exe"]`。**仅 TUN 模式生效**，系统代理模式下 sing-box 无法获取进程信息 |

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
| 进程名 | `Binance,Binance.exe` | 可选，TUN 模式下按进程精准匹配 |

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
  "geoipTags": [],
  "processNames": ["Binance", "Binance.exe"]
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
