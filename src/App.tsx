import { useOverlayStore } from './stores/overlayStore';
import { OverlayListener } from './features/act/components/OverlayListener';

export function App() {
  const { playerName, playerJob, currentZone, inCombat, currentOpener, openerProgress } =
    useOverlayStore();

  return (
    <div
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: '20px',
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif',
        borderRadius: '8px',
        maxWidth: '400px',
      }}
    >
      <OverlayListener />

      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700 }}>
          EpiOpener - ACT Integration Active
        </h1>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ margin: 0 }}>Player: {playerName || 'Unknown'}</p>
        <p style={{ margin: 0 }}>Job: {playerJob || 'Unknown'}</p>
        <p style={{ margin: 0 }}>Zone: {currentZone || 'Unknown'}</p>
        <p style={{ margin: 0 }}>
          Combat: <strong>{inCombat ? 'YES' : 'NO'}</strong>
        </p>
      </div>

      {currentOpener && (
        <div
          style={{
            marginTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            paddingTop: '20px',
          }}
        >
          <h2 style={{ margin: '0 0 12px 0', fontSize: '18px', fontWeight: 600 }}>
            Current Opener: {currentOpener.name}
          </h2>
          {openerProgress && (
            <div>
              <p style={{ margin: '0 0 8px 0' }}>
                Progress: {openerProgress.completedActions.length} / {currentOpener.actions.length}
              </p>
              {openerProgress.isComplete ? (
                <p style={{ margin: 0, color: '#4ade80', fontWeight: 600 }}>✓ Opener Complete!</p>
              ) : (
                <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                  Next: {currentOpener.actions[openerProgress.currentIndex]?.name || 'N/A'}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
