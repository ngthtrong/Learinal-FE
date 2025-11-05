import React from "react";
import "./CategoryCard.css";

const CategoryCard = ({ title, subtitle, cta, onClick, Icon }) => {
  return (
    <div
      className="category-card"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      <div className="cc-icon">
        {Icon ? <Icon size={18} stroke={2} /> : <span aria-hidden>📄</span>}
      </div>
      <div className="cc-title" title={title}>
        {title}
      </div>
      {subtitle ? <div className="cc-sub">{subtitle}</div> : null}
      <div className="cc-spacer" />
      {cta ? <div className="cc-cta">{cta}</div> : null}
    </div>
  );
};

export default CategoryCard;
