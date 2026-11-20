import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useJadwalSocket = <T = any>(
  events: string[],
  onUpdate: (data: T) => void
) => {
  const callbackRef = useRef(onUpdate);

  useEffect(() => {
    callbackRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!socket) {
      // Mendeteksi secara otomatis alamat IP/domain tempat browser dibuka
      const wsUrl = typeof window !== "undefined" 
        ? `${window.location.protocol}//${window.location.hostname}:4000` 
        : "http://localhost:4000";
        
      socket = io(wsUrl, {
        transports: ["websocket"],
        timeout: 5000,
        reconnection: true,
        reconnectionAttempts: 3,
      });

      socket.on("connect_error", (err) => {
        console.warn("⚠️ WebSocket connection error:", err.message);
      });

      socket.on("connect", () => {
        console.log("✅ WebSocket connected");
      });
    }

    const handlers: Record<string, (data: T) => void> = {};

    events.forEach((event) => {
      const handler = (data: T) => {
        callbackRef.current(data);
      };
      handlers[event] = handler;
      socket!.on(event, handler);
    });

    return () => {
      events.forEach((event) => {
        socket!.off(event, handlers[event]);
      });
    };
  }, [events]);
};