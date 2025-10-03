import { createContext, useContext } from 'react';

export const EchoContext = createContext();

export const useEchoContext = () => {
  const context = useContext(EchoContext);
  if (!context) {
    throw new Error('useEchoContext must be used within an EchoProvider');
  }
  return context;
};
