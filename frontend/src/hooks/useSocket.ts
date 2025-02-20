import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

// URL du WebSocket via Nginx
const SOCKET_URL = import.meta.env.VITE_WS_URL || "http://gateway";

// Hook personnalisé
export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      path: "/socket.io/",
      transports: ["websocket"],
    });

    newSocket.on("connect", () => {
      console.log("✅ Connecté à WebSocket !");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("❌ Déconnecté du WebSocket !");
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect(); // Ferme proprement la connexion quand le composant est démonté
    };
  }, []);

  return { socket, isConnected };
};
