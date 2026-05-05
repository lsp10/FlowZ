import { CustomAppPreset } from './types';

/**
 * 应用分流预设列表
 * 每个应用对应一个或多个 geosite 标签，底层映射到 sing-box 的 rule_set 机制
 */

export interface AppPreset {
  /** 应用唯一 ID */
  id: string;
  /** i18n key，对应 rules.apps.XXX */
  labelKey: string;
  /** Emoji 图标（兜备用） */
  emoji: string;
  /** 图标 URL（Qure Color 彩色图标集） */
  iconUrl?: string;
  /** 对应的 geosite 标签数组（可能有多个） */
  geositeTags: string[];
  /** 对应的 geoip 标签数组（可能有多个，可选） */
  geoipTags?: string[];
  /**
   * 额外的域名后缀规则（可选）
   * 用于补充 geosite 规则集未覆盖的第三方依赖域名。
   * 格式与 sing-box domain_suffix 一致，如 "auth0.com"、"statsig.com"。
   * 匹配该域名本身及所有子域名（*.auth0.com、auth0.com 均命中）。
   */
  domainSuffix?: string[];
  /** 对应的进程名数组（用于 macOS/Windows/Linux 真·应用分流，可选） */
  processNames?: string[];
  /** 分类 */
  category: 'video' | 'social' | 'ai' | 'tools' | 'game';
}

const QURE_BASE = 'https://fastly.jsdelivr.net/gh/Koolson/Qure/IconSet/Color';

