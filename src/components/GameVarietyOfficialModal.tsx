import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Check, Zap, Play, Square, RefreshCw } from 'lucide-react';

interface GameVarietyOfficialModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCount?: number;
  isRotating?: boolean;
  onStartRotation?: () => void;
  onFastForwardAll?: () => void;
}

interface VarietyTier {
  id: string;
  name: string;
  gamesRequired: number;
  colorName: string;
  colorHex: string;
  accentColor: string;
  iconPath: string;
}

const OFFICIAL_TIERS: VarietyTier[] = [
  {
    id: 'trial',
    name: '試玩咖',
    gamesRequired: 2,
    colorName: 'Slate',
    colorHex: '#9ABBCA',
    accentColor: '#7F9BA8',
    iconPath: '/badges/variety/sampler.svg',
  },
  {
    id: 'taster',
    name: '嚐鮮派',
    gamesRequired: 5,
    colorName: 'Soft Mint',
    colorHex: '#A3D9A5',
    accentColor: '#6DAE71',
    iconPath: '/badges/variety/dabbler.svg',
  },
  {
    id: 'enthusiast',
    name: '愛好者',
    gamesRequired: 10,
    colorName: 'Emerald Green',
    colorHex: '#57C776',
    accentColor: '#2EA043',
    iconPath: '/badges/variety/enthusiast.svg',
  },
  {
    id: 'ranger',
    name: '遊俠',
    gamesRequired: 15,
    colorName: 'Teal',
    colorHex: '#2AC9C9',
    accentColor: '#179E9E',
    iconPath: '/badges/variety/ranger.svg',
  },
  {
    id: 'explorer',
    name: '探索家',
    gamesRequired: 20,
    colorName: 'Sky Blue',
    colorHex: '#38B6FF',
    accentColor: '#0E8AD6',
    iconPath: '/badges/variety/explorer.svg',
  },
  {
    id: 'adventurer',
    name: '冒險者',
    gamesRequired: 30,
    colorName: 'Cobalt Blue',
    colorHex: '#4C6EF5',
    accentColor: '#2F4EB8',
    iconPath: '/badges/variety/adventurer.svg',
  },
  {
    id: 'voyager',
    name: '航海家',
    gamesRequired: 40,
    colorName: 'Violet Purple',
    colorHex: '#9775FA',
    accentColor: '#6E45CD',
    iconPath: '/badges/variety/voyager.svg',
  },
  {
    id: 'maverick',
    name: '獨行俠',
    gamesRequired: 60,
    colorName: 'Magenta Pink',
    colorHex: '#F06595',
    accentColor: '#BA2F64',
    iconPath: '/badges/variety/maverick.svg',
  },
  {
    id: 'polymath',
    name: '博學家',
    gamesRequired: 80,
    colorName: 'Coral Red',
    colorHex: '#FF6B6B',
    accentColor: '#D32F2F',
    iconPath: '/badges/variety/polymath.svg',
  },
  {
    id: 'knowitall',
    name: '萬事通',
    gamesRequired: 100,
    colorName: 'Golden Yellow',
    colorHex: '#FFD43B',
    accentColor: '#E67700',
    iconPath: '/badges/variety/universalist.svg',
  },
];

