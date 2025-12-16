import { useOverlayStore } from './stores/overlayStore';
import { OverlayListener } from './features/act/components/OverlayListener';
import { OpenerTimeline } from './features/opener/components/OpenerTimeline';
import './App.css';

export function App() {
  const { currentOpener } = useOverlayStore();

  return (
    <div className="app-container">
      <OverlayListener />

      {/* Show timeline whenever an opener is loaded */}
      {currentOpener && (
        <div className="timeline-container">
          <OpenerTimeline />
        </div>
      )}
    </div>
  );
}
