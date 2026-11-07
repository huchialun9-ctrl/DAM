import { useState, useEffect, useCallback, useMemo } from 'react';
import { DiscordBadgeItem } from '../types/dam';
import { DISCORD_BADGE_ENCYCLOPEDIA } from '../data/presets';
import { Clock, Tv, Layers, Shield, Gift, Flame, Award } from 'lucide-react';

const CACHE_KEY = 'dam_discord_badges_cdn_v3';
const CACHE_TIME_KEY = 'dam_discord_badges_cdn_synced_at';

export interface UseDiscordBadgesResult {
  badges: DiscordBadgeItem[];
  pendingBadges: DiscordBadgeItem[];
  unlockedBadges: DiscordBadgeItem[];
  unlockedBadgeIds: string[];
  isLoading: boolean;
  isSyncing: boolean;
  error: string | null;
  lastSyncedAt: Date | null;
  nextRunAt: string | null;
  cdnStatus: 'synced' | 'syncing' | 'local' | 'error';
  cdnSource: string;
  totalBadges: number;
  crawlerState: {
    isInitialized: boolean;
    isRunning: boolean;
    lastRunTimestamp: string | null;
    nextRunTimestamp: string | null;
    totalSyncedBadges: number;
    syncIntervalHours: number;
    cdnGatewayStatus: string;
  } | null;
  recentLogs: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
  }>;
  categories: Array<{
    id: string;
    label: string;
    count: number;
    icon: any;
  }>;
  refreshBadges: (force?: boolean) => Promise<void>;
  triggerManualSync: () => Promise<void>;
  unlockBadge: (badgeId: string) => Promise<any>;
  getBadgeById: (id: string) => DiscordBadgeItem | undefined;
  getBadgesByCategory: (category: string) => DiscordBadgeItem[];
}

