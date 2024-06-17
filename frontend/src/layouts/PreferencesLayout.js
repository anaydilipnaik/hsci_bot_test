import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import LanguagePreferences from "../components/LanguagePreferences";
import ServicePreferences from "../components/ServicePreferences";
import { getSCPByPhone } from "../controllers/scp";
import { useUser } from "../contexts/userContext";
import "./PreferencesLayout.css";
import CalendarComponent from "../components/Calendar";
import {
  updateSCPPreferences,
  addSCPAvailability,
  getScpAvailability,
  deleteSCPAvailability,
} from "../controllers/scp";
import { format, toZonedTime, fromZonedTime } from "date-fns-tz";
import moment from "moment";
import axios from "axios";
import { supabase } from "../utils/supabase";

const PreferencesLayout = () => {
  const [selectedTimeZone, setSelectedTimeZone] = useState(moment.tz.guess());
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
  const location = useLocation();
  const { user, setUser } = useUser();
  const [events, setEvents] = useState([]);
  const [events2, setEvents2] = useState([]);

  const handleTimeZoneChange = (e) => {
    e.preventDefault();
    setSelectedTimeZone(e.target.value);
  };

  const convertToPSTTime = (date) => {
    const timeZone = "America/Los_Angeles";
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, "HH:mm", { timeZone });
  };

  const convertToPSTDate = (date) => {
    const timeZone = "America/Los_Angeles";
    const zonedDate = toZonedTime(date, timeZone);
    return format(zonedDate, "yyyy-MM-dd", { timeZone });
  };

  const handleDateSelect = async (res) => {
    const startDate = new Date(res.start);
    const endDate = new Date(res.end);

    const formattedStart = fromZonedTime(startDate, selectedTimeZone);
    const formattedEnd = fromZonedTime(endDate, selectedTimeZone);

    const startPST = convertToPSTTime(formattedStart);
    const endPST = convertToPSTTime(formattedEnd);
    const datePST = convertToPSTDate(formattedStart);

    try {
      await addSCPAvailability(user.id, datePST, startPST, endPST);
      await getAvailability();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEventClick = async (clickInfo, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await deleteSCPAvailability(clickInfo.id);
        await getAvailability();
      } catch (err) {
        console.error(err);
      }
    } else return;
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
      "America/Los_Angeles"
    )
      .then(async (res) => {
        if (res) {
          setIsSubmitted(true);
          sendAcknowledgement(user.whatsapp_phone_no, user.name);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const sendAcknowledgement = async (phone, name) => {
    try {
      const response = await axios.post(
        "https://backend.trayaschedule.hsciglobal.org/acknowledgement",
        {
          whatsapp_phone_no: phone,
          name: name,
        }
      );
      console.log("Response from server:", response.data);
    } catch (error) {
      console.error("Error sending acknowledgement:", error);
    }
  };

  const verifyUser = async () => {
    const params = queryString.parse(location.search);

    if (params.id) {
      const columnName = "preferences_link";
      const { data, error } = await supabase
        .from("scp")
        .select(`id, ${columnName}`);

      if (error) {
        console.error("Error fetching data from Supabase:", error);
      } else if (data && data.length > 0) {
        // Find the row where the JSON column contains the key
        const row = data.find((row) => row[columnName][params.id]);

        if (row) {
          getSCPByPhone(row[columnName][params.id]).then((res) => {
            setUser(res);
            if (res) {
              const languageUpdates = {};
              res.languages_spoken.forEach((lang) => {
                languageUpdates[lang.toLowerCase()] = true;
              });
              setPreferences((prev) => ({ ...prev, ...languageUpdates }));

              const serviceUpdates = {};
              res.services_offered.forEach((service) => {
                serviceUpdates[service] = true;
              });
              setServices((prev) => ({ ...prev, ...serviceUpdates }));
            }
          });
        } else {
          console.error("Key not found in any row's JSON object");
        }
      }
    }
  };

  useEffect(() => {
    verifyUser();
  }, [location, setUser]);

  const getAvailability = async () => {
    const res = await getScpAvailability(user.id);
    let initialData = res.map((row) => {
      let startDateTime = `${row.date} ${row.start_time}`;
      let endDateTime = `${row.date} ${row.end_time}`;

      let start = new Date(startDateTime);
      let end = new Date(endDateTime);

      return {
        id: row.id,
        start: start,
        end: end,
      };
    });
    setEvents(initialData);
  };

  useEffect(() => {
    const updatedEvents = events.map((event) => {
      let convertedStart = toZonedTime(event.start, selectedTimeZone);
      let convertedEnd = toZonedTime(event.end, selectedTimeZone);

      return {
        ...event,
        start: convertedStart,
        end: convertedEnd,
      };
    });

    setEvents2(updatedEvents);
  }, [selectedTimeZone, events]);

  useEffect(() => {
    if (user && user.id) {
      getAvailability(user.id);
    }
  }, [user]);

  return user ? (
    !isNext ? (
      <div className="preferences-container">
        <span style={{ fontSize: "25px", fontWeight: "bold" }}>
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
            style={{ color: "#4CAF50", textDecoration: "none" }}
          >
            Click here
          </a>{" "}
          to go back to WhatsApp.
        </span>
      </div>
    ) : (
      <CalendarComponent
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        setIsNext={setIsNext}
        selectedTimeZone={selectedTimeZone}
        handleSubmit={handleSubmit}
        events={events2}
        handleTimeZoneChange={handleTimeZoneChange}
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
      <span style={{ fontSize: "24px", textAlign: "center" }}>Loading...</span>
    </div>
  );
};

export default PreferencesLayout;
