import React from 'react';

interface Props {
  children: React.ReactNode;
  label?: string;
}
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', this.props.label, error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="m-4 p-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-slate-200 text-sm">
        <p className="font-bold text-rose-300 mb-1">
          Une erreur est survenue{this.props.label ? ` (${this.props.label})` : ''}.
        </p>
        <p className="text-xs text-slate-400 break-words mb-3">{this.state.error.message}</p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
        >
          Réessayer
        </button>
      </div>
    );
  }
}
