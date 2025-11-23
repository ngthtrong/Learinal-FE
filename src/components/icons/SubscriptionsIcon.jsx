/**
 * Subscriptions Icon Component
 */

function SubscriptionsIcon({ size = 24, color = "currentColor", ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M20 7H16V5C16 3.897 15.103 3 14 3H10C8.897 3 8 3.897 8 5V7H4C2.897 7 2 7.897 2 9V19C2 20.103 2.897 21 4 21H20C21.103 21 22 20.103 22 19V9C22 7.897 21.103 7 20 7ZM10 5H14V7H10V5ZM20 19H4V9H8V11H10V9H14V11H16V9H20V19Z"
        fill={color}
      />
      <path
        d="M12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12ZM12 16C11.4477 16 11 15.5523 11 15C11 14.4477 11.4477 14 12 14C12.5523 14 13 14.4477 13 15C13 15.5523 12.5523 16 12 16Z"
        fill={color}
      />
    </svg>
  );
}

export default SubscriptionsIcon;
