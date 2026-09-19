import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SkillHub ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error('Failed to clear storage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#1e1e1e] border border-neutral-800 rounded-3xl p-8 shadow-2xl space-y-5 animate-in fade-in duration-200">
            <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center mx-auto text-rose-400">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-white">Something went wrong</h2>
              <p className="text-xs text-neutral-400 leading-relaxed font-medium">
                An unexpected display or storage error occurred while processing media. You can refresh the application or reset stored cache to restore full functionality.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-[#121212] border border-neutral-800 rounded-xl p-3 text-[11px] font-mono text-rose-300 text-left overflow-x-auto max-h-24">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95"
              >
                <RefreshCw className="w-4 h-4 stroke-[3]" />
                <span>Reload Application</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="py-3 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white font-bold text-xs rounded-xl border border-neutral-700 flex items-center justify-center gap-2 transition active:scale-95"
                title="Clears local cache if corrupted data caused the issue"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Cache & Reset</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
