import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { StarknetProvider } from "./context/StarknetContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <StarknetProvider>
    <App />
  </StarknetProvider>
);
