import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import momentTimezonePlugin from "@fullcalendar/moment-timezone";
import Sidebar from "../components/Sidebar";

const CalendarComponent = ({
  weekendsVisible,
  currentEvents,
  handleWeekendsToggle,
  handleDateSelect,
  handleEventClick,
  handleEvents,
  renderEventContent,
  setIsNext,
  selectedTimeZone,
  handleTimeZoneChange,
  handleSubmit,
  initialAvailability,
}) => {
  return (
    <>
      <Sidebar
        weekendsVisible={weekendsVisible}
        handleWeekendsToggle={handleWeekendsToggle}
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
        }}
      >
        <FullCalendar
          plugins={[
            dayGridPlugin,
            timeGridPlugin,
            interactionPlugin,
            momentTimezonePlugin,
          ]}
          timeZone={selectedTimeZone}
          headerToolbar={{
            left: "prev,next",
            center: "title",
            right: "today",
          }}
          initialView="timeGridWeek"
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={weekendsVisible}
          initialEvents={initialAvailability}
          select={handleDateSelect}
          eventContent={renderEventContent}
          // eventClick={handleEventClick}
          eventsSet={handleEvents}
        />
      </div>
    </>
  );
};

export default CalendarComponent;
