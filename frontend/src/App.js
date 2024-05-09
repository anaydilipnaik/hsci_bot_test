import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import the layouts
import Home from "./layouts/Home";
import PreferencesLayout from "./layouts/PreferencesLayout";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/preferences" element={<PreferencesLayout />} />
      </Routes>
    </Router>
  );
};

export default App;