export const APP_PRESETS: AppPreset[] = [
  // ── 视频 ──────────────────────────────────────────
  {
    id: 'youtube',
    labelKey: 'youtube',
    emoji: '▶️',
    iconUrl: `${QURE_BASE}/YouTube.png`,
    geositeTags: ['youtube'],
    category: 'video',
  },
  {
    id: 'netflix',
    labelKey: 'netflix',
    emoji: '🎬',
    iconUrl: `${QURE_BASE}/Netflix.png`,
    geositeTags: ['netflix'],
    processNames: ['Netflix', 'Netflix.exe'],
    category: 'video',
  },
  {
    id: 'tiktok',
    labelKey: 'tiktok',
    emoji: '🎵',
    iconUrl: `${QURE_BASE}/TikTok.png`,
    geositeTags: ['tiktok'],
    processNames: ['TikTok', 'TikTok.exe'],
    category: 'video',
  },
  {
    id: 'bilibili',
    labelKey: 'bilibili',
    emoji: '📺',
    iconUrl: `${QURE_BASE}/bilibili.png`,
    geositeTags: ['bilibili'],
    processNames: ['BiliBili', 'bilibili', 'bilibili.exe'],
    category: 'video',
  },
  // ── 社交 ──────────────────────────────────────────
  {
    id: 'telegram',
    labelKey: 'telegram',
    emoji: '✈️',
    iconUrl: `${QURE_BASE}/Telegram.png`,
    geositeTags: ['telegram'],
    processNames: ['Telegram', 'Telegram.exe', 'Telegram Desktop'],
    category: 'social',
  },
  {
    id: 'twitter',
    labelKey: 'twitter',
    emoji: '🐦',
    iconUrl: `${QURE_BASE}/X.png`,
    geositeTags: ['twitter'],
    processNames: ['Twitter', 'X', 'Twitter.exe'],
    category: 'social',
  },
  {
    id: 'instagram',
    labelKey: 'instagram',
    emoji: '📷',
    iconUrl: `${QURE_BASE}/Instagram.png`,
    geositeTags: ['instagram'],
    processNames: ['Instagram', 'Instagram.exe'],
    category: 'social',
  },
  // ── AI ────────────────────────────────────────────
  {
    id: 'kiro',
    labelKey: 'kiro',
    emoji: '🤖',
    iconUrl: 'https://kiro.dev/images/kiro-wordmark.png',
    geositeTags: [],
    // 来源：https://kiro.dev/docs/autonomous-agent/firewalls/（官方防火墙配置文档）
    // 覆盖 Kiro IDE 所有出站请求：AI 推理、认证、遥测、资产下载、订阅管理
    domainSuffix: [
      // ── Kiro 核心域名 ──
      'kiro.dev', // 网站、文档、所有子域名（*.kiro.dev 通配）
      'kiro.aws.dev', // 遥测端点（prod.us-east-1.telemetry.kiro.aws.dev）
      // ── AWS 服务端点 ──
      'amazonaws.com', // q.*.amazonaws.com（Kiro AI 服务）+ Cognito + OIDC
      'awsstatic.com', // a0.awsstatic.com（AWS 静态资源）
      'shortbread.aws.dev', // Cookie 同意组件（*.shortbread.aws.dev）
      'awsapps.com', // IAM Identity Center 门户
      'signin.aws', // IAM Identity Center 登录
      // ── 社交登录 ──
      // GitHub 登录（github.com 通常已被 geosite-github 覆盖，此处补充认证子域名）
      'github.com',
      'githubusercontent.com',
      // Google 登录
      'accounts.google.com',
      // ── 订阅计费 ──
      'stripe.com', // billing.stripe.com / checkout.stripe.com
    ],
    // Kiro 是 Electron 应用，进程名匹配最精准
    processNames: ['Kiro', 'Kiro.exe', 'kiro', 'kiro-agent'],
    category: 'ai',
  },
  {
    id: 'openai',
    labelKey: 'openai',
    emoji: '🤖',
    iconUrl: `${QURE_BASE}/ChatGPT.png`,
    geositeTags: ['openai'],
    // 补充 geosite-openai 未覆盖的第三方依赖域名（来源：OpenAI 官方网络要求文档）
    // 浏览器访问 ChatGPT 时这些域名必须可达，否则会出现登录失败、功能异常等问题
    domainSuffix: [
      // 登录认证：OpenAI 使用 Auth0 托管登录流程
      'auth0.com',
      // A/B 测试 & 功能开关：ChatGPT 用 Statsig 控制功能灰度
      'statsig.com',
      'statsigapi.net',
      'featuregates.org',
      // 客服对话组件
      'intercom.io',
      'intercomcdn.com',
      'intercomassets.com',
      // 前端错误监控
      'sentry.io',
      // Datadog 监控
      'datadoghq.com',
      // 邮件链接追踪
      'sendgrid.net',
      // Azure 基础设施（OpenAI 静态资源、文件存储、实时推送）
      'azureedge.net',
      'azurefd.net',
      'webpubsub.azure.com',
      'blob.core.windows.net',
      // 图片 CDN
      'imgix.net',
      // Cloudflare CDN（openai.com.cdn.cloudflare.net）
      'cloudflare.net',
    ],
    processNames: ['ChatGPT', 'ChatGPT.exe'],
    category: 'ai',
  },
  {
    id: 'anthropic',
    labelKey: 'anthropic',
    emoji: '🧠',
    iconUrl:
      'https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/04ProxySoft/claude.png',
    geositeTags: ['anthropic'],
    // 补充 geosite-anthropic 未覆盖的第三方依赖域名
    domainSuffix: [
      // A/B 测试 & 功能开关（Claude 也使用 Statsig）
      'statsig.com',
      'statsigapi.net',
      'featuregates.org',
      // 前端错误监控
      'sentry.io',
      // 客服组件
      'intercom.io',
      'intercomcdn.com',
    ],
    processNames: ['Claude', 'Claude.exe'],
    category: 'ai',
  },
  {
    id: 'gemini',
    labelKey: 'gemini',
    emoji: '✨',
    iconUrl:
      'https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/04ProxySoft/gemini.png',
    geositeTags: ['google'],
    category: 'ai',
  },
  // ── 工具 ──────────────────────────────────────────
  {
    id: 'github',
    labelKey: 'github',
    emoji: '🐙',
    iconUrl: `${QURE_BASE}/GitHub.png`,
    geositeTags: ['github'],
    processNames: ['GitHub Desktop', 'GitHubDesktop.exe', 'git', 'git.exe', 'GitHub'],
    category: 'tools',
  },
  {
    id: 'google',
    labelKey: 'google',
    emoji: '🔍',
    iconUrl: `${QURE_BASE}/Google_Search.png`,
    geositeTags: ['google'],
    category: 'tools',
  },
  {
    id: 'spotify',
    labelKey: 'spotify',
    emoji: '🎧',
    iconUrl: `${QURE_BASE}/Spotify.png`,
    geositeTags: ['spotify'],
    processNames: ['Spotify', 'Spotify.exe'],
    category: 'tools',
  },
  {
    id: 'apple',
    labelKey: 'apple',
    emoji: '🍎',
    iconUrl: `${QURE_BASE}/Apple.png`,
    geositeTags: ['apple'],
    processNames: ['App Store', 'Software Update', 'cloudd', 'nsurlsessiond'],
    category: 'tools',
  },
  // ── 游戏 ──────────────────────────────────────────
  {
    id: 'steam',
    labelKey: 'steam',
    emoji: '🎮',
    iconUrl: `${QURE_BASE}/Steam.png`,
    geositeTags: ['steam'],
    // 包含 Steam 客户端及常见热门游戏的进程名
    // 游戏通过 Steam 启动后是独立进程，仅匹配 "Steam" 无法覆盖游戏本体的 UDP 流量
    processNames: [
      // Steam 客户端及辅助进程
      'Steam',
      'steam.exe',
      'steamwebhelper',
      'steamwebhelper.exe',
      'GameOverlayUI.exe',
      'GameOverlayUI',
      'steam_osx', // macOS Steam binary
      // 热门 FPS / 竞技游戏
      'cs2',
      'cs2.exe', // CS2 (Counter-Strike 2)
      'dota2',
      'dota2.exe', // Dota 2
      'TslGame.exe',
      'TslGame', // PUBG
      'r5apex.exe',
      'r5apex', // Apex Legends
      'EscapeFromTarkov.exe', // Escape from Tarkov
      'FortniteClient-Win64-Shipping.exe', // Fortnite (via Epic on Steam)
      // MOBA / RPG
      'Hearthstone.exe',
      'Hearthstone', // 炉石传说
      'GenshinImpact.exe',
      'YuanShen.exe', // 原神
      'StarRail.exe', // 崩坏：星穹铁道
      'ZenlessZoneZero.exe', // 绝区零
      // 生存 / 沙盒
      'valheim.exe',
      'valheim', // Valheim
      'RustClient.exe', // Rust
      'Palworld-Win64-Shipping.exe', // Palworld 幻兽帕鲁
    ],
    category: 'game',
  },
  {
    id: 'epic',
    labelKey: 'epic',
    emoji: '🎮',
    iconUrl:
      'https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/07Game/epicgames.png',
    geositeTags: ['epicgames'],
    processNames: [
      'EpicGamesLauncher',
      'EpicGamesLauncher.exe',
      'EpicWebHelper.exe',
      'FortniteClient-Win64-Shipping.exe',
      'UnrealEngineLauncher.exe',
    ],
    category: 'game',
  },
  {
    id: 'riot',
    labelKey: 'riot',
    emoji: '⚔️',
    iconUrl: 'https://raw.githubusercontent.com/lige47/QuanX-icon-rule/main/icon/07Game/riot.png',
    geositeTags: ['riot'],
    processNames: [
      'RiotClientServices.exe',
      'RiotClientServices',
      'LeagueClient.exe',
      'LeagueClient', // 英雄联盟客户端
      'League of Legends.exe',
      'League of Legends', // 英雄联盟游戏
      'VALORANT-Win64-Shipping.exe', // Valorant
      'LoR.exe', // Legends of Runeterra
    ],
    category: 'game',
  },
  {
    id: 'disney',
    labelKey: 'disney',
    emoji: '🏰',
    iconUrl: `${QURE_BASE}/Disney.png`,
    geositeTags: ['disney'],
    processNames: ['Disney+'],
    category: 'video',
  },
];

/** 根据 appId 快速查找预设（支持从用户自定义列表中查找） */
export function getAppPreset(
  appId: string,
  customPresets?: CustomAppPreset[]
): AppPreset | undefined {
  const builtin = APP_PRESETS.find((p) => p.id === appId);
  if (builtin) return builtin;

  if (customPresets) {
    const custom = customPresets.find((p) => p.id === appId);
    if (custom) {
      // 将 CustomAppPreset 转换为 AppPreset 兼容格式
      return {
        id: custom.id,
        labelKey: custom.name, // 自定义应用直接存储名称
        emoji: custom.emoji,
        iconUrl: custom.iconUrl,
        geositeTags: custom.geositeTags ?? [],
        geoipTags: custom.geoipTags,
        processNames: custom.processNames,
        category: 'tools', // 自定义应用默认归类到工具
      };
    }
  }

  return undefined;
}

/** 获取某个 category 下的所有预设 */
export function getAppPresetsByCategory(category: AppPreset['category']): AppPreset[] {
  return APP_PRESETS.filter((p) => p.category === category);
}
