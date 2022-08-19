import {
  html,
  render,
} from "https://unpkg.com/htm/preact/standalone.module.js";
import { QuestionnaireApp } from "./app.js";
import Frame from "./frame.js";

render(html`<${Frame}><${QuestionnaireApp} /></${Frame}>`, document.body);
