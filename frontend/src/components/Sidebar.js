import React from "react";

const Sidebar = ({ setIsNext, handleSubmit }) => {
  return (
    <div className="options-bar">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsNext(false);
        }}
        style={{
          marginRight: "auto",
          background: "grey",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Go back
      </button>
      <button
        onClick={handleSubmit}
        style={{
          marginLeft: "auto",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default Sidebar;
