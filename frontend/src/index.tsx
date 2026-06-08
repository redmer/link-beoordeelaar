import { createRoot } from "react-dom/client";
import { App } from "./app/App.js";
import { PageFrame } from "./components/PageFrame.js";

const root = createRoot(document.body);
root.render(
  <PageFrame>
    <App />
  </PageFrame>,
);
