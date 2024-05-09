import React from "react";

const ServicePreferences = ({ services, handleCheckboxChange }) => {
  const serviceItems = [
    "Compassionate Presence",
    "Hindu Tradition-related Matters",
    "Hindu Identity",
    "Yoga Therapy",
    "Meditation",
    "Art Therapy",
    "Senior",
    "Cancer Support",
    "Palliative and Hospice Care",
    "Trauma and Aged Care",
  ];

  return (
    <div className="service-preferences">
      <h2 className="service-heading">Service Preferences</h2>
      {serviceItems.map((service) => (
        <label key={service} className="service-label">
          <input
            type="checkbox"
            className="service-checkbox"
            checked={services[service]}
            onChange={() => handleCheckboxChange(service)}
          />
          {service}
        </label>
      ))}
    </div>
  );
};

export default ServicePreferences;
