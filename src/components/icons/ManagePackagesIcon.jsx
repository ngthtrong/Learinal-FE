import React from "react";

// Distinct icon for Quản lý gói (avoid duplicates with SubscriptionsIcon)
const ManagePackagesIcon = ({ size = 20, stroke = 2, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M12 3 3 7l9 4 9-4-9-4Z" />
    <path d="M3 17l9 4 9-4" />
    <path d="M3 12l9 4 9-4" />
    <path d="M12 3v5" />
  </svg>
);

export default ManagePackagesIcon;
