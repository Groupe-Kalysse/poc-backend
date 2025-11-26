import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import LockerStatus from "../components/LockerStatus";

function Home() {
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const handleBadge = (data: { uid: string }) => {
      navigate(`/badge/${data.uid}`);
    };

    const handleClosedDoor = (data: { locker: number }) => {
      console.log("Should receive the event");

      //navigate(`/door/${data.locker}`)
    };

    socket.on("rfid-event", handleBadge);
    socket.on("door-event", handleClosedDoor);
    return () => {
      socket.off("rfid-event", handleBadge);
      socket.off("door-event", handleClosedDoor);
    };
  }, [socket]);

  if (isConnected)
    return (
      <>
        <section>
          <LockerStatus />
          <p>
            <span className="blue">Libre</span> -{" "}
            <span className="orange">En réservation</span> -{" "}
            <span className="red">Occupé</span>
          </p>
        </section>
        <h2>✅ Borne en attente d'instructions</h2>
        <ul>
          <li>Fermer une porte puis badger pour réserver un casier</li>
          <li>Badger pour ouvrir un casier préalablement réservé</li>
        </ul>
        <aside className="text-gray-500 opacity-70">
          <details>
            <summary>
              <h2>🐛 Debug</h2>
            </summary>
            Le reste
          </details>
        </aside>
      </>
    );
  else
    return (
      <>
        <h2>❌ Contact rompu avec les casiers</h2>
        <ul>
          <li>Merci de prendre contact avec un responsable</li>
          <li>Pour tout renseignement complémentaire, contacter Kalysse</li>
        </ul>
      </>
    );
}

export default Home;
