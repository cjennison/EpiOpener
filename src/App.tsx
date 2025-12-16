import { Box, Text } from '@mantine/core';
import { useOverlayStore } from './stores/overlayStore';
import { OverlayListener } from './features/act/components/OverlayListener';

export function App() {
  const { playerName, playerJob, currentZone, inCombat } = useOverlayStore();

  return (
    <Box
      style={{
        backgroundColor: 'transparent',
        padding: '20px',
        color: 'white',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <OverlayListener />

      <Box style={{ marginBottom: '20px' }}>
        <Text size="xl" fw={700}>
          EpiOpener - ACT Integration Active
        </Text>
      </Box>

      <Box>
        <Text>Player: {playerName || 'Unknown'}</Text>
        <Text>Job: {playerJob || 'Unknown'}</Text>
        <Text>Zone: {currentZone || 'Unknown'}</Text>
        <Text>Combat: {inCombat ? 'YES' : 'NO'}</Text>
      </Box>
    </Box>
  );
}
