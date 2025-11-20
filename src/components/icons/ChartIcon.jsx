/**
 * Chart / Analytics Icon
 */
function ChartIcon({ size = 24, color = "currentColor", stroke = 2, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth={stroke} />
      <path
        d="M8 14V17 M12 11V17 M16 8V17"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
export default ChartIcon;
