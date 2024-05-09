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

const PreferencesLayout = () => {
  const [weekendsVisible, setWeekendsVisible] = useState(true);
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

  const handleWeekendsToggle = () => {
    setWeekendsVisible(!weekendsVisible);
  };

  const handleDateSelect = (selectInfo) => {
    let calendarApi = selectInfo.view.calendar;

    calendarApi.unselect(); // clear date selection

    const date1 = new Date(selectInfo.startStr);

    // Extracting the date in YYYY-MM-DD format
    const dateString = date1.toISOString().split("T")[0]; // Splits the ISO string by 'T' and takes the first part

    // Extracting the time in HH:MM format
    const startTimeString = date1.toTimeString().split(" ")[0].substring(0, 5);

    const date2 = new Date(selectInfo.endStr);

    const endTimeString = date2.toTimeString().split(" ")[0].substring(0, 5);

    calendarApi.addEvent({
      id: createEventId(),
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay,
    });

    addSCPAvailability(user.id, dateString, startTimeString, endTimeString)
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
      selectedTimeZone
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
      });
    }
  }, [location, setUser]);

  const getAvailability = () => {
    getScpAvailability(user.id).then((res) => {
      let initialData = [];
      res.forEach((row) => {
        let json = {};
        let date = row.date;
        let start = date + "T" + row.start_time + ":00";
        let end = date + "T" + row.end_time + ":00";
        json.id = row.id;
        json.start = start;
        json.end = end;
        initialData.push(json);
      });
      setInitialAvailability(initialData);
    });
  };

  useEffect(() => {
    if (user && user.id) {
      getAvailability(user.id);
    }
  }, [user]);

  // useEffect(() => {
  //   const myHeaders = new Headers();
  //   myHeaders.append("Authorization", "bc9261c7-2d89-4415-a439-a98609b58fc8");
  //   myHeaders.append("Content-Type", "application/json");

  //   const raw = JSON.stringify({
  //     event_name: "appointment_details",
  //     user: {
  //       phone: "16693061513",
  //       fname: "Anay Naik",
  //     },
  //     txid: "123",
  //   });

  //   const requestOptions = {
  //     method: "POST",
  //     headers: myHeaders,
  //     body: raw,
  //     redirect: "follow",
  //   };

  //   // Reminder: Ensure you have clicked "Request temporary access to the demo server" at https://cors-anywhere.herokuapp.com/corsdemo
  //   const url =
  //     "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/137b1758102d899b5f9d308e0";
  //   const proxy = "https://cors-anywhere.herokuapp.com/";

  //   fetch(proxy + url, requestOptions)
  //     .then((response) => response.text())
  //     .then((result) => console.log(result))
  //     .catch((error) => console.error("Error:", error));
  // }, []);

  return (
    user &&
    (!isNext ? (
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
        weekendsVisible={weekendsVisible}
        currentEvents={currentEvents}
        handleWeekendsToggle={handleWeekendsToggle}
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        handleEvents={handleEvents}
        renderEventContent={renderEventContent}
        setIsNext={setIsNext}
        selectedTimeZone={selectedTimeZone}
        handleTimeZoneChange={handleTimeZoneChange}
        handleSubmit={handleSubmit}
        initialAvailability={initialAvailability}
      />
    ))
  );
};

export default PreferencesLayout;
