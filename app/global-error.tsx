'use client';

const GlobalError = ({ reset }: { error: Error; reset: () => void }) => {
  return (
    <html>
      <body
        style={{
          background: '#000',
          color: '#fff',
          fontFamily: 'monospace',
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <p style={{ fontSize: '12px', opacity: 0.5, letterSpacing: '0.2em' }}>
          something went wrong
        </p>
        <button
          onClick={reset}
          style={{
            border: '1px solid rgba(255,255,255,0.3)',
            padding: '8px 16px',
            fontSize: '11px',
            background: 'none',
            color: '#fff',
            cursor: 'pointer'
          }}
        >
          try again
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
