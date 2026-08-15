import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    try {
      const msg = `TIME: ${new Date().toISOString()}\nERROR: ${error.message}\nSTACK: ${error.stack}\nCOMPONENT STACK: ${errorInfo.componentStack}`;
      window.__AZKAR_ERROR = msg;
      if (window.electronAPI?.writeErrorLog) {
        window.electronAPI.writeErrorLog(msg);
      }
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'var(--bg-primary)',
          direction: 'rtl',
        }}>
          <div style={{ textAlign: 'center', maxWidth: 400 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
              حدث خطأ
            </h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.8 }}>
              عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.hash = '/';
                window.location.reload();
              }}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, var(--accent-green), #10b981)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
              }}
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
