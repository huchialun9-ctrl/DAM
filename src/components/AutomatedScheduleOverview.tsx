import React, { useState, useEffect } from 'react';
import { ScheduleTask } from '../types/dam';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCw,
  Copy,
  Check,
  Database,
  ShieldCheck,
} from 'lucide-react';

interface AutomatedScheduleOverviewProps {
  onTriggerFastInjectHours?: (hours: number) => void;
  onTriggerActiveDevPing?: () => void;
  onNavigateToTab?: (tab: string) => void;
}

export const AutomatedScheduleOverview: React.FC<AutomatedScheduleOverviewProps> = ({
  onTriggerFastInjectHours,
  onTriggerActiveDevPing,
}) => {
  const [tasks, setTasks] = useState<ScheduleTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInjectingId, setIsInjectingId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<string | null>(null);
  const [boundAccount, setBoundAccount] = useState<{
    id: string;
    username: string;
    globalName: string;
  }>({
    id: '1525721083834269777',
    username: 'lun05484',
    globalName: '我草莓感覺',
  });
  const [dbMeta, setDbMeta] = useState<{ totalGames: number; nextSync: string }>({
    totalGames: 25188,
    nextSync: '每日定時 (24h)',
  });

  const fetchScheduleOverview = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/schedule/overview');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) {
          setTasks(data.tasks);
        }
        if (data.account) {
          setBoundAccount(data.account);
        }
        if (data.totalGamesLoaded) {
          setDbMeta({
            totalGames: data.totalGamesLoaded,
            nextSync: data.nextSyncDate || '每日定時 (24h)',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch schedule overview:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduleOverview();
  }, []);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleExecuteTask = async (task: ScheduleTask) => {
    // Strictly prevent re-executing completed tasks
    if (task.status === 'completed') {
      return;
    }

    setIsInjectingId(task.id);
    setLastActionResult(null);

    try {
      if (task.id === 'task-active-dev' && onTriggerActiveDevPing) {
        onTriggerActiveDevPing();
      } else if (task.id === 'task-playtime-boost' && onTriggerFastInjectHours) {
        onTriggerFastInjectHours(100);
      }

      const res = await fetch('/api/schedule/complete-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();

      setLastActionResult(
        data.message || `排程項目「${task.name}」已執行完成並同步至綁定 Discord 帳號，狀態已鎖定為已完成。`
      );
      await fetchScheduleOverview();
    } catch (err: any) {
      setLastActionResult(`執行失敗：${err.message}`);
    } finally {
      setIsInjectingId(null);
    }
  };

  const handleCompleteRemainingTasks = async () => {
    setIsInjectingId('all-quests');
    try {
      const pending = tasks.filter((t) => t.status !== 'completed');
      for (const t of pending) {
        await fetch('/api/schedule/complete-task', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: t.id }),
        });
      }
      setLastActionResult('所有待執行排程項目皆已依序執行完畢並同步至綁定 Discord 帳號。');
      await fetchScheduleOverview();
    } catch (err: any) {
      setLastActionResult(`批次同步失敗：${err.message}`);
    } finally {
      setIsInjectingId(null);
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const allCompleted = tasks.length > 0 && completedCount === tasks.length;

  return (
    <div className="space-y-6 font-sans">
      {/* Formal Document Header */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="w-8 h-8 rounded-lg bg-[#111214] border border-[#2b2d31] flex items-center justify-center text-neutral-100">
                <Calendar className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-neutral-100 tracking-tight">
                自動化任務排程與帳號同步佇列
              </h2>
              <span className="text-xs font-mono text-neutral-400">
                · 綁定帳號：{boundAccount.globalName} (@{boundAccount.username} · ID: {boundAccount.id})
              </span>
            </div>
            <p className="text-xs text-neutral-400 max-w-2xl leading-relaxed">
              依照綁定官方 Discord 帳號與平台同步順序排列。已執行或已完成之排程項目將自動鎖定為「已完成」狀態，不可重複觸發。
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCompleteRemainingTasks}
              disabled={isInjectingId !== null || allCompleted}
              className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                allCompleted
                  ? 'bg-[#111214] text-neutral-500 border border-[#2b2d31] cursor-not-allowed'
                  : 'text-white bg-[#5865F2] hover:bg-[#4752C4] disabled:opacity-50'
              }`}
            >
              {allCompleted ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#23A55A]" />
                  <span>全部排程項目已完成</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>依序執行剩餘排程 ({tasks.length - completedCount} 項)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={fetchScheduleOverview}
              disabled={isLoading}
              className="p-2 text-neutral-300 bg-[#111214] hover:bg-[#2b2d31] border border-[#2b2d31] rounded-md transition-colors"
              title="重新整理排程狀態"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Database metadata strip */}
        <div className="pt-3 border-t border-[#2b2d31] flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-neutral-300">
              <Database className="w-3.5 h-3.5 text-[#5865F2]" />
              排程完成度：{completedCount} / {tasks.length} 項已完成
            </span>
            <span>·</span>
            <span>官方可檢測遊戲庫：{dbMeta.totalGames.toLocaleString()} 款</span>
            <span>·</span>
            <span>下次定時檢查點：{dbMeta.nextSync}</span>
          </div>
          <span className="text-neutral-300">通訊模式：Discord REST API v10 帳號同步</span>
        </div>

        {lastActionResult && (
          <div className="p-2.5 rounded-lg bg-[#111214] border border-[#23A55A] text-xs text-neutral-200 flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 text-[#23A55A] shrink-0" />
            <span className="truncate">{lastActionResult}</span>
          </div>
        )}
      </div>

      {/* Structured Schedule Table */}
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111214] text-neutral-400 font-mono border-b border-[#2b2d31]">
              <tr>
                <th className="py-3 px-4 min-w-[260px]">排程順序與任務名稱</th>
                <th className="py-3 px-4 min-w-[150px]">預計時間 / 目前數值</th>
                <th className="py-3 px-4 min-w-[130px]">同步狀態</th>
                <th className="py-3 px-4 min-w-[170px]">完成紀錄 / 憑證序號</th>
                <th className="py-3 px-4 min-w-[140px] text-right">執行操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2b2d31]">
              {tasks.map((task) => {
                const isWorking = isInjectingId === task.id;
                const isCompleted = task.status === 'completed';

                return (
                  <tr
                    key={task.id}
                    className={`transition-colors ${
                      isCompleted ? 'bg-[#18191c]' : 'hover:bg-[#232428]'
                    }`}
                  >
                    {/* Task Name & Official Discord Icon */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded bg-[#111214] border border-[#2b2d31] p-1 flex items-center justify-center shrink-0">
                          <img
                            src={task.icon}
                            alt={task.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/badges/core/quest.png';
                            }}
                          />
                        </div>
                        <div className="min-w-0">
                          <span
                            className={`font-bold block text-xs truncate ${
                              isCompleted ? 'text-neutral-300' : 'text-neutral-100'
                            }`}
                          >
                            {task.name}
                          </span>
                          <span className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Estimated Duration / Interval */}
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                        <span>{task.estimatedDuration}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-semibold border ${
                          isCompleted
                            ? 'bg-[#111214] text-[#23A55A] border-[#2b2d31]'
                            : 'bg-[#111214] text-neutral-200 border-[#2b2d31]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#23A55A]" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span>{isCompleted ? '已完成' : task.statusLabel}</span>
                      </span>
                    </td>

                    {/* Completion Date / Voucher */}
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      <div className="space-y-1">
                        <span>{task.completionDate}</span>
                        {task.claimedCode && (
                          <div className="flex items-center gap-1.5 pt-0.5">
                            <span className="text-[10px] text-neutral-400">憑證:</span>
                            <span className="text-[10px] font-bold text-[#23A55A] select-all">
                              {task.claimedCode}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(task.id, task.claimedCode!)}
                              className="p-0.5 text-neutral-400 hover:text-white"
                              title="複製代碼"
                            >
                              {copiedCodeId === task.id ? (
                                <Check className="w-3 h-3 text-[#23A55A]" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action Button (Completed tasks are strictly disabled and show 已完成!) */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleExecuteTask(task)}
                        disabled={isCompleted || isWorking}
                        className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                          isCompleted
                            ? 'bg-[#111214] text-neutral-500 border border-[#2b2d31] cursor-not-allowed'
                            : 'bg-[#5865F2] hover:bg-[#4752C4] text-white'
                        }`}
                      >
                        {isWorking ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>執行中...</span>
                          </>
                        ) : isCompleted ? (
                          <>
                            <Check className="w-3 h-3 text-[#23A55A]" />
                            <span>已完成</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 fill-white" />
                            <span>{task.actionLabel}</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
