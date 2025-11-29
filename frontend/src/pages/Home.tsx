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

  return (
    <>
      <section>
        <LockerStatus />
      </section>
    </>
  );
}

export default Home;
