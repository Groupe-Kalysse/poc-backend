import "./App.css";
import RfidListener from "./components/RfidListener";

function App() {
  return (
    <>
      <h1>Kalysse</h1>
      <h2>Lecteur de badges RFID</h2>
      <div className="card">
        <RfidListener />
      </div>
    </>
  );
}

export default App;
