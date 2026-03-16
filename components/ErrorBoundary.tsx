
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

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
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f2a43] flex items-center justify-center p-6">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 max-w-md w-full text-center shadow-2xl">
            <div className="w-16 h-16 bg-rose-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-rose-500" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f2a43] mb-4">Something went wrong</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              We encountered an unexpected error while rendering this view. Your data is safe, but the display crashed.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[#00a3e0] text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-[#0092c9] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reload Application</span>
            </button>
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-600 break-words">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
