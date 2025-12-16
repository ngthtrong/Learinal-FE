import React from "react";

const CategoryCard = ({ title, subtitle, cta, onClick, Icon }) => {
  return (
    <div
      className="
        group relative overflow-hidden
        bg-white dark:bg-slate-800
        rounded-xl sm:rounded-2xl p-4 sm:p-6 
        hover:shadow-2xl shadow-sm
        transition-all duration-300 cursor-pointer
        border border-transparent dark:border-slate-700 hover:border-primary-500 dark:hover:border-primary-500
        flex flex-col
        hover:-translate-y-2 transform
        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
        min-h-[100px] sm:min-h-[140px]
      "
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
    >
      {/* Decorative blurred blob */}
      <div className="pointer-events-none absolute -top-6 -right-6 w-16 sm:w-24 h-16 sm:h-24 bg-primary-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity" />

      <div className="mb-2 sm:mb-4">
        <div className="w-10 h-10 sm:w-14 sm:h-14 flex items-center justify-center rounded-lg sm:rounded-xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform">
          {Icon ? <Icon size={20} className="sm:w-7 sm:h-7" strokeWidth={2} /> : <span className="text-xl sm:text-3xl">📄</span>}
        </div>
      </div>

      <div
        className="text-sm sm:text-xl font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 sm:mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        title={title}
      >
        {title}
      </div>
      {subtitle && (
        <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-4">{subtitle}</div>
      )}

      {cta && (
        <div className="mt-auto">
          <div className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
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
