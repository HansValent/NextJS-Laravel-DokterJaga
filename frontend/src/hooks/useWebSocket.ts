import { useEffect } from 'react';

export function useWebSocket() {
  useEffect(() => {
    const wsHost = typeof window !== "undefined" 
      ? `ws://${window.location.hostname}:4000` 
      : "ws://localhost:4000";
      
    const ws = new WebSocket(wsHost);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'jadwal' || data.type === 'paramedic') {
        // Refresh data atau update state
        console.log('Broadcast received:', data);
      }
    };
    return () => ws.close();
  }, []);
}