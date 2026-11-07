import React from 'react';
import { DiscordAuthUser } from '../types/dam';
import { Download, FileText, User, LogOut, Gamepad2, Shield, Gift, Calculator, Award, Calendar } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenExport: () => void;
  onOpenTerms: () => void;
  authUser: DiscordAuthUser | null;
  onLoginDiscord: () => void;
  onLogoutDiscord: () => void;
  isRunning: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
  onOpenTerms,
  authUser,
  onLoginDiscord,
  onLogoutDiscord,
  isRunning,
}) => {
  const desktopNavItems = [
    { id: 'activity', label: '遊戲動態', icon: Gamepad2 },
    { id: 'badges', label: '徽章全集', icon: Award },
    { id: 'schedule', label: '排程概覽', icon: Calendar },
    { id: 'quests', label: '任務中心', icon: Gift },
    { id: 'active_dev', label: '開發者維護', icon: Shield },
    { id: 'calculator', label: '時數試算', icon: Calculator },
  ];

  const mobileNavItems = [
    { id: 'activity', label: '動態', icon: Gamepad2 },
    { id: 'badges', label: '徽章', icon: Award },
    { id: 'schedule', label: '排程', icon: Calendar },
    { id: 'quests', label: '任務', icon: Gift },
    { id: 'active_dev', label: '開發者', icon: Shield },
  ];

  return (
    <>
      {/* Top Header Bar: Clean 3-zone standard */}
      <header className="sticky top-0 z-40 bg-[#111214] border-b border-[#2b2d31] transition-colors font-sans select-none shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Wordmark (Formal Enterprise Document Style) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-[#5865F2] flex items-center justify-center text-xs font-bold text-white shadow-sm">
              D
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-neutral-100 tracking-tight">
                Activity Master
              </span>
              <span className="hidden sm:inline text-neutral-500">/</span>
              <span className="hidden sm:inline text-neutral-400 font-medium">
                狀態管理控制台
              </span>
            </div>
          </div>

          {/* Desktop-only Segmented Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-[#1e1f22] p-1 rounded-lg border border-[#2b2d31]">
            {desktopNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-[#5865F2] text-white shadow-sm'
                      : 'text-neutral-400 hover:text-neutral-200 hover:bg-[#2b2d31]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Terms, Script, Auth */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenExport}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all whitespace-nowrap shadow-sm"
              title="下載本機 Windows 守護進程"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">電腦版程式</span>
            </button>

            <button
              onClick={onOpenTerms}
              className="p-1.5 text-neutral-300 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all shadow-sm flex items-center gap-1"
              title="查看使用條款、系統說明書與 Cookie 協議"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium text-neutral-300">條款</span>
            </button>

            {authUser ? (
              <div className="flex items-center gap-1.5 pl-1.5 border-l border-[#2b2d31]">
                <div className="flex items-center gap-1.5 bg-[#1e1f22] border border-[#2b2d31] rounded-md px-2.5 py-1">
                  {authUser.avatar ? (
                    <img
                      src={`https://cdn.discordapp.com/avatars/${authUser.id}/${authUser.avatar}.png?size=64`}
                      alt={authUser.username}
                      referrerPolicy="no-referrer"
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-[#5865F2] flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                      {authUser.username.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="text-xs font-semibold text-neutral-200 max-w-[110px] sm:max-w-[180px] truncate">
                    {authUser.global_name || authUser.username}
                  </span>
                </div>
                <button
                  onClick={onLogoutDiscord}
                  className="p-1.5 text-neutral-400 hover:text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] border border-[#3f4147] rounded-md transition-all shadow-sm"
                  title="解除連動"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginDiscord}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-md transition-all whitespace-nowrap shadow-sm"
              >
                <User className="w-3.5 h-3.5" />
                <span>連動 Discord</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Floating Navigation Bar (Never clipped, touch target >= 44px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111214]/95 backdrop-blur-md border-t border-[#2b2d31] pb-[max(env(safe-area-inset-bottom),14px)] pt-1.5 px-2 shadow-lg">
        <nav className="flex items-center justify-around gap-1 max-w-md mx-auto">
          {mobileNavItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex-1 min-h-[46px] flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all text-center active:scale-95 ${
                  isActive
                    ? 'bg-[#5865F2] text-white font-bold shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 shrink-0 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <span className="text-[11px] leading-tight tracking-tight whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

