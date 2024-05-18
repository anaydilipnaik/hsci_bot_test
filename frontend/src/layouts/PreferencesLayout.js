import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import queryString from "query-string";
import LanguagePreferences from "../components/LanguagePreferences";
import ServicePreferences from "../components/ServicePreferences";
import { getSCPByPhone } from "../controllers/scp";
import { useUser } from "../contexts/userContext";
import { decryptPhone } from "../utils/decryptPhoneNumber";
import "./PreferencesLayout.css";
import CalendarComponent from "../components/Calendar";
import {
  updateSCPPreferences,
  addSCPAvailability,
  getScpAvailability,
  deleteSCPAvailability,
} from "../controllers/scp";
import moment from "moment";
import axios from "axios";
import "moment-timezone";

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

  const handleTimeZoneChange = (e) => {
    e.preventDefault();
    setSelectedTimeZone(e.target.value);
    moment.tz.setDefault(e.target.value);
  };

  const [events, setEvents] = useState([]);

  const convertDateStringToPST = (dateString) => {
    console.log("dateString: ", dateString);
    // Parse the date string with moment and convert it to PST
    const date = moment(dateString).tz("America/Los_Angeles");
    const time = date.format("HH:mm");
    const formattedDate = date.format("YYYY-MM-DD");
    return { formattedDate, time };
  };

  const handleDateSelect = (res) => {
    // Convert the start and end dates to ISO strings before passing to the convert function
    let startIsoString = new Date(res.start);
    let formattedStart = moment(startIsoString).format("YYYY-MM-DDTHH:mm:ssZ");
    let finalStart = moment(formattedStart)
      .tz(selectedTimeZone, true)
      .format("YYYY-MM-DDTHH:mm:ssZ");

    let endIsoString = new Date(res.end);
    let formattedEnd = moment(endIsoString).format("YYYY-MM-DDTHH:mm:ssZ");
    let finalEnd = moment(formattedEnd)
      .tz(selectedTimeZone, true)
      .format("YYYY-MM-DDTHH:mm:ssZ");

    const obj1 = convertDateStringToPST(finalStart);
    const obj2 = convertDateStringToPST(finalEnd);

    // Add your API call logic here
    addSCPAvailability(user.id, obj1.formattedDate, obj1.time, obj2.time)
      .then(() => {
        return getAvailability(user.id);
      })
      .catch((err) => console.error(err));
  };

  const handleEventClick = (clickInfo, event) => {
    event.preventDefault();
    event.stopPropagation();

    if (window.confirm("Are you sure you want to delete this event?")) {
      deleteSCPAvailability(clickInfo.id)
        .then((res) => {
          console.log("res: ", res);
          return getAvailability(user.id); // Assuming 'user.id' is available in this scope
        })
        .catch((err) => {
          console.error(err);
        });
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
      // selectedTimeZone
      "America/Los_Angeles"
    )
      .then(async (res) => {
        if (res) {
          setIsSubmitted(true);

          const config = {
            headers: {
              Authorization: "bc9261c7-2d89-4415-a439-a98609b58fc8",
              "Content-Type": "application/json",
            },
          };

          // Gupshup callback URL and payload data
          const gupshupUrl =
            "https://notifications.gupshup.io/notifications/callback/service/ipass/project/31566410/integration/137b1758102d899b5f9d308e0";
          const payloadData = {
            event_name: "preferences_acknowledgement",
            event_time: JSON.stringify(new Date()),
            user: {
              phone: user.whatsapp_phone_no,
              name: user.name,
            },
            txid: "123",
          };

          // Send POST requests with the Authorization header
          let gupRes = await axios.post(gupshupUrl, payloadData, config);

          console.log("gupshup res: ", gupRes);
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
    console.log("Timezone changed to:", selectedTimeZone);
    console.log("Original events:", events);

    // Convert event times to the selected timezone
    const updatedEvents = events.map((event) => {
      let convertedStart = moment(event.start)
        .tz(selectedTimeZone, true)
        .toDate();
      let convertedEnd = moment(event.end).tz(selectedTimeZone, true).toDate();

      return {
        ...event,
        start: convertedStart,
        end: convertedEnd,
      };
    });

    console.log("Updated events:", updatedEvents);
    setEvents(updatedEvents);
  }, [selectedTimeZone]);

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
        handleDateSelect={handleDateSelect}
        handleEventClick={handleEventClick}
        setIsNext={setIsNext}
        selectedTimeZone={selectedTimeZone}
        handleSubmit={handleSubmit}
        events={events}
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
