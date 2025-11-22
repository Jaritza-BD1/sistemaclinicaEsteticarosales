import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // also log to console
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    const { error, info } = this.state;
    if (error) {
      return (
        <div style={{ padding: 20 }}>
          <h2 style={{ color: '#b00020' }}>Se produjo un error en la aplicación</h2>
          <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', background: '#fff6f6', padding: 12, borderRadius: 6, border: '1px solid #f3c2c2' }}>
            {String(error && error.message)}
            {info && info.componentStack ? '\n\n' + info.componentStack : ''}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
