import React from "react";
import Topbar from "./Topbar";

/**
 * TopbarLayout
 * Wraps authenticated pages that should display the Topbar
 */
const TopbarLayout = ({ children }) => {
  return (
    <div className="app-shell">
      <Topbar />
      {children}
    </div>
  );
};

export default TopbarLayout;
