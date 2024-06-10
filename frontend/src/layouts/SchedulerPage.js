// src/SchedulerPage.js
import React, { useState } from "react";
import {
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import DatePicker from "@mui/lab/DatePicker";
import TextField from "@mui/material/TextField";
import AdapterDateFns from "@mui/lab/AdapterDateFns";
import LocalizationProvider from "@mui/lab/LocalizationProvider";

const SchedulerPage = () => {
  const [selectedSCP, setSelectedSCP] = useState("");
  const [languagePreferences, setLanguagePreferences] = useState({
    english: true,
    tamil: true,
  });
  const [services, setServices] = useState({
    meditation: true,
    hinduLastRites: true,
  });
  const [availabilities, setAvailabilities] = useState([
    "2024-06-10 10:00",
    "2024-06-10 11:00",
    "2024-06-11 14:00",
    "2024-06-11 15:00",
  ]);
  const [matches, setMatches] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleSCPChange = (event) => {
    setSelectedSCP(event.target.value);
  };

  const handleLanguageChange = (event) => {
    setLanguagePreferences({
      ...languagePreferences,
      [event.target.name]: event.target.checked,
    });
  };

  const handleServiceChange = (event) => {
    setServices({
      ...services,
      [event.target.name]: event.target.checked,
    });
  };

  const handleSearchMatches = () => {
    // Sample matches data
    const sampleMatches = [
      {
        name: "SCP 1",
        languages: ["English", "Tamil"],
        services: ["Meditation", "Hindu Last Rites"],
        availability: ["2024-06-10 10:00", "2024-06-10 11:00"],
      },
      {
        name: "SCP 2",
        languages: ["English"],
        services: ["Meditation"],
        availability: ["2024-06-11 14:00", "2024-06-11 15:00"],
      },
    ];

    setMatches(sampleMatches);
  };

  const handleSchedule = (scp) => {
    // Handle the scheduling logic
    alert(`Scheduled ${scp.name} successfully!`);
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Scheduler Page
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <FormControl fullWidth>
            <InputLabel id="scp-select-label">Select Patient</InputLabel>
            <Select
              labelId="scp-select-label"
              value={selectedSCP}
              onChange={handleSCPChange}
            >
              <MenuItem value="scp1">Patient 1</MenuItem>
              <MenuItem value="scp2">Patient 2</MenuItem>
              <MenuItem value="scp3">Patient 3</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {selectedSCP && (
          <>
            <Grid item xs={12}>
              <Typography variant="h6">Language Preferences</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={languagePreferences.english}
                    onChange={handleLanguageChange}
                    name="english"
                  />
                }
                label="English"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={languagePreferences.tamil}
                    onChange={handleLanguageChange}
                    name="tamil"
                  />
                }
                label="Tamil"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Services Offered</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={services.meditation}
                    onChange={handleServiceChange}
                    name="meditation"
                  />
                }
                label="Meditation"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={services.hinduLastRites}
                    onChange={handleServiceChange}
                    name="hinduLastRites"
                  />
                }
                label="Hindu Last Rites"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">Availability</Typography>
              <ul>
                {availabilities.map((slot, index) => (
                  <li key={index}>{slot}</li>
                ))}
              </ul>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearchMatches}
              >
                Search Matches
              </Button>
            </Grid>
          </>
        )}
        {matches.length > 0 && (
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              Matches
            </Typography>
            {matches.map((scp, index) => (
              <Card key={index} style={{ marginBottom: "20px" }}>
                <CardContent>
                  <Typography variant="h6">{scp.name}</Typography>
                  <Typography>Languages: {scp.languages.join(", ")}</Typography>
                  <Typography>Services: {scp.services.join(", ")}</Typography>
                  <Typography>Availability:</Typography>
                  <ul>
                    {scp.availability.map((slot, i) => (
                      <li key={i}>{slot}</li>
                    ))}
                  </ul>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => handleSchedule(scp)}
                  >
                    Schedule
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default SchedulerPage;
