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

### 开发模式

```bash
git clone https://github.com/zhangjh/FlowZ.git
cd FlowZ

npm install
npm run dev
```

### 生产打包（macOS）

完整打包流程分为 5 步：编译主进程 → 编译渲染进程 → Electron 打包 → 签名 → 生成 DMG。

```bash
# 1. 编译主进程 TypeScript → dist/main/
npm run build:main

# 2. 编译渲染进程 (Vite) → dist/renderer/
npx vite build

# 3. Electron Builder 打包为 .app（自动包含 sing-box 二进制和规则集）
npm run package:mac

# 4. Ad-hoc 签名（无 Apple 开发者证书时必须，否则 macOS 拒绝运行）
codesign --force --deep --sign - dist-package/mac/FlowZ.app

# 5. 生成 DMG 安装镜像
hdiutil create -volname "FlowZ-3.4.5" \
  -srcfolder dist-package/mac/FlowZ.app \
  -ov -format UDZO \
  dist-package/FlowZ-3.4.5-mac-x64.dmg
```

**一行快速打包（复制即用）：**

```bash
npm run build:main && npx vite build && npm run package:mac && codesign --force --deep --sign - dist-package/mac/FlowZ.app && hdiutil create -volname "FlowZ-3.4.5" -srcfolder dist-package/mac/FlowZ.app -ov -format UDZO dist-package/FlowZ-3.4.5-mac-x64.dmg
```

**各步骤说明：**

| 步骤 | 命令 | 产物 | 说明 |
|---|---|---|---|
| 1 | `npm run build:main` | `dist/main/` | 将主进程 TypeScript 编译为 JavaScript |
| 2 | `npx vite build` | `dist/renderer/` | 将 React 渲染进程打包为静态资源 |
| 3 | `npm run package:mac` | `dist-package/mac/FlowZ.app` | Electron Builder 将编译产物、sing-box 核心、规则集打包为 macOS 应用 |
| 4 | `codesign` | 原地签名 | macOS Gatekeeper 要求所有 .app 必须签名，Ad-hoc 签名可在本机运行 |
| 5 | `hdiutil create` | `dist-package/FlowZ-3.4.5-mac-x64.dmg` | 生成可分发的 DMG 安装镜像 |

**注意事项：**

- 版本号在 `package.json` 中定义（当前 3.4.5），DMG 文件名需同步更新
- `npm run package:mac` 内部会再次调用 vite build，步骤 2 可省略，但单独跑可以提前发现渲染层编译错误
- macOS Intel (x64) 用户需要修改 `electron-builder.json` 中的 arch 为 `["x64"]`

### 生产打包（Windows）

