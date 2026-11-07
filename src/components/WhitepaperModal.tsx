import React from 'react';
import { X, FileText, CheckCircle2, Shield, Cpu, Zap } from 'lucide-react';

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#121212]/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#191919] border border-[#2f2f2f] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="px-6 py-4 bg-[#202020] border-b border-[#2f2f2f] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#2a2a2a] border border-[#3a3a3a] flex items-center justify-center text-neutral-300">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100">
                軟體專案陳述與企劃書：Discord Activity Master (DAM)
              </h2>
              <span className="text-[11px] text-neutral-400 font-mono">
                Official Engineering Architecture & Specifications · Windows Native
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-100 rounded hover:bg-[#2c2c2c] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Document */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6 text-neutral-300 text-xs sm:text-sm leading-relaxed bg-[#191919]">
          {/* Section 1 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-[#2e2e2e] pb-1.5 flex items-center gap-2">
              <span className="text-neutral-400 font-mono">一、</span>
              專案核心摘要 (Executive Summary)
            </h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              <strong>Discord Activity Master (DAM)</strong> 是一套專為 Windows 環境打造的輕量化進程模擬與 Discord 狀態管理自動化系統。使用者無需下載數十 GB 的遊戲本體，即可透過系統底層進程名稱映射與 Discord Rich Presence (RPC) 標準協議，在極低資源消耗下實現遊戲狀態回報、社群任務（Quests）進度推進，以及第三方開發者認證資格的常態性維護。
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-[#2e2e2e] pb-1.5 flex items-center gap-2">
              <span className="text-neutral-400 font-mono">二、</span>
              課題分析與開發背景 (Problem Statement)
            </h3>
            <div className="space-y-2">
              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3">
                <strong className="text-neutral-200 block mb-0.5 text-xs">
                  1. 硬體與頻寬負擔過重：
                </strong>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  使用者若僅為了在 Discord 展示遊玩動態、累積遊戲時數或參與特定平台活動，通常必須下載完整遊戲檔案（動輒 50GB ~ 140GB）並長時間常駐執行，對本機高耗電 CPU、GPU、RAM 與儲存空間造成無謂消耗。
                </p>
              </div>

              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3">
                <strong className="text-neutral-200 block mb-0.5 text-xs">
                  2. 手動操作面臨認證失效風險：
                </strong>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Discord 官方規定「活躍開發者勳章 (Active Developer Badge)」必須在 30 天內至少有一筆斜線指令（Slash Command）互動記錄。一般開發者容易因忘記手動維護而導致認證資格過期失效。
                </p>
              </div>

              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3">
                <strong className="text-neutral-200 block mb-0.5 text-xs">
                  3. 缺乏統一的排程與看門狗機制：
                </strong>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  既有的 RPC 工具多數僅提供靜態自訂文字，缺乏與 Discord 官方資料庫（遊戲 ID、CDN 圖示）的即時同步，亦無網路斷線自動重連或動態隨機防檢測延遲機制。
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-[#2e2e2e] pb-1.5 flex items-center gap-2">
              <span className="text-neutral-400 font-mono">三、</span>
              系統架構與技術特點 (System Architecture & Highlights)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3.5">
                <strong className="text-neutral-200 block text-xs mb-1">
                  1. 微型進程映射引擎
                </strong>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
                  <li>利用 Windows API 建立無 GUI 的微型常駐進程。</li>
                  <li>設定執行緒與進程名稱，模擬目標遊戲之主程式。</li>
                  <li>記憶體佔用量控制在 20MB 以下，CPU 使用率趨近 0%。</li>
                </ul>
              </div>

              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3.5">
                <strong className="text-neutral-200 block text-xs mb-1">
                  2. 官方端點同步模組
                </strong>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
                  <li>自 Discord 官方應用程式端點自動拉取遊戲 Title ID 與正式名稱。</li>
                  <li>高解析度圖示同步，狀態展示與官方原生啟動完全一致。</li>
                </ul>
              </div>

              <div className="bg-[#202020] border border-[#2f2f2f] rounded p-3.5">
                <strong className="text-neutral-200 block text-xs mb-1">
                  3. 排程器與看門狗監控
                </strong>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc pl-4">
                  <li>動態隨機延遲 (Jitter Delay) 避免規律性存取觸發風控。</li>
                  <li>主動輪詢本機 Discord 客戶端進程存活狀態與自動重連。</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-2">
            <h3 className="text-sm font-bold text-neutral-100 border-b border-[#2e2e2e] pb-1.5 flex items-center gap-2">
              <span className="text-neutral-400 font-mono">四、</span>
              功能模組規格 (Functional Specifications)
            </h3>
            <div className="overflow-x-auto border border-[#2f2f2f] rounded">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#222222] text-neutral-400 font-mono border-b border-[#2e2e2e]">
                  <tr>
                    <th className="p-2.5">模組編號</th>
                    <th className="p-2.5">模組名稱</th>
                    <th className="p-2.5">關鍵技術 / 核心邏輯</th>
                    <th className="p-2.5">交付成果</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a] font-mono">
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-300">MOD-01</td>
                    <td className="p-2.5 text-neutral-200 font-sans">進程映射子系統</td>
                    <td className="p-2.5 text-neutral-400">Windows Process API, 執行檔名偽裝</td>
                    <td className="p-2.5 text-neutral-300 font-sans">免安裝遊戲本體之狀態回報</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-300">MOD-02</td>
                    <td className="p-2.5 text-neutral-200 font-sans">時數等級試算器</td>
                    <td className="p-2.5 text-neutral-400">差額推算演算法、連續運作耗時推導</td>
                    <td className="p-2.5 text-neutral-300 font-sans">距離目標勳章門檻之所需時數與預計達成日</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-300">MOD-03</td>
                    <td className="p-2.5 text-neutral-200 font-sans">開發者勳章維護器</td>
                    <td className="p-2.5 text-neutral-400">Discord API Gateway, 斜線指令自動排程觸發</td>
                    <td className="p-2.5 text-neutral-300 font-sans">常態維持 30 天內活躍指令記錄</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-300">MOD-04</td>
                    <td className="p-2.5 text-neutral-200 font-sans">Quests 任務信號器</td>
                    <td className="p-2.5 text-neutral-400">任務進度監控、心跳信號回傳</td>
                    <td className="p-2.5 text-neutral-300 font-sans">自動滿足社群活動挑戰與限時勳章領取條件</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-neutral-300">MOD-05</td>
                    <td className="p-2.5 text-neutral-200 font-sans">容錯與日誌系統</td>
                    <td className="p-2.5 text-neutral-400">Python Logging, 自動重連與錯誤重試機制</td>
                    <td className="p-2.5 text-neutral-300 font-sans">運作日誌記錄與異常自癒機制</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5 & 6 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <section className="bg-[#202020] border border-[#2f2f2f] rounded p-3.5 space-y-1.5">
              <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <span className="font-mono text-neutral-400">五、</span>
                技術堆疊 (Technology Stack)
              </h3>
              <ul className="text-xs text-neutral-400 space-y-0.5 list-disc pl-4 font-mono">
                <li>核心語言：Python 3.10+ / CTypes / Threading</li>
                <li>系統接口：Discord RPC (IPC Socket \\.\pipe\discord-ipc-0)</li>
                <li>端點通訊：Discord REST API (v10 Gateway)</li>
                <li>支援平台：Windows 10 / Windows 11 (x64)</li>
              </ul>
            </section>

            <section className="bg-[#202020] border border-[#2f2f2f] rounded p-3.5 space-y-1.5">
              <h3 className="text-xs font-semibold text-neutral-200 flex items-center gap-1.5">
                <span className="font-mono text-neutral-400">六、</span>
                安全合規與道德準則 (Compliance & Ethics)
              </h3>
              <ul className="text-xs text-neutral-400 space-y-1">
                <li>
                  <strong className="text-neutral-200">1. 非侵入式架構：</strong>本工具不包含任何 DLL 注入、記憶體掛鉤（Hooking）或修改 Discord 客戶端二進位檔之行為。
                </li>
                <li>
                  <strong className="text-neutral-200">2. 純本地資料儲存：</strong>所有參數、排程設定與憑證僅儲存於本機端，不向任何第三方伺服器回傳遙測或使用者資料。
                </li>
                <li>
                  <strong className="text-neutral-200">3. 使用者顯式控制：</strong>所有自動化調度任務均需由使用者主動配置並啟動，提供明確的停止與退出機制。
                </li>
              </ul>
            </section>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-[#202020] border-t border-[#2f2f2f] flex items-center justify-between">
          <span className="text-[11px] text-neutral-400 font-mono">
            Discord Activity Master (DAM) · Specifications Document
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs text-neutral-300 hover:text-white bg-[#2c2c2c] hover:bg-[#383838] rounded border border-[#3a3a3a] transition-colors"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
