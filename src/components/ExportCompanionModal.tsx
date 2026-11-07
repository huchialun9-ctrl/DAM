import React, { useState } from 'react';
import { GamePreset, DeveloperBadgeConfig, ProcessState } from '../types/dam';
import {
  generatePythonDaemonScript,
  generateRequirementsTxt,
  generateConfigFile,
} from '../utils/pythonScriptGenerator';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Terminal,
  FolderArchive,
  CheckCircle2,
} from 'lucide-react';

interface ExportCompanionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeGame: GamePreset;
  processState: ProcessState;
  badgeConfig: DeveloperBadgeConfig;
  details: string;
  state: string;
}

export const ExportCompanionModal: React.FC<ExportCompanionModalProps> = ({
  isOpen,
  onClose,
  activeGame,
  processState,
  badgeConfig,
  details,
  state,
}) => {
  if (!isOpen) return null;

  const [activeFile, setActiveFile] = useState<
    'script' | 'requirements' | 'config' | 'bat'
  >('script');
  const [copied, setCopied] = useState(false);

  const pythonScript = generatePythonDaemonScript(
    processState,
    activeGame,
    badgeConfig,
    details,
    state
  );

  const requirementsTxt = generateRequirementsTxt();
  const configJson = generateConfigFile(activeGame, badgeConfig, details, state);
  const batScript = `@echo off
title Discord Activity Master (DAM) Launcher
echo ========================================================
echo  Launching Discord Activity Master (DAM) Windows Host...
echo  Target Executable: ${activeGame.executableName}
echo ========================================================
python -m pip install -r requirements.txt
python dam_daemon.py
pause
`;

  const getFileContent = () => {
    switch (activeFile) {
      case 'script':
        return { filename: 'dam_daemon.py', content: pythonScript };
      case 'requirements':
        return { filename: 'requirements.txt', content: requirementsTxt };
      case 'config':
        return { filename: 'dam_config.json', content: configJson };
      case 'bat':
        return { filename: 'start_dam.bat', content: batScript };
    }
  };

  const current = getFileContent();

  const handleCopy = () => {
    navigator.clipboard.writeText(current.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([current.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = current.filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const files = [
      { name: 'dam_daemon.py', content: pythonScript },
      { name: 'requirements.txt', content: requirementsTxt },
      { name: 'dam_config.json', content: configJson },
      { name: 'start_dam.bat', content: batScript },
    ];

    files.forEach((file, index) => {
      setTimeout(() => {
        const blob = new Blob([file.content], {
          type: 'text/plain;charset=utf-8',
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }, index * 200);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#111214]/80 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-[#1e1f22] border border-[#2b2d31] rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#111214] border-b border-[#2b2d31] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#5865F2] flex items-center justify-center text-white shadow-sm">
              <FileCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-neutral-100">
                匯出 Windows 原生守護程式 (Python Companion Daemon)
              </h2>
              <p className="text-xs text-neutral-400">
                可直接於本機 Windows 常駐運行，直連具名管道 \\.\pipe\discord-ipc-0，免開瀏覽器。
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 rounded-md hover:bg-[#2b2d31] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* File Tabs & Actions Strip */}
        <div className="px-6 py-2.5 bg-[#18191c] border-b border-[#2b2d31] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            {[
              { id: 'script', name: 'dam_daemon.py' },
              { id: 'requirements', name: 'requirements.txt' },
              { id: 'config', name: 'dam_config.json' },
              { id: 'bat', name: 'start_dam.bat' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFile(f.id as any)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                  activeFile === f.id
                    ? 'bg-[#5865F2] text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white hover:bg-[#2b2d31]'
                }`}
              >
                {f.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-200 bg-[#2b2d31] hover:bg-[#35373c] rounded-md border border-[#3f4147] transition-all shadow-sm"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#23A55A]" />
                  <span>已複製</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製內容</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#5865F2] hover:bg-[#4752C4] rounded-md transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載單檔</span>
            </button>
          </div>
        </div>

        {/* Code Content View */}
        <div className="flex-1 p-5 overflow-y-auto bg-[#111214] font-mono text-xs text-neutral-300">
          <pre className="overflow-x-auto whitespace-pre leading-relaxed select-all">
            {current.content}
          </pre>
        </div>

        {/* Bottom Fast Guide & 1-Click All Download */}
        <div className="px-6 py-3.5 bg-[#18191c] border-t border-[#2b2d31] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-neutral-400 flex items-center gap-2">
            <span className="font-mono text-neutral-200 font-bold">快速指引：</span>
            <span>下載檔案至同一目錄，雙擊 start_dam.bat 即可全天候自動掛機。</span>
          </div>

          <button
            onClick={handleDownloadAll}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-[#23A55A] hover:bg-[#1A7B42] text-white font-bold text-xs rounded-md transition-all shadow-sm shrink-0"
          >
            <FolderArchive className="w-4 h-4" />
            <span>打包下載全部 4 個專案檔案</span>
          </button>
        </div>
      </div>
    </div>
  );
};
