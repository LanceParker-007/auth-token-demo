import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Container, Box } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const Dashboard = () => {
  const [message, setMessage] = useState("");
  const { user, logout, refreshToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProtectedData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/protected`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
            withCredentials: true,
          }
        );
        setMessage(response.data.message);
      } catch (error) {
        console.error("Error fetching protected data:", error);
        if (error.response && error.response.status === 403) {
          const newToken = await refreshToken();
          if (newToken) {
            const retryResponse = await axios.get(
              `${import.meta.env.VITE_API_URL}/protected`,
              {
                headers: { Authorization: `Bearer ${newToken}` },
                withCredentials: true,
              }
            );
            setMessage(retryResponse.data.message);
          } else {
            navigate("/login");
          }
        }
      }
    };

    fetchProtectedData();
  }, [user, navigate, refreshToken]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Dashboard
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          Welcome, User ID: {user.userId}
        </Typography>
        <Typography variant="body1" sx={{ mt: 2 }}>
          {message}
        </Typography>
        <Button
          onClick={handleLogout}
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Logout
        </Button>
      </Box>
    </Container>
  );
};

export default Dashboard;
