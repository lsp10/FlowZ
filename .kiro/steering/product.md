# FlowZ — Product Overview

FlowZ is a cross-platform desktop proxy client built on the [sing-box](https://github.com/SagerNet/sing-box) core engine. It provides a clean, modern UI for managing proxy connections with smart traffic routing.

## Supported Protocols
NaïveProxy, VLESS, VMess, Trojan, Shadowsocks (+ Shadow-TLS plugin), Hysteria2, AnyTLS, TUIC, SOCKS, HTTP

## Key Capabilities
- **Three proxy modes**: Global (all traffic proxied), Smart (geo-based split routing), Direct (no proxy)
- **Two proxy type modes**: System Proxy (HTTP/SOCKS) and TUN (transparent, kernel-level)
- **Routing rules**: Custom domain/IP rules, app-level routing (per-process in TUN mode), geosite/geoip rule sets
- **FakeIP**: Optional DNS privacy mode returning fake IPs to prevent DNS leaks
- **Subscriptions**: Import servers from subscription URLs with traffic stats and auto-update
- **Speed testing**: Per-server latency testing
- **i18n**: Chinese (primary) and English

## Target Platforms
Windows 10 1809+, macOS 12+, Linux

## User Data Location
Config and logs stored in Electron's `app.getPath('userData')`:
- macOS: `~/Library/Application Support/FlowZ/`
- Windows: `%APPDATA%\FlowZ\`
