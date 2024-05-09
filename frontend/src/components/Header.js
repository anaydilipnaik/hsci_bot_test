import React from "react";

const Header = ({ logoSrc, headerTitle }) => {
  return (
    <header className="sticky top-0 bg-white shadow-md z-10 px-4 py-2 flex items-center justify-between">
      <img src={logoSrc} alt="Logo" className="h-8 w-8" />
      <h2 className="text-2xl font-bold">{headerTitle}</h2>
    </header>
  );
};

export default Header;
