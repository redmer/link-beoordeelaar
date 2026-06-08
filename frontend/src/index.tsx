import { render } from "preact";
import { App } from "./app/App.js";
import { PageFrame } from "./components/PageFrame.js";

render(
  <PageFrame>
    <App />
  </PageFrame>,
  document.body,
);
