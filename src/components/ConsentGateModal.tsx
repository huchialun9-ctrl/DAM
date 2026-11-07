import React, { useState } from 'react';
import { Shield, FileText, CheckCircle2, BookOpen, Cookie, CheckSquare, X, Zap } from 'lucide-react';

interface ConsentGateModalProps {
  isOpen: boolean;
  onAccept: () => void;
  canCloseWithoutAccepting?: boolean;
  onClose?: () => void;
}

export const ConsentGateModal: React.FC<ConsentGateModalProps> = ({
  isOpen,
  onAccept,
  canCloseWithoutAccepting = false,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'manual' | 'cookies'>('terms');
  const [agreedTerms, setAgreedTerms] = useState(true);
  const [agreedManual, setAgreedManual] = useState(true);
  const [agreedCookies, setAgreedCookies] = useState(true);

  if (!isOpen) return null;

  const allAgreed = agreedTerms && agreedManual && agreedCookies;

  const handleSelectAllAndAccept = () => {
    setAgreedTerms(true);
    setAgreedManual(true);
    setAgreedCookies(true);
    onAccept();
  };

  const handleToggleAll = () => {
    const nextState = !allAgreed;
    setAgreedTerms(nextState);
    setAgreedManual(nextState);
    setAgreedCookies(nextState);
  };

  const handleConfirm = () => {
    if (allAgreed) {
      onAccept();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md overflow-y-auto overscroll-contain flex items-center justify-center p-3 sm:p-6"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="bg-[#191919] border border-[#2f2f2f] rounded-2xl max-w-2xl w-full max-h-[84dvh] flex flex-col shadow-2xl overflow-hidden font-sans my-auto">
        {/* Header with Quick Accept Action on Mobile */}
        <div className="px-4 sm:px-6 py-3 bg-[#202020] border-b border-[#2f2f2f] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#2c2c2c] border border-[#3d3d3d] flex items-center justify-center text-neutral-200 shrink-0">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xs sm:text-sm font-bold text-neutral-100 tracking-tight truncate">
                系統使用條款、技術說明書與 Cookie 宣告
              </h2>
              <span className="text-[10px] text-neutral-400 font-mono block truncate">
                Discord Activity Master (DAM) · 正式版手冊
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSelectAllAndAccept}
              className="px-2.5 py-1.5 rounded-lg bg-[#23A55A] hover:bg-[#1A7B42] text-white text-[11px] font-bold flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
              title="一鍵同意全部並立即進入"
            >
              <Zap className="w-3 h-3 fill-white" />
              <span>快速同意進入</span>
            </button>
            {canCloseWithoutAccepting && onClose && (
              <button
                onClick={onClose}
                className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-[#2c2c2c]"
                title="關閉視窗"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 sm:px-6 py-2 bg-[#141414] border-b border-[#2a2a2a] grid grid-cols-3 gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'terms'
                ? 'bg-[#2b2d31] text-white border border-[#3f4147]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]'
            }`}
          >
            <Shield className="w-3 h-3 text-[#5865F2] shrink-0" />
            <span className="truncate">1. 服務條款</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'manual'
                ? 'bg-[#2b2d31] text-white border border-[#3f4147]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]'
            }`}
          >
            <BookOpen className="w-3 h-3 text-[#23A55A] shrink-0" />
            <span className="truncate">2. 架構說明</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cookies')}
            className={`px-2 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 ${
              activeTab === 'cookies'
                ? 'bg-[#2b2d31] text-white border border-[#3f4147]'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#202020]'
            }`}
          >
            <Cookie className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="truncate">3. 資料政策</span>
          </button>
        </div>

        {/* Scrollable Body (Touch-friendly momentum scroll) */}
        <div
          className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-3.5 text-xs text-neutral-300 leading-relaxed bg-[#191919]"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {activeTab === 'terms' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 1 條：服務性質與帳號連動範圍
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  Discord Activity Master（以下簡稱「本系統」）提供標準 Discord Rich Presence（RPC）、Node.js 狀態同步與官方 Quests Orbs 任務輔助管理。連動 Discord 帳號時採用官方 OAuth2 認證與標準 IPC 管道通訊。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 2 條：使用者合規義務
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  使用者承諾不利用本系統進行任何形式之阻斷服務攻擊（DDoS）或濫發訊息。本系統所有時數推進、直播心跳與 Orbs 任務同步均遵循非侵入式安全速率規範。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 3 條：免責與安全保障聲明
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  本系統支援雲端即時同調與本機 Node.js 腳本雙重連動，確保您的 Discord 個人檔案狀態欄與勳章進度安全更新。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 1 節：非侵入式技術規格 (Non-Invasive Architecture)
                </strong>
                <ul className="text-neutral-400 space-y-1 list-disc pl-4 leading-relaxed">
                  <li>不包含任何動態連結庫注入（DLL Injection）或記憶體掛鉤（Memory Hooking）。</li>
                  <li>不修改本機 Discord 客戶端二進位檔或快取記憶體。</li>
                  <li>透過標準 Node.js IPC 管道與 Epoch Backdating 時間戳回溯技術安全同步時數。</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 2 節：Node.js 實機狀態與 Discord 雙向同步
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  本系統內建 Node.js RPC 橋接核心與實機同步腳本，可將掛機遊戲、累積時數（如 10h ~ 10,000h）、直播時數（新人至現象級人物 10 階）與 Orbs 任務進度直接同步至您綁定的 Discord 帳號。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 1 項：必要性 Cookie 之使用說明
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  本平台使用安全性 HTTP-only Cookie（<code className="bg-[#141414] px-1 py-0.5 rounded text-neutral-200">dam_session</code>）維持 Discord OAuth2 授權狀態，僅用於同步當前綁定之 Discord 帳號資訊與勳章。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#202020] border border-[#2f2f2f]">
                <strong className="text-neutral-100 block mb-1">
                  第 2 項：本機安全儲存 (Local Storage)
                </strong>
                <p className="text-neutral-400 leading-relaxed">
                  Bot Application ID、排程參數與條款同意狀態保存在本機瀏覽器與個人專屬雲端狀態庫中，隨時可一鍵清除或登出。
                </p>
              </div>
            </div>
          )}

          {/* Checkboxes inside scrollable area */}
          <div className="p-3 rounded-xl bg-[#141414] border border-[#2a2a2a] space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#262626]">
              <span className="text-[11px] font-bold text-neutral-200">法定授權與守則確認聲明</span>
              <button
                type="button"
                onClick={handleToggleAll}
                className="text-[11px] text-[#5865F2] hover:text-[#7983f5] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <CheckSquare className="w-3 h-3" />
                <span>{allAgreed ? '取消全選' : '一鍵全選'}</span>
              </button>
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300 py-0.5">
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                className="mt-0.5 rounded border-[#404040] bg-[#141414] text-[#5865F2] focus:ring-0 shrink-0"
              />
              <span className="leading-snug">我已閱讀並同意《Discord Activity Master 服務條款與使用者守則》</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300 py-0.5">
              <input
                type="checkbox"
                checked={agreedManual}
                onChange={(e) => setAgreedManual(e.target.checked)}
                className="mt-0.5 rounded border-[#404040] bg-[#141414] text-[#5865F2] focus:ring-0 shrink-0"
              />
              <span className="leading-snug">我已查閱《系統架構與安全操作說明書》，理解非侵入式同步原理</span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-neutral-300 py-0.5">
              <input
                type="checkbox"
                checked={agreedCookies}
                onChange={(e) => setAgreedCookies(e.target.checked)}
                className="mt-0.5 rounded border-[#404040] bg-[#141414] text-[#5865F2] focus:ring-0 shrink-0"
              />
              <span className="leading-snug">我同意使用必要之 Cookie 維護 Discord 帳號授權與同步狀態</span>
            </label>
          </div>
        </div>

        {/* Sticky Footer Always Visible Above Everything */}
        <div className="p-3.5 sm:px-6 sm:py-3.5 bg-[#202020] border-t border-[#2f2f2f] flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <span className="text-[11px] text-neutral-400 font-mono text-center sm:text-left">
            {allAgreed ? '✓ 已完成 3 項聲明確認，可直接進入系統' : '請勾選上方 3 項聲明'}
          </span>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!allAgreed}
            className={`w-full sm:w-auto px-5 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-md ${
              allAgreed
                ? 'bg-[#5865F2] hover:bg-[#4752C4] text-white cursor-pointer active:scale-95'
                : 'bg-[#2b2d31] text-neutral-500 cursor-not-allowed border border-[#3f4147]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>同意條款並進入系統</span>
          </button>
        </div>
      </div>
    </div>
  );
};
