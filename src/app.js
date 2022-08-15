import {
  html,
  Component,
} from "https://unpkg.com/htm/preact/standalone.module.js";

export class App extends Component {
  render(props, state) {
    return html`<div id="link-beoordelaar">
      <header class="colophon">
        <div>
          <a target="_blank" href="https://github.com/redmer/link-beoordeelaar">
            redmer/link-beoordeelaar
          </a>
        </div>
        <div>
          <a target="_blank" href="https://github.com/redmer/link-beoordeelaar"
            >HELP</a
          >
        </div>
      </header>
      ${props.children}
      <main class="app">
        <header class="measure">
          <h1>Beoordeel</h1>
          <p>
            Beoordeel <span class="subject">...</span> door op een van de opties
            te klikken. Als je het beoordelen moet onderbreken, kun je op deze
            computer in deze browser binnen een week doorgaan.
          </p>
        </header>
        <main class="options-container">
          <form>
            <div class="option-list">
              <label class="option">
                <input type="radio" id="opt1" name="opt" value="1" />
                <h2 class="option-title">♻️ Bruikbaar en moet mee</h2>
                <p class="option-description">Kennis</p>
              </label>
              <label class="option">
                <input type="radio" id="opt2" name="opt" value="0" />
                <h2 class="option-title">🚮 Verouderd en te archiveren</h2>
                <p class="option-description">
                  Verouderd en niet meer relevant, al heel erg lang niet meer of
                  misschien maar recent
                </p>
              </label>
              <label class="option">
                <input type="radio" id="opt3" name="opt" value="999" />
                <h2 class="option-title">Overslaan</h2>
                <p class="option-description">Deze link later beoordelen</p>
              </label>
            </div>
          </form>
        </main>
        <footer>
          <table class="subject-properties measure-wide">
            <tr>
              <th scope="row">
                Key that is very very very long indeed 1, so long in fact that
                it would span two lines.
              </th>
              <td>Absolutely</td>
            </tr>

            <tr>
              <th scope="row">Key 2</th>
              <td>
                Team 1 that consists of you, me and all of your favorite
                co-workers. But won't you think of all the things that I long
                have forgotten? You're a computer that could do such a thing,
                right?
              </td>
            </tr>
          </table>
        </footer>
      </main>
      <footer class="diagnostics">
        <details>
          <summary>Diagnostics</summary>
          <div id="debug-diagnostics">{ adhasda: 'asda', 'aasdjj': 129 }</div>
        </details>
      </footer>
    </div>`;
  }
}
