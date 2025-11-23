import React from "react";

const CategoryCard = ({ title, subtitle, cta, onClick, Icon }) => {
  return (
    <div
      className="
        bg-white rounded-xl p-6 shadow-soft hover:shadow-medium
        transition-all duration-300 cursor-pointer
        border border-gray-100 hover:border-primary-300
        flex flex-col gap-3
        hover:scale-[1.02] transform
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
      "
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary-50 text-primary-600">
        {Icon ? <Icon size={24} strokeWidth={2} /> : <span className="text-2xl">📄</span>}
      </div>
      <div className="text-lg font-semibold text-gray-900 line-clamp-2" title={title}>
        {title}
      </div>
      {subtitle && <div className="text-sm text-gray-600 line-clamp-2">{subtitle}</div>}
      <div className="flex-1" />
      {cta && (
        <div className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
          {cta}
        </div>
      )}
    </div>
  );
};

export default CategoryCard;
