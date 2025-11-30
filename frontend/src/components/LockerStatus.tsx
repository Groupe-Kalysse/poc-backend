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
  const [focusedLocker, setFocusedLocker] = useState<Locker | null>(null);
  const { socket, isConnected } = useSocket();

  async function openLocker() {
    console.log("open ", focusedLocker?.id);
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/open`, {
      method: "PUT",
    });
    setFocusedLocker(null);
  }
  async function closeLocker() {
    console.log("close ", focusedLocker?.id);
    if (!focusedLocker) return;
    await fetch(`/api/lockers/${focusedLocker.id}/close`, {
      method: "PUT",
    });
    setFocusedLocker(null);
  }
  const hFeedback = (data: { locks: Lockers }) => {
    setLockers(data.locks);
  };

  const hBadge = async (data: { trace: string }) => {
    if (!socket) return;
    console.log({ focusedLocker });

    if (!focusedLocker) return;

    if (focusedLocker.status === "open")
      socket.emit("ask-close", {
        locker: focusedLocker.id,
        idType: "badge",
        code: data.trace,
      });
    // else
    //   socket.emit("ask-open", {
    //     locker: focusedLocker.id,
    //     idType: "badge",
    //     code: data,
    //   });
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("welcome", hFeedback);
    // socket.on("claim", hFeedback);
    // socket.on("free", hFeedback);
    // socket.on("open", hFeedback);
    socket.on("close", hFeedback);

    socket.on("badge", hBadge);
    socket.on("open", hFeedback);

    return () => {
      // socket.off("claim", hFeedback);
      // socket.off("free", hFeedback);
      socket.off("welcome", hFeedback);
      socket.off("open", hFeedback);
      socket.off("close", hFeedback);
      socket.on("badge", hBadge);
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
    <Dialog onOpenChange={() => setFocusedLocker(null)}>
      <ul className="container">
        {lockers.map((locker) => {
          return (
            <DialogTrigger key={locker.id} asChild>
              <li
                className={`${locker.status} ${
                  focusedLocker?.id === locker.id && "claimed"
                } ${locker.lockerNumber}`}
                onClick={async () => {
                  console.log("ask to claim locker", locker);
                  setFocusedLocker(locker);
                }}
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
