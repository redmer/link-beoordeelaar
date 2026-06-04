import { html } from "htm/preact";
import { render } from "preact";
import { QuestionnaireApp } from "./controller/app.js";
import Frame from "./view/frame.js";

render(html`<${Frame}><${QuestionnaireApp} /></${Frame}>`, document.body);
