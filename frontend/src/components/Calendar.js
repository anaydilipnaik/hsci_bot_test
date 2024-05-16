import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Sidebar from "../components/Sidebar";
import CustomEvent from "./CustomEvent";

const localizer = momentLocalizer(moment);

const CalendarComponent = ({
  handleDateSelect,
  handleEventClick,
  setIsNext,
  selectedTimeZone,
  handleTimeZoneChange,
  handleSubmit,
  initialAvailability,
  events,
}) => {
  const scrollToTime = new Date();
  scrollToTime.setHours(8, 0, 0, 0); // Set the scroll to 8 AM

  return (
    <>
      <Sidebar
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
        <div className="helperText">
          Tip: Drag to select a time slot on the calendar.
        </div>
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
          formats={{
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
              `${localizer.format(
                start,
                "MMM DD, YYYY",
                culture
              )} – ${localizer.format(end, "MMM DD, YYYY", culture)}`,
          }}
          scrollToTime={scrollToTime}
          onSelectEvent={handleEventClick}
        />
      </div>
    </>
  );
};

export default CalendarComponent;
