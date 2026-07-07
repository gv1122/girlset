'use client';

import { Component, ReactNode } from 'react';

export default class ErrorBoundary extends Component<
  { children: ReactNode },
  { crashed: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error: Error) {
    console.error('Page crashed:', error);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-black font-mono text-white gap-4">
          <p className="text-xs text-white/50 tracking-widest">
            something went wrong
          </p>
          <button
            onClick={() => this.setState({ crashed: false })}
            className="border border-white/30 px-4 py-2 text-xs hover:border-white"
          >
            try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
