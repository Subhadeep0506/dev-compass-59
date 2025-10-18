import React from "react";

interface State {
  hasError: boolean;
  error?: Error | null;
  info?: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  State
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Log to console so it's easy to copy the stack
    console.error("ErrorBoundary caught:", error, info);
    this.setState({ error, info });
  }

  render() {
    if (!this.state.hasError) return this.props.children as React.ReactElement;

    return (
      <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-900">
        <div className="font-semibold">Rendering error</div>
        <div className="text-sm mt-2">{this.state.error?.message}</div>
        <details className="mt-2 text-xs whitespace-pre-wrap">
          <summary className="cursor-pointer text-primary">View stack</summary>
          <div className="mt-2">{this.state.info?.componentStack}</div>
          <pre className="mt-2 bg-muted/10 p-2 rounded text-xs overflow-auto">
            {this.state.error?.stack}
          </pre>
        </details>
      </div>
    );
  }
}

export default ErrorBoundary;
