import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Sidebar from "../components/Sidebar";
import CustomEvent from "./CustomEvent";

const localizer = momentLocalizer(moment);

const CalendarComponent = ({
  currentEvents,
  handleDateSelect,
  handleEventClick,
  handleEvents,
  renderEventContent,
  setIsNext,
  selectedTimeZone,
  handleTimeZoneChange,
  handleSubmit,
  initialAvailability,
  events,
}) => {
  return (
    <>
      <Sidebar
        currentEvents={currentEvents}
        setIsNext={setIsNext}
        selectedTimeZone={selectedTimeZone}
        handleTimeZoneChange={handleTimeZoneChange}
        handleSubmit={handleSubmit}
      />
      <div
        style={{
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          margin: "20px auto",
          maxWidth: "1000px",
          width: "90%",
          height: "500px",
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={["week", "day"]}
          selectable
          onSelectSlot={handleDateSelect}
          style={{ height: "100%" }}
          components={{
            event: CustomEvent,
          }}
        />
      </div>
    </>
  );
};

export default CalendarComponent;
