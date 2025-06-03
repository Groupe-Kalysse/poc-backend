import {Outlet} from "react-router-dom"
import "./Layout.css";

function Layout() {
  return (
    <>
      <h1>Kalysse - Casiers connectés</h1>
      <div className="card">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
