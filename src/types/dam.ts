export interface RealDiscordBadge {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface DiscordAuthUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email?: string;
  flags?: number;
  public_flags?: number;
  banner?: string | null;
  accent_color?: number | null;
  botGuild?: {
    id: string;
    name: string;
    icon: string | null;
    permissions?: string;
  } | null;
  connections?: Array<{
    id: string;
    name: string;
    type: string;
    verified: boolean;
  }>;
  guildsCount?: number;
  realBadges?: RealDiscordBadge[];
}

export interface ScheduleTask {
  id: string;
  name: string;
  category: 'database' | 'developer' | 'quest' | 'variety' | 'playtime';
  icon: string;
  estimatedDuration: string;
  status: 'scheduled' | 'ready' | 'completed';
  statusLabel: string;
  completionDate: string;
  claimedCode?: string;
  actionLabel: string;
  actionEndpoint: string;
  isFastInjectable: boolean;
  description: string;
}

export interface GamePreset {
  id: string;
  name: string;
  executableName: string;
  discordAppId: string;
  category: string;
  defaultDetails: string;
  defaultState: string;
  installSizeGb: number;
  iconUrl: string;
  largeImageKey: string;
  largeImageText: string;
  smallImageKey?: string;
  smallImageText?: string;
}

export interface ProcessState {
  isActive: boolean;
  pid: number;
  processName: string;
  targetGameId: string;
  customGameName?: string;
  customExecutable?: string;
  customAppId?: string;
  memoryUsageMb: number;
  cpuUsagePercent: number;
  threadCount: number;
  startTime: number | null;
  elapsedSeconds: number;
  ipcStatus: 'connected' | 'reconnecting' | 'disconnected' | 'idle';
  stealthMode: boolean;
  officialMetadataSynced: boolean;
}

export interface ActivityPresence {
  gameName: string;
  details: string;
  state: string;
  partySize: number;
  partyMax: number;
  showParty: boolean;
  showTimeElapsed: boolean;
  largeImageKey: string;
  largeImageText: string;
  smallImageKey: string;
  smallImageText: string;
  button1Label: string;
  button1Url: string;
  button2Label: string;
  button2Url: string;
}

export interface PlaytimeCalculation {
  currentHours: number;
  targetHours: number;
  hoursPerDay: number;
  remainingHours: number;
  daysToTarget: number;
  completionDate: string;
  kwhSaved: number;
  carbonSavedKg: number;
  costSavedTwd: number;
}

export interface DeveloperBadgeConfig {
  appId: string;
  publicKey: string;
  botToken: string;
  interactionWebhook: string;
  lastPingTimestamp: number;
  pingIntervalDays: number;
  jitterPercent: number;
  autoPingEnabled: boolean;
  status: 'valid' | 'warning' | 'expired';
}

export interface DiscordQuest {
  id: string;
  title: string;
  sponsor: string;
  reward: string;
  rewardType: 'item' | 'badge' | 'nitro_credit' | 'orbs';
  orbsReward?: number;
  questCategory?: 'orbs' | 'decoration' | 'item' | 'ingame';
  taskType?: 'PLAY_ON_DESKTOP' | 'STREAM_ON_DESKTOP' | 'WATCH_VIDEO';
  targetMinutes: number;
  progressMinutes: number;
  completed: boolean;
  claimedCode?: string;
  expiryDate: string;
  gameId: string;
  gameName?: string;
  discordAppId?: string;
  gameIconUrl?: string;
  rewardAssetUrl?: string;
  status: 'available' | 'streaming' | 'completed';
  streamHeartbeatsCount?: number;
  lastHeartbeatTimestamp?: number;
}

export interface QuestMonitorState {
  isRunning: boolean;
  pollIntervalMs: number;
  lastPollTimestamp: string | null;
  lastPollStatus: 'SUCCESS' | 'DEGRADED' | 'FAILED' | 'INITIALIZING';
  pingLatencyMs: number;
  activeStreamingCount: number;
  totalQuestsCount: number;
  completedCount: number;
  totalOrbsEarned?: number;
  totalOrbsAvailable?: number;
  autoCompleteFastMode: boolean;
  gatewayEndpoint: string;
  lastLogMessage: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'RPC' | 'WATCHDOG' | 'QUEST';
  module: 'MOD-01' | 'MOD-02' | 'MOD-03' | 'MOD-04' | 'MOD-05';
  message: string;
  meta?: Record<string, any>;
}

export interface WatchdogMetrics {
  clientDetected: boolean;
  pipeName: string;
  reconnectAttempts: number;
  lastHeartbeat: string;
  healthScore: number;
  networkLatencyMs: number;
}

export interface DiscordBadgeItem {
  id: string;
  name: string;
  category: 'playtime' | 'streaming' | 'variety' | 'developer' | 'quests' | 'hypesquad';
  tier?: number;
  threshold?: string;
  icon: string;
  officialCdnUrl?: string;
  cdnHash?: string;
  description: string;
  requirement: string;
  solution: string;
  canGrindAuto: boolean;
  actionLabel?: string;
  actionType?: 'active_dev' | 'universalist' | 'quest' | 'hours' | 'streaming';
  status: 'available' | 'in_progress' | 'claimed' | 'system';
  verified?: boolean;
  lastSynced?: string;
}

