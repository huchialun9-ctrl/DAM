import { useState, useEffect, useCallback, useMemo } from 'react';
import { GamePreset } from '../types/dam';
import { GAME_PRESETS } from '../data/presets';

export interface UseDiscordGamesResult {
  games: GamePreset[];
  popularPresets: GamePreset[];
  totalCount: number;
  isLoading: boolean;
  page: number;
  totalPages: number;
  searchQuery: string;
  selectedTheme: string;
  setSearchQuery: (query: string) => void;
  setSelectedTheme: (theme: string) => void;
  setPage: (page: number) => void;
  loadUniversalistPool: () => Promise<GamePreset[]>;
}

export function useDiscordGames(): UseDiscordGamesResult {
  const [games, setGames] = useState<GamePreset[]>(GAME_PRESETS);
  const [popularPresets] = useState<GamePreset[]>(GAME_PRESETS);
  const [totalCount, setTotalCount] = useState<number>(25188);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(630);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('all');

  const fetchGames = useCallback(async (q: string, theme: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: p.toString(),
        limit: '40',
      });
      if (q.trim()) params.set('q', q.trim());
      if (theme && theme !== 'all') params.set('theme', theme);

      const res = await fetch(`/api/discord/games?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.games)) {
          setGames(data.games);
          setTotalCount(data.total || 25188);
          setTotalPages(data.totalPages || 1);
          setPage(data.page || 1);
        }
      }
    } catch (e) {
      console.warn('Failed to fetch Discord games catalog:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchGames(searchQuery, selectedTheme, 1);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedTheme, fetchGames]);

  // Handle page change
  const handlePageChange = useCallback(
    (newPage: number) => {
      setPage(newPage);
      fetchGames(searchQuery, selectedTheme, newPage);
    },
    [fetchGames, searchQuery, selectedTheme]
  );

  const loadUniversalistPool = useCallback(async (): Promise<GamePreset[]> => {
    try {
      const res = await fetch('/api/discord/games/universalist-pool?count=575');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.games)) {
          return data.games;
        }
      }
    } catch (e) {
      console.warn('Universalist pool fetch error:', e);
    }
    return GAME_PRESETS;
  }, []);

  return {
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
    setPage: handlePageChange,
    loadUniversalistPool,
  };
}
