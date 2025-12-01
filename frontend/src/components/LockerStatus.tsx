import { useEffect, useRef, useState } from "react";
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
  const [focusedLockerId, setFocusedLockerId] = useState<number | null>(null);
  const focusedLocker = lockers.find((l) => l.id === focusedLockerId) ?? null;
  const focusedLockerRef = useRef<Locker | null>(null);

  const { socket, isConnected } = useSocket();

  async function openLocker() {
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/open`, {
      method: "PUT",
    });
    setFocusedLockerId(null);
  }
  async function closeLocker() {
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/close`, {
      method: "PUT",
    });
    setFocusedLockerId(null);
  }
  const hFeedback = (data: { locks: Lockers }) => {
    setLockers(data.locks);
  };

  const hBadge = async (data: { trace: string }) => {
    if (!socket) return;
    if (!focusedLockerRef.current) return; //TODO si pas de casier focus, check badges admin ?
    if (focusedLockerRef.current.status === "open") {
      socket.emit("ask-close", {
        locker: focusedLockerRef.current.id,
        idType: "badge",
        code: data.trace,
      });
    }
    if (focusedLockerRef.current.status === "closed") {
      socket.emit("ask-open", {
        locker: focusedLockerRef.current.id,
        idType: "badge",
        code: data.trace,
      });
    }
  };

  useEffect(() => {
    focusedLockerRef.current = focusedLocker;
  }, [focusedLocker]);

  useEffect(() => {
    if (!socket) return;

    socket.on("welcome", hFeedback);
    socket.on("badge", hBadge);
    socket.on("close", hFeedback);
    socket.on("open", hFeedback);

    return () => {
      socket.off("welcome", hFeedback);
      socket.off("open", hFeedback);
      socket.off("close", hFeedback);
      socket.off("badge", hBadge);
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
    <Dialog
      onOpenChange={(open) => {
        if (!open) setFocusedLockerId(null);
      }}
    >
      <ul className="container">
        {lockers.map((locker) => {
          return (
            <DialogTrigger
              key={locker.id}
              asChild
              onClick={async () => {
                setFocusedLockerId(locker.id);
              }}
            >
              <li
                className={`${locker.status} ${
                  focusedLocker?.id === locker.id && "claimed"
                } ${locker.lockerNumber}`}
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
      <section>
        <h2>✅ Borne en attente d'instructions</h2>
        <ul>
          <li>Fermer une porte puis badger pour réserver un casier</li>
          <li>Badger pour ouvrir un casier préalablement réservé</li>
        </ul>
      </section>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {focusedLocker?.status === "closed" ? "Ouvrir" : "Verrouiller"} le
            casier {focusedLocker?.lockerNumber}
          </DialogTitle>
          <DialogDescription>lorem100</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-start">
          {focusedLocker?.status === "closed" ? (
            <DialogClose asChild>
              <Button type="submit" variant="default" onClick={openLocker}>
                Ouvrir
              </Button>
            </DialogClose>
          ) : (
            <DialogClose asChild>
              <Button type="submit" variant="default" onClick={closeLocker}>
                Verrouiller
              </Button>
            </DialogClose>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default LockerStatus;
