import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function RfidListener() {
  const [lastUid, setLastUid] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleCarteDetectee = (data: { uid: string }) => {
      setLastUid(data.uid);
      setTimeout(() => {
        setLastUid(null);
      }, 5000);
    };

    socket.on("rfid-event", handleCarteDetectee);

    return () => {
      socket.off("rfid-event", handleCarteDetectee);
    };
  }, [socket]);
  return (
    <div>
      <h2>Scanner RFID ({isConnected ? "✅" : "❌"})</h2>
      {lastUid ? (
        <p>📟 Carte détectée : {lastUid}</p>
      ) : (
        <p>Aucune carte scannée.</p>
      )}
    </div>
  );
}
