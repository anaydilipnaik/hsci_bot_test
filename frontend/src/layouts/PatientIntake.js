import React, { useState, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useLocation } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  MenuItem,
} from "@mui/material";
import InputMask from "react-input-mask";
import { createPatient } from "../controllers/patient";
import { countries } from "../utils/countryCodes";

const secretKey = "hospital-secret";
const countryOptions = countries.map((country) => ({
  value: country.dial_code,
  label: `${country.name} (${country.dial_code})`,
}));

const PatientIntake = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    hospital: "",
    countryCode: "+1",
  });

  const [statusMessage, setStatusMessage] = useState({
    type: "",
    message: "",
  });

  const [success, setSuccess] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const encryptedHospitalName = params.get("hospital");

    if (encryptedHospitalName) {
      // Reverse the URL-safe transformations
      const encryptedString = encryptedHospitalName
        .replace(/-/g, "+")
        .replace(/_/g, "/");
      const bytes = CryptoJS.AES.decrypt(encryptedString, secretKey);
      const decryptedHospitalName = bytes.toString(CryptoJS.enc.Utf8);
      setFormData((prevFormData) => ({
        ...prevFormData,
        hospital: decryptedHospitalName,
      }));
    }
  }, [location.search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCountryCodeChange = (e) => {
    setFormData({
      ...formData,
      countryCode: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reformat phone number
    const reformattedPhone = formData.phone.replace(/[^\d]/g, "");
    const formattedData = {
      ...formData,
      phone: `${formData.countryCode}${reformattedPhone}`,
    };

    createPatient(
      formattedData.name,
      formattedData.phone.split("+")[1],
      formattedData.hospital
    )
      .then((res) => {
        if (res.error) {
          setStatusMessage({
            type: "error",
            message:
              res.error.message ===
              'duplicate key value violates unique constraint "patients_whatsapp_phone_no_key"'
                ? "Phone already exists"
                : "An error occurred.",
          });
        } else {
          setSuccess(true);
        }
      })
      .catch((err) => {
        setStatusMessage({
          type: "error",
          message: err.message || "An error occurred.",
        });
      });
  };

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#f0f4f8",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#d69e2e", textAlign: "center", fontWeight: "bold" }}
      >
        🙏 Welcome to Spiritual Care Seva by HSCI
      </Typography>
      {!success && (
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            color: "#444",
            textAlign: "center",
            fontSize: "16px",
            marginTop: "20px",
            marginBottom: "25px",
          }}
        >
          Hindu Spiritual Care Institute (HSCI) is pleased to serve you. Please
          complete this form, and we will contact you to schedule the virtual
          visit.
        </Typography>
      )}
      {!success ? (
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
            backgroundColor: "#fff",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
          }}
          onSubmit={handleSubmit}
        >
          <TextField
            label="Patient Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            required
          />
          <Grid
            container
            spacing={2}
            alignItems="center"
            fullWidth
            margin="normal"
          >
            <Grid item xs={4}>
              <TextField
                select
                value={formData.countryCode}
                onChange={handleCountryCodeChange}
                variant="outlined"
                fullWidth
                sx={{
                  marginTop: "7px",
                }}
                SelectProps={{
                  MenuProps: {
                    PaperProps: {
                      style: {
                        maxHeight: 200,
                      },
                    },
                  },
                }}
              >
                {countryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={8}>
              <InputMask
                mask="(999) 999-9999"
                value={formData.phone}
                onChange={handleChange}
              >
                {() => (
                  <TextField
                    label="Phone (WhatsApp)"
                    name="phone"
                    fullWidth
                    margin="normal"
                    variant="outlined"
                    required
                  />
                )}
              </InputMask>
            </Grid>
          </Grid>
          <TextField
            label="Hospital Name"
            name="hospital"
            value={formData.hospital}
            onChange={handleChange}
            fullWidth
            margin="normal"
            variant="outlined"
            disabled
          />
          {statusMessage.message && (
            <Typography
              variant="body1"
              sx={{
                color: statusMessage.type === "error" ? "red" : "green",
                marginTop: 2,
                textAlign: "center",
              }}
            >
              {statusMessage.message}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            sx={{
              mt: 2,
              backgroundColor: "#d69e2e",
              ":hover": {
                backgroundColor: "#b0891e",
              },
            }}
          >
            Submit
          </Button>
        </Box>
      ) : (
        <Typography
          variant="h6"
          sx={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "green",
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          Your responses have been successfully recorded. We will contact you on
          Whatsapp shortly.
        </Typography>
      )}
      {!success && (
        <Typography
          variant="body2"
          sx={{
            color: "#444",
            textAlign: "center",
            fontSize: "14px",
            marginTop: "20px",
            marginBottom: "25px",
          }}
        >
          Hindu Spiritual Care Institute needs the information you provide to us
          to contact you about our services. You may unsubscribe from these
          communications at any time. You can review our Privacy Policy{" "}
          <a
            href="https://www.hsciglobal.org/privacy-policy.html"
            target="_BLANK"
            style={{ color: "#1a73e8" }}
          >
            here
          </a>
          .
          <br />
          <br />
          By clicking submit, you consent to allow Hindu Spiritual Care
          Institute to store and process the personal information submitted
          above.
        </Typography>
      )}
    </Container>
  );
};

export default PatientIntake;
