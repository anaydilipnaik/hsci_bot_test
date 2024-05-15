import React, { useState } from "react";

const CustomEvent = ({ event }) => {
  const [showDetails, setShowDetails] = useState(false);

  const handleToggleDetails = () => {
    setShowDetails(!showDetails);
  };

  return (
    <div
      onClick={handleToggleDetails}
      style={{ cursor: "pointer", position: "relative", height: "100%" }}
    >
      {showDetails && <div>{event.start + " to " + event.end}</div>}
    </div>
  );
};

export default CustomEvent;
