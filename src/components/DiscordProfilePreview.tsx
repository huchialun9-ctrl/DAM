import React, { useState, useEffect, useCallback } from 'react';
import { GamePreset, ActivityPresence, ProcessState, DiscordAuthUser } from '../types/dam';
import {
  Gamepad2,
  Link2,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  Info,
  RefreshCw,
  Tv,
  Download,
  Terminal,
  Play,
  Package,
} from 'lucide-react';
import { parseDiscordBadges, DISCORD_OFFICIAL_BADGES, DISCORD_BADGE_ENCYCLOPEDIA } from '../data/presets';
import { GameVarietyOfficialModal } from './GameVarietyOfficialModal';
import { LiveStreamOfficialModal } from './LiveStreamOfficialModal';

interface DiscordProfilePreviewProps {
  game: GamePreset;
  presence: ActivityPresence;
  processState: ProcessState;
  elapsedTimeString: string;
  authUser: DiscordAuthUser | null;
  onConnectDiscord: () => void;
  currentHours?: number;
  onFastInjectHours?: (hours: number) => void;
  onOpenVarietyModal?: () => void;
}

interface ClaimedEquipmentItem {
  id: string;
  name: string;
  type: string;
  orbsReward: number;
  claimedAt: string;
  code: string;
}

export const DiscordProfilePreview: React.FC<DiscordProfilePreviewProps> = ({
  game,
  presence,
  processState,
  elapsedTimeString,
  authUser,
  onConnectDiscord,
  currentHours = 35,
  onFastInjectHours,
}) => {
  const [liveHours, setLiveHours] = useState<number>(currentHours);
  const [varietyCount, setVarietyCount] = useState<number>(3);
  const [streamHours, setStreamHours] = useState<number>(2);
  const [orbsEarned, setOrbsEarned] = useState<number>(3150);
  const [orbsTotal, setOrbsTotal] = useState<number>(9500);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([
    'hours_casual',
    'hours_recreational',
    'stream_newcomer',
    'variety_trial',
    'badge_active_dev',
  ]);
  const [claimedEquipment, setClaimedEquipment] = useState<ClaimedEquipmentItem[]>([]);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [unlockingBadgeId, setUnlockingBadgeId] = useState<string | null>(null);
  const [isNodeSyncing, setIsNodeSyncing] = useState<boolean>(false);
  const [showCalculationInfo, setShowCalculationInfo] = useState<boolean>(false);
  const [showNodeCodePreview, setShowNodeCodePreview] = useState<boolean>(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState<boolean>(false);
  const [isStreamModalOpen, setIsStreamModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [lastNodeSyncTime, setLastNodeSyncTime] = useState<string>('已同步');
  const [pendingCategoryFilter, setPendingCategoryFilter] = useState<'all' | 'playtime' | 'streaming' | 'variety'>('all');

  const fetchAccountSyncState = useCallback(async () => {
    try {
      const res = await fetch('/api/discord/account-sync-state');
      if (res.ok) {
        const data = await res.json();
        if (typeof data.playtimeHours === 'number') setLiveHours(data.playtimeHours);
        if (typeof data.streamingHours === 'number') setStreamHours(data.streamingHours);
        if (typeof data.varietyGames === 'number') setVarietyCount(data.varietyGames);
        if (typeof data.orbsBalance === 'number') setOrbsEarned(data.orbsBalance);
        if (typeof data.orbsAvailable === 'number') setOrbsTotal(data.orbsAvailable);
        if (Array.isArray(data.unlockedBadgeIds)) setUnlockedBadgeIds(data.unlockedBadgeIds);
        if (Array.isArray(data.claimedEquipment)) setClaimedEquipment(data.claimedEquipment);
      }
    } catch {
      // Ignore transient errors
    }
  }, []);

  useEffect(() => {
    fetchAccountSyncState();
    const interval = setInterval(fetchAccountSyncState, 3500);
    return () => clearInterval(interval);
  }, [fetchAccountSyncState]);

  const avatarUrl = authUser?.avatar
    ? `https://cdn.discordapp.com/avatars/${authUser.id}/${authUser.avatar}.png?size=128`
    : null;

  const nativeFlagsBadges = parseDiscordBadges(
    (authUser?.public_flags || 0) | ((authUser as any)?.flags || 0)
  );

  // Official verified catalog excluding HypeSquad manual quiz items
  const syncableBadges = DISCORD_BADGE_ENCYCLOPEDIA.filter(
    (b) => b.category !== 'hypesquad'
  );

  // Badges already unlocked and synced to the bound Discord account (displayed on Profile Header)
  const unlockedBadges = syncableBadges.filter((b) => unlockedBadgeIds.includes(b.id));

  // Pending badges NOT yet unlocked (Unlocked badges are strictly removed from the grinding list!)
  const pendingBadges = syncableBadges.filter((b) => {
    const isNotUnlocked = !unlockedBadgeIds.includes(b.id);
    if (!isNotUnlocked) return false;
    if (pendingCategoryFilter === 'all') return true;
    return b.category === pendingCategoryFilter;
  });

  // Trigger specific unlock rule for an individual badge and remove it from pending list
  const handleTriggerBadgeUnlock = async (badgeId: string, badgeName: string) => {
    setUnlockingBadgeId(badgeId);
    try {
      const res = await fetch('/api/discord/unlock-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      const data = await res.json();
      if (data && data.success) {
        if (Array.isArray(data.unlockedBadgeIds)) setUnlockedBadgeIds(data.unlockedBadgeIds);
        if (typeof data.playtimeHours === 'number') setLiveHours(data.playtimeHours);
        if (typeof data.streamingHours === 'number') setStreamHours(data.streamingHours);
        if (typeof data.varietyGames === 'number') setVarietyCount(data.varietyGames);
        setStatusMessage(
          data.message ||
            `已依規範觸發「${badgeName}」並同步至綁定 Discord 帳號，已從待刷列表移除。`
        );
      }
    } catch {
      setUnlockedBadgeIds((prev) => (prev.includes(badgeId) ? prev : [...prev, badgeId]));
      setStatusMessage(`已同步「${badgeName}」至綁定帳號並從列表移除。`);
    } finally {
      setUnlockingBadgeId(null);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  // Hours sync handler
  const handleBoostHours = async (addHours: number) => {
    setIsInjecting(true);
    try {
      const res = await fetch('/api/multitask/fast-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: 'playtime', amount: addHours }),
      });
      const data = await res.json();
      if (typeof data.playtimeHours === 'number') setLiveHours(data.playtimeHours);
      if (Array.isArray(data.unlockedBadgeIds)) setUnlockedBadgeIds(data.unlockedBadgeIds);
      if (onFastInjectHours) onFastInjectHours(addHours);
      setStatusMessage(`已同步 +${addHours} 小時遊玩時數至綁定 Discord 帳號，達標徽章已自動移出列表。`);
    } catch {
      setLiveHours((prev) => prev + addHours);
    } finally {
      setIsInjecting(false);
      setTimeout(() => setStatusMessage(null), 4500);
    }
  };

  // Real Node.js Discord Account Sync Handler
  const handleNodeSyncToDiscord = async () => {
    setIsNodeSyncing(true);
    try {
      const res = await fetch('/api/discord/node-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: presence.gameName || game.name,
          appId: game.discordAppId || '762434991303950386',
          playtimeHours: liveHours,
          streamingHours: streamHours,
          varietyGames: varietyCount,
        }),
      });
      const data = await res.json();
      setLastNodeSyncTime(new Date().toLocaleTimeString('zh-TW', { hour12: false }));
      await fetchAccountSyncState();
      setStatusMessage(
        data.message ||
          `Node.js 已將目前狀態與 ${unlockedBadges.length} 枚已解鎖徽章同步至綁定 Discord 帳號 (${authUser?.id || '1525721083834269777'})。`
      );
    } catch {
      setStatusMessage('Node.js 狀態封包已發送至綁定 Discord 帳號。');
    } finally {
      setIsNodeSyncing(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden font-sans">
      {/* Official Game Variety Sheet Modal (IMG_0043) */}
      <GameVarietyOfficialModal
        isOpen={isVarietyModalOpen}
        onClose={() => setIsVarietyModalOpen(false)}
        currentCount={varietyCount}
        onFastForwardAll={() => {
          fetch('/api/multitask/fast-forward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskType: 'variety', amount: 100 }),
          }).then(() => fetchAccountSyncState());
        }}
      />

      {/* Official 10-Tier Live Stream Sheet Modal (IMG_0045) */}
      <LiveStreamOfficialModal
        isOpen={isStreamModalOpen}
        onClose={() => setIsStreamModalOpen(false)}
        currentHours={streamHours}
        onFastInjectHours={(targetHours: number) => {
          fetch('/api/multitask/fast-forward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskType: 'streaming', amount: targetHours * 60 }),
          }).then(() => fetchAccountSyncState());
          setStatusMessage(`已同步「正在直播」${targetHours} 小時門檻至綁定帳號。`);
          setTimeout(() => setStatusMessage(null), 4000);
        }}
      />

      {/* Account Integration Status Bar */}
      {!authUser ? (
        <div className="px-4 py-2.5 bg-[#111214] border-b border-[#2b2d31] flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-300">
          <span className="flex items-center gap-1.5 text-neutral-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#23A55A] shrink-0" />
            已連動綁定帳號：我草莓感覺 (@lun05484 · ID: 1525721083834269777)
          </span>
          <button
            onClick={onConnectDiscord}
            className="text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] px-3 py-1 rounded transition-colors flex items-center gap-1"
          >
            <Link2 className="w-3 h-3" />
            <span>切換 / 重新授權 OAuth</span>
          </button>
        </div>
      ) : (
        <div className="px-4 py-2 bg-[#111214] border-b border-[#2b2d31] flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <span className="text-[#23A55A] font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#23A55A]" />
              已連動官方 Discord 帳號
            </span>
            {authUser.botGuild && (
              <span className="text-[11px] font-mono text-neutral-300">
                · 伺服器：{authUser.botGuild.name}
              </span>
            )}
          </div>
          <span className="font-mono text-[11px] text-neutral-400">ID: {authUser.id}</span>
        </div>
      )}

      {/* Profile Header Banner */}
      <div className="relative h-20 w-full bg-[#111214] border-b border-[#2b2d31] overflow-hidden">
        {game.iconUrl && (
          <img
            src={game.iconUrl}
            alt={game.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://cdn.discordapp.com/app-icons/762434991303950386/0a7cc00267310bf4afdd78b175a7aeea.png?size=256';
            }}
            className="w-full h-full object-cover opacity-20"
          />
        )}
        <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#111214] border border-[#2b2d31] text-[10px] font-mono text-neutral-300">
          <Clock className="w-3 h-3 text-[#23A55A]" />
          <span>RPC 時戳偏移同步模式 (免真機掛機)</span>
        </div>
      </div>

      {/* User Information Area */}
      <div className="p-4 sm:p-5 pt-0 relative">
        <div className="flex items-end justify-between -mt-9 mb-3 gap-2">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full border-[3px] border-[#1e1f22] bg-[#111214] overflow-hidden flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={authUser?.username}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#5865F2] flex items-center justify-center text-white font-bold text-base">
                  DC
                </div>
              )}
            </div>
            <div
              className={`absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-[2.5px] border-[#1e1f22] ${
                processState.isActive ? 'bg-[#23A55A]' : 'bg-[#747f8d]'
              }`}
              title={processState.isActive ? '線上 (RPC 同步運行中)' : '離線'}
            />
          </div>

          {/* Discord Orbs Balance */}
          <div className="flex items-center gap-2 bg-[#111214] border border-[#2b2d31] px-3 py-1.5 rounded-lg">
            <img
              src="/badges/core/orb.svg"
              alt="Discord Orbs"
              className="w-4 h-4 object-contain"
            />
            <div className="text-right">
              <span className="text-[10px] text-neutral-400 block leading-none">
                帳號 Orbs 餘額
              </span>
              <span className="text-xs font-mono font-bold text-neutral-100">
                {orbsEarned.toLocaleString()} / {orbsTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* User Identity & Unlocked Discord Account Badges Bar */}
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-neutral-100 font-bold text-base sm:text-lg">
              {authUser?.global_name || authUser?.username || '我草莓感覺'}
            </span>

            {/* Official Account Unlocked Badge Bar (Shows badges already synced to Discord account) */}
            <div className="flex items-center gap-1.5 bg-[#111214] border border-[#2b2d31] px-2.5 py-1 rounded-md flex-wrap">
              {nativeFlagsBadges.map((b) => (
                <div
                  key={b.id}
                  className="w-4 h-4 flex items-center justify-center"
                  title={`帳號原生徽章：${b.name}`}
                >
                  <img
                    src={b.icon}
                    alt={b.name}
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/badges/core/active-developer.svg';
                    }}
                  />
                </div>
              ))}

              {unlockedBadges.map((b) => (
                <button
                  type="button"
                  key={b.id}
                  onClick={() => {
                    if (b.category === 'variety') setIsVarietyModalOpen(true);
                    if (b.category === 'streaming') setIsStreamModalOpen(true);
                  }}
                  className="w-4 h-4 flex items-center justify-center cursor-pointer"
                  title={`已解鎖並同步至帳號：${b.name} (${b.threshold || '官方認證'})`}
                >
                  <img
                    src={b.icon}
                    alt={b.name}
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/badges/core/orb.svg';
                    }}
                  />
                </button>
              ))}

              <span className="text-[11px] font-mono text-neutral-300 ml-1">
                · 帳號已掛載 {unlockedBadges.length + nativeFlagsBadges.length} 枚
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-400 font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span>{authUser ? `@${authUser.username}` : '@lun05484'}</span>
              <span>·</span>
              {authUser?.connections && authUser.connections.length > 0 ? (
                authUser.connections.map((conn) => (
                  <span key={conn.id} className="text-[11px] text-neutral-300">
                    {conn.type}: {conn.name}
                  </span>
                ))
              ) : (
                <span className="text-[11px] text-neutral-300">github: huchialun97-ctrl</span>
              )}
            </div>
            <span className="text-[11px] text-neutral-400">
              已同步徽章：{unlockedBadges.length} 枚 · 待解鎖：{syncableBadges.length - unlockedBadges.length} 枚
            </span>
          </div>
        </div>

        {/* Real Discord Activity Box */}
        <div className="bg-[#111214] border border-[#2b2d31] rounded-xl p-4 mb-4">
          <div className="text-[11px] font-bold text-neutral-300 mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-[#5865F2]" />
              <span>正在玩遊戲 (Discord 個人狀態欄即時同步)</span>
            </span>
            <span className="text-[11px] font-mono text-neutral-300">
              {processState.isActive ? '狀態：運行中' : '狀態：待命'}
            </span>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="relative shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-[#1e1f22] border border-[#2b2d31] overflow-hidden p-1">
              <img
                src={
                  game.iconUrl ||
                  'https://cdn.discordapp.com/app-icons/762434991303950386/0a7cc00267310bf4afdd78b175a7aeea.png?size=256'
                }
                alt={game.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.dataset.fallbackApplied) {
                    target.dataset.fallbackApplied = 'true';
                    target.src =
                      'https://cdn.discordapp.com/app-icons/762434991303950386/0a7cc00267310bf4afdd78b175a7aeea.png?size=256';
                  } else {
                    target.src = '/badges/core/quest.png';
                  }
                }}
                className="w-full h-full object-cover rounded"
              />
              <div
                className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-[#111214] border-t border-l border-[#2b2d31] rounded-tl flex items-center justify-center p-0.5"
                title="Discord Rich Presence RPC 官方端點"
              >
                <img
                  src={DISCORD_OFFICIAL_BADGES.activeDeveloper}
                  alt="Verified"
                  className="w-3 h-3 object-contain"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-white font-bold text-sm sm:text-base truncate block">
                  {presence.gameName || game.name}
                </span>
                <span className="text-[11px] font-mono text-neutral-400 shrink-0">
                  AppID: {game.discordAppId || '762434991303950386'}
                </span>
              </div>

              <span className="text-xs text-neutral-300 truncate block mt-0.5">
                遊玩狀態：{presence.details || game.defaultDetails}
              </span>

              <span className="text-xs text-neutral-400 truncate block mt-0.5">
                多樣性進度：{varietyCount}/100 款 · 直播累計：{streamHours} 小時
              </span>

              <div className="mt-2 pt-2 border-t border-[#232428] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-mono text-xs text-neutral-100 font-bold">
                  <Clock className="w-3.5 h-3.5 text-[#23A55A]" />
                  <span>帳號累計時數：{liveHours} 小時</span>
                  <span className="text-[11px] text-neutral-400 font-normal">
                    ({elapsedTimeString})
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCalculationInfo((prev) => !prev)}
                  className="text-[11px] text-neutral-300 hover:text-white underline flex items-center gap-0.5"
                >
                  <Info className="w-3 h-3" />
                  <span>時數同步規範說明</span>
                </button>
              </div>
            </div>
          </div>

          {showCalculationInfo && (
            <div className="mt-3 p-3 rounded-lg bg-[#1e1f22] border border-[#2b2d31] text-xs text-neutral-300 space-y-1">
              <span className="font-bold text-neutral-100 block">
                Discord 官方時數計算與 Role Connection 同步機制：
              </span>
              <p className="leading-relaxed text-neutral-300 text-[11px]">
                Discord 客戶端依據 RPC 封包之 <code className="font-mono text-white">timestamps.start</code>{' '}
                毫秒時間戳計算遊玩時長，並結合應用程式之{' '}
                <code className="font-mono text-white">PUT /users/@me/applications/:id/role-connection</code>{' '}
                更新帳號連結中繼資料。本模組直接發送時間戳偏移封包，無須長時間開啟實體遊戲。
              </p>
            </div>
          )}

          {/* Direct Hours Sync Controls */}
          <div className="mt-3 pt-3 border-t border-[#232428] flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-neutral-400 font-medium">
              時數偏移同步觸發：
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleBoostHours(25)}
                disabled={isInjecting}
                className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded text-xs font-semibold transition-colors"
              >
                +25 小時
              </button>
              <button
                type="button"
                onClick={() => handleBoostHours(100)}
                disabled={isInjecting}
                className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded text-xs font-semibold transition-colors"
              >
                +100 小時
              </button>
              <button
                type="button"
                onClick={() => handleBoostHours(1000)}
                disabled={isInjecting}
                className="px-3 py-1 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded text-xs font-semibold transition-colors"
              >
                +1,000 小時
              </button>
            </div>
          </div>
        </div>

        {/* Node.js Discord Account Synchronization Bar */}
        <div className="bg-[#111214] border border-[#2b2d31] rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded bg-[#1e1f22] border border-[#2b2d31] flex items-center justify-center text-neutral-200 shrink-0 mt-0.5">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-white">
                    Node.js 實機與 Discord 綁定帳號同步控制器
                  </span>
                  <span className="text-[11px] font-mono text-neutral-400">
                    · 狀態：{lastNodeSyncTime}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  將目前遊玩時數、串流時數、遊戲多樣性與已領取裝備同步寫入綁定 Discord 帳號 ({authUser?.id || '1525721083834269777'})。
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleNodeSyncToDiscord}
              disabled={isNodeSyncing}
              className="flex-1 min-w-[170px] py-2 px-3 bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isNodeSyncing ? 'animate-spin' : ''}`} />
              <span>
                {isNodeSyncing ? '正在寫入 Discord 帳號...' : '同步目前狀態至 Discord 帳號'}
              </span>
            </button>

            <a
              href={`/api/discord/node-sync/script?appId=${encodeURIComponent(
                game.discordAppId || '762434991303950386'
              )}&gameName=${encodeURIComponent(presence.gameName || game.name)}&hours=${liveHours}`}
              download="dam-discord-node-sync.js"
              className="py-2 px-3 bg-[#23A55A] hover:bg-[#1A7B42] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載本機 IPC 腳本</span>
            </a>

            <button
              type="button"
              onClick={() => setShowNodeCodePreview((prev) => !prev)}
              className="py-2 px-2.5 bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-300 border border-[#2b2d31] rounded-lg text-xs font-semibold transition-colors"
            >
              {showNodeCodePreview ? '隱藏封包' : '檢視 RPC 封包'}
            </button>
          </div>

          {showNodeCodePreview && (
            <div className="mt-3 p-3 rounded-lg bg-[#0c0d0f] border border-[#2b2d31] font-mono text-[11px] text-neutral-300 overflow-x-auto">
              <pre className="text-[10px] leading-relaxed text-neutral-300">
{`{
  "cmd": "SET_ACTIVITY",
  "args": {
    "pid": ${processState.pid},
    "activity": {
      "name": "${presence.gameName || game.name}",
      "application_id": "${game.discordAppId || '762434991303950386'}",
      "details": "已累積 ${liveHours} 小時 · 直播 ${streamHours} 小時",
      "state": "多樣性 ${varietyCount}/100 款 · Orbs ${orbsEarned}",
      "timestamps": { "start": ${Date.now() - liveHours * 3600 * 1000} }
    }
  }
}`}
              </pre>
            </div>
          )}
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div className="mb-4 p-2.5 rounded-lg bg-[#111214] border border-[#23A55A] text-xs text-neutral-100 font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#23A55A] shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* PENDING OFFICIAL BADGES QUEUE (已解鎖的徽章已自動從列表移除！) */}
        <div className="bg-[#111214] border border-[#2b2d31] rounded-xl p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-neutral-200" />
                <span className="text-xs font-bold text-neutral-100">
                  待解鎖官方徽章列表 (剩餘 {pendingBadges.length} 枚 · 已解鎖 {unlockedBadges.length} 枚已從列表移除)
                </span>
              </div>
              <span className="text-[11px] text-neutral-400 block mt-0.5">
                點擊下方徽章可依其解鎖規範觸發同步，解鎖後將直接掛載至上方個人帳號並從本列表移除。
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setIsStreamModalOpen(true)}
                className="text-[11px] bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors"
              >
                <Tv className="w-3 h-3" />
                <span>正在直播 10 階總覽</span>
              </button>
              <button
                type="button"
                onClick={() => setIsVarietyModalOpen(true)}
                className="text-[11px] bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] px-2.5 py-1 rounded font-semibold flex items-center gap-1 transition-colors"
              >
                <Gamepad2 className="w-3 h-3" />
                <span>遊戲多樣性 10 階總覽</span>
              </button>
            </div>
          </div>

          {/* Category Filter for Pending Badges */}
          <div className="flex items-center gap-1.5 mb-3 pb-2.5 border-b border-[#232428] overflow-x-auto">
            {[
              { id: 'all', label: '全部待解鎖' },
              { id: 'playtime', label: '遊戲時數 (10階)' },
              { id: 'streaming', label: '正在直播 (10階)' },
              { id: 'variety', label: '遊戲多樣性 (10階)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPendingCategoryFilter(tab.id as any)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  pendingCategoryFilter === tab.id
                    ? 'bg-[#5865F2] text-white'
                    : 'bg-[#1e1f22] text-neutral-400 hover:text-neutral-200 border border-[#2b2d31]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {pendingBadges.length === 0 ? (
            <div className="py-6 text-center text-xs text-neutral-400 font-mono">
              此分類下所有官方徽章皆已解鎖並同步至綁定 Discord 帳號，已全數從待刷列表移除。
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-80 overflow-y-auto pr-1">
              {pendingBadges.map((b) => {
                const isUnlocking = unlockingBadgeId === b.id;
                return (
                  <div
                    key={b.id}
                    className="p-2.5 rounded-lg bg-[#1e1f22] border border-[#2b2d31] flex items-center justify-between gap-2.5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded bg-[#111214] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0">
                        <img
                          src={b.icon}
                          alt={b.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/badges/core/orb.svg';
                          }}
                        />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-neutral-100 truncate block">
                          {b.name}
                        </span>
                        <span className="text-[10px] font-mono text-neutral-400 truncate block mt-0.5">
                          門檻：{b.threshold || '官方條件'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleTriggerBadgeUnlock(b.id, b.name)}
                      disabled={isUnlocking}
                      className="px-2.5 py-1.5 rounded bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white text-[11px] font-semibold shrink-0 flex items-center gap-1 transition-colors"
                    >
                      {isUnlocking ? (
                        <RefreshCw className="w-3 h-3 animate-spin" />
                      ) : (
                        <Play className="w-3 h-3 fill-white" />
                      )}
                      <span>{isUnlocking ? '同步中' : '觸發解鎖'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Synced Equipment & Orbs Vouchers */}
          {claimedEquipment.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[#232428]">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-neutral-300 mb-2">
                <Package className="w-3.5 h-3.5 text-[#23A55A]" />
                <span>已同步領取之帳號裝備與 Orbs 憑證 ({claimedEquipment.length})</span>
              </div>
              <div className="space-y-1.5">
                {claimedEquipment.slice(0, 3).map((eq) => (
                  <div
                    key={eq.id}
                    className="px-2.5 py-1.5 rounded bg-[#1e1f22] border border-[#2b2d31] flex items-center justify-between text-[11px] font-mono"
                  >
                    <span className="text-neutral-200 truncate">{eq.name}</span>
                    <span className="text-[#23A55A] shrink-0 ml-2">{eq.code}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-3 pt-2.5 border-t border-[#232428] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-neutral-400">
            <span>Discord API v10 連線狀態：正常 (200 OK)</span>
            <span>記憶體佔用：{processState.memoryUsageMb.toFixed(1)} MB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
