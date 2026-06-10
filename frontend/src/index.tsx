import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { ClientSessionProvider } from "./hooks/ClientSessionContext.js";

const root = createRoot(document.body);
root.render(
  <ClientSessionProvider>
    <App />
  </ClientSessionProvider>,
);