```bash
npm run build:main
npx vite build
npm run package:win
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
 ⑤ 国内 DNS 服务器直连 (port 53/443)    — 阿里/腾讯/114 DNS 走直连
 ⑥ ICMP 拒绝                           — FakeIP 下 ping 无意义
 ⑦ 代理工具/系统进程直连                  — Surge/Clash 等不走代理
 ⑧ 公共 DNS DoH/DoT 阻断 (port 443/853) — 阻断浏览器加密 DNS，迫使回退 UDP 53
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
- **⑧ DoH/DoT 阻断**：现代浏览器（Chrome/Firefox/Edge）会通过 HTTPS 443 或 DoT 853 端口向公共 DNS IP 发起加密 DNS 请求，完全绕过 hijack-dns（仅劫持 port 53）。阻断这些 IP 的 443/853 端口后，浏览器被迫回退到 UDP 53，从而被 hijack-dns 劫持进入正常 DNS 分流体系
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

## 🔍 FakeIP 详解

### 为什么需要 FakeIP

传统代理的 DNS 流程存在三个致命问题：

1. **DNS 泄漏** — 应用先向本地 DNS 查询域名，ISP 和 GFW 能看到你访问了什么网站，即使后续流量走了代理
2. **DNS 污染** — GFW 对境外域名返回虚假 IP（投毒），导致即使走代理也连不上正确的服务器
3. **IP 连接被拒** — 很多机场节点要求收到域名（SNI）而非纯 IP，收到 IP 会直接拒绝连接

FakeIP 从根源上解决了这三个问题：**域名解析这一步根本不出本机**。

### FakeIP 是什么

当应用解析域名时，sing-box 不向任何上游 DNS 查询，而是立刻返回一个 `198.18.x.x` 段的虚假 IP。应用拿到假 IP 后发起连接，sing-box 通过流量嗅探（sniff）从 TLS ClientHello 中还原出真实域名，再交给路由引擎判断走代理还是直连。

整个过程中，真实域名从未离开本机，ISP 和 GFW 完全无感知。

### 不用 FakeIP vs 用 FakeIP

| | 不用 FakeIP（传统模式） | 用 FakeIP |
|---|---|---|
| **DNS 查询** | 先向本地/公共 DNS 查询真实 IP | 直接返回假 IP，不查询 |
| **ISP 可见性** | ISP 能看到你查了 google.com | ISP 看不到任何域名查询 |
| **GFW 污染** | 可能拿到被污染的假 IP | 不依赖任何 DNS 返回值 |
| **代理节点兼容** | 发送 IP 地址，部分节点拒绝 | 发送完整域名，100% 兼容 |
| **首次连接速度** | 等 DNS 响应（50~500ms） | 即时返回（<1ms） |

### 什么时候用 FakeIP

| 场景 | 建议 |
|---|---|
| 日常翻墙上网 | 在设置 → DNS 配置中启用 FakeIP（推荐） |
| 网银/证券/U盾 | 已内置绕过，无需操心 |
| 某个应用连不上 | 为该域名勾选「绕过 FakeIP」使用真实 DNS |

### FakeIP 的好处总结

- **隐私保护** — DNS 查询不出本机，ISP 无法通过 DNS 日志追踪你的访问记录
- **抗 GFW 污染** — 不依赖境内 DNS 的返回结果，彻底免疫 DNS 投毒
- **节点兼容性** — 代理节点收到完整域名而非 IP，兼容所有 SNI 严格校验的机场
- **连接更快** — 省去了 DNS 查询的网络往返，首次连接延迟更低
- **分流更准** — 路由引擎基于域名判断（而非可能被污染的 IP），分流命中率更高

### FakeIP 何时启用

| 代理模式类型 | FakeIP 状态 |
|---|---|
| **TUN 模式** | 取决于用户 DNS 配置中的 `enableFakeIp` 开关 |
| **系统代理模式** | 取决于用户 DNS 配置中的 `enableFakeIp` 开关 |

FakeIP 在所有代理模式下均由用户手动控制，在设置 → DNS 配置中开启或关闭。

### FakeIP 地址段

| 协议 | 地址段 |
|---|---|
| IPv4 | `198.18.0.0/15`（198.18.0.0 ~ 198.19.255.255） |
| IPv6 | `fc00::/18` |

### 国内域名的处理

FakeIP 对所有 A/AAAA 查询统一返回假 IP，包括国内域名。当路由引擎判定流量走直连（如命中 `geosite-cn`）时，sing-box 在 direct 出站阶段重新发起真实 DNS 解析，拿到真实 IP 后建立连接：

```
baidu.com → FakeIP 返回 198.18.0.x → 路由命中 geosite-cn → direct 出站 → 真实 DNS 解析 → 连接百度真实 IP
```

国内网站的访问体验不受影响。

### TUN 模式下的 DNS 劫持机制

在 TUN 模式下，FlowZ 通过以下机制确保 DNS 请求被正确劫持：

1. **系统 DNS 重定向（macOS）** — 启动时自动将系统 DNS 设置为 TUN 地址（`172.19.0.1`），确保所有 DNS 请求发往 TUN 接口而非路由器
2. **hijack-dns 规则** — sing-box 劫持所有经过 TUN 的 port 53 流量，交由内部 DNS 模块处理
3. **DoH/DoT 阻断** — 阻断公共 DNS IP（8.8.8.8、1.1.1.1 等）的 443/853 端口，以及 `dns.google`、`cloudflare-dns.com` 等 DoH 域名，迫使浏览器回退到 UDP 53
4. **停止时恢复** — 断开连接时自动恢复系统 DNS 为自动获取

这套机制解决了 macOS 上 DNS 请求绕过 TUN 的问题：macOS 的网关（如 192.168.1.1）有 ARP 产生的 host route 直接走物理网卡，如果不重定向系统 DNS，DNS 请求会完全绕过 TUN。

### 如何验证 FakeIP 已生效

**方法一：nslookup 验证（最直观）**

在终端中解析任意国外域名，如果返回 `198.18.x.x` 段的 IP，说明 FakeIP 生效：

```bash
nslookup google.com

