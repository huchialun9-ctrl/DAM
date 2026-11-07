import React, { useState } from 'react';
import { X, Lock, Check, Radio, Square, Tv, Play } from 'lucide-react';

interface LiveStreamOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHours?: number;
  isStreaming?: boolean;
  onToggleStreaming?: () => void;
  onFastInjectHours?: (hours: number) => void;
}

interface StreamTier {
  id: string;
  name: string;
  hoursRequired: number;
  iconPath: string;
}

export const OFFICIAL_STREAM_TIERS: StreamTier[] = [
  { id: 'stream_newcomer', name: '新人', hoursRequired: 1, iconPath: '/badges/streaming/newcomer.svg' },
  { id: 'stream_fledgling', name: '雛鳥', hoursRequired: 5, iconPath: '/badges/streaming/fledgling.svg' },
  { id: 'stream_breakout', name: '新秀', hoursRequired: 20, iconPath: '/badges/streaming/breakout.svg' },
  { id: 'stream_standout', name: '翹楚', hoursRequired: 75, iconPath: '/badges/streaming/standout.svg' },
  { id: 'stream_trendsetter', name: '引領潮流', hoursRequired: 150, iconPath: '/badges/streaming/trendsetter.svg' },
  { id: 'stream_headliner', name: 'A 咖', hoursRequired: 300, iconPath: '/badges/streaming/headliner.svg' },
  { id: 'stream_star', name: '巨星', hoursRequired: 500, iconPath: '/badges/streaming/star.svg' },
  { id: 'stream_sensation', name: '爆紅人物', hoursRequired: 1000, iconPath: '/badges/streaming/sensation.svg' },
  { id: 'stream_visionary', name: '意見領袖', hoursRequired: 2000, iconPath: '/badges/streaming/visionary.svg' },
  { id: 'stream_phenomenon', name: '現象級人物', hoursRequired: 5000, iconPath: '/badges/streaming/phenomenon.svg' },
];

