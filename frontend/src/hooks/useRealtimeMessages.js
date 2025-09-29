import { useContext } from 'react';
import { RealtimeMessageContext } from '@/components/inbox/RealtimeMessageProvider';

export const useRealtimeMessages = () => {
  const context = useContext(RealtimeMessageContext);
  if (!context) {
    throw new Error('useRealtimeMessages must be used within a RealtimeMessageProvider');
  }
  return context;
};