# FakeIP 生效时的输出：
# Server:    172.19.0.1
# Address:   198.18.0.x

# FakeIP 未启用时的输出：
# Server:    172.19.0.1
# Address:   142.250.x.x（真实 IP）
```

注意：DNS Server 显示为 `172.19.0.1` 说明 TUN DNS 劫持正常工作，无论 FakeIP 是否启用。

**方法二：ping 验证**

```bash
ping -c 1 google.com

# FakeIP 生效时，目标 IP 显示为 198.18.x.x
# PING google.com (198.18.0.5): 56 data bytes
# （ICMP 会被 sing-box reject，不会有回复，这是正常的）
```

**方法三：浏览器开发者工具**

1. 打开 Chrome → F12 → Network 面板
2. 访问 `https://google.com`
3. 点击请求 → 查看 Remote Address
4. 如果显示 `198.18.x.x:443`，说明 FakeIP 生效

**方法四：FlowZ 日志验证**

1. 打开 FlowZ → 日志页面
2. 访问任意国外网站
3. 观察日志中的路由命中记录，如果出站连接的目标显示为域名（而非 IP），说明 FakeIP + sniff 工作正常

### 常见问题

**Q: ping 国外网站超时是否正常？**
A: 正常。FakeIP 模式下 ICMP 流量被 sing-box reject（代理节点通常不支持 ICMP），ping 超时不代表网络不通。用浏览器访问验证即可。

**Q: nslookup 返回真实 IP？**
A: 检查 DNS 配置中 FakeIP 是否已启用。FakeIP 现在由用户手动控制，不再自动强制开启。

**Q: 某些应用连不上，怀疑 FakeIP 干扰？**
A: 在自定义路由规则中为该域名添加规则并勾选「绕过 FakeIP」，该域名将使用真实 DNS 解析。银行/证券类域名已内置绕过。

**Q: DNS Server 不是 172.19.0.1？**
A: 说明系统 DNS 未被正确重定向到 TUN 接口。尝试断开并重新连接 FlowZ，或检查是否有其他 VPN/代理工具冲突。

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

## ❓ 常见问题：「连接超时：服务器响应超时」日志频繁出现

### 原因

这条日志来自 sing-box 核心引擎。当应用或系统发起的网络请求经过代理转发时，如果远端服务器在规定时间内没有响应，sing-box 就会输出 timeout 级别的错误。FlowZ 捕获这些日志后翻译为中文展示。

常见触发场景：

1. **后台应用心跳/轮询** — 浏览器扩展、IM 客户端、云同步服务等会持续发起连接，部分目标服务器响应慢或不可达时就会超时。
2. **DNS 查询超时** — 智能模式下 DNS 请求也走代理链路，如果上游 DNS 响应慢会触发超时。
3. **代理节点负载高或网络波动** — 节点本身延迟大、丢包率高时，正常请求也可能超时。
4. **目标站点不可达** — 被访问的网站本身宕机或限制了来源 IP。

### 对正常使用的影响

**基本不影响。** 这些超时是单次连接级别的失败，不代表整体代理不可用：

- 浏览器等客户端会自动重试，用户通常感知不到。
- FlowZ 已内置节流机制（10 秒内相同的无目标超时只显示一次），避免日志刷屏。
- 私有 IP（局域网地址）的超时已被自动过滤，不会显示。

### 什么时候需要关注

- 超时日志**持续大量出现**且伴随网页无法加载 → 说明代理节点可能已失效，建议切换节点。
- 超时目标集中在**同一个域名** → 该站点本身有问题，与代理无关。
- 刚启动代理后短暂出现几条 → 正常现象，DNS 缓存建立后会消失。

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
