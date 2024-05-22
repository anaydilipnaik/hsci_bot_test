import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import the layouts
import Home from "./layouts/Home";
import PreferencesLayout from "./layouts/PreferencesLayout";
import PatientIntake from "./layouts/PatientIntake";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<PreferencesLayout />} />
        <Route path="/patient" element={<PatientIntake />} />
      </Routes>
    </Router>
  );
};

export default App;
