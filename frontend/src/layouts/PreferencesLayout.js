import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import LanguagePreferences from "../components/LanguagePreferences";
import ServicePreferences from "../components/ServicePreferences";
import { getSCPByPhone } from "../controllers/scp";
import { useUser } from "../contexts/userContext";
import { decryptPhone } from "../utils/decryptPhoneNumber";
import "./PreferencesLayout.css";
import { createEventId } from "../utils/event-utils";
import CalendarComponent from "../components/Calendar";
import {
  updateSCPPreferences,
  addSCPAvailability,
  getScpAvailability,
} from "../controllers/scp";
import moment from "moment";

const PreferencesLayout = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    "America/Los_Angeles"
  );

  const [preferences, setPreferences] = useState({
    english: false,
    hindi: false,
    marathi: false,
    tamil: false,
    telugu: false,
    kannada: false,
  });

  const [services, setServices] = useState({
    "Compassionate Presence": false,
    "Hindu Tradition-related Matters": false,
    "Hindu Identity": false,
    "Yoga Therapy": false,
    Meditation: false,
    "Art Therapy": false,
    Senior: false,
    "Cancer Support": false,
    "Palliative and Hospice Care": false,
    "Trauma and Aged Care": false,
  });

  const [isNext, setIsNext] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [initialAvailability, setInitialAvailability] = useState([]);

  const location = useLocation();
  const { user, setUser } = useUser();

  const handleTimeZoneChange = (e) => {
    e.preventDefault();
    setSelectedTimeZone(e.target.value);
  };

  const [events, setEvents] = useState([]);

  const convertDateString = (dateString) => {
    const date = moment(new Date(dateString));
    const time = date.format("HH:mm");
    const formattedDate = date.format("YYYY-MM-DD");
    return { formattedDate, time }; // returning the date object
  };

  const handleDateSelect = (res) => {
    let start = res.start;
    let end = res.end;

    const obj1 = convertDateString(res.start);
    const obj2 = convertDateString(res.end);

    addSCPAvailability(user.id, obj1.formattedDate, obj1.time, obj2.time)
      .then(() => {
        return getAvailability(user.id);
      })
      .catch((err) => console.error(err));
  };

  const handleEventClick = (clickInfo) => {
    if (
      window.confirm(
        `Are you sure you want to delete the event '${clickInfo.event.title}'`
      )
    ) {
      clickInfo.event.remove();
    }
  };

  const handleEvents = (events) => {
    setCurrentEvents(events);
  };

  const renderEventContent = (eventInfo) => {
    return (
      <>
        <b>{eventInfo.timeText}</b>
      </>
    );
  };

  const handleLanguageCheckboxChange = (language) => {
    setPreferences({
      ...preferences,
      [language]: !preferences[language],
    });
  };

  const handleServiceCheckboxChange = (service) => {
    setServices({
      ...services,
      [service]: !services[service],
    });
  };

  const handleNext = (e) => {
    e.preventDefault();
    setIsNext(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const languagesSpoken = [];
    for (const language in preferences) {
      if (preferences[language]) {
        languagesSpoken.push(
          language.charAt(0).toUpperCase() + language.slice(1)
        );
      }
    }

    const servicesOffered = [];
    for (const service in services) {
      if (services[service]) {
        servicesOffered.push(service);
      }
    }

    updateSCPPreferences(
      user.id,
      languagesSpoken,
      servicesOffered,
      // selectedTimeZone
      "America/Los_Angeles"
    )
      .then((res) => {
        if (res) {
          setIsSubmitted(true);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  useEffect(() => {
    const params = queryString.parse(location.search);

    if (params.phone) {
      let phoneTemp = params.phone
        .toString()
        .replace("xMl3Jk", "+")
        .replace("Por21Ld", "/")
        .replace("Ml32", "=");

      getSCPByPhone(decryptPhone(phoneTemp)).then((res) => {
        setUser(res);

        if (res) {
          // Set language preferences
          const languageUpdates = {};
          res.languages_spoken.forEach((lang) => {
            languageUpdates[lang.toLowerCase()] = true;
          });
          setPreferences((prev) => ({ ...prev, ...languageUpdates }));

          // Set service preferences
          const serviceUpdates = {};
          res.services_offered.forEach((service) => {
            serviceUpdates[service] = true;
          });
          setServices((prev) => ({ ...prev, ...serviceUpdates }));
        }
      });
    }
  }, [location, setUser]);

  const getAvailability = () => {
    getScpAvailability(user.id).then((res) => {
      let initialData = res.map((row) => {
        // Combine date and time strings
        let startDateTime = `${row.date} ${row.start_time}`;
        let endDateTime = `${row.date} ${row.end_time}`;

        // Parse combined strings into Date objects
        let start = moment(startDateTime, "YYYY-MM-DD HH:mm").toDate();
        let end = moment(endDateTime, "YYYY-MM-DD HH:mm").toDate();

        return {
          id: row.id,
          start: start,
          end: end,
        };
      });
      setEvents(initialData);
    });
  };

  useEffect(() => {
    if (user && user.id) {
      getAvailability(user.id);
    }
  }, [user]);

  return user ? (
    !isNext ? (
      <div className="preferences-container">
        <span
          style={{
            fontSize: "25px",
            fontWeight: "bold",
          }}
        >
          Welcome, {user.name} Ji.
        </span>
        <LanguagePreferences
          preferences={preferences}
          handleCheckboxChange={handleLanguageCheckboxChange}
        />
        <ServicePreferences
          services={services}
          handleCheckboxChange={handleServiceCheckboxChange}
        />
        <button onClick={handleNext}>Next</button>
      </div>
    ) : isSubmitted ? (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          backgroundColor: "#f4f4f9",
          padding: "20px",
          boxSizing: "border-box",
          flexDirection: "column",
        }}
      >
        <span
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
          }}
        >
          Your responses have been recorded, {user.name} Ji!{" "}
          <a
            href={"https://wa.me/19252305898"}
            style={{
              color: "#4CAF50",
              textDecoration: "none",
            }}
          >
            Click here
          </a>{" "}
          to go back to WhatsApp.
        </span>
      </div>
    ) : (
      <CalendarComponent
        currentEvents={currentEvents}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        handleEvents={handleEvents}
        renderEventContent={renderEventContent}
        setIsNext={setIsNext}
        selectedTimeZone={selectedTimeZone}
        handleTimeZoneChange={handleTimeZoneChange}
        handleSubmit={handleSubmit}
        initialAvailability={initialAvailability}
        events={events}
      />
    )
  ) : (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f4f4f9",
        color: "#333",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <span
        style={{
          fontSize: "24px",
          textAlign: "center",
        }}
      >
        Loading...
      </span>
    </div>
  );
};

export default PreferencesLayout;
