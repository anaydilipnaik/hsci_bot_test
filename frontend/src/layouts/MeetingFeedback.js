import React from "react";

const MeetingFeedback = () => {
  const containerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    textAlign: "center",
  };

  const messageStyle = {
    fontFamily: "Arial, sans-serif",
    fontSize: "1.5em",
    color: "#333",
    marginTop: "20px",
  };

  return (
    <div style={containerStyle}>
      <div>
        <div style={messageStyle}>
          We hope you had a productive session. We will reach out to you on
          WhatsApp shortly to gather your feedback.
        </div>
      </div>
    </div>
  );
};

export default MeetingFeedback;
