import React from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment-timezone";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Sidebar from "../components/Sidebar";
import CustomEvent from "./CustomEvent";

const localizer = momentLocalizer(moment);

const CalendarComponent = ({
  handleDateSelect,
  handleEventClick,
  setIsNext,
  selectedTimeZone,
  handleSubmit,
  handleTimeZoneChange,
  events,
}) => {
  const timezones = moment.tz.names();

  const scrollToTime = new Date();
  scrollToTime.setHours(8, 0, 0, 0); // Set the scroll to 8 AM

  const now = new Date();

  const handleSelectSlot = (slotInfo) => {
    const now = new Date();

    if (slotInfo.start < now) {
      alert("Cannot select past dates.");
      return;
    }

    // Check if the selected slot is at least one hour long
    const duration = (slotInfo.end - slotInfo.start) / (1000 * 60);
    if (duration < 60) {
      alert("Minimum booking duration is 1 hour.");
      return;
    }

    // Check if the selected slot overlaps with any existing events
    const isOverlapping = events.some((slot) => {
      return (
        (slotInfo.start >= slot.start && slotInfo.start < slot.end) ||
        (slotInfo.end > slot.start && slotInfo.end <= slot.end) ||
        (slotInfo.start <= slot.start && slotInfo.end >= slot.end)
      );
    });

    if (isOverlapping) {
      alert("Selected time slot overlaps with an existing event.");
      return;
    }

    handleDateSelect(slotInfo);
  };

  // Disable past dates visually
  const slotPropGetter = (date) => {
    if (date < now) {
      return {
        style: {
          backgroundColor: "#e9ecef",
          pointerEvents: "none",
        },
      };
    }
    return {};
  };

  const today = new Date();

  return (
    <>
      <Sidebar setIsNext={setIsNext} handleSubmit={handleSubmit} />
      <div
        style={{
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
          margin: "20px auto",
          maxWidth: "1000px",
          width: "90%",
          height: "calc(100vh - 40px)", // Adjust height to be dynamic
          overflow: "hidden",
        }}
      >
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
          }}
        >
          <label
            htmlFor="timezone-select"
            style={{
              fontWeight: "bold",
              fontSize: "14px",
              marginRight: "10px",
              display: "inline-block",
              verticalAlign: "middle",
              fontFamily: "Arial, sans-serif",
            }}
          >
            Select Timezone:
          </label>
          <select
            id="timezone-select"
            value={selectedTimeZone}
            onChange={handleTimeZoneChange}
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              fontSize: "14px",
              border: "1px solid #ccc",
              borderRadius: "5px",
              transition: "border-color 0.3s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.borderColor = "#888")}
            onMouseOut={(e) => (e.target.style.borderColor = "#ccc")}
            onFocus={(e) => (e.target.style.borderColor = "#888")}
            onBlur={(e) => (e.target.style.borderColor = "#ccc")}
          >
            {timezones.map((tz) => (
              <option
                key={tz}
                value={tz}
                style={{
                  fontFamily: "Arial, sans-serif",
                }}
              >
                {tz}
              </option>
            ))}
          </select>
        </div>
        <div className="helperText">
          Tip: Long press and drag to select a time slot on the calendar.
        </div>
        <Calendar
          localizer={localizer}
          longPressThreshold={100}
          events={events}
          defaultView="week"
          views={["week", "day"]}
          selectable
          onSelectSlot={handleSelectSlot}
          style={{ height: "calc(100% - 100px)" }}
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
          slotPropGetter={slotPropGetter}
          step={30}
          timeslots={2}
          min={
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              0,
              0,
              0
            )
          }
          max={
            new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
              23,
              59,
              59
            )
          }
        />
      </div>
    </>
  );
};

export default CalendarComponent;
