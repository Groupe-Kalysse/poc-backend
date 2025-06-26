import { Outlet } from "react-router-dom";
import "./Layout.css";
import { useEffect } from "react";

function Layout() {
  useEffect(() => {
    ["gesturestart", "gesturechange", "gestureend"].forEach((evt) =>
      window.addEventListener(evt, (e) => e.preventDefault(), {
        passive: false,
      })
    );
  }, []);
  return (
    <>
      {/* <h1>Kalysse - Casiers connectés</h1> */}
      <div className="card">
        <Outlet />
      </div>
    </>
  );
}

export default Layout;
