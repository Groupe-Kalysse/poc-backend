import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import LockerStatus from "../components/LockerStatus";

function Home() {
  const { socket, isConnected } = useSocket();
  const navigate = useNavigate();
  const [status, setStatus] = useState(undefined);

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

  useEffect(() => {
    fetch("/api/system", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        //setStatus(res)
        //Debug front
        setStatus(res);
      });
  }, []);

  if (isConnected)
    return (
      <>
        <LockerStatus {...status} />
        <h2>✅ Borne en attente d'instructions</h2>
        <ul>
          <li>Fermer une porte puis badger pour réserver un casier</li>
          <li>Badger pour ouvrir un casier préalablement réservé</li>
        </ul>
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
