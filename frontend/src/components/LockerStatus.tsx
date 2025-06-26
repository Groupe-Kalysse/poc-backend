import "./LockerStatus.css";

type Props = {
  lockers: {
    id: number;
    lockerNumber: string;
    status: string;
  }[];
};
function LockerStatus({ lockers }: Props) {
  if (!lockers) return <p>Status loading...</p>;

  return (
    <ul className="lockers">
      {lockers.map((locker) => {
        const claimed = locker.status === "claimed" ? "claimed" : "";
        const closed = locker.status === "occupied" ? "closed" : "";
        return (
          <li key={locker.id} className={`${claimed} ${closed}`}>
            {locker.lockerNumber}
          </li>
        );
      })}
    </ul>
  );
}

export default LockerStatus;
