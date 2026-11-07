import React, { useState } from 'react';
import { LogEntry, WatchdogMetrics } from '../types/dam';
import {
  Terminal,
  Shield,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Radio,
  CheckCircle2,
  Activity,
} from 'lucide-react';

interface WatchdogLogsModuleProps {
  logs: LogEntry[];
  metrics: WatchdogMetrics;
  onClearLogs: () => void;
  onTriggerHealthCheck: () => void;
}

export const WatchdogLogsModule: React.FC<WatchdogLogsModuleProps> = ({
  logs,
  metrics,
  onClearLogs,
  onTriggerHealthCheck,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [filterModule, setFilterModule] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = logs.filter((log) => {
    if (filterLevel !== 'ALL' && log.level !== filterLevel) return false;
    if (filterModule !== 'ALL' && log.module !== filterModule) return false;
    if (
      searchQuery &&
      !log.message.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const handleExportLogs = () => {
    const text = logs
      .map(
        (l) =>
          `[${l.timestamp}] [${l.level.padEnd(8)}] [${l.module}] ${l.message}`
      )
      .join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dam_runtime_${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2e2e2e]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-medium text-neutral-300 bg-[#262626] border border-[#383838] px-2 py-0.5 rounded">
              MOD-05
            </span>
            <h2 className="text-lg font-bold text-neutral-100 tracking-tight">
              容錯與日誌系統 (Watchdog & Logging System)
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
            基於 Python Logging 標準規格、本機 Discord.exe 進程存活輪詢、具名管道斷線指數退避自動重試（Backoff Retry）與異常自癒看門狗。
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onTriggerHealthCheck}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-neutral-400" />
            <span>健康度檢測</span>
          </button>
          <button
            onClick={handleExportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-300 bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-neutral-400" />
            <span>匯出 .log</span>
          </button>
          <button
            onClick={onClearLogs}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-neutral-400 hover:text-neutral-200 bg-[#242424] hover:bg-[#2c2c2c] border border-[#333333] rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清除</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>客戶端進程監控</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-sm font-bold font-mono text-neutral-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{metrics.clientDetected ? '常駐運行中' : '未啟動'}</span>
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
            Discord.exe (Windows Tasklist)
          </span>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>IPC 通道</span>
            <Radio className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-2 text-xs font-bold font-mono text-neutral-200 truncate">
            {metrics.pipeName}
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            握手通訊正常
          </span>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>重連與自癒計數</span>
            <Activity className="w-3.5 h-3.5 text-neutral-400" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-neutral-100 tabular-nums">
            {metrics.reconnectAttempts} 次
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
            指數退避 2s ~ 60s
          </span>
        </div>

        <div className="bg-[#1e1e1e] border border-[#2f2f2f] rounded-lg p-3.5">
          <div className="flex items-center justify-between text-xs text-neutral-400">
            <span>健康評分</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 text-base font-bold font-mono text-emerald-400 tabular-nums">
            {metrics.healthScore} / 100
          </div>
          <span className="text-[10px] text-neutral-500 font-mono mt-1 block">
            心跳延遲: {metrics.networkLatencyMs}ms
          </span>
        </div>
      </div>

      {/* Terminal Log Viewer */}
      <div className="bg-[#181818] border border-[#2f2f2f] rounded-lg overflow-hidden shadow-xs flex flex-col font-mono text-xs">
        <div className="bg-[#202020] border-b border-[#2e2e2e] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-neutral-400" />
            <span className="font-semibold text-neutral-200">dam_runtime.log</span>
            <span className="text-[11px] text-neutral-500">
              ({filteredLogs.length} 筆記錄)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-[#262626] rounded p-0.5 border border-[#333333]">
              {['ALL', 'INFO', 'RPC', 'WATCHDOG', 'WARN'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                    filterLevel === lvl
                      ? 'bg-[#383838] text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search className="w-3 h-3 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="過濾日誌..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#262626] border border-[#333333] rounded pl-6 pr-2 py-0.5 text-[11px] text-neutral-100 placeholder-neutral-500 focus:outline-none w-36"
              />
            </div>
          </div>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto space-y-1 bg-[#141414]">
          {filteredLogs.length === 0 ? (
            <div className="text-neutral-500 py-6 text-center">無符合條件之日誌</div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-2 py-0.5 hover:bg-[#1f1f1f] rounded px-1 text-[11px] leading-relaxed"
              >
                <span className="text-neutral-500 shrink-0 tabular-nums">
                  [{log.timestamp}]
                </span>
                <span
                  className={`px-1 py-0.1 rounded text-[9px] font-bold shrink-0 ${
                    log.level === 'WARN'
                      ? 'text-amber-400 bg-amber-950/40'
                      : log.level === 'RPC'
                      ? 'text-blue-400 bg-blue-950/40'
                      : log.level === 'WATCHDOG'
                      ? 'text-purple-400 bg-purple-950/40'
                      : log.level === 'QUEST'
                      ? 'text-emerald-400 bg-emerald-950/40'
                      : 'text-neutral-300 bg-[#242424]'
                  }`}
                >
                  {log.level}
                </span>
                <span className="text-neutral-400 shrink-0 font-medium">
                  [{log.module}]
                </span>
                <span className="text-neutral-300 break-all">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
