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
        return (
          <li key={locker.id} className={locker.status}>
            {locker.lockerNumber}
          </li>
        );
      })}
    </ul>
  );
}

export default LockerStatus;
