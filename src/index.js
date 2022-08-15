import {
  html,
  render,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { App } from "./app.js";

render(html`<${App} />`, document.body);
