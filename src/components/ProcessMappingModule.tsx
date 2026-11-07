import React, { useState } from 'react';
import { GamePreset, ProcessState, ActivityPresence } from '../types/dam';
import { useDiscordGames } from '../hooks/useDiscordGames';
import {
  Play,
  Square,
  Search,
  Plus,
  RefreshCw,
  HardDrive,
  CheckCircle2,
  Gamepad2,
  Sparkles,
  Sliders,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  Layers,
} from 'lucide-react';

interface ProcessMappingModuleProps {
  processState: ProcessState;
  activeGame: GamePreset;
  presence: ActivityPresence;
  onSelectGame: (game: GamePreset) => void;
  onToggleProcess: () => void;
  onUpdatePresence: (presence: Partial<ActivityPresence>) => void;
  onToggleStealth: () => void;
  onToggleOfficialMetadata: () => void;
  onCustomGameSave: (name: string, exe: string, appId: string) => void;
  isRotatingGames?: boolean;
  onToggleRotatingGames?: () => void;
  rotatedGamesCount?: number;
}

export const ProcessMappingModule: React.FC<ProcessMappingModuleProps> = ({
  processState,
  activeGame,
  presence,
  onSelectGame,
  onToggleProcess,
  onUpdatePresence,
  onCustomGameSave,
  isRotatingGames = false,
  onToggleRotatingGames,
  rotatedGamesCount = 14,
}) => {
  const {
    games,
    popularPresets,
    totalCount,
    isLoading,
    page,
    totalPages,
    searchQuery,
    selectedTheme,
    setSearchQuery,
    setSelectedTheme,
    setPage,
  } = useDiscordGames();

  const [sourceMode, setSourceMode] = useState<'all' | 'popular'>('all');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customExe, setCustomExe] = useState('');
  const [customAppId, setCustomAppId] = useState('');

  const displayGames = sourceMode === 'popular'
    ? popularPresets.filter((g) =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.executableName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : games;

  const themes = [
    { id: 'all', label: '全部類型' },
    { id: 'action', label: '動作冒險' },
    { id: 'rpg', label: '角色扮演' },
    { id: 'shooter', label: '射擊對戰' },
    { id: 'strategy', label: '策略模擬' },
    { id: 'indie', label: '獨立製作' },
    { id: 'open world', label: '開放世界' },
  ];

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customExe.trim()) return;
    onCustomGameSave(
      customName.trim(),
      customExe.trim().endsWith('.exe') ? customExe.trim() : `${customExe.trim()}.exe`,
      customAppId.trim() || '1566690710961524836'
    );
    setShowCustomModal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Universalist Game Variety Rotator Banner */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Official Universalist Vector Badge */}
            <div className="w-12 h-12 rounded-xl bg-[#111214] border border-[#2b2d31] p-1.5 flex items-center justify-center shrink-0 shadow-md">
              <img
                src="/badges/variety/universalist.svg"
                alt="Universalist Golden Controller"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/badges/core/quest.png';
                }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-neutral-100">
                  全能遊戲家 · 575+ 款遊戲多樣性輪播 (Universalist Grinder)
                </span>
                <span className="text-[10px] font-mono font-semibold text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  直連官方 25,188 款庫
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                自動自官方 25,188 款遊戲庫每 3.5 秒輪播 Discord Title ID，全自動在個人資料累積 575+ 款遊戲歷史，解鎖金色 Universalist 勳章。
                <span className="text-neutral-200 font-mono font-semibold ml-1.5">
                  (目前已連續登錄 {rotatedGamesCount} 款遊戲動態)
                </span>
              </p>
            </div>
          </div>

          {onToggleRotatingGames && (
            <button
              onClick={onToggleRotatingGames}
              className={`px-4 py-2.5 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-all shrink-0 shadow-sm ${
                isRotatingGames
                  ? 'bg-[#DA373C] hover:bg-[#A1282C] text-white'
                  : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRotatingGames ? 'animate-spin' : ''}`} />
              <span>{isRotatingGames ? '停止輪播掛載' : '一鍵啟動 575 款全自動輪播'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Step 1: Select Game Library (All 25,000+ Discord Official Games Imported) */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#2b2d31]">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              1
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-neutral-100">
                  選擇目標遊戲庫與進程模擬
                </h3>
                <span className="text-[10px] font-mono font-bold text-[#23A55A] bg-[#23A55A]/15 border border-[#23A55A]/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  已導入 {totalCount.toLocaleString()} 款官方遊戲
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5">
                點選套用 Discord 官方 Application ID 與可執行檔名稱映射（免下載實體遊戲，直連官方 Detectable 端點）。
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Mode switch: All 25k vs Curated */}
            <div className="flex items-center bg-[#111214] p-0.5 rounded-lg border border-[#2b2d31] text-xs">
              <button
                onClick={() => setSourceMode('all')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  sourceMode === 'all'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                全量庫 ({totalCount.toLocaleString()})
              </button>
              <button
                onClick={() => setSourceMode('popular')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  sourceMode === 'popular'
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                常用精選 ({popularPresets.length})
              </button>
            </div>

            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜尋 25,000+ 款官方遊戲..."
                className="w-full bg-[#111214] border border-[#2b2d31] rounded-md pl-9 pr-3 py-1.5 text-xs text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-[#5865F2]"
              />
            </div>

            <button
              onClick={() => setShowCustomModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>自訂執行檔</span>
            </button>
          </div>
        </div>

        {/* Theme Pills Strip (Only active in 'all' mode) */}
        {sourceMode === 'all' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            {themes.map((t) => {
              const isSelected = selectedTheme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-2.5 py-1 rounded-md font-medium whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-[#5865F2] text-white'
                      : 'bg-[#111214] border border-[#2b2d31] text-neutral-400 hover:text-neutral-200 hover:bg-[#1e1f22]'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Responsive Grid with Dedicated Logo Box & Uncropped Official Logos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="col-span-1 md:col-span-2 py-12 flex flex-col items-center justify-center text-neutral-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#5865F2]" />
              <span className="text-xs">正在自 Discord 官方庫檢索遊戲...</span>
            </div>
          ) : displayGames.length === 0 ? (
            <div className="col-span-1 md:col-span-2 py-10 text-center text-neutral-400 text-xs">
              查無符合條件之 Discord 官方遊戲，請嘗試不同關鍵字。
            </div>
          ) : (
            displayGames.map((game) => {
              const isSelected = activeGame.id === game.id;
              return (
                <div
                  key={game.id}
                  onClick={() => onSelectGame(game)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#2b2d31] border-[#5865F2] ring-1 ring-[#5865F2] shadow-sm'
                      : 'bg-[#111214] border-[#2b2d31] hover:border-[#3f4147] hover:bg-[#18191c]'
                  }`}
                >
                  {/* Official Game Logo Avatar Box (Exact position, zero crop) */}
                  <div className="w-12 h-12 rounded-lg bg-[#1e1f22] border border-[#2b2d31] overflow-hidden flex items-center justify-center p-1 shrink-0">
                    {game.iconUrl && game.iconUrl !== '/badges/core/quest.png' ? (
                      <img
                        src={game.iconUrl}
                        alt={game.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <Gamepad2 className="w-6 h-6 text-neutral-500" />
                    )}
                  </div>

                  {/* Game Title & Information Stack (No overlap on mobile) */}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-neutral-100 truncate">
                        {game.name}
                      </span>
                      {isSelected ? (
                        <span className="text-[10px] font-mono font-semibold text-[#23A55A] bg-[#23A55A]/15 border border-[#23A55A]/30 px-1.5 py-0.5 rounded shrink-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          已掛載
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 font-mono">
                          點選掛載
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span className="text-neutral-300 truncate">{game.executableName}</span>
                      <span>·</span>
                      <span className="text-neutral-400 shrink-0">免裝 {game.installSizeGb}GB</span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-neutral-500 font-mono mt-0.5">
                      <span className="truncate">{game.category}</span>
                      <span className="shrink-0 text-neutral-500">ID: {game.discordAppId.slice(0, 8)}...</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Bar for 25k Library */}
        {sourceMode === 'all' && totalPages > 1 && (
          <div className="pt-2 border-t border-[#2b2d31] flex items-center justify-between text-xs text-neutral-400">
            <span className="font-mono text-[11px]">
              第 {page} 頁 / 共 {totalPages} 頁 (檢索庫容量: {totalCount.toLocaleString()} 款)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1 || isLoading}
                className="px-2.5 py-1 bg-[#111214] hover:bg-[#2b2d31] disabled:opacity-40 border border-[#2b2d31] rounded-md font-semibold text-neutral-300 flex items-center gap-1 transition-all"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>上一頁</span>
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages || isLoading}
                className="px-2.5 py-1 bg-[#111214] hover:bg-[#2b2d31] disabled:opacity-40 border border-[#2b2d31] rounded-md font-semibold text-neutral-300 flex items-center gap-1 transition-all"
              >
                <span>下一頁</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Step 2: Customize Details */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#2b2d31]">
          <div className="w-6 h-6 rounded-md bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold shadow-sm">
            2
          </div>
          <div>
            <h3 className="text-sm font-bold text-neutral-100">
              即時狀態設定 (Presence Payload)
            </h3>
            <p className="text-xs text-neutral-400">
              自訂在 Discord 好友清單與個人資料卡片所顯示的詳細動態資訊。
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              詳細內容 (Details - 地圖 / 章節 / 冒險內容)
            </label>
            <input
              type="text"
              value={presence.details}
              onChange={(e) => onUpdatePresence({ details: e.target.value })}
              placeholder="例如：提瓦特大陸 · 納塔冒險中"
              className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-[#5865F2]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1.5">
              狀態字串 (State - 小隊 / 等級 / 排位階級)
            </label>
            <input
              type="text"
              value={presence.state}
              onChange={(e) => onUpdatePresence({ state: e.target.value })}
              placeholder="例如：世界等級 8 · 冒險等階 60"
              className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-[#5865F2]"
            />
          </div>
        </div>
      </div>

      {/* Step 3: Launch Activity (High Visibility Solid Buttons with Icons) */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-[#5865F2] text-white flex items-center justify-center text-xs font-bold shadow-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-neutral-100">
              {processState.isActive ? '真機時數掛機中 (Active)' : '準備就緒，點擊啟動'}
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            當前目標：<span className="text-neutral-100 font-semibold">{activeGame.name}</span>
            {processState.isActive && (
              <span className="text-[#23A55A] font-mono ml-2 font-medium">
                · 連續掛機 {Math.floor(processState.elapsedSeconds / 60)} 分鐘 · PID: {processState.pid} · 記憶體 {processState.memoryUsageMb}MB
              </span>
            )}
          </p>
        </div>

        <button
          onClick={onToggleProcess}
          className={`px-6 py-3 rounded-md text-xs font-bold text-white transition-all shrink-0 flex items-center justify-center gap-2 shadow-sm ${
            processState.isActive
              ? 'bg-[#DA373C] hover:bg-[#A1282C]'
              : 'bg-[#23A55A] hover:bg-[#1A7B42]'
          }`}
        >
          {processState.isActive ? (
            <>
              <Square className="w-4 h-4 fill-white" />
              <span>停止在 Discord 掛機</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>開始在 Discord 真機掛機</span>
            </>
          )}
        </button>
      </div>

      {/* Custom Game Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-[#111214]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#2b2d31]">
              <div className="flex items-center gap-2">
                <Gamepad2 className="w-4 h-4 text-[#5865F2]" />
                <h3 className="text-sm font-bold text-neutral-100">
                  新增自訂遊戲進程
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-neutral-400 hover:text-neutral-200 p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  遊戲顯示名稱 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：艾爾登法環 (Elden Ring)"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  執行檔名稱 (.exe) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：eldenring.exe"
                  value={customExe}
                  onChange={(e) => setCustomExe(e.target.value)}
                  className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                  Discord Application ID (選填，預設自建 App)
                </label>
                <input
                  type="text"
                  placeholder="1566690710961524836"
                  value={customAppId}
                  onChange={(e) => setCustomAppId(e.target.value)}
                  className="w-full bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-[#5865F2]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#2b2d31]">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-300 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all shadow-sm"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-md transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>確認建立</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