export function useDiscordBadges(options: { autoRefresh?: boolean; intervalMs?: number } = {}): UseDiscordBadgesResult {
  const { autoRefresh = false, intervalMs = 300000 } = options;

  const [badges, setBadges] = useState<DiscordBadgeItem[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DISCORD_BADGE_ENCYCLOPEDIA;
  });

  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([
    'hours_casual',
    'hours_recreational',
    'stream_newcomer',
    'variety_trial',
    'badge_active_dev',
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [cdnStatus, setCdnStatus] = useState<'synced' | 'syncing' | 'local' | 'error'>('local');
  const [cdnSource, setCdnSource] = useState<string>('Discord 官方 CDN 資產庫');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(() => {
    try {
      const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
      return cachedTime ? new Date(cachedTime) : null;
    } catch {
      return null;
    }
  });

  const [nextRunAt, setNextRunAt] = useState<string | null>(null);
  const [crawlerState, setCrawlerState] = useState<{
    isInitialized: boolean;
    isRunning: boolean;
    lastRunTimestamp: string | null;
    nextRunTimestamp: string | null;
    totalSyncedBadges: number;
    syncIntervalHours: number;
    cdnGatewayStatus: string;
  } | null>(null);
  const [recentLogs, setRecentLogs] = useState<Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
  }>>([]);

  const fetchCrawlerStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/crawler/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.state) {
          setCrawlerState(data.state);
          if (data.state.nextRunTimestamp) setNextRunAt(data.state.nextRunTimestamp);
          if (Array.isArray(data.recentLogs)) setRecentLogs(data.recentLogs);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchOfficialBadges = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsSyncing(true);
    }
    setError(null);

    try {
      setCdnStatus('syncing');
      const [response, syncRes] = await Promise.all([
        fetch('/api/discord/badges', {
          headers: {
            Accept: 'application/json',
            'Cache-Control': isManualRefresh ? 'no-cache' : 'default',
          },
        }),
        fetch('/api/discord/account-sync-state'),
      ]);

      let activeUnlockedIds: string[] = [];
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        if (Array.isArray(syncData.unlockedBadgeIds)) {
          activeUnlockedIds = syncData.unlockedBadgeIds;
          setUnlockedBadgeIds(syncData.unlockedBadgeIds);
        }
      }

      if (!response.ok) {
        throw new Error(`API 同步異常 (HTTP ${response.status})`);
      }

      const data = await response.json();
      if (Array.isArray(data.unlockedBadgeIds) && activeUnlockedIds.length === 0) {
        activeUnlockedIds = data.unlockedBadgeIds;
        setUnlockedBadgeIds(data.unlockedBadgeIds);
      }

      if (data && data.success && Array.isArray(data.badges)) {
        const syncedBadges: DiscordBadgeItem[] = data.badges.map((item: any) => {
          const safeIcon = item.icon || item.officialCdnUrl || '/badges/core/quest.png';
          return {
            ...item,
            icon: safeIcon,
            verified: true,
            status: activeUnlockedIds.includes(item.id) ? 'claimed' : item.status || 'available',
          };
        });

        setBadges(syncedBadges);
        setCdnStatus('synced');
        setCdnSource(data.cdnSource || 'Discord Official REST API & CDN Asset Gateway');
        if (data.nextRunAt) setNextRunAt(data.nextRunAt);
        const now = data.syncedAt ? new Date(data.syncedAt) : new Date();
        setLastSyncedAt(now);

        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(syncedBadges));
          localStorage.setItem(CACHE_TIME_KEY, now.toISOString());
        } catch {
          // ignore
        }
      } else {
        setBadges(DISCORD_BADGE_ENCYCLOPEDIA);
        setCdnStatus('local');
      }

      await fetchCrawlerStatus();
    } catch (err: any) {
      setError(err.message);
      setCdnStatus('local');
      if (badges.length === 0) {
        setBadges(DISCORD_BADGE_ENCYCLOPEDIA);
      }
    } finally {
      setIsLoading(false);
      setIsSyncing(false);
    }
  }, [badges.length, fetchCrawlerStatus]);

  const unlockBadge = useCallback(
    async (badgeId: string) => {
      const res = await fetch('/api/discord/unlock-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ badgeId }),
      });
      const data = await res.json();
      if (data && Array.isArray(data.unlockedBadgeIds)) {
        setUnlockedBadgeIds(data.unlockedBadgeIds);
        setBadges((prev) =>
          prev.map((b) =>
            data.unlockedBadgeIds.includes(b.id) ? { ...b, status: 'claimed' } : b
          )
        );
      }
      return data;
    },
    []
  );

  const triggerManualSync = useCallback(async () => {
    setIsSyncing(true);
    setCdnStatus('syncing');
    try {
      const res = await fetch('/api/crawler/sync-now', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.state) {
          setCrawlerState(data.state);
          if (data.state.nextRunTimestamp) setNextRunAt(data.state.nextRunTimestamp);
          if (Array.isArray(data.recentLogs)) setRecentLogs(data.recentLogs);
        }
      }
      await fetchOfficialBadges(false);
    } catch (err: any) {
      setError(`同步失敗: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchOfficialBadges]);

  useEffect(() => {
    fetchOfficialBadges(false);

    if (autoRefresh && intervalMs > 0) {
      const timer = setInterval(() => {
        fetchOfficialBadges(false);
      }, intervalMs);
      return () => clearInterval(timer);
    }
  }, [fetchOfficialBadges, autoRefresh, intervalMs]);

  const refreshBadges = useCallback(async (force = true) => {
    await fetchOfficialBadges(force);
  }, [fetchOfficialBadges]);

  const pendingBadges = useMemo(
    () => badges.filter((b) => !unlockedBadgeIds.includes(b.id) && b.status !== 'claimed'),
    [badges, unlockedBadgeIds]
  );

  const unlockedBadges = useMemo(
    () => badges.filter((b) => unlockedBadgeIds.includes(b.id) || b.status === 'claimed'),
    [badges, unlockedBadgeIds]
  );

  const getBadgeById = useCallback(
    (id: string) => badges.find((b) => b.id === id),
    [badges]
  );

  const getBadgesByCategory = useCallback(
    (category: string) => {
      if (category === 'all') return pendingBadges;
      return pendingBadges.filter((b) => b.category === category);
    },
    [pendingBadges]
  );

  const categories = useMemo(() => {
    const playtimeCount = pendingBadges.filter((b) => b.category === 'playtime').length;
    const streamingCount = pendingBadges.filter((b) => b.category === 'streaming').length;
    const varietyCount = pendingBadges.filter((b) => b.category === 'variety').length;
    const devCount = pendingBadges.filter((b) => b.category === 'developer').length;
    const questCount = pendingBadges.filter((b) => b.category === 'quests').length;
    const hypeCount = pendingBadges.filter((b) => b.category === 'hypesquad').length;

    return [
      { id: 'all', label: '待解鎖官方徽章', count: pendingBadges.length, icon: Award },
      { id: 'playtime', label: `遊戲時數 (${playtimeCount})`, count: playtimeCount, icon: Clock },
      { id: 'streaming', label: `正在直播 (${streamingCount})`, count: streamingCount, icon: Tv },
      { id: 'variety', label: `遊戲多樣性 (${varietyCount})`, count: varietyCount, icon: Layers },
      { id: 'developer', label: '活躍開發者', count: devCount, icon: Shield },
      { id: 'quests', label: '官方任務', count: questCount, icon: Gift },
      { id: 'hypesquad', label: 'HypeSquad', count: hypeCount, icon: Flame },
    ];
  }, [pendingBadges]);

  return {
    badges,
    pendingBadges,
    unlockedBadges,
    unlockedBadgeIds,
    isLoading,
    isSyncing,
    error,
    lastSyncedAt,
    nextRunAt,
    cdnStatus,
    cdnSource,
    totalBadges: pendingBadges.length,
    crawlerState,
    recentLogs,
    categories,
    refreshBadges,
    triggerManualSync,
    unlockBadge,
    getBadgeById,
    getBadgesByCategory,
  };
}