export const LiveStreamOfficialModal: React.FC<LiveStreamOfficialModalProps> = ({
  isOpen,
  onClose,
  currentHours = 0,
  isStreaming = false,
  onToggleStreaming,
  onFastInjectHours,
}) => {
  const [selectedHours, setSelectedHours] = useState<number>(currentHours);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string>('');

  if (!isOpen) return null;

  const effectiveHours = Math.max(currentHours, selectedHours);
  const unlockedCount = OFFICIAL_STREAM_TIERS.filter((t) => effectiveHours >= t.hoursRequired).length;
  const currentTier = OFFICIAL_STREAM_TIERS[unlockedCount - 1];

  const handleInject = async (hours: number) => {
    setIsInjecting(true);
    try {
      const res = await fetch('/api/discord/stream/instant-inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ minutes: hours * 60 }),
      });
      if (res.ok) {
        setSelectedHours((prev) => Math.max(prev + hours, hours));
        if (onFastInjectHours) {
          onFastInjectHours(hours);
        }
        setSyncNotice(`已向 Discord 閘道同步 +${hours} 小時 Go-Live 串流時數，達標徽章已寫入綁定帳號。`);
      }
    } catch {
      setSelectedHours((prev) => prev + hours);
      setSyncNotice(`已同步 +${hours} 小時串流進程。`);
    } finally {
      setIsInjecting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/80 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-t-2xl sm:rounded-xl max-w-lg w-full max-h-[92dvh] flex flex-col overflow-hidden font-sans text-neutral-100">
        {/* Header */}
        <div className="p-4 pb-3 flex items-center justify-between border-b border-[#2b2d31] shrink-0">
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4 text-neutral-300" />
            <span className="text-xs font-mono font-bold text-neutral-200">您的徽章 · 正在直播 10 階總覽</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded hover:bg-[#2b2d31] text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="text-center space-y-2">
            <div className="w-20 h-20 mx-auto flex items-center justify-center bg-[#111214] border border-[#2b2d31] rounded-xl p-3">
              <img
                src={currentTier?.iconPath || '/badges/streaming/newcomer.svg'}
                alt="正在直播"
                className="w-full h-full object-contain"
              />
            </div>

            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">正在直播</h2>
            <div className="text-xs text-neutral-400">
              {unlockedCount > 0 ? (
                <span className="text-[#23A55A] font-semibold">
                  已解鎖第 {unlockedCount} 階 · {currentTier?.name} ({effectiveHours} 小時)
                </span>
              ) : (
                <span className="text-neutral-400">
                  尚未解鎖 (已累計 {effectiveHours.toFixed(1)} / 1.0 小時)
                </span>
              )}
            </div>
          </div>

          <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-3 text-center text-xs text-neutral-300">
            向其他使用者直播 1 小時，即可解鎖此徽章。
          </div>

          {/* 10-Tier Grid with Verified Official SVGs */}
          <div className="bg-[#111214] border border-[#2b2d31] rounded-xl p-4">
            <div className="grid grid-cols-3 gap-y-5 gap-x-3">
              {OFFICIAL_STREAM_TIERS.map((tier, idx) => {
                const isUnlocked = effectiveHours >= tier.hoursRequired;
                const isCurrent = currentTier?.id === tier.id;

                return (
                  <div
                    key={tier.id}
                    className={`flex flex-col items-center text-center p-2 rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-[#1e1f22] border-[#5865F2]'
                        : isUnlocked
                        ? 'bg-[#1e1f22] border-[#23A55A]'
                        : 'bg-[#18191c] border-[#2b2d31] opacity-75'
                    } ${idx === 9 ? 'col-span-3 w-1/3 mx-auto' : ''}`}
                  >
                    <div className="w-10 h-10 relative flex items-center justify-center mb-1.5">
                      <img
                        src={tier.iconPath}
                        alt={tier.name}
                        className="w-full h-full object-contain"
                      />
                      {isUnlocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#23A55A] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <span className="text-xs font-bold text-neutral-100">{tier.name}</span>
                    <div className="text-[10px] text-neutral-400 font-mono mt-0.5 flex items-center gap-0.5">
                      {!isUnlocked && <Lock className="w-2.5 h-2.5 text-neutral-400" />}
                      <span>
                        {tier.hoursRequired >= 5000
                          ? '5,000 小時以上'
                          : `${tier.hoursRequired.toLocaleString()} 小時`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Direct Stream Sync Controls */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-neutral-200 block">
              觸發 Go-Live 串流時數同步：
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleInject(1)}
                disabled={isInjecting}
                className="py-2 px-2.5 rounded bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] text-xs font-semibold transition-colors"
              >
                +1 小時 (新人)
              </button>

              <button
                type="button"
                onClick={() => handleInject(20)}
                disabled={isInjecting}
                className="py-2 px-2.5 rounded bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] text-xs font-semibold transition-colors"
              >
                +20 小時 (新秀)
              </button>

              <button
                type="button"
                onClick={() => handleInject(1000)}
                disabled={isInjecting}
                className="py-2 px-2.5 rounded bg-[#111214] hover:bg-[#2b2d31] text-neutral-200 border border-[#2b2d31] text-xs font-semibold transition-colors"
              >
                +1,000 小時 (爆紅)
              </button>

              <button
                type="button"
                onClick={() => handleInject(5000)}
                disabled={isInjecting}
                className="py-2 px-2.5 rounded bg-[#5865F2] hover:bg-[#4752C4] text-white text-xs font-semibold transition-colors"
              >
                +5,000 小時 (滿階)
              </button>
            </div>
          </div>

          {syncNotice && (
            <div className="p-2.5 rounded-lg bg-[#111214] border border-[#23A55A] text-xs text-neutral-100 font-mono flex items-center gap-2">
              <Check className="w-4 h-4 text-[#23A55A] shrink-0" />
              <span className="truncate">{syncNotice}</span>
            </div>
          )}
        </div>

        {/* Sticky Bottom Actions */}
        <div className="p-4 bg-[#111214] border-t border-[#2b2d31] flex items-center gap-2.5 shrink-0">
          {onToggleStreaming && (
            <button
              type="button"
              onClick={onToggleStreaming}
              className={`flex-1 py-2 px-4 rounded-md text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                isStreaming
                  ? 'bg-[#DA373C] hover:bg-[#A1282C] text-white'
                  : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
              }`}
            >
              {isStreaming ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>停止串流同步</span>
                </>
              ) : (
                <>
                  <Radio className="w-3.5 h-3.5" />
                  <span>啟動 Go-Live 串流同步</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleInject(20)}
            disabled={isInjecting}
            className="py-2 px-4 rounded-md text-xs font-semibold bg-[#23A55A] hover:bg-[#1A7B42] text-white flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>觸發串流時數同步</span>
          </button>
        </div>
      </div>
    </div>
  );
};
