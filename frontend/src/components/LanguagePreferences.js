import React from "react";

const LanguagePreferences = ({ preferences, handleCheckboxChange }) => {
  return (
    <div className="language-preferences">
      <h2 className="language-heading">Language Preferences</h2>
      {["english", "hindi", "marathi", "tamil", "telugu", "kannada"].map(
        (lang) => (
          <label key={lang} className="language-label">
            <input
              type="checkbox"
              className="language-checkbox"
              checked={preferences[lang]}
              onChange={() => handleCheckboxChange(lang)}
            />
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </label>
        )
      )}
    </div>
  );
};

export default LanguagePreferences;
