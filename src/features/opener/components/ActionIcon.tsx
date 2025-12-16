import type { OpenerAction } from '@/types/opener.types';
import './ActionIcon.css';

interface ActionIconProps {
  action: OpenerAction;
  state: 'upcoming' | 'current' | 'completed' | 'missed';
  size: 'default' | 'small' | 'large';
}

export function ActionIcon({ action, state, size = 'default' }: ActionIconProps) {
  const iconPath = `/icons/${action.iconId}.png`;
  const isOGCD = action.type === 'ogcd';

  // GCDs are larger, oGCDs are smaller
  const actualSize = size === 'default' ? (isOGCD ? 'small' : 'large') : size;

  return (
    <div
      className={`action-icon ${actualSize} ${state} ${isOGCD ? 'ogcd' : 'gcd'}`}
      title={action.name}
    >
      <div className="icon-wrapper">
        <img
          src={iconPath}
          alt={action.name}
          onError={(e) => {
            e.currentTarget.src = '/icons/placeholder.png';
          }}
        />

        {state === 'completed' && (
          <div className="completed-overlay">
            <svg viewBox="0 0 24 24" className="checkmark">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
