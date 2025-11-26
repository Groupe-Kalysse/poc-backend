import { useEffect, useState } from "react";
import "./LockerStatus.css";
import "./LockerStatus_Layout.css";
import { useSocket } from "../hooks/useSocket";

type Lockers = {
  id: number;
  lockerNumber: string;
  status: "open" | "closed" | "claimed";
}[];
function LockerStatus() {
  const [lockers, setLockers] = useState<Lockers>([]);
  const { socket } = useSocket();

  async function updateLocker(num: number) {
    await fetch(`/api/lockers/${num}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then((res) => {
        setLockers(res);
      });
  }

  useEffect(() => {
    fetch("/api/lockers", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((res) => {
        setLockers(res);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    const hFeedback = (data: { locks: Lockers }) => {
      console.log(data.locks);

      setLockers(data.locks);
    };

    socket.on("claim", hFeedback);
    socket.on("free", hFeedback);

    return () => {
      socket.off("claim", hFeedback);
      socket.off("free", hFeedback);
    };
  }, [socket]);

  if (!lockers) return <p>Status loading...</p>;

  return (
    <ul className="container">
      {lockers.map((locker) => {
        return (
          <li
            key={locker.id}
            className={`${locker.status} ${locker.lockerNumber}`}
            onClick={() => {
              updateLocker(locker.id);
            }}
          >
            {locker.lockerNumber}
          </li>
        );
      })}
      <li className="Terminal" />
    </ul>
  );
}

export default LockerStatus;
