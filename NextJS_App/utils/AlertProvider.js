"use client";
import { createContext, useContext, useState, useCallback } from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

// Create Context
const AlertContext = createContext();
export const useAlert = () => useContext(AlertContext);

// Provider Component
export default function AlertProvider({ children }) {
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success",
    duration: 3000,
  });

  // The function you will call anywhere in your app
  const showAlert = useCallback((message, severity = "success", duration = 3000) => {
    setAlert({
      open: true,
      message,
      severity,
      duration,
    });
  }, []);

  const handleClose = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Snackbar
        open={alert.open}
        autoHideDuration={alert.duration}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MuiAlert
          elevation={6}
          variant="filled"
          severity={alert.severity}
          onClose={handleClose}
          sx={{ width: "100%" }}
        >
          {alert.message}
        </MuiAlert>
      </Snackbar>
    </AlertContext.Provider>
  );
}
