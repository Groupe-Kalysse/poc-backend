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

type Locker = {
  id: number;
  lockerNumber: string;
  status: "open" | "closed" | "claimed";
};
type Lockers = Locker[];
function LockerStatus() {
  const [lockers, setLockers] = useState<Lockers>([]);
  const { socket, isConnected } = useSocket();
  const [focusedLocker, setFocus] = useState<Locker | null>(null);

  async function claimLocker(num: number) {
    console.log("claim ", focusedLocker?.id);
    await fetch(`/api/lockers/${num}/claim`, {
      method: "PUT",
    });
  }
  async function freeLocker() {
    console.log("free ", focusedLocker?.id);
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/free`, {
      method: "PUT",
    });
    setFocus(null);
  }
  async function openLocker() {
    console.log("open ", focusedLocker?.id);
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/open`, {
      method: "PUT",
    });
    setFocus(null);
  }
  async function closeLocker() {
    console.log("close ", focusedLocker?.id);
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/close`, {
      method: "PUT",
    });
    setFocus(null);
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
      setLockers(data.locks);
    };

    socket.on("claim", hFeedback);
    socket.on("free", hFeedback);
    socket.on("open", hFeedback);
    socket.on("close", hFeedback);

    return () => {
      socket.off("claim", hFeedback);
      socket.off("free", hFeedback);
      socket.off("open", hFeedback);
      socket.off("close", hFeedback);
    };
  }, [socket]);

  if (!lockers) return <p>Status loading...</p>;

  if (!isConnected)
    return (
      <>
        <h2>❌ Contact rompu avec les casiers</h2>
        <ul>
          <li>Merci de prendre contact avec un responsable</li>
          <li>Pour tout renseignement complémentaire, contacter Kalysse</li>
        </ul>
      </>
    );

  return (
    <Dialog>
      <ul className="container">
        {lockers.map((locker) => {
          return (
            <DialogTrigger
              asChild
              onClick={() => {
                setFocus(locker);
                claimLocker(locker.id);
              }}
            >
              <li
                key={locker.id}
                className={`${locker.status} ${locker.lockerNumber}`}
              >
                {locker.lockerNumber}
              </li>
            </DialogTrigger>
          );
        })}
        <li className="Terminal" />
      </ul>
      <p>
        <span className="blue">Libre</span> -{" "}
        <span className="orange">En réservation</span> -{" "}
        <span className="red">Occupé</span>
      </p>
      {/* <section>
          <h2>✅ Borne en attente d'instructions</h2>
          <ul>
            <li>Fermer une porte puis badger pour réserver un casier</li>
            <li>Badger pour ouvrir un casier préalablement réservé</li>
          </ul>
        </section> */}

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reserver/Ouvrir un casier</DialogTitle>
          <DialogDescription>lorem100</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" onClick={freeLocker}>
              Nope
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" variant="default" onClick={closeLocker}>
              Close
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="submit" variant="default" onClick={openLocker}>
              Open
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LockerStatus;