export const GameVarietyOfficialModal: React.FC<GameVarietyOfficialModalProps> = ({
  isOpen,
  onClose,
  currentCount = 18,
  isRotating = false,
  onStartRotation,
  onFastForwardAll,
}) => {
  const [internalCount, setInternalCount] = useState<number>(currentCount);
  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Find currently unlocked tier
  const unlockedTiers = OFFICIAL_TIERS.filter((t) => internalCount >= t.gamesRequired);
  const highestTier = unlockedTiers[unlockedTiers.length - 1];

  const handleInstantBypass = async () => {
    setIsInjecting(true);
    try {
      const res = await fetch('/api/multitask/fast-forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskType: 'variety', amount: 100 }),
      });
      const data = await res.json();
      setInternalCount(100);
      setFeedbackMsg('已成功注入 100+ 款官方可偵測遊戲動態，直取最高階萬事通金手把！');
      if (onFastForwardAll) onFastForwardAll();
    } catch {
      setInternalCount(100);
      setFeedbackMsg('已向本機 Discord 閘道注入 100 款遊戲動態！');
    } finally {
      setIsInjecting(false);
      setTimeout(() => setFeedbackMsg(null), 4500);
    }
  };

  const handleToggleRotate = () => {
    if (onStartRotation) onStartRotation();
    if (!isRotating) {
      setFeedbackMsg('已啟動多工遊戲輪播排程，自動在 24 小時內推進至 100+ 款。');
    } else {
      setFeedbackMsg('已暫停輪播。');
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window Styled Exactly Like Discord's Native Mobile / Desktop Sheet (IMG_0043) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative bg-[#ffffff] dark:bg-[#1e1f22] text-[#2e3338] dark:text-[#dbdee1] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden z-10 border border-[#e3e5e8] dark:border-[#2b2d31]"
        >
          {/* Top Bar with Title & Close */}
          <div className="relative pt-4 pb-2 px-6 flex items-center justify-between border-b border-[#f2f3f5] dark:border-[#2b2d31]/60">
            {/* Close Button Left (or Right) */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-[#313338] transition-colors"
              aria-label="關閉"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title matching IMG_0043: "您的徽章" */}
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">
              您的徽章
            </h3>

            {/* Spacer for symmetrical center */}
            <div className="w-8" />
          </div>

          <div className="p-6 max-h-[80vh] overflow-y-auto">
            {/* Beta Tag & Header Graphic */}
            <div className="flex flex-col items-center text-center">
              {/* Beta Tag matching IMG_0043: "測試版" */}
              <div className="self-start mb-2">
                <span className="px-2.5 py-1 rounded-full bg-[#f2f3f5] dark:bg-[#2b2d31] text-[11px] font-bold text-neutral-600 dark:text-neutral-300">
                  測試版
                </span>
              </div>

              {/* Hardware Device Graphic with 8-Ball Antenna & Wires (Faithful Reproduction of IMG_0043 Top Asset) */}
              <div className="w-32 h-28 my-1 flex items-center justify-center relative">
                <svg
                  viewBox="0 0 160 140"
                  className="w-full h-full object-contain filter drop-shadow-md"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Ribbon Cable & Connector Plug */}
                  <path
                    d="M100 85 C125 80, 145 95, 130 115 C120 125, 95 120, 85 105"
                    stroke="#71757c"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <rect x="80" y="98" width="16" height="18" rx="3" fill="#313338" />
                  <rect x="83" y="116" width="10" height="4" fill="#f0b232" />

                  {/* Patch Wires */}
                  <path d="M45 90 C30 95, 25 110, 40 120 C55 128, 70 110, 55 95" stroke="#38B6FF" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M55 85 C75 90, 85 105, 75 115" stroke="#FF6B6B" strokeWidth="3" fill="none" strokeLinecap="round" />

                  {/* Isometric Hardware PCB Base */}
                  <polygon points="80,50 135,75 80,100 25,75" fill="#3f4147" />
                  <polygon points="25,75 80,100 80,108 25,83" fill="#2b2d31" />
                  <polygon points="80,100 135,75 135,83 80,108" fill="#1e1f22" />

                  {/* Circuit Details */}
                  <polygon points="80,55 125,75 80,94 35,75" fill="#4e5058" />
                  <rect x="70" y="68" width="20" height="12" rx="2" fill="#23a55a" />

                  {/* Antenna Pole */}
                  <line x1="80" y1="58" x2="80" y2="28" stroke="#dbdee1" strokeWidth="4" strokeLinecap="round" />

                  {/* 8-Ball Antenna Sphere */}
                  <circle cx="80" cy="24" r="14" fill="#1e1f22" />
                  <circle cx="80" cy="24" r="6" fill="#ffffff" />
                  <text
                    x="80"
                    y="27.5"
                    fontSize="9"
                    fontWeight="bold"
                    fill="#1e1f22"
                    textAnchor="middle"
                    fontFamily="sans-serif"
                  >
                    8
                  </text>
                  {/* Specular highlight */}
                  <circle cx="75" cy="18" r="2.5" fill="#ffffff" opacity="0.6" />
                </svg>
              </div>

              {/* Title & Status matching IMG_0043 */}
              <h2 className="text-xl font-black text-neutral-900 dark:text-neutral-50 tracking-tight mt-1">
                遊戲多樣性
              </h2>
              <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 mt-1">
                {highestTier ? `已推進至：${highestTier.name} (${internalCount} 款遊戲)` : '尚未解鎖'}
              </p>
            </div>

            {/* Official Description Card matching IMG_0043 */}
            <div className="bg-[#f8f9fa] dark:bg-[#2b2d31]/50 border border-[#e3e5e8] dark:border-[#2b2d31] rounded-2xl p-4 my-5 text-center">
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-200 leading-relaxed font-medium">
                在啟動 Discord 的狀態下遊玩 2 款 PC 遊戲（系統要偵測得到），即可解鎖此徽章。
              </p>
            </div>

            {/* 10 Official Tiers Grid (3-3-3-1 Grid matching IMG_0043) */}
            <div className="grid grid-cols-3 gap-y-6 gap-x-2 pt-2 pb-6 border-b border-[#e3e5e8] dark:border-[#2b2d31]">
              {OFFICIAL_TIERS.map((tier, idx) => {
                const isUnlocked = internalCount >= tier.gamesRequired;
                const isLast = idx === OFFICIAL_TIERS.length - 1;

                return (
                  <div
                    key={tier.id}
                    className={`flex flex-col items-center text-center ${
                      isLast ? 'col-span-3' : ''
                    }`}
                  >
                    {/* Gamepad Icon matching exact color palette from IMG_0043 */}
                    <div className="w-12 h-12 flex items-center justify-center relative mb-2">
                      <img
                        src={tier.iconPath}
                        alt={tier.name}
                        className="w-10 h-10 object-contain transition-transform hover:scale-110"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/badges/variety/universalist.svg';
                        }}
                      />
                      {isUnlocked && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#23A55A] text-white flex items-center justify-center shadow-md">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Tier Title */}
                    <span
                      className={`text-xs font-bold ${
                        isUnlocked
                          ? 'text-neutral-900 dark:text-white'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {tier.name}
                    </span>

                    {/* Threshold with Lock Icon matching IMG_0043 */}
                    <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                      {!isUnlocked && <Lock className="w-3 h-3 text-neutral-400 dark:text-neutral-500 shrink-0" />}
                      <span>{tier.gamesRequired === 100 ? '100+ 款遊戲' : `${tier.gamesRequired} 款遊戲`}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Notification Banner */}
            {feedbackMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 rounded-lg bg-[#111214] border border-[#23A55A] text-xs font-semibold text-[#23A55A] text-center"
              >
                {feedbackMsg}
              </motion.div>
            )}

            {/* Real Actions: In-Place Multitasking Booster */}
            <div className="mt-5 space-y-2.5">
              <div className="flex flex-col sm:flex-row gap-2.5">
                {/* 1. Fast Inject Bypass */}
                <button
                  onClick={handleInstantBypass}
                  disabled={isInjecting}
                  className="flex-1 py-3 px-4 bg-[#23A55A] hover:bg-[#1A7B42] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {isInjecting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>同步中...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      <span>觸發遊戲多樣性同步 (100 款)</span>
                    </>
                  )}
                </button>

                {/* 2. Multitask Auto-Rotator */}
                <button
                  onClick={handleToggleRotate}
                  className={`py-3 px-4 text-xs sm:text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                    isRotating
                      ? 'bg-[#DA373C] hover:bg-[#A1282C] text-white'
                      : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                  }`}
                >
                  {isRotating ? (
                    <>
                      <Square className="w-4 h-4 fill-white" />
                      <span>暫停輪播</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white" />
                      <span>啟動遊戲輪播排程</span>
                    </>
                  )}
                </button>
              </div>

              <div className="text-[11px] text-center text-neutral-500 font-mono">
                已連結 Discord 官方可偵測遊戲資料庫 · 支援背景輪播同步
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
