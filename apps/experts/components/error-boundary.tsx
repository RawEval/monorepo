'use client';

import { Component } from 'react';
import { Button } from '@raweval/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8)',
            gap: 'var(--space-4)',
            minHeight: '200px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-error-subtle)',
            }}
          >
            <AlertTriangle style={{ width: 24, height: 24, color: 'var(--color-error)' }} />
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
              fontWeight: 500,
              marginBottom: 'var(--space-1)',
            }}>
              {this.props.fallbackMessage || 'Something went wrong'}
            </p>
            <p style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              maxWidth: 400,
            }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{ gap: 6 }}
          >
            <RefreshCw style={{ width: 14, height: 14 }} />
            Try again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
