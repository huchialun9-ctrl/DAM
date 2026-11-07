import React, { useState, useEffect } from 'react';
import { DeveloperBadgeConfig } from '../types/dam';
import { DISCORD_OFFICIAL_BADGES } from '../data/presets';
import {
  Shield,
  Key,
  Clock,
  Shuffle,
  Send,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';

interface BadgeMaintainerModuleProps {
  config: DeveloperBadgeConfig;
  onUpdateConfig: (config: Partial<DeveloperBadgeConfig>) => void;
  onTriggerPing: () => void;
  isPinging: boolean;
  lastPingResponse: string | null;
  authUser?: import('../types/dam').DiscordAuthUser | null;
}

export const BadgeMaintainerModule: React.FC<BadgeMaintainerModuleProps> = ({
  config,
  onUpdateConfig,
  onTriggerPing,
  isPinging,
  lastPingResponse,
  authUser,
}) => {
  const [showToken, setShowToken] = useState(false);
  const [verifyingBot, setVerifyingBot] = useState(false);
  const [botVerifyResult, setBotVerifyResult] = useState<{
    success: boolean;
    commandsCount?: number;
    message: string;
  } | null>(null);

  const [timeRemaining, setTimeRemaining] = useState({
    days: 30,
    hours: 0,
    minutes: 0,
    seconds: 0,
    percent: 100,
  });

  useEffect(() => {
    const updateCountdown = () => {
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      const elapsed = Date.now() - config.lastPingTimestamp;
      const remainingMs = Math.max(0, thirtyDaysMs - elapsed);

      const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
      const hours = Math.floor(
        (remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000)
      );
      const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remainingMs % (60 * 1000)) / 1000);
      const percent = Math.max(0, Math.min(100, (remainingMs / thirtyDaysMs) * 100));

      setTimeRemaining({ days, hours, minutes, seconds, percent });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [config.lastPingTimestamp]);

  // Real backend call to verify Bot via Discord REST API v10
  const handleVerifyBotAPI = async () => {
    if (!config.appId) return;
    setVerifyingBot(true);
    setBotVerifyResult(null);

    try {
      const res = await fetch('/api/discord/verify-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: config.appId,
          botToken: config.botToken,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBotVerifyResult({
          success: true,
          commandsCount: data.commandsCount,
          message: `連線成功：已於 Discord API Gateway 驗證 ${data.commandsCount} 項註冊指令。`,
        });
      } else {
        setBotVerifyResult({
          success: false,
          message: data.message || '連線受阻，請檢查 Application ID 或 Token 權限。',
        });
      }
    } catch (err: any) {
      setBotVerifyResult({
        success: false,
        message: `API 連線異常：${err.message}`,
      });
    } finally {
      setVerifyingBot(false);
    }
  };

  const isWarning = timeRemaining.days < 7;
  const isCritical = timeRemaining.days < 2;

  return (
    <div className="space-y-6 font-sans">
      {/* Module Title Banner */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
              活躍開發者憑證維護器 (Active Developer Maintainer)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl leading-relaxed">
              配合 Discord REST API v10 官方端點，常態化維護 30 天內斜線指令（Slash Command）活躍記錄，內建動態隨機延遲（Jitter Delay）規避固定頻率存取風控。
            </p>
          </div>
        </div>

        <a
          href="https://discord.com/developers/active-developer"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all shrink-0 shadow-sm"
        >
          <span>官方勳章領取審查</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Official Badge Status & 30-Day Countdown */}
        <div className="md:col-span-5 bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 flex flex-col justify-between shadow-sm">
          <div>
            {/* Discord Official Badge Graphic */}
            <div className="flex items-center gap-3.5 pb-4 border-b border-[#2b2d31]">
              <div className="w-14 h-14 rounded-xl bg-[#111214] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0 shadow-sm">
                <img
                  src={DISCORD_OFFICIAL_BADGES.activeDeveloper}
                  alt="Active Developer Badge"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <span className="text-sm font-bold text-neutral-100 block">
                  Active Developer Badge
                </span>
                <span className="text-xs text-neutral-400 block mt-0.5">
                  活躍開發者官方認證勳章
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-[#23A55A] animate-pulse" />
                  <span className="text-[11px] font-mono text-[#23A55A] font-semibold">
                    有效保留中 (Valid)
                  </span>
                </div>
              </div>
            </div>

            {/* Connected Bot Guild Banner */}
            {authUser?.botGuild && (
              <div className="mt-4 p-3 bg-[#111214] border border-[#5865F2]/40 rounded-xl flex items-center justify-between gap-3 shadow-inner">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono font-bold text-[#5865F2] block uppercase tracking-wider">
                    已綁定伺服器 · Bot 授權就緒
                  </span>
                  <span className="text-xs font-bold text-neutral-100 block truncate mt-0.5">
                    {authUser.botGuild.name}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#23A55A] bg-[#23A55A]/15 border border-[#23A55A]/30 px-2 py-0.5 rounded-full shrink-0">
                  管理員權限 (8)
                </span>
              </div>
            )}

            {/* Countdown Clock */}
            <div className="mt-5 space-y-2">
              <span className="text-xs text-neutral-400 block font-medium">
                距離官方 30 天互動資格失效倒數
              </span>

              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-100 block">
                    {timeRemaining.days}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">天</span>
                </div>
                <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-100 block">
                    {timeRemaining.hours}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">小時</span>
                </div>
                <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-100 block">
                    {timeRemaining.minutes}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">分</span>
                </div>
                <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5">
                  <span className="text-xl sm:text-2xl font-bold font-mono text-neutral-100 block">
                    {timeRemaining.seconds}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">秒</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#111214] rounded-full overflow-hidden mt-3 border border-[#2b2d31]">
                <div
                  className={`h-full transition-all duration-300 ${
                    isCritical
                      ? 'bg-[#DA373C]'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-[#23A55A]'
                  }`}
                  style={{ width: `${timeRemaining.percent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-neutral-400 font-mono pt-1">
                <span>上次指令上報</span>
                <span className="text-neutral-200">
                  {new Date(config.lastPingTimestamp).toLocaleDateString('zh-TW')}
                </span>
              </div>
            </div>
          </div>

          {/* Manual Ping Action */}
          <div className="mt-5 pt-4 border-t border-[#2b2d31]">
            <button
              onClick={onTriggerPing}
              disabled={isPinging}
              className="w-full py-2.5 px-4 text-xs font-bold rounded-md bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-all shadow-sm"
            >
              {isPinging ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>正在向 Discord 發送指令封包...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>立即發送斜線指令 (重置 30 天週期)</span>
                </>
              )}
            </button>
            {lastPingResponse && (
              <p className="mt-2.5 text-[11px] text-[#23A55A] font-mono bg-[#111214] p-2.5 rounded-lg border border-[#23A55A]/30 leading-relaxed">
                {lastPingResponse}
              </p>
            )}
          </div>
        </div>

        {/* Right Column: Credentials & API Settings */}
        <div className="md:col-span-7 bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#2b2d31]">
            <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2">
              <Key className="w-4 h-4 text-[#5865F2]" />
              Discord 開發者應用端點設定
            </h3>
            <span className="text-[11px] text-neutral-400 font-mono">
              純本地安全儲存 (No Cloud)
            </span>
          </div>

          {/* Application ID (prefilled from screenshot) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
              用戶端 ID (Client ID / Application ID) *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="例如：1566690710961524836"
                value={config.appId}
                onChange={(e) => onUpdateConfig({ appId: e.target.value.trim() })}
                className="flex-1 bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-[#5865F2]"
              />
              <button
                type="button"
                onClick={handleVerifyBotAPI}
                disabled={verifyingBot}
                className="px-3.5 py-2 text-xs font-semibold bg-[#2b2d31] hover:bg-[#35373c] text-neutral-100 border border-[#3f4147] rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 shadow-sm"
              >
                {verifyingBot ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#23A55A]" />
                )}
                <span>連線檢驗</span>
              </button>
            </div>
            {botVerifyResult && (
              <p
                className={`mt-2 text-xs font-mono p-2 rounded-md ${
                  botVerifyResult.success
                    ? 'text-[#23A55A] bg-[#23A55A]/10 border border-[#23A55A]/20'
                    : 'text-amber-400 bg-amber-500/10 border border-amber-500/20'
                }`}
              >
                {botVerifyResult.message}
              </p>
            )}
          </div>

          {/* Bot Token */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-neutral-300">
                Bot Token (機器人授權憑證)
              </label>
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-neutral-400 hover:text-neutral-200 flex items-center gap-1"
              >
                {showToken ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showToken ? '隱藏憑證' : '顯示'}</span>
              </button>
            </div>
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="Bot Token..."
              value={config.botToken}
              onChange={(e) => onUpdateConfig({ botToken: e.target.value.trim() })}
              className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-[#5865F2]"
            />
            <span className="text-[11px] text-neutral-500 mt-1 block">
              憑證僅暫存於使用者本機瀏覽器 localStorage，絕不發送給非 Discord 官方伺服器。
            </span>
          </div>

          {/* Automation Scheduler & Jitter */}
          <div className="pt-3 border-t border-[#2b2d31] space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-200 block">
                  常態自動維護排程
                </span>
                <span className="text-[11px] text-neutral-400 block">
                  系統常駐時於指定週期自動調度斜線指令
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.autoPingEnabled}
                onChange={(e) => onUpdateConfig({ autoPingEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-[#3f4147] bg-[#111214] text-[#5865F2] focus:ring-0 accent-[#5865F2]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  排程間隔天數
                </label>
                <select
                  value={config.pingIntervalDays}
                  onChange={(e) =>
                    onUpdateConfig({ pingIntervalDays: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-[#5865F2]"
                >
                  <option value={3}>每 3 天</option>
                  <option value={7}>每 7 天 (推薦)</option>
                  <option value={14}>每 14 天</option>
                  <option value={25}>每 25 天 (極限)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                  隨機浮動 (Jitter Delay)
                </label>
                <select
                  value={config.jitterPercent}
                  onChange={(e) =>
                    onUpdateConfig({ jitterPercent: parseInt(e.target.value) })
                  }
                  className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-[#5865F2]"
                >
                  <option value={0}>無浮動 (整點)</option>
                  <option value={10}>±10% (±16小時)</option>
                  <option value={20}>±20% (±33小時 · 推薦)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
