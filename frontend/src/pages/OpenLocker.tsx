import { useEffect } from "react";
import {useNavigate, useParams} from "react-router-dom";

function OpenLocker() {
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
        <h2>Casier #{id} Ouvert !</h2>
        <p>Vous pouvez dès à présent récupérer vos affaires</p>
    </>)
}

export default OpenLocker;
