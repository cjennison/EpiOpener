import { useOverlayStore } from '@/stores/overlayStore';
import { ActionIcon } from './ActionIcon';
import './OpenerTimeline.css';

export function OpenerTimeline() {
  const { currentOpener, openerProgress } = useOverlayStore();

  if (!currentOpener || !openerProgress) {
    return null;
  }

  const getActionState = (index: number) => {
    if (openerProgress.isComplete || index < openerProgress.currentIndex) return 'completed';
    if (index === openerProgress.currentIndex) return 'current';
    return 'upcoming';
  };

  return (
    <div className="opener-timeline">
      <div className="timeline-header">
        <span className="job-name">{currentOpener.name || `${currentOpener.job} Opener`}</span>
        <span className="progress-text">
          {openerProgress.currentIndex} / {currentOpener.actions.length}
        </span>
      </div>

      <div className="timeline-container">
        {/* Horizontal line through GCDs */}
        <div className="timeline-line" />

        {/* One flat line of all actions */}
        <div className="timeline-slots">
          {currentOpener.actions.map((action, index) => {
            const isGCD = action.type === 'gcd';
            const isPrePull = action.delayMs && action.delayMs < 0;
            const isFirstOfPosition =
              index === 0 || currentOpener.actions[index - 1]?.position !== action.position;

            // Check if this is the first non-prepull action (to show PULL marker)
            const previousAction = index > 0 ? currentOpener.actions[index - 1] : null;
            const isFirstAfterPrePull =
              previousAction &&
              previousAction.delayMs &&
              previousAction.delayMs < 0 &&
              (!action.delayMs || action.delayMs >= 0);

            return (
              <div key={action.id} className={`action-slot ${isGCD ? 'gcd' : 'ogcd'}`}>
                {/* PULL marker - show on first action after pre-pull */}
                {isFirstAfterPrePull && (
                  <div className="pull-marker">
                    <div className="pull-line" />
                    <div className="pull-label">Pull</div>
                  </div>
                )}

                {/* Pre-pull marker */}
                {isPrePull && (
                  <div className="prepull-marker">
                    <div className="prepull-line" />
                    <div className="prepull-label">{action.delayMs}ms</div>
                  </div>
                )}

                {/* Position number - only show on first action of each position */}
                {isFirstOfPosition && <div className="position-number">{action.position}</div>}

                {/* Action icon */}
                <ActionIcon action={action} state={getActionState(index)} size="default" />

                {/* Action name */}
                <div className="action-name">{action.name}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
