import { getFeatureFlags } from '../../utils/configuration';
import RealtimeTranscriptionConfig from './types/ServiceConfiguration';

const { enabled = false } = (getFeatureFlags()?.features?.realtime_transcription as RealtimeTranscriptionConfig) || {};

export const isFeatureEnabled = () => {
  return enabled;
};
