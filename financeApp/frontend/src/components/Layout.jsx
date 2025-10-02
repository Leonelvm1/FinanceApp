import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="d-flex flex-column vh-100">
      <Navbar />
      <div className="container-fluid p-4 flex-grow-1 bg-light">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;