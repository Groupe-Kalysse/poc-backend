import { useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function RfidListener() {
  const [lastUid, setLastUid] = useState<string | null>(null);

  useSocket((uid) => {
    setLastUid(uid);
    setTimeout(() => setLastUid(null), 2000);
  });

  return (
    <div>
      <h2>Scanner RFID</h2>
      {lastUid ? (
        <p>📟 Carte détectée : {lastUid}</p>
      ) : (
        <p>Aucune carte scannée.</p>
      )}
    </div>
  );
}
