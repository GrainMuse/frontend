import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { ContentProvider } from "./context/ContentContext";
import { initContactService } from "./services/contactService";
import "./styles/globals.css";
import "./styles/components.css";

initContactService();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ContentProvider>
          <App />
        </ContentProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
