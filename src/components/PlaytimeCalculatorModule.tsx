import React, { useState, useMemo } from 'react';
import { GamePreset, PlaytimeCalculation } from '../types/dam';
import { PLAYTIME_MILESTONES } from '../data/presets';
import {
  Clock,
  Calendar,
  Zap,
  HardDrive,
  Award,
  Play,
  CheckCircle2,
  TrendingUp,
  Sparkles,
} from 'lucide-react';

interface PlaytimeCalculatorModuleProps {
  activeGame: GamePreset;
  currentRecordedHours: number;
  onUpdateCurrentHours: (hours: number) => void;
  onStartGrinding?: () => void;
}

export const PlaytimeCalculatorModule: React.FC<PlaytimeCalculatorModuleProps> = ({
  activeGame,
  currentRecordedHours,
  onUpdateCurrentHours,
  onStartGrinding,
}) => {
  const [targetHours, setTargetHours] = useState<number>(500);
  const [hoursPerDay, setHoursPerDay] = useState<number>(18);
  const [customTarget, setCustomTarget] = useState<string>('');
  const [electricityRate, setElectricityRate] = useState<number>(4.2);

  const calc: PlaytimeCalculation = useMemo(() => {
    const remaining = Math.max(0, targetHours - currentRecordedHours);
    const days = hoursPerDay > 0 ? remaining / hoursPerDay : 0;

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + Math.ceil(days));

    const kwhSaved = remaining * 0.4495;
    const carbonSavedKg = kwhSaved * 0.495;
    const costSavedTwd = kwhSaved * electricityRate;

    return {
      currentHours: currentRecordedHours,
      targetHours,
      hoursPerDay,
      remainingHours: remaining,
      daysToTarget: Math.ceil(days),
      completionDate: completionDate.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      kwhSaved,
      carbonSavedKg,
      costSavedTwd,
    };
  }, [currentRecordedHours, targetHours, hoursPerDay, electricityRate]);

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white shadow-sm">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
              遊戲時數等級試算與節能精算 (Playtime Calculator)
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5 max-w-2xl leading-relaxed">
              透過差額推算演算法與連續運作耗時推導，估算達成特定遊戲成就門檻之所需時數與預計達成日，並量化非實體全載常駐所節省之電力負載與電費成本。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 space-y-5 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-100 flex items-center gap-2 pb-3 border-b border-[#2b2d31]">
            <TrendingUp className="w-4 h-4 text-[#5865F2]" />
            時數目標與排程參數配置
          </h3>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">目前已記錄時數</span>
              <span className="font-mono font-semibold text-neutral-100">{currentRecordedHours} 小時</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={2000}
                step={5}
                value={currentRecordedHours}
                onChange={(e) => onUpdateCurrentHours(parseFloat(e.target.value))}
                className="flex-1 accent-[#5865F2]"
              />
              <div className="flex items-center bg-[#111214] border border-[#2b2d31] rounded-md px-3 py-1.5">
                <input
                  type="number"
                  min={0}
                  max={20000}
                  value={currentRecordedHours}
                  onChange={(e) =>
                    onUpdateCurrentHours(Math.max(0, parseFloat(e.target.value) || 0))
                  }
                  className="w-16 bg-transparent text-right font-mono text-xs text-neutral-100 focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 ml-1 font-mono">h</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-300 mb-2">
              目標里程碑設定
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PLAYTIME_MILESTONES.map((m) => {
                const isSelected = targetHours === m.hours;
                return (
                  <button
                    key={m.hours}
                    type="button"
                    onClick={() => {
                      setTargetHours(m.hours);
                      setCustomTarget('');
                    }}
                    className={`flex flex-col text-left p-3 rounded-lg border text-xs transition-all shadow-sm ${
                      isSelected
                        ? 'bg-[#2b2d31] border-[#5865F2] ring-1 ring-[#5865F2] text-neutral-100'
                        : 'bg-[#111214] border-[#2b2d31] text-neutral-300 hover:border-[#3f4147] hover:bg-[#18191c]'
                    }`}
                  >
                    <div className="font-bold text-neutral-100 flex items-center justify-between">
                      <span>{m.hours} 小時</span>
                      <Award className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-neutral-500'}`} />
                    </div>
                    <span className="text-[10px] text-neutral-400 mt-1 font-mono">
                      {m.label} ({m.badge})
                    </span>
                  </button>
                );
              })}

              <div className="bg-[#111214] border border-[#2b2d31] rounded-lg p-2.5 flex items-center gap-1.5 shadow-sm">
                <input
                  type="number"
                  placeholder="自訂時數"
                  value={customTarget}
                  onChange={(e) => {
                    setCustomTarget(e.target.value);
                    const val = parseInt(e.target.value);
                    if (val > 0) setTargetHours(val);
                  }}
                  className="w-full bg-transparent text-xs text-neutral-100 placeholder-neutral-500 font-mono focus:outline-none"
                />
                <span className="text-[11px] text-neutral-400 font-mono">h</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">每日排程時數</span>
              <span className="font-mono font-semibold text-neutral-100">
                {hoursPerDay === 24 ? '24/7 全天候' : `${hoursPerDay} 小時 / 天`}
              </span>
            </div>
            <input
              type="range"
              min={1}
              max={24}
              value={hoursPerDay}
              onChange={(e) => setHoursPerDay(parseInt(e.target.value))}
              className="w-full accent-[#5865F2]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-neutral-300 font-medium">平均電費費率 (NTD / 度)</span>
              <span className="font-mono font-semibold text-neutral-100">${electricityRate} / kWh</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={8.0}
              step={0.1}
              value={electricityRate}
              onChange={(e) => setElectricityRate(parseFloat(e.target.value))}
              className="w-full accent-[#5865F2]"
            />
          </div>
        </div>

        {/* Right Output Dashboard (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>目標進度評估</span>
              <span className="font-mono text-neutral-300 font-medium">
                {activeGame.name}
              </span>
            </div>

            <div className="mt-3">
              <span className="text-xs text-neutral-400 block font-medium">所需剩餘時數</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold font-mono tabular-nums text-neutral-100">
                  {calc.remainingHours.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-neutral-400">小時</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-[#2b2d31]">
              <div>
                <span className="text-[11px] text-neutral-400 block">連續耗時預計</span>
                <span className="text-base font-bold font-mono text-neutral-100 tabular-nums">
                  {calc.daysToTarget} 天
                </span>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400 block">預計完工日</span>
                <span className="text-xs font-medium text-neutral-200">
                  {calc.completionDate}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2b2d31] flex items-center justify-between text-xs text-neutral-300">
              <span className="font-medium">進度達成率</span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {Math.min(100, Math.round((currentRecordedHours / targetHours) * 100))}%
              </span>
            </div>

            <div className="w-full h-2 bg-[#111214] rounded-full mt-2 overflow-hidden border border-[#2b2d31]">
              <div
                className="h-full bg-[#5865F2] transition-all duration-300"
                style={{
                  width: `${Math.min(100, (currentRecordedHours / targetHours) * 100)}%`,
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 mt-4">
              <button
                onClick={async () => {
                  const needed = Math.max(1, targetHours - currentRecordedHours);
                  try {
                    const res = await fetch('/api/discord/worker/fast-inject-hours', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ hours: needed, gameName: activeGame.name }),
                    });
                    const data = await res.json();
                    if (data.success && data.totalHours) {
                      onUpdateCurrentHours(Math.round(data.totalHours));
                    }
                  } catch (e) {
                    onUpdateCurrentHours(targetHours);
                  }
                }}
                className="w-full sm:flex-1 py-2.5 px-3 rounded-md text-xs font-bold bg-[#23A55A] hover:bg-[#1A7B42] text-white flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="直接注入差額時數，秒速達成目標門檻勳章"
              >
                <Zap className="w-3.5 h-3.5 fill-white" />
                <span>外掛秒解注入 (直衝 {targetHours}h)</span>
              </button>

              {onStartGrinding && (
                <button
                  onClick={onStartGrinding}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-md text-xs font-bold bg-[#2b2d31] hover:bg-[#35373c] text-neutral-200 border border-[#3f4147] flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>背景常駐</span>
                </button>
              )}
            </div>
          </div>

          {/* Efficiency Data */}
          <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 space-y-3 text-xs shadow-sm">
            <span className="text-xs font-bold text-neutral-100 block">
              效益精算數據 (相較於實體 450W 全載)
            </span>
            <div className="flex justify-between py-1.5 border-b border-[#2b2d31] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                節約電力消耗
              </span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                ≈ {calc.kwhSaved.toFixed(1)} 度電
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#2b2d31] text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#23A55A]" />
                節約電費支出
              </span>
              <span className="font-mono font-bold text-[#23A55A] tabular-nums">
                ≈ NT$ {Math.round(calc.costSavedTwd).toLocaleString()} 元
              </span>
            </div>
            <div className="flex justify-between py-1 text-neutral-400">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                免下載節省硬碟空間
              </span>
              <span className="font-mono font-bold text-neutral-100 tabular-nums">
                {activeGame.installSizeGb} GB ({activeGame.name})
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
