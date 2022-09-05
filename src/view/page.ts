import { html } from "htm/preact";
import { Component } from "preact";

export class PropertiesTable extends Component {
  static defaultProps = {
    subject: [],
    keys: [],
  };

  render(props, state) {
    return html`
      <dl class="subject-properties measure-wide">
        ${Object.entries(props.subject).map(([key, rawvalue]) => {
          // If there are allowed-keys, then skip if key is in them
          if (props.keys.length > 0 && props.keys.indexOf(key) == -1)
            return html``;

          // If the value is None, N/A, etc., skip
          if (["", undefined, null].indexOf(rawvalue as any) != -1)
            return html``;

          const value = String(rawvalue);

          return html`
            <div class="keep-together kv-pair">
              <dt scope="row">${key}</dt>
              <dd><code>${value}</code></dd>
            </div>
          `;
        })}
      </dl>
    `;
  }
}

export class AnswerOption extends Component {
  static defaultProps = {
    options: [],
  };

  keyboardSelect(event) {
    event.preventDefault();
    console.log(`keyboard select`);
  }

  mnemonic(index) {
    return [
      "f",
      "j",
      "x",
      "5",
      "6",
      "7",
      "d",
      "k",
      "r",
      "u",
      "e",
      "i",
      "1",
      "2",
      "9",
      "0",
    ][index];
  }

  render(props, state) {
    const answers = props.options;
    return html`
      <div class="option-list">
        ${answers.map((answer, n) => {
          return html`<${AnswerOptionButton}
            value=${answer.value}
            name=${answer.name}
            description=${answer.description}
            mnemonic=${this.mnemonic(n)}
          />`;
        })}
      </div>
    `;
  }
}

function AnswerOptionButton(props) {
  return html`<button
    type="submit"
    class="option"
    id="opt-${props.value}"
    value=${props.value}
    data-key-equivalent=${props.mnemonic}
  >
    <span class="mnemonic"
      ><kbd title="press with keyboard">${props.mnemonic}</kbd></span
    >
    <h2 class="option-title">${props.name}</h2>
    <p class="option-description">${props.description}</p>
  </button>`;
}

class QuestionnairePage extends Component {
  render() {
    return html``;
  }
}

class QuestionnaireFinalPage extends Component {
  render() {
    return html``;
  }
}

class QuestionnaireOpeningPage extends Component {
  render() {
    return html``;
  }
}

class QuestionnaireSessionLessPage extends Component {
  render() {
    return html``;
  }
}
