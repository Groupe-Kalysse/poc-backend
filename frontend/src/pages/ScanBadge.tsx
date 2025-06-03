import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";

function ScanBadge() {
    const navigate = useNavigate()
    const {id} = useParams()

    useEffect(() => {
        const trigger = setTimeout( ()=>{
            navigate("/")
        },5000 )
        return ()=>{
            clearTimeout(trigger)
        }

    }, []);
    
    return (
    <>
        <h2>Casier #{id} fermé</h2>
        <p>Scanner un badge RFID pour valider la réservation</p>
        <p>Pas d'inquiétude: en l'absence de scan votre casier se réouvrira dans quelques secondes</p>
    </>)
}

export default ScanBadge;
