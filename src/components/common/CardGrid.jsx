import React from "react";

const CardGrid = ({ children, columns = 3, gap = 6 }) => {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  const gapClass = `gap-${gap}`;

  return (
    <div className={`grid ${gridCols[columns] || gridCols[3]} ${gapClass} w-full`}>{children}</div>
  );
};

export default CardGrid;
