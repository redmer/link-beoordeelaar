import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { ClientSessionProvider } from "./hooks/ClientSessionContext.js";

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(
  <ClientSessionProvider>
    <App />
  </ClientSessionProvider>,
);
