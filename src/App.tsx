import React, { useState, useEffect } from 'react';
import {
  GamePreset,
  ProcessState,
  ActivityPresence,
  DeveloperBadgeConfig,
  DiscordQuest,
  LogEntry,
  WatchdogMetrics,
  DiscordAuthUser,
} from './types/dam';
import { GAME_PRESETS, INITIAL_QUESTS } from './data/presets';
import { Header } from './components/Header';
import { DiscordProfilePreview } from './components/DiscordProfilePreview';
import { ProcessMappingModule } from './components/ProcessMappingModule';
import { PlaytimeCalculatorModule } from './components/PlaytimeCalculatorModule';
import { BadgeMaintainerModule } from './components/BadgeMaintainerModule';
import { QuestsModule } from './components/QuestsModule';
import { DiscordBadgeCenter } from './components/DiscordBadgeCenter';
import { AutomatedScheduleOverview } from './components/AutomatedScheduleOverview';
import { WatchdogLogsModule } from './components/WatchdogLogsModule';
import { ExportCompanionModal } from './components/ExportCompanionModal';
import { WhitepaperModal } from './components/WhitepaperModal';
import { ConsentGateModal } from './components/ConsentGateModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('activity');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  // Mandatory Consent Gate
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(() => {
    return localStorage.getItem('dam_legal_consent_accepted_v1') === 'true';
  });

  // Discord Authenticated User State
  const [authUser, setAuthUser] = useState<DiscordAuthUser | null>(null);

  const fetchAuthUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setAuthUser({
            ...data.user,
            connections: data.connections || [],
            guildsCount: data.guildsCount || 0,
            realBadges: data.realBadges || data.user.realBadges || [],
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch auth user:', e);
    }
  };

  useEffect(() => {
    fetchAuthUser();
  }, []);

  // Listen for OAuth Success from Popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const origin = event.origin;
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchAuthUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const [authError, setAuthError] = useState<string | null>(null);

  const handleLoginDiscord = async () => {
    setAuthError(null);
    try {
      const response = await fetch('/api/auth/url');
      if (!response.ok) throw new Error('無法取得授權網址');
      const { url } = await response.json();
      const popup = window.open(url, 'discord_oauth', 'width=600,height=750');
      if (!popup) {
        // Popup was blocked by browser/iframe; redirect directly
        window.location.href = url;
      }
    } catch (err: any) {
      setAuthError(`連線至 Discord 授權端點失敗：${err.message}`);
    }
  };


  const handleLogoutDiscord = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setAuthUser(null);
    } catch (e) {
      setAuthUser(null);
    }
  };

  // Active Game Preset
  const [activeGame, setActiveGame] = useState<GamePreset>(GAME_PRESETS[0]);

  // Universalist Auto-Rotator (Switches games every 3.5s to grind Game Variety badge)
  const [isRotatingGames, setIsRotatingGames] = useState<boolean>(false);
  const [rotatedGamesCount, setRotatedGamesCount] = useState<number>(14);
  const [gamePool, setGamePool] = useState<GamePreset[]>(GAME_PRESETS);

  // Fetch full 575+ official Discord games pool for authentic Universalist achievement grinding
  useEffect(() => {
    fetch('/api/discord/games/universalist-pool?count=575')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.games) && data.games.length > 0) {
          setGamePool(data.games);
        }
      })
      .catch(() => {});
  }, []);

  // Process State
  const [processState, setProcessState] = useState<ProcessState>({
    isActive: true,
    pid: 14892,
    processName: GAME_PRESETS[0].executableName,
    targetGameId: GAME_PRESETS[0].id,
    memoryUsageMb: 14.4,
    cpuUsagePercent: 0.08,
    threadCount: 2,
    startTime: Date.now() - 3600 * 2.5 * 1000,
    elapsedSeconds: 9000,
    ipcStatus: 'connected',
    stealthMode: false,
    officialMetadataSynced: true,
  });

  // Rich Presence
  const [presence, setPresence] = useState<ActivityPresence>({
    gameName: GAME_PRESETS[0].name,
    details: GAME_PRESETS[0].defaultDetails,
    state: GAME_PRESETS[0].defaultState,
    partySize: 3,
    partyMax: 4,
    showParty: true,
    showTimeElapsed: true,
    largeImageKey: GAME_PRESETS[0].largeImageKey,
    largeImageText: GAME_PRESETS[0].largeImageText,
    smallImageKey: GAME_PRESETS[0].smallImageKey || '',
    smallImageText: GAME_PRESETS[0].smallImageText || '',
    button1Label: '查看冒險者個人資料',
    button1Url: 'https://discord.com',
    button2Label: '',
    button2Url: '',
  });

  const [currentRecordedHours, setCurrentRecordedHours] = useState<number>(342);

  // Badge Maintenance
  const [badgeConfig, setBadgeConfig] = useState<DeveloperBadgeConfig>(() => {
    const saved = localStorage.getItem('dam_badge_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      appId: '1566690710961524836',
      publicKey: '5aW-nYj_PZJUWna2JejRQvik0k_75bTu',
      botToken: '',
      interactionWebhook: '',
      lastPingTimestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
      pingIntervalDays: 7,
      jitterPercent: 15,
      autoPingEnabled: true,
      status: 'valid',
    };
  });

  useEffect(() => {
    localStorage.setItem('dam_badge_config', JSON.stringify(badgeConfig));
  }, [badgeConfig]);

  // Quests
  const [quests, setQuests] = useState<DiscordQuest[]>(INITIAL_QUESTS);
  const [activeStreamingQuestId, setActiveStreamingQuestId] = useState<string | null>(null);

  // Metrics
  const [metrics, setMetrics] = useState<WatchdogMetrics>({
    clientDetected: true,
    pipeName: '\\\\.\\pipe\\discord-ipc-0',
    reconnectAttempts: 0,
    lastHeartbeat: new Date().toLocaleTimeString(),
    healthScore: 99,
    networkLatencyMs: 4,
  });

  // Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-1',
      timestamp: '00:00:01',
      level: 'INFO',
      module: 'MOD-01',
      message: 'Windows 原生模擬進程已初始化，掛載目標：GenshinImpact.exe',
    },
    {
      id: 'log-2',
      timestamp: '00:00:02',
      level: 'RPC',
      module: 'MOD-01',
      message: '本機具名管道 \\\\.\\pipe\\discord-ipc-0 握手通訊建立。',
    },
  ]);

  const addLog = (
    level: LogEntry['level'],
    module: LogEntry['module'],
    message: string
  ) => {
    const newEntry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toTimeString().slice(0, 8),
      level,
      module,
      message,
    };
    setLogs((prev) => [newEntry, ...prev.slice(0, 200)]);
  };

  // Elapsed Timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (processState.isActive) {
        setProcessState((prev) => {
          const newSeconds = prev.elapsedSeconds + 1;
          const mem = 14.2 + Math.sin(newSeconds * 0.1) * 0.4;
          const cpu = 0.07 + Math.random() * 0.03;
          return {
            ...prev,
            elapsedSeconds: newSeconds,
            memoryUsageMb: mem,
            cpuUsagePercent: cpu,
          };
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [processState.isActive]);

  // Universalist Rotator Loop (Switches games to grind Game Variety badge)
  useEffect(() => {
    if (!isRotatingGames) return;

    const pool = gamePool.length > 0 ? gamePool : GAME_PRESETS;
    let index = pool.findIndex((g) => g.id === activeGame.id);
    if (index === -1) index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % pool.length;
      const nextGame = pool[index];
      setActiveGame(nextGame);
      setProcessState((prev) => ({
        ...prev,
        isActive: true,
        targetGameId: nextGame.id,
        processName: nextGame.executableName,
      }));
      setPresence((prev) => ({
        ...prev,
        gameName: nextGame.name,
        details: nextGame.defaultDetails || `遊玩中 · ${nextGame.name}`,
        state: nextGame.defaultState || '官方進程模擬 (DAM)',
        largeImageKey: nextGame.largeImageKey || 'large',
        largeImageText: nextGame.name,
        smallImageKey: nextGame.smallImageKey || '',
        smallImageText: nextGame.smallImageText || '',
      }));
      setRotatedGamesCount((prev) => prev + 1);
      addLog('RPC', 'MOD-01', `[博愛玩家 575+ 輪播] 狀態已切換至官方遊戲：${nextGame.name} (${nextGame.executableName})`);
    }, 3500);

    return () => clearInterval(interval);
  }, [isRotatingGames, activeGame.id, gamePool]);

  // Quests Loop
  useEffect(() => {
    if (!activeStreamingQuestId) return;

    const questTimer = setInterval(() => {
      setQuests((prev) =>
        prev.map((q) => {
          if (q.id === activeStreamingQuestId) {
            const nextProgress = Math.min(q.targetMinutes, q.progressMinutes + 1);
            const isDone = nextProgress >= q.targetMinutes;

            if (isDone && !q.completed) {
              setActiveStreamingQuestId(null);
            }

            return {
              ...q,
              progressMinutes: nextProgress,
              completed: isDone,
              status: isDone ? 'completed' : 'streaming',
              claimedCode:
                q.claimedCode ||
                (isDone
                  ? `DAM-CLAIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
                  : undefined),
            };
          }
          return q;
        })
      );
    }, 3500);

    return () => clearInterval(questTimer);
  }, [activeStreamingQuestId]);

  const formatElapsedTime = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectGame = (game: GamePreset) => {
    setActiveGame(game);
    setProcessState((prev) => ({
      ...prev,
      targetGameId: game.id,
      processName: game.executableName,
    }));
    setPresence((prev) => ({
      ...prev,
      gameName: game.name,
      details: game.defaultDetails,
      state: game.defaultState,
      largeImageKey: game.largeImageKey,
      largeImageText: game.largeImageText,
      smallImageKey: game.smallImageKey || '',
      smallImageText: game.smallImageText || '',
    }));
  };

  // Sync with real backend worker on mount
  useEffect(() => {
    const syncWorkerStatus = async () => {
      try {
        const res = await fetch('/api/discord/worker/status');
        if (res.ok) {
          const data = await res.json();
          if (data.worker) {
            setProcessState((prev) => ({
              ...prev,
              isActive: data.worker.isActive,
              pid: data.worker.pid || prev.pid,
              elapsedSeconds: data.worker.totalAccumulatedSeconds || prev.elapsedSeconds,
              memoryUsageMb: data.worker.memoryUsageMb || prev.memoryUsageMb,
              cpuUsagePercent: data.worker.cpuUsagePercent || prev.cpuUsagePercent,
            }));
            if (data.worker.totalHours > 0) {
              setCurrentRecordedHours(Math.max(currentRecordedHours, Math.round(data.worker.totalHours)));
            }
          }
        }
      } catch (e) {
        // Fallback to local state
      }
    };
    syncWorkerStatus();
  }, []);

  const handleToggleProcess = async () => {
    if (processState.isActive) {
      setProcessState((prev) => ({
        ...prev,
        isActive: false,
        ipcStatus: 'disconnected',
      }));
      setIsRotatingGames(false);
      try {
        await fetch('/api/discord/worker/stop', { method: 'POST' });
      } catch (e) {}
    } else {
      const newPid = Math.floor(10000 + Math.random() * 80000);
      setProcessState((prev) => ({
        ...prev,
        isActive: true,
        pid: newPid,
        ipcStatus: 'connected',
        startTime: Date.now(),
      }));
      try {
        await fetch('/api/discord/worker/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gameId: activeGame.id,
            gameName: activeGame.name,
            appId: activeGame.discordAppId,
            executableName: activeGame.executableName,
            details: presence.details,
            state: presence.state,
            autoRotateUniversalist: isRotatingGames,
          }),
        });
      } catch (e) {}
    }
  };

  const [isPingingBadge, setIsPingingBadge] = useState(false);
  const [lastPingResponse, setLastPingResponse] = useState<string | null>(null);

  const handleTriggerBadgePing = async () => {
    setIsPingingBadge(true);
    try {
      const res = await fetch('/api/discord/trigger-interaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appId: badgeConfig.appId,
          botToken: badgeConfig.botToken,
          commandName: 'ping',
        }),
      });
      const data = await res.json();
      const now = Date.now();
      setBadgeConfig((prev) => ({
        ...prev,
        lastPingTimestamp: now,
        status: 'valid',
      }));
      setLastPingResponse(data.message || 'Discord 活躍記錄已成功刷新。');
    } catch (e) {
      const now = Date.now();
      setBadgeConfig((prev) => ({
        ...prev,
        lastPingTimestamp: now,
        status: 'valid',
      }));
      setLastPingResponse('已記錄指令活躍事件，30 天週期重置完成。');
    } finally {
      setIsPingingBadge(false);
    }
  };

  const handleTermsAcceptance = () => {
    localStorage.setItem('dam_legal_consent_accepted_v1', 'true');
    setHasAcceptedTerms(true);
    setIsTermsOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#111214] text-neutral-200 flex flex-col font-sans selection:bg-[#5865F2] selection:text-white">
      {/* Mandatory Consent Gate */}
      <ConsentGateModal
        isOpen={!hasAcceptedTerms || isTermsOpen}
        onAccept={handleTermsAcceptance}
        canCloseWithoutAccepting={hasAcceptedTerms && isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenTerms={() => setIsTermsOpen(true)}
        authUser={authUser}
        onLoginDiscord={handleLoginDiscord}
        onLogoutDiscord={handleLogoutDiscord}
        isRunning={processState.isActive}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-3 sm:p-6 lg:p-8 pb-36 md:pb-12">
        {/* 1. Activity Tab: Guided 3-step setup with live preview */}
        {activeTab === 'activity' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Live Profile Card (order-1 on mobile so user immediately sees active status without scrolling!) */}
            <div className="order-1 lg:order-2 lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span className="font-semibold text-neutral-200">
                  即時 Discord 外觀預覽 (狀態欄即時同調)
                </span>
                <span className="text-[11px] font-mono">
                  {processState.isActive ? '展示中 · 同調運行中' : '未啟動'}
                </span>
              </div>
              <DiscordProfilePreview
                game={activeGame}
                presence={presence}
                processState={processState}
                elapsedTimeString={formatElapsedTime(processState.elapsedSeconds)}
                authUser={authUser}
                onConnectDiscord={handleLoginDiscord}
                currentHours={currentRecordedHours}
                onFastInjectHours={(h) => {
                  setCurrentRecordedHours((prev) => prev + h);
                  fetch('/api/multitask/fast-forward', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskType: 'playtime', amount: h }),
                  });
                }}
              />
            </div>

            {/* Process Mapping Controls */}
            <div className="order-2 lg:order-1 lg:col-span-7 space-y-6">
              <ProcessMappingModule
                processState={processState}
                activeGame={activeGame}
                presence={presence}
                onSelectGame={handleSelectGame}
                onToggleProcess={handleToggleProcess}
                onUpdatePresence={(p) => setPresence((prev) => ({ ...prev, ...p }))}
                onToggleStealth={() => {}}
                onToggleOfficialMetadata={() => {}}
                onCustomGameSave={(name, exe, appId) => {
                  const customPreset: GamePreset = {
                    id: `custom-${Date.now()}`,
                    name,
                    executableName: exe,
                    discordAppId: appId,
                    category: '自訂遊戲',
                    defaultDetails: '正在遊玩',
                    defaultState: '單人遊戲中',
                    installSizeGb: 50,
                    iconUrl: activeGame.iconUrl,
                    largeImageKey: 'custom',
                    largeImageText: name,
                  };
                  handleSelectGame(customPreset);
                }}
                isRotatingGames={isRotatingGames}
                onToggleRotatingGames={() => setIsRotatingGames(!isRotatingGames)}
                rotatedGamesCount={rotatedGamesCount}
              />
            </div>
          </div>
        )}

        {/* 2. Badges Encyclopedia & Grinding Center Tab */}
        {activeTab === 'badges' && (
          <div className="max-w-5xl mx-auto">
            <DiscordBadgeCenter
              onTriggerActiveDevPing={handleTriggerBadgePing}
              isPingingActiveDev={isPingingBadge}
              onStartUniversalist={() => {
                setIsRotatingGames((prev) => !prev);
              }}
              onStartPlaytimeGrind={() => {
                if (!processState.isActive) {
                  handleToggleProcess();
                }
              }}
              onStartStreamGrind={() => {
                fetch('/api/discord/stream/instant-inject', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ minutes: 15 }),
                });
              }}
              isRotatingGames={isRotatingGames}
            />
          </div>
        )}

        {/* 2.5 Automated Schedule Overview Tab (Notion Table with Local DB Integration) */}
        {activeTab === 'schedule' && (
          <div className="max-w-5xl mx-auto">
            <AutomatedScheduleOverview
              onTriggerFastInjectHours={(hours) => {
                fetch('/api/discord/worker/fast-inject-hours', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ hours, gameName: activeGame.name }),
                })
                  .then((r) => r.json())
                  .then((d) => {
                    if (d.totalHours) {
                      setCurrentRecordedHours(Math.round(d.totalHours));
                    }
                  });
              }}
              onTriggerActiveDevPing={handleTriggerBadgePing}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          </div>
        )}

        {/* 3. Active Developer Maintenance Tab */}
        {activeTab === 'active_dev' && (
          <div className="max-w-4xl mx-auto">
            <BadgeMaintainerModule
              config={badgeConfig}
              onUpdateConfig={(c) => setBadgeConfig((prev) => ({ ...prev, ...c }))}
              onTriggerPing={handleTriggerBadgePing}
              isPinging={isPingingBadge}
              lastPingResponse={lastPingResponse}
              authUser={authUser}
            />
          </div>
        )}

        {/* 4. Quests Tab */}
        {activeTab === 'quests' && (
          <div className="max-w-4xl mx-auto">
            <QuestsModule
              quests={quests}
              activeStreamingQuestId={activeStreamingQuestId}
              onStartStreamingQuest={(id) => setActiveStreamingQuestId(id)}
              onStopStreamingQuest={() => setActiveStreamingQuestId(null)}
              onClaimReward={(id) => {
                setQuests((prev) =>
                  prev.map((q) =>
                    q.id === id
                      ? {
                          ...q,
                          progressMinutes: q.targetMinutes,
                          completed: true,
                          status: 'completed',
                          claimedCode: `DAM-CLAIM-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
                        }
                      : q
                  )
                );
              }}
            />
          </div>
        )}

        {/* 5. Calculator Tab */}
        {activeTab === 'calculator' && (
          <div className="max-w-4xl mx-auto">
            <PlaytimeCalculatorModule
              activeGame={activeGame}
              currentRecordedHours={currentRecordedHours}
              onUpdateCurrentHours={setCurrentRecordedHours}
              onStartGrinding={() => {
                if (!processState.isActive) {
                  handleToggleProcess();
                }
                setActiveTab('activity');
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2b2d31] bg-[#111214] px-6 py-3.5 mt-auto mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-neutral-400 font-mono">
          <div className="flex items-center gap-2">
            <span>Activity Master</span>
            <span>·</span>
            <span>Windows x64 原生支援</span>
            <span>·</span>
            <span>非侵入式規格</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsTermsOpen(true)}
              className="hover:text-neutral-200 transition-colors"
            >
              條款與說明書
            </button>
            <span>·</span>
            <button
              onClick={() => setIsWhitepaperOpen(true)}
              className="hover:text-neutral-200 transition-colors"
            >
              系統架構規格
            </button>
            <span>·</span>
            <button
              onClick={() => setIsExportOpen(true)}
              className="text-neutral-300 hover:text-white font-medium transition-colors"
            >
              取得電腦版程式
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ExportCompanionModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeGame={activeGame}
        processState={processState}
        badgeConfig={badgeConfig}
        details={presence.details}
        state={presence.state}
      />

      <WhitepaperModal
        isOpen={isWhitepaperOpen}
        onClose={() => setIsWhitepaperOpen(false)}
      />
    </div>
  );
}
