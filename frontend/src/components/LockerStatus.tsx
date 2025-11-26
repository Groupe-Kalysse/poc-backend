import { useEffect, useState } from "react";
import "./LockerStatus.css";
import "./LockerStatus_Layout.css";
import { useSocket } from "../hooks/useSocket";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

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
    <>
      {/* <ul className="container">
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
      </ul> */}
      <Dialog>
        <ul className="container">
          {lockers.map((locker) => {
            return (
              <DialogTrigger asChild>
                <li
                  key={locker.id}
                  className={`${locker.status} ${locker.lockerNumber}`}
                  onClick={() => {
                    updateLocker(locker.id);
                  }}
                >
                  {locker.lockerNumber}
                </li>
              </DialogTrigger>
            );
          })}
          <li className="Terminal" />
        </ul>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reserver/Ouvrir un casier</DialogTitle>
            <DialogDescription>lorem100</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Nope
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" variant="default">
                Yep
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LockerStatus;
