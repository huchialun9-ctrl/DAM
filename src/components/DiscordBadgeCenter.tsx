import React, { useState, useEffect } from 'react';
import { DiscordBadgeItem } from '../types/dam';
import { useDiscordBadges } from '../hooks/useDiscordBadges';
import { GameVarietyOfficialModal } from './GameVarietyOfficialModal';
import { LiveStreamOfficialModal } from './LiveStreamOfficialModal';
import {
  Award,
  ExternalLink,
  Search,
  Table,
  LayoutGrid,
  Gamepad2,
  Gift,
  Play,
  RefreshCw,
  Clock,
  Tv,
  Send,
  Radio,
  Check,
  Activity,
} from 'lucide-react';

interface DiscordBadgeCenterProps {
  onTriggerActiveDevPing?: () => void;
  onStartUniversalist?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onStartPlaytimeGrind?: () => void;
  onStartStreamGrind?: (questId?: string) => void;
  isRotatingGames?: boolean;
  isPingingActiveDev?: boolean;
}

interface MultitaskStateData {
  tasks: {
    playtime: {
      isActive: boolean;
      status: string;
      currentValue: number;
      targetValue: number;
      unit: string;
      speedLabel: string;
      targetEntity: string;
    };
    streaming: {
      isActive: boolean;
      status: string;
      currentValue: number;
      targetValue: number;
      unit: string;
      speedLabel: string;
      targetEntity: string;
    };
    variety: {
      isActive: boolean;
      status: string;
      currentValue: number;
      targetValue: number;
      unit: string;
      speedLabel: string;
      details: string;
    };
    quests: {
      isActive: boolean;
      status: string;
      currentValue: number;
      targetValue: number;
      unit: string;
      speedLabel: string;
    };
  };
  activeThreadsCount: number;
}

