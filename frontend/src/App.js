import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import the layouts
import Home from "./layouts/Home";
import PreferencesLayout from "./layouts/PreferencesLayout";
import PatientIntake from "./layouts/PatientIntake";
import JitsiMeetComponent from "./layouts/JitsiMeetComponent";
import SchedulerPage from "./layouts/SchedulerPage";
import MeetingFeedback from "./layouts/MeetingFeedback";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<PreferencesLayout />} />
        <Route path="/patient" element={<PatientIntake />} />
        <Route path="/meeting" element={<JitsiMeetComponent />} />
        <Route path="/meeting-feedback" element={<MeetingFeedback />} />
        <Route path="/sdo" element={<SchedulerPage />} />
      </Routes>
    </Router>
  );
};

export default App;
