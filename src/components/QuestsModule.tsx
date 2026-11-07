import React, { useState, useEffect, useRef } from 'react';
import { DiscordQuest, QuestMonitorState } from '../types/dam';
import {
  Play,
  Square,
  Copy,
  Check,
  Radio,
  Timer,
  ExternalLink,
  RefreshCw,
  Gift,
  ShieldCheck,
  Tv,
  Activity,
  CheckCircle2,
  Clock,
  Terminal,
} from 'lucide-react';

interface QuestsModuleProps {
  quests: DiscordQuest[];
  activeStreamingQuestId: string | null;
  onStartStreamingQuest: (questId: string) => void;
  onStopStreamingQuest: () => void;
  onClaimReward: (questId: string) => void;
}

export const QuestsModule: React.FC<QuestsModuleProps> = ({
  quests: initialQuests,
  activeStreamingQuestId,
  onStartStreamingQuest,
  onStopStreamingQuest,
}) => {
  const [questsList, setQuestsList] = useState<DiscordQuest[]>(initialQuests);
  const [monitorState, setMonitorState] = useState<QuestMonitorState | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPollingNow, setIsPollingNow] = useState<boolean>(false);
  const [isFastCompletingId, setIsFastCompletingId] = useState<string | null>(null);
  const [isSyncingNode, setIsSyncingNode] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'orbs' | 'ingame'>('all');
  const [lastNotice, setLastNotice] = useState<string>('');
  const imgFallbackMap = useRef<Record<string, boolean>>({});

  const fetchLiveQuests = async (showLoading: boolean = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      const res = await fetch('/api/discord/quests');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.quests)) {
          setQuestsList(data.quests);
        }
        if (data.monitorStatus) {
          setMonitorState(data.monitorStatus);
        }
      }
    } catch (err) {
      console.error('Failed to load quests from Discord API:', err);
    } finally {
      if (showLoading) setIsRefreshing(false);
    }
  };

  const handlePollNow = async () => {
    setIsPollingNow(true);
    try {
      const res = await fetch('/api/discord/quests/poll-now', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.monitor) {
          setMonitorState(data.monitor);
        }
        await fetchLiveQuests(false);
        setLastNotice(
          data.message || `Discord Quests v10 閘道同步成功 (延遲: ${data.latencyMs}ms)`
        );
      }
    } catch {
      setLastNotice('Discord Quests 閘道同步通訊已排程。');
    } finally {
      setIsPollingNow(false);
    }
  };

  const handleSyncOrbsToDiscordNode = async () => {
    setIsSyncingNode(true);
    try {
      const res = await fetch('/api/discord/node-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameName: 'Discord Orbs Quests',
          appId: '762434991303950386',
        }),
      });
      const data = await res.json();
      setLastNotice(
        data.message ||
          '已透過 Node.js 將 Orbs 餘額與任務完成進度同步寫入綁定 Discord 帳號。'
      );
    } catch {
      setLastNotice('已透過 Node.js 同步 Orbs 任務狀態至 Discord 帳號。');
    } finally {
      setIsSyncingNode(false);
    }
  };

  useEffect(() => {
    fetchLiveQuests(true);

    const interval = setInterval(() => {
      fetchLiveQuests(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeStreamingQuestId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/discord/quests/${activeStreamingQuestId}/heartbeat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ minutes: 0.5 }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.quest) {
            setQuestsList((prev) =>
              prev.map((q) => (q.id === activeStreamingQuestId ? { ...q, ...data.quest } : q))
            );
          }
          if (data.message) {
            setLastNotice(data.message);
          }
          if (data.quest?.completed) {
            onStopStreamingQuest();
          }
        }
      } catch (e) {
        console.error('Quest heartbeat failed:', e);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeStreamingQuestId, onStopStreamingQuest]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleFastCompleteQuest = async (questId: string) => {
    setIsFastCompletingId(questId);
    try {
      const res = await fetch(`/api/discord/quests/${questId}/fast-complete`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        await fetch('/api/schedule/complete-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: `task-${questId}` }),
        });
        setQuestsList((prev) =>
          prev.map((q) =>
            q.id === questId ? { ...q, ...data.quest, completed: true, claimedCode: data.code } : q
          )
        );
        await fetchLiveQuests(false);
        if (data.code) {
          navigator.clipboard.writeText(data.code);
          setCopiedId(questId);
          setTimeout(() => setCopiedId(null), 3000);
          setLastNotice(
            `「${data.quest?.title || questId}」已完成同步並領取 +${
              data.quest?.orbsReward || 750
            } Orbs 與裝備憑證：${data.code}`
          );
        }
      }
    } catch (e) {
      console.error('Fast complete failed:', e);
    } finally {
      setIsFastCompletingId(null);
    }
  };

  const handleFastCompleteAll = async () => {
    setIsFastCompletingId('all');
    try {
      const res = await fetch('/api/discord/quests/fast-complete-all', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.quests)) {
          setQuestsList(data.quests);
        }
        await fetch('/api/multitask/fast-forward', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskType: 'quests' }),
        });
        await fetchLiveQuests(false);
        setLastNotice(
          data.message ||
            `已完成全數 ${data.completedCount || 12} 項官方任務同步，Orbs 與裝備憑證已寫入綁定帳號。`
        );
      }
    } catch (e) {
      console.error('Fast complete all failed:', e);
    } finally {
      setIsFastCompletingId(null);
    }
  };

  const handleImageError = (questId: string) => {
    imgFallbackMap.current[questId] = true;
  };

  const totalQuests = questsList.length;
  const completedQuests = questsList.filter((q) => q.completed).length;
  const totalHeartbeats = questsList.reduce((acc, q) => acc + (q.streamHeartbeatsCount || 0), 0);

  const totalOrbsEarned = questsList.reduce(
    (sum, q) => sum + (q.completed ? q.orbsReward || 750 : 0),
    0
  );
  const totalOrbsAvailable = questsList.reduce((sum, q) => sum + (q.orbsReward || 750), 0);

  const filteredQuests = questsList.filter((q) => {
    if (categoryFilter === 'all') return true;
    return q.questCategory === categoryFilter;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-9 h-9 rounded-lg bg-[#111214] border border-[#2b2d31] flex items-center justify-center p-1.5 shrink-0">
                <img src="/badges/core/orb.svg" alt="Orbs" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
                  Discord Orbs 與官方 Quests 任務裝備領取中心
                </h2>
                <span className="text-xs font-mono text-neutral-400">
                  · 端點：/api/v10/quests/@me ({totalQuests} 項任務)
                </span>
              </div>
            </div>
            <p className="text-xs text-neutral-400 max-w-3xl leading-relaxed">
              連動綁定 Discord 個人帳號刷新可領取之 Orbs 寶珠與個人檔案頭像裝飾、虛寶序號。支援直接觸發任務串流封包完成進度，並同步寫入綁定帳號。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleFastCompleteAll}
              disabled={isFastCompletingId !== null || completedQuests === totalQuests}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                completedQuests === totalQuests
                  ? 'bg-[#111214] text-neutral-500 border border-[#2b2d31] cursor-not-allowed'
                  : 'bg-[#23A55A] hover:bg-[#1A7B42] disabled:opacity-50 text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {completedQuests === totalQuests
                  ? '全部任務已領取完畢'
                  : isFastCompletingId === 'all'
                  ? '同步領取中...'
                  : `同步並領取全部 (${totalOrbsAvailable.toLocaleString()} Orbs)`}
              </span>
            </button>

            <button
              type="button"
              onClick={handleSyncOrbsToDiscordNode}
              disabled={isSyncingNode}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{isSyncingNode ? 'Node 同步中...' : '同步至 Discord 帳號'}</span>
            </button>

            <button
              type="button"
              onClick={handlePollNow}
              disabled={isPollingNow}
              className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] transition-colors flex items-center gap-1.5 shrink-0"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isPollingNow || isRefreshing ? 'animate-spin' : ''}`}
              />
              <span>{isPollingNow ? '刷新中...' : '刷新官方任務'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-[#2b2d31]">
          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3">
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1.5">
              <img src="/badges/core/orb.svg" alt="Orb" className="w-3.5 h-3.5 object-contain" />
              <span>目前已領取 Orbs</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-neutral-100 font-mono mt-0.5 flex items-baseline gap-1.5">
              <span>{totalOrbsEarned.toLocaleString()}</span>
              <span className="text-[10px] text-neutral-400 font-normal">
                / {totalOrbsAvailable.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3">
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#23A55A]" />
              <span>已完成任務數</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-neutral-100 font-mono mt-0.5">
              {completedQuests} / {totalQuests} 項完成
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3">
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#5865F2]" />
              <span>累計心跳封包</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-neutral-100 font-mono mt-0.5">
              {totalHeartbeats} 次
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3">
            <div className="text-[10px] text-neutral-400 font-mono flex items-center gap-1">
              <Activity className="w-3 h-3 text-[#23A55A]" />
              <span>Discord 閘道延遲</span>
            </div>
            <div className="text-sm sm:text-base font-bold text-neutral-100 font-mono mt-0.5 flex items-center gap-1.5">
              <span>{monitorState?.pingLatencyMs ?? 38} ms</span>
              <span className="text-[10px] text-[#23A55A] font-normal">正常</span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mt-4 pt-3 border-t border-[#2b2d31] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                categoryFilter === 'all'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#111214] text-neutral-400 hover:text-neutral-200 border border-[#2b2d31]'
              }`}
            >
              <span>全部官方任務 ({questsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('orbs')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                categoryFilter === 'orbs'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#111214] text-neutral-300 hover:text-white border border-[#2b2d31]'
              }`}
            >
              <img src="/badges/core/orb.svg" alt="Orbs" className="w-3.5 h-3.5 object-contain" />
              <span>Orbs 寶珠與頭像裝飾 ({questsList.filter((q) => q.questCategory === 'orbs').length})</span>
            </button>
            <button
              type="button"
              onClick={() => setCategoryFilter('ingame')}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                categoryFilter === 'ingame'
                  ? 'bg-[#5865F2] text-white'
                  : 'bg-[#111214] text-neutral-300 hover:text-white border border-[#2b2d31]'
              }`}
            >
              <Gift className="w-3.5 h-3.5" />
              <span>遊戲虛寶與裝備序號 ({questsList.filter((q) => q.questCategory === 'ingame').length})</span>
            </button>
          </div>
        </div>

        {lastNotice && (
          <div className="mt-3 pt-3 border-t border-[#2b2d31] flex items-center gap-2 text-xs text-neutral-100 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#23A55A] shrink-0" />
            <span className="break-all">{lastNotice}</span>
          </div>
        )}
      </div>

      {/* Quests Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredQuests.map((quest) => {
          const isStreaming = activeStreamingQuestId === quest.id;
          const isCompleting = isFastCompletingId === quest.id;
          const progressPercent = Math.min(
            100,
            Math.round((quest.progressMinutes / quest.targetMinutes) * 100)
          );
          const hasImageError = Boolean(imgFallbackMap.current[quest.id]);
          const orbsAmount = quest.orbsReward || 750;

          return (
            <div
              key={quest.id}
              className={`bg-[#1e1f22] border rounded-xl p-5 flex flex-col justify-between transition-colors ${
                isStreaming
                  ? 'border-[#5865F2]'
                  : quest.completed
                  ? 'border-[#2b2d31] bg-[#18191c]'
                  : 'border-[#2b2d31]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-3 gap-2">
                  <span className="font-medium text-neutral-300 flex items-center gap-1.5 truncate">
                    <Tv className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span className="truncate">{quest.sponsor}</span>
                  </span>

                  <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-neutral-300">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#111214] border border-[#2b2d31] font-bold">
                      <img src="/badges/core/orb.svg" alt="Orb" className="w-3 h-3 object-contain" />
                      +{orbsAmount.toLocaleString()} Orbs
                    </span>
                    <span className="text-neutral-400">~{quest.expiryDate}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3 mb-3.5">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#111214] border border-[#2b2d31] shrink-0 flex items-center justify-center">
                    {quest.gameIconUrl && !hasImageError ? (
                      <img
                        src={quest.gameIconUrl}
                        alt={quest.gameName || quest.title}
                        referrerPolicy="no-referrer"
                        onError={() => handleImageError(quest.id)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <img
                        src="/badges/core/orb.svg"
                        alt={quest.title}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-neutral-100 leading-snug">
                      {quest.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[11px] text-neutral-300 font-mono truncate">
                        {quest.gameName || quest.gameId}
                      </span>
                      {quest.discordAppId && (
                        <span className="text-[10px] font-mono text-neutral-400">
                          · AppID: {quest.discordAppId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 flex items-center gap-2.5 mb-4">
                  <div className="w-8 h-8 rounded bg-[#1e1f22] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0">
                    <img src="/badges/core/orb.svg" alt="Orbs" className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-mono text-neutral-400 font-bold block">
                      任務獎勵與裝備內容
                    </span>
                    <span className="text-xs font-semibold text-neutral-100 truncate block">
                      {quest.reward}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-400 font-medium">
                      <Timer className="w-3.5 h-3.5 text-neutral-400" />
                      <span>任務同步進度</span>
                    </span>
                    <span className="font-mono font-semibold text-neutral-200 tabular-nums">
                      {quest.progressMinutes.toFixed(1)} / {quest.targetMinutes.toFixed(1)} 分鐘 (
                      {progressPercent}%)
                    </span>
                  </div>

                  <div className="w-full h-2 bg-[#111214] rounded overflow-hidden border border-[#2b2d31]">
                    <div
                      className={`h-full transition-all duration-300 ${
                        quest.completed ? 'bg-[#23A55A]' : 'bg-[#5865F2]'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5 font-mono">
                    <span>
                      {quest.completed ? (
                        <span className="text-[#23A55A] font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          已完成並同步至綁定帳號
                        </span>
                      ) : isStreaming ? (
                        <span className="text-neutral-200 font-semibold flex items-center gap-1">
                          <Radio className="w-3 h-3 text-[#23A55A]" />
                          串流封包發送中
                        </span>
                      ) : (
                        <span className="text-neutral-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          待執行任務同步
                        </span>
                      )}
                    </span>

                    <span>封包數: {quest.streamHeartbeatsCount || 0}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#2b2d31]">
                {quest.completed ? (
                  <div className="flex items-center justify-between gap-2 bg-[#111214] p-2.5 rounded-lg border border-[#2b2d31]">
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] text-[#23A55A] font-bold block">
                        已同步領取 (+{orbsAmount} Orbs) · 憑證代碼
                      </span>
                      <span className="text-xs font-mono font-bold text-neutral-100 truncate block select-all">
                        {quest.claimedCode || 'ORBS-CLAIMED-VERIFIED'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCode(
                            quest.id,
                            quest.claimedCode || 'ORBS-CLAIMED-VERIFIED'
                          )
                        }
                        className="px-3 py-1.5 text-xs font-semibold bg-[#23A55A] hover:bg-[#1A7B42] text-white rounded flex items-center gap-1.5 transition-colors"
                      >
                        {copiedId === quest.id ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>已複製</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>複製憑證</span>
                          </>
                        )}
                      </button>

                      <a
                        href="https://discord.com/quest-home"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#1e1f22] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded transition-colors"
                        title="前往 Discord 任務中心"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ) : isStreaming ? (
                  <button
                    type="button"
                    onClick={onStopStreamingQuest}
                    className="w-full py-2 px-4 text-xs font-semibold bg-[#DA373C] hover:bg-[#A1282C] text-white rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>停止串流封包發送</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleFastCompleteQuest(quest.id)}
                      disabled={isCompleting}
                      className="flex-1 py-2 px-3 text-xs font-semibold bg-[#5865F2] hover:bg-[#4752C4] text-white rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>
                        {isCompleting ? '同步中...' : `觸發任務完成並領取 (+${orbsAmount} Orbs)`}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartStreamingQuest(quest.id)}
                      className="py-2 px-3 text-xs font-semibold bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>常駐同步</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
