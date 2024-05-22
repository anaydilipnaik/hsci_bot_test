import React, { useState, useEffect } from "react";
import HSCI_LOGO from "../assets/hsci_logo.png";
import CryptoJS from "crypto-js";
import { useLocation } from "react-router-dom";
import { TextField, Button, Container, Typography, Box } from "@mui/material";
import InputMask from "react-input-mask";
import { createPatient } from "../controllers/patient";

const secretKey = "hospital-secret"; // Ensure this matches the key used during encryption

const PatientIntake = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    hospital: "",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Reformat phone number
    const reformattedPhone = formData.phone.replace(/[^\d]/g, "");
    const formattedData = {
      ...formData,
      phone: reformattedPhone,
    };

    createPatient(
      formattedData.name,
      formattedData.phone,
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
        backgroundColor: "#fafafa",
        padding: "0 20px",
      }}
    >
      <img
        src={HSCI_LOGO}
        alt="Logo"
        style={{ width: "60px", marginBottom: "30px" }}
      />
      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#444", textAlign: "center" }}
      >
        Welcome to the HSCI Telechaplaincy Patient Intake Page
      </Typography>
      {!success ? (
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: "400px",
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
          />
          <InputMask
            mask="+1 (999) 999-9999"
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
              />
            )}
          </InputMask>
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
              backgroundColor: "#007BFF",
              ":hover": {
                backgroundColor: "#0056b3",
              },
            }}
          >
            Submit
          </Button>
        </Box>
      ) : (
        <span
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "green",
            textAlign: "center",
            marginTop: "25px",
          }}
        >
          Your responses have been successfully recorded. We will contact you on
          Whatsapp shortly.
        </span>
      )}
    </Container>
  );
};

export default PatientIntake;
