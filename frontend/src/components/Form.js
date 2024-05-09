import React, { useState } from "react";

const Form = () => {
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedScp, setSelectedScp] = useState(""); // Assuming a dropdown

  const dayOptions = [
    { value: "", label: "Select Day" },
    { value: "Mon", label: "Monday" },
    // ... other days
  ];

  const timeOptions = [
    // Replace with your actual time slot options
    { value: "00:00-01:00", label: "12:00 AM - 1:00 AM" },
    { value: "01:00-02:00", label: "1:00 AM - 2:00 AM" },
    // ... more time slots
  ];

  const scpOptions = [
    // Replace with your actual SCP options
    { value: "scp1", label: "SCP 1" },
    { value: "scp2", label: "SCP 2" },
    // ... more SCPs
  ];

  // Similar event handlers for other form elements
  const handleDayChange = () => {};
  const handleTimeChange = () => {};
  const handleScpChange = () => {};

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission and validation here
    console.log("Form submitted:", {
      selectedDay,
      selectedTime,
      selectedScp,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Find a Slot</h3>

      <div className="form-group">
        <h4>Find a Slot</h4>
        <label htmlFor="day">Pick a Day</label>
        <select id="day" value={selectedDay} onChange={handleDayChange}>
          {dayOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="time">Pick a Time</label>
        <select id="time" value={selectedTime} onChange={handleTimeChange}>
          {timeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="scp">Pick a SCP</label>
        <label htmlFor="scp">Pick a SCP</label>
        <select id="scp" value={selectedScp} onChange={handleScpChange}>
          {scpOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <button type="submit" className="button">
        Schedule
      </button>
    </form>
  );
};

export default Form;
