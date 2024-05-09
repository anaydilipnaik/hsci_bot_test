import React from "react";
import moment from "moment-timezone";

const Sidebar = ({
  weekendsVisible,
  handleWeekendsToggle,
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
        style={{ marginRight: "auto" }}
      >
        Go back
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
        }}
      >
        <div className="toggle-switch">
          <input
            type="checkbox"
            checked={weekendsVisible}
            onChange={handleWeekendsToggle}
          />
          <span className="slider"></span>
        </div>
        <label style={{ marginRight: "20px" }}>Toggle Weekends</label>
        <select
          value={selectedTimeZone}
          onChange={handleTimeZoneChange}
          className="timezone-select"
        >
          {moment.tz.names().map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleSubmit} style={{ marginLeft: "auto" }}>
        Submit
      </button>
    </div>
  );
};

export default Sidebar;
