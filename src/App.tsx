import { useOverlayStore } from './stores/overlayStore';
import { OverlayListener } from './features/act/components/OverlayListener';

export function App() {
  const { playerName, playerJob, currentZone, inCombat } = useOverlayStore();

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
    </div>
  );
}
