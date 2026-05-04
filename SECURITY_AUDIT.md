# FlowZ 安全审计报告

**审计日期**: 2026-05-04
**审计范围**: 全部源码（`src/main/`、`src/renderer/`、`src/shared/`）、构建配置、CI/CD、依赖项
**结论**: **未发现后门、恶意代码、数据外传或隐蔽信息收集。** 代码逻辑与代理客户端功能定位一致。但存在若干安全加固不足的问题，按严重程度列出如下。

---

## 高风险

### 1. preload.ts — IPC 通道无白名单过滤

`src/main/preload.ts:17-18`

```typescript
invoke: <T = any>(channel: string, args?: any): Promise<T> => {
  return ipcRenderer.invoke(channel, args);
},
```

`invoke`/`on`/`off` 等方法接受任意 channel 字符串，没有白名单校验。如果渲染进程被 XSS 攻击（例如通过恶意订阅内容），攻击者可以调用任意已注册的 IPC handler，包括启动代理、修改配置、执行更新安装等。

**建议**: 在 preload 中引入 `IPC_CHANNELS` 白名单，拒绝不在列表中的调用。

### 2. shell.openExternal 接受任意 URL

`src/main/ipc/handlers/version-handlers.ts:56-62`

```typescript
async (_event: IpcMainInvokeEvent, url: string) => {
  await shell.openExternal(url);
  return true;
}
```

渲染进程可传入任意 URL，包括 `file://`、自定义协议等。结合上面 preload 无白名单的问题，攻击链完整。

**建议**: 校验 URL 必须以 `https://` 开头。

### 3. core-update:update 接受任意下载 URL

`src/main/ipc/handlers/core-update-handlers.ts:19`

```typescript
registerIpcHandler('core-update:update', async (_, downloadUrl: string) => {
  return await coreUpdateService.updateCore(downloadUrl);
});
```

渲染进程可传入任意 URL 作为 sing-box 核心下载地址。下载后解压并替换核心二进制文件，该文件随后会以管理员权限（TUN 模式）执行。攻击者可指定恶意 URL 替换核心为恶意程序。

**建议**: 校验 URL 必须来自 `github.com/SagerNet/sing-box`，或由主进程自行获取下载 URL 而非从渲染进程接收。

### 4. installUpdate 接受任意文件路径

`src/main/services/UpdateService.ts:170`

```typescript
async installUpdate(installerPath: string): Promise<boolean> {
```

接受来自渲染进程的文件路径，仅检查文件是否存在就直接执行。Windows 上会生成 VBScript 运行该路径指向的程序。

**建议**: 校验路径必须位于 `app.getPath('temp')` 下，且扩展名符合预期（`.exe`/`.dmg`/`.AppImage`）。

---

## 中风险

### 5. sandbox: false

`src/main/index.ts:237`

虽然 `contextIsolation: true` 和 `nodeIntegration: false` 已正确设置，但 `sandbox: false` 降低了渲染进程的隔离级别，增加了 XSS 攻击的影响面。

### 6. 缺少 Content Security Policy (CSP)

`src/renderer/index.html` 中没有 CSP meta 标签，主进程也未通过 `session.defaultSession.webRequest` 设置 CSP 响应头。缺少 CSP 意味着如果存在 XSS 漏洞，攻击者可以加载任意外部脚本。

### 7. executeJavaScript 字符串拼接注入

`src/main/services/UpdateService.ts:370-376`

```typescript
this.progressWindow.webContents.executeJavaScript(`
  document.getElementById('progress-text').textContent = '${message}';
`);
```

`message` 通过字符串模板直接拼接到 JS 代码中。如果 `message` 包含单引号或特殊字符，可能导致代码注入。

**建议**: 使用 `webContents.send()` + preload 传递数据。

### 8. 命令注入风险 — shell 命令字符串拼接

多处使用 `execSync`/`execAsync` 拼接路径到 shell 命令：

- `SystemProxyManager.ts` — `networksetup` 命令拼接 service 名称
- `CoreUpdateService.ts:181-182` — `xattr -cr` 和 `codesign` 拼接路径
- `CoreUpdateService.ts:834-838` — PowerShell 脚本拼接路径

**建议**: 使用 `execFileSync` 替代 `execSync`，以数组形式传递参数，避免 shell 解释。

### 9. 隐私密码明文存储

`src/main/services/ConfigManager.ts` 和 `src/renderer/components/layout/privacy-overlay.tsx`

隐私保护密码以明文 JSON 存储，前端明文比较。

**建议**: 使用 Electron `safeStorage` API 或至少哈希存储。

### 10. PowerShell 提权脚本 TOCTOU 竞争

`src/main/services/CoreUpdateService.ts:834-856`

在临时目录写入 PowerShell 脚本后以管理员权限执行，存在写入和执行之间被替换的竞争条件。

### 11. 第三方 GitHub Action 未固定 SHA

`.github/workflows/release.yml:128` — `softprops/action-gh-release@v1` 使用 major 版本标签，存在供应链攻击风险。

---

## 低风险

### 12. 生产环境日志泄露敏感信息

- `src/main/ipc/ipc-handler.ts:40` — 打印所有 IPC 请求参数（含密码）
- `src/main/ipc/handlers/proxy-handlers.ts:38` — 打印完整用户配置 JSON
- `src/renderer/ipc/ipc-client.ts:55,65` — 渲染进程打印所有 IPC 调用
- `src/main/services/SubscriptionService.ts:196` — 订阅 URL（可能含 token）写入日志

**建议**: 生产构建中移除或脱敏这些日志。

### 13. dangerouslySetInnerHTML

`src/renderer/pages/rules-page.tsx:192` — 内容来自静态 i18n 翻译文件（仅含 `<strong>` 标签），风险极低，但建议改用 `<Trans>` 组件。

### 14. npm 镜像源

`.npmrc` 使用 `registry.npmmirror.com`（阿里云镜像），理论上存在供应链风险。对安全敏感项目建议使用官方 registry。

### 15. macOS 构建未签名

`electron-builder.json` 中 `identity: null`，分发的 macOS 应用无法验证来源真实性。

---

## 确认安全的方面

- **无后门代码**: 未发现隐藏的远程控制、反向 shell 或未授权命令执行
- **无数据外传**: 所有网络请求均指向合理目标（GitHub API 更新检查、用户配置的订阅/代理服务器、jsdelivr CDN 图标）
- **无追踪/遥测**: 未发现 analytics、telemetry、beacon 等用户行为收集
- **无恶意文件操作**: 未发现读取 SSH 密钥、浏览器数据等敏感文件
- **无硬编码凭证**: 未发现 API 密钥、密码、token 硬编码在源码中
- **无动态外部脚本加载**: 未发现 `createElement('script')` 或动态 `import()` 外部 URL
- **contextIsolation: true, nodeIntegration: false**: 基本的 Electron 安全设置正确

---

## 优先修复建议

| 优先级 | 修复项 | 工作量 |
|--------|--------|--------|
| P0 | preload.ts 添加 IPC channel 白名单 | 小 |
| P0 | shell.openExternal 添加 URL 协议白名单 | 小 |
| P0 | core-update:update 校验下载 URL 域名 | 小 |
| P0 | installUpdate 校验文件路径范围 | 小 |
| P1 | 添加 CSP 策略 | 中 |
| P1 | shell 命令改用 execFileSync | 中 |
| P1 | 生产环境移除敏感日志 | 小 |
| P2 | 启用 sandbox | 需评估兼容性 |
| P2 | 隐私密码哈希存储 | 小 |
