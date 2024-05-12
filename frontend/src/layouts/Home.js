import React from "react";
import HSCI_LOGO from "../assets/hsci_logo.png";

const Home = () => {
  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f4f4f9",
      color: "#333",
      fontFamily: "Arial, sans-serif",
    },
    logo: {
      width: "50px",
      marginBottom: "20px",
    },
    text: {
      fontSize: "24px",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <img src={HSCI_LOGO} alt="Logo" style={styles.logo} />
      <span style={styles.text}>
        Welcome to the HSCI Telechaplaincy Bot Home Page
      </span>
    </div>
  );
};

export default Home;