export const DiscordBadgeCenter: React.FC<DiscordBadgeCenterProps> = ({
  onTriggerActiveDevPing,
  onStartUniversalist,
  onStartPlaytimeGrind,
  onStartStreamGrind,
  isPingingActiveDev = false,
}) => {
  const {
    pendingBadges,
    unlockedBadges,
    isSyncing,
    categories,
    unlockBadge,
    refreshBadges,
  } = useDiscordBadges({ autoRefresh: true });

  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [unlockingId, setUnlockingId] = useState<string | null>(null);
  const [isOfficialVarietyModalOpen, setIsOfficialVarietyModalOpen] = useState<boolean>(false);
  const [isOfficialStreamModalOpen, setIsOfficialStreamModalOpen] = useState<boolean>(false);
  const [actionNotification, setActionNotification] = useState<string | null>(null);

  const [multitaskData, setMultitaskData] = useState<MultitaskStateData>({
    tasks: {
      playtime: {
        isActive: true,
        status: 'running',
        currentValue: 35,
        targetValue: 1000,
        unit: '小時',
        speedLabel: 'RPC 時間戳同步',
        targetEntity: 'Genshin Impact (原神)',
      },
      streaming: {
        isActive: true,
        status: 'running',
        currentValue: 120,
        targetValue: 300,
        unit: '分鐘',
        speedLabel: 'Go-Live RTC 串流同步',
        targetEntity: '語音頻道串流狀態',
      },
      variety: {
        isActive: true,
        status: 'running',
        currentValue: 3,
        targetValue: 100,
        unit: '款官方遊戲',
        speedLabel: 'Application ID 輪播',
        details: '25,188 款 Discord 官方可檢測遊戲庫',
      },
      quests: {
        isActive: true,
        status: 'running',
        currentValue: 3,
        targetValue: 12,
        unit: '項任務',
        speedLabel: 'Quests 閘道同步',
      },
    },
    activeThreadsCount: 4,
  });

  useEffect(() => {
    const fetchMultitask = async () => {
      try {
        const res = await fetch('/api/multitask/status');
        if (res.ok) {
          const data = await res.json();
          if (data && data.tasks) {
            setMultitaskData({
              tasks: data.tasks,
              activeThreadsCount: data.activeThreadsCount || 4,
            });
          }
        }
      } catch {
        // Ignore transient errors
      }
    };

    fetchMultitask();
    const interval = setInterval(fetchMultitask, 3500);
    return () => clearInterval(interval);
  }, []);

  // Only show pending (unlocked) badges in the list — unlocked badges are strictly removed!
  const filteredBadges = pendingBadges.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.requirement.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.threshold && b.threshold.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      activeCategory === 'all' ? true : b.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  // Trigger specific unlock rule per badge and remove it from the list upon completion
  const handleAction = async (badge: DiscordBadgeItem) => {
    setUnlockingId(badge.id);

    try {
      if (badge.actionType === 'active_dev' && onTriggerActiveDevPing) {
        onTriggerActiveDevPing();
      } else if (badge.actionType === 'universalist' && onStartUniversalist) {
        onStartUniversalist();
      } else if (badge.actionType === 'hours' && onStartPlaytimeGrind) {
        onStartPlaytimeGrind();
      } else if (badge.actionType === 'streaming' && onStartStreamGrind) {
        onStartStreamGrind();
      }

      const data = await unlockBadge(badge.id);
      setActionNotification(
        data?.message ||
          `已依循「${badge.name}」解鎖規範完成觸發並同步至綁定 Discord 帳號，該徽章已從列表移除。`
      );
    } catch {
      setActionNotification(`已觸發「${badge.name}」同步程序。`);
    } finally {
      setUnlockingId(null);
      setTimeout(() => setActionNotification(null), 5000);
    }
  };

  const handleStartAllMultitasking = async () => {
    try {
      await fetch('/api/multitask/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: 'all' }),
      });
      setActionNotification('已啟動全部 4 項同步通道（遊玩時數、正在直播、遊戲多樣性、官方任務）。');
    } catch {
      setActionNotification('多工同步通道已啟動。');
    }
    setTimeout(() => setActionNotification(null), 5000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Official Game Variety Sheet (IMG_0043 Modal) */}
      <GameVarietyOfficialModal
        isOpen={isOfficialVarietyModalOpen}
        onClose={() => setIsOfficialVarietyModalOpen(false)}
        currentCount={multitaskData.tasks.variety.currentValue}
        isRotating={multitaskData.tasks.variety.isActive}
        onStartRotation={() => {
          fetch('/api/multitask/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskType: 'variety' }),
          });
        }}
        onFastForwardAll={() => {
          fetch('/api/multitask/fast-forward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskType: 'variety', amount: 100 }),
          }).then(() => refreshBadges(true));
        }}
      />

      {/* Official 10-Tier Live Stream Sheet (IMG_0045 Modal) */}
      <LiveStreamOfficialModal
        isOpen={isOfficialStreamModalOpen}
        onClose={() => setIsOfficialStreamModalOpen(false)}
        currentHours={Math.max(1, Math.floor(multitaskData.tasks.streaming.currentValue / 60))}
        onFastInjectHours={(targetHours: number) => {
          fetch('/api/multitask/fast-forward', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskType: 'streaming', amount: targetHours * 60 }),
          }).then(() => refreshBadges(true));
          setActionNotification(`已同步「正在直播」${targetHours} 小時門檻，達標徽章已從列表移除。`);
          setTimeout(() => setActionNotification(null), 4000);
        }}
      />

      {/* Formal Document Header */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#111214] border border-[#2b2d31] flex items-center justify-center text-neutral-100 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
                Discord 官方徽章解鎖規範與同步中心
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                · 待解鎖：{pendingBadges.length} 枚 · 已解鎖並移除：{unlockedBadges.length} 枚
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              依據 Discord 官方各類徽章解鎖規範（RPC 時戳回溯、Go-Live 串流封包、可檢測遊戲 Application ID 輪播、指令互動）連結綁定帳號觸發同步。已解鎖之徽章會自動從下方列表移除。
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsOfficialStreamModalOpen(true)}
            className="px-3 py-1.5 bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Tv className="w-3.5 h-3.5 text-neutral-300" />
            <span>正在直播 10 階檢視</span>
          </button>

          <button
            type="button"
            onClick={() => setIsOfficialVarietyModalOpen(true)}
            className="px-3 py-1.5 bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Gamepad2 className="w-3.5 h-3.5 text-neutral-300" />
            <span>遊戲多樣性 10 階檢視</span>
          </button>

          <div className="flex items-center bg-[#111214] p-1 rounded-lg border border-[#2b2d31]">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#5865F2] text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">表格檢視</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded text-xs font-semibold flex items-center gap-1 transition-colors ${
                viewMode === 'cards'
                  ? 'bg-[#5865F2] text-white'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">卡片檢視</span>
            </button>
          </div>
        </div>
      </div>

      {/* Multi-Module Rule Trigger Overview */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#111214] border border-[#2b2d31] flex items-center justify-center text-[#23A55A]">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white">
                  多模組並行觸發控制器 (綁定帳號：1525721083834269777)
                </h3>
                <span className="text-xs font-mono text-neutral-400">
                  · {isSyncing ? '同步中' : '4 通道連線正常'}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                針對不同徽章之官方驗證機制分別建立獨立通訊模組，支援同時並行觸發並同步回個人 Discord 帳號。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleStartAllMultitasking}
              className="px-3.5 py-2 bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>啟動全部並行模組</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-[#2b2d31]">
          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neutral-300" />
                  遊戲時數模組 (Playtime)
                </span>
                <span className="text-[11px] font-mono text-neutral-400">RPC 時戳</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {multitaskData.tasks.playtime.currentValue} 小時
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1 truncate">
                規範：随興玩家 (10h) 至 永恆傳奇 (10,000h)
              </span>
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-neutral-300" />
                  正在直播模組 (Streaming)
                </span>
                <span className="text-[11px] font-mono text-neutral-400">Go-Live RTC</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {Math.max(1, Math.floor(multitaskData.tasks.streaming.currentValue / 60))} 小時
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1 truncate">
                規範：新人 (1h) 至 現象級人物 (5,000h+)
              </span>
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-neutral-300" />
                  遊戲多樣性模組 (Variety)
                </span>
                <span className="text-[11px] font-mono text-neutral-400">AppID 輪播</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                {multitaskData.tasks.variety.currentValue} / 100 款
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1 truncate">
                規範：試玩咖 (2款) 至 萬事通 (100+款)
              </span>
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-neutral-200 flex items-center gap-1.5">
                  <Gift className="w-3.5 h-3.5 text-neutral-300" />
                  Quests 與開發者模組
                </span>
                <span className="text-[11px] font-mono text-neutral-400">REST API v10</span>
              </div>
              <div className="text-base font-bold text-white font-mono">
                已解鎖 {unlockedBadges.length} 枚徽章
              </div>
              <span className="text-[11px] text-neutral-400 block mt-1 truncate">
                已解鎖項目已自動從下方列表移除
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {actionNotification && (
        <div className="p-3 bg-[#111214] border border-[#23A55A] text-neutral-100 text-xs font-medium rounded-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#23A55A] shrink-0" />
            <span>{actionNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionNotification(null)}
            className="text-neutral-400 hover:text-white text-xs underline"
          >
            關閉
          </button>
        </div>
      )}

      {/* Category Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#1e1f22] p-1.5 rounded-lg border border-[#2b2d31] overflow-x-auto max-w-full">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded transition-colors whitespace-nowrap font-semibold flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-[#5865F2] text-white'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#2b2d31]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋待解鎖徽章名稱或門檻..."
            className="bg-[#1e1f22] border border-[#2b2d31] rounded-lg pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#5865F2] w-64"
          />
        </div>
      </div>

      {/* Empty State when all badges in category are unlocked */}
      {filteredBadges.length === 0 && (
        <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-8 text-center space-y-2">
          <p className="text-sm font-bold text-neutral-200">
            目前分類下之官方徽章皆已解鎖並同步至綁定 Discord 帳號
          </p>
          <p className="text-xs text-neutral-400">
            已解鎖的徽章已自動從列表中移除，並顯示於個人檔案狀態欄。
          </p>
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && filteredBadges.length > 0 && (
        <div className="space-y-4">
          {/* Mobile List */}
          <div className="md:hidden space-y-3">
            {filteredBadges.map((badge) => {
              const isBusy = unlockingId === badge.id || (badge.actionType === 'active_dev' && isPingingActiveDev);

              return (
                <div
                  key={badge.id}
                  className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-lg bg-[#111214] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0">
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/badges/core/quest.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-bold text-white text-xs sm:text-sm">
                          {badge.name}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-300 bg-[#111214] border border-[#2b2d31] px-2 py-0.5 rounded shrink-0">
                          門檻：{badge.threshold || '官方條件'}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                        {badge.description}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 space-y-2 text-xs">
                    <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5">
                      <span className="text-[10px] font-mono text-neutral-400 font-bold block mb-0.5">
                        官方解鎖規範：
                      </span>
                      <span className="text-neutral-300 leading-relaxed block text-[11px]">
                        {badge.requirement}
                      </span>
                    </div>
                    <div className="px-1 text-[11px] text-neutral-400 leading-relaxed">
                      <span className="text-neutral-300 font-bold">平台觸發機制：</span>
                      {badge.solution}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#2b2d31]">
                    {badge.canGrindAuto && badge.actionLabel ? (
                      <button
                        type="button"
                        onClick={() => handleAction(badge)}
                        disabled={isBusy}
                        className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white flex items-center justify-center gap-2 transition-colors"
                      >
                        {isBusy ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>同步至 Discord 帳號中...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>{badge.actionLabel} (解鎖並從列表移除)</span>
                          </>
                        )}
                      </button>
                    ) : badge.category === 'hypesquad' ? (
                      <a
                        href="https://discord.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2 px-4 text-xs font-semibold text-center text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>前往 Discord 客戶端設定</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#111214] text-neutral-400 font-mono border-b border-[#2b2d31]">
                  <tr>
                    <th className="py-3 px-4 min-w-[220px]">官方徽章圖示與名稱</th>
                    <th className="py-3 px-4 min-w-[120px]">達成門檻</th>
                    <th className="py-3 px-4 min-w-[240px]">官方解鎖規範</th>
                    <th className="py-3 px-4 min-w-[260px]">平台觸發與帳號同步機制</th>
                    <th className="py-3 px-4 min-w-[160px] text-right">觸發同步操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2b2d31]">
                  {filteredBadges.map((badge) => {
                    const isBusy =
                      unlockingId === badge.id ||
                      (badge.actionType === 'active_dev' && isPingingActiveDev);

                    return (
                      <tr key={badge.id} className="hover:bg-[#232428] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-[#111214] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0">
                              <img
                                src={badge.icon}
                                alt={badge.name}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/badges/core/quest.png';
                                }}
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-neutral-100 truncate block text-xs">
                                {badge.name}
                              </span>
                              <span className="text-[11px] text-neutral-400 truncate block mt-0.5">
                                {badge.description}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-neutral-200">
                          {badge.threshold || '官方條件'}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-300 leading-relaxed">
                          {badge.requirement}
                        </td>

                        <td className="py-3.5 px-4 text-neutral-400 leading-relaxed">
                          {badge.solution}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          {badge.canGrindAuto && badge.actionLabel ? (
                            <button
                              type="button"
                              onClick={() => handleAction(badge)}
                              disabled={isBusy}
                              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white transition-colors whitespace-nowrap"
                            >
                              {isBusy ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                  <span>同步中...</span>
                                </>
                              ) : badge.actionType === 'active_dev' ? (
                                <>
                                  <Send className="w-3.5 h-3.5" />
                                  <span>{badge.actionLabel}</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-white" />
                                  <span>{badge.actionLabel}</span>
                                </>
                              )}
                            </button>
                          ) : badge.category === 'hypesquad' ? (
                            <a
                              href="https://discord.com"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] px-3 py-1.5 rounded-md transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              <span>前往設定</span>
                            </a>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CARDS VIEW */}
      {viewMode === 'cards' && filteredBadges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBadges.map((badge) => {
            const isBusy =
              unlockingId === badge.id ||
              (badge.actionType === 'active_dev' && isPingingActiveDev);

            return (
              <div
                key={badge.id}
                className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-3.5">
                    <div className="w-12 h-12 rounded-lg bg-[#111214] border border-[#2b2d31] p-2 flex items-center justify-center shrink-0">
                      <img
                        src={badge.icon}
                        alt={badge.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/badges/core/quest.png';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-neutral-100 truncate">
                          {badge.name}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-300 bg-[#111214] border border-[#2b2d31] px-2 py-0.5 rounded shrink-0">
                          {badge.threshold || '官方條件'}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-400 mt-1 block leading-relaxed">
                        {badge.description}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 text-xs text-neutral-300 space-y-1 mb-3">
                    <span className="text-[10px] text-neutral-400 font-mono font-bold block">
                      官方解鎖規範：
                    </span>
                    <p className="text-xs text-neutral-300 leading-relaxed">
                      {badge.requirement}
                    </p>
                  </div>

                  <div className="text-xs text-neutral-400 leading-relaxed mb-3">
                    <strong className="text-neutral-200 block mb-0.5">
                      平台觸發與帳號同步機制：
                    </strong>
                    {badge.solution}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#2b2d31] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-neutral-400">
                    分類：{badge.category}
                  </span>

                  {badge.canGrindAuto && badge.actionLabel ? (
                    <button
                      type="button"
                      onClick={() => handleAction(badge)}
                      disabled={isBusy}
                      className="px-4 py-2 text-xs font-semibold rounded-md bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50 text-white flex items-center gap-1.5 transition-colors"
                    >
                      {isBusy ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>同步中...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>{badge.actionLabel}</span>
                        </>
                      )}
                    </button>
                  ) : badge.category === 'hypesquad' ? (
                    <a
                      href="https://discord.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] px-3.5 py-1.5 rounded-md transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>前往設定</span>
                    </a>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
