import { useEffect, useState } from "react";
import "./LockerStatus.css";
import "./LockerStatus_Layout.css";

type Lockers = {
  id: number;
  lockerNumber: string;
  status: string;
}[];
function LockerStatus() {
  const [lockers, setLockers] = useState<Lockers>([]);

  async function updateLocker(num: number) {
    await fetch(`/api/lockers/${num}`, {
      method: "PUT",
    })
      .then((res) => res.json())
      .then((res) => {
        const newState = lockers.map((candidate) => {
          if (candidate.id !== res.id) return candidate;
          return res;
        });
        setLockers(newState);
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
