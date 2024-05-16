import React from "react";
import moment from "moment-timezone";

const Sidebar = ({
  setIsNext,
  selectedTimeZone,
  handleTimeZoneChange,
  handleSubmit,
}) => {
  return (
    <div className="options-bar">
      <button
        onClick={(e) => {
          e.preventDefault();
          setIsNext(false);
        }}
        style={{ marginRight: "auto", background: "grey" }}
      >
        Go back
      </button>
      <button onClick={handleSubmit} style={{ marginLeft: "auto" }}>
        Submit
      </button>
    </div>
  );
};

export default Sidebar;
