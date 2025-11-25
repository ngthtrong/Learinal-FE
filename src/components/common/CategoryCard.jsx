import React from "react";

const CategoryCard = ({ title, subtitle, cta, onClick, Icon }) => {
  return (
    <div
      className="
        group relative overflow-hidden
        bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
        rounded-2xl p-6 shadow-lg hover:shadow-xl
        transition-all duration-300 cursor-pointer
        border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500
        flex flex-col
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
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      <div className="mb-4">
        <div className="w-14 h-14 flex items-center justify-center rounded-xl bg-primary-500/20 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
          {Icon ? <Icon size={28} strokeWidth={2} /> : <span className="text-3xl">📄</span>}
        </div>
      </div>

      <div
        className="text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        title={title}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-sm text-gray-700 dark:text-gray-400 line-clamp-2 mb-4">{subtitle}</div>
      )}

      {cta && (
        <div className="mt-auto">
          <div className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
            {cta}
          </div>
        </div>
      )}

      {/* Hover underline accent */}
      <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary-500 group-hover:w-full transition-all" />
    </div>
  );
};

export default CategoryCard;
