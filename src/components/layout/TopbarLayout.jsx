import React from "react";
import Topbar from "./Topbar";

const TopbarLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Topbar />
      {children}
    </div>
  );
};

export default TopbarLayout;
