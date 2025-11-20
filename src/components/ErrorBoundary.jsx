import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-background">
          <div className="text-4xl font-bold text-destructive mb-4">Oops!</div>
          <div className="text-xl text-destructive-foreground mb-8">Something went wrong.</div>
          <details className="w-1/2 p-4 bg-muted rounded-lg">
            <summary className="cursor-pointer text-muted-foreground">Error Details</summary>
            <pre className="mt-2 text-sm text-destructive-foreground whitespace-pre-wrap">
              {this.state.error && this.state.error.toString()}
            </pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
