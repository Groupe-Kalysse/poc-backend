import "./LockerStatus.css";

type Props = {
    Locker:{
        totalSlots:number;
        claimedLockers: number[];
        tmpClosedlocker?:number
    };
    Database:number
}
function LockerStatus({Locker}:Props) {
    if(!Locker) return <p>Status loading...</p>

    return(
        <ul className="lockers">
            {Array.from(Array(Locker.totalSlots).keys()).map(locker=>{
                const claimed = Locker.claimedLockers.includes(locker) ? "claimed":""
                const closed = Locker.tmpClosedlocker===locker ? "closed":""
                return <li key={locker} className={`${claimed} ${closed}`}>{locker}</li>
            })}
        </ul>
    )
}

export default LockerStatus;
