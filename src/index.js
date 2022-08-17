import {
  html,
  render,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { QuestionnaireApp } from "./app.js";
import SinglePage from "./page.js";

render(
  html`<${SinglePage}><${QuestionnaireApp} /></${SinglePage}>`,
  document.body
);
