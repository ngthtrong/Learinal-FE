import React from "react";

const BookIcon = ({ size = 20, stroke = 2, className = "" }) => (
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
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M20 22H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20z" />
    <path d="M6.5 2A2.5 2.5 0 0 0 4 4.5v0A2.5 2.5 0 0 0 6.5 7H20" />
  </svg>
);

export default BookIcon;
