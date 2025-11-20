import React from "react";

const CoinsIcon = ({ size = 20, stroke = 2, className = "" }) => (
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
    aria-hidden="true"
    focusable="false"
  >
    <ellipse cx="8" cy="6" rx="5" ry="3" />
    <path d="M3 6v6c0 1.7 2.2 3 5 3s5-1.3 5-3V6" />
    <path d="M13 8c0 1.7-2.2 3-5 3s-5-1.3-5-3" />
    <path d="M16 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M16 12h1" />
  </svg>
);

export default CoinsIcon;
