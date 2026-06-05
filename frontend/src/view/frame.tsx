import { Component, type ComponentProps } from "preact";
import label from "../util/lang.js";

export default class Frame extends Component {
  constructor(props: ComponentProps<any>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    console.log("called -getDerivedStateFromError");
    return {
      hasError: true,
      errorCode: error.name,
      errorMessage: error.message,
      error: error,
    };
  }

  render(props: any, state: any) {
    const repo = `redmer/link-beoordeelaar`;
    const help = label("HELP_URL");

    if (state.hasError) {
      return (
        <div id="link-beoordelaar">
          <PageHeader repo={repo} help={help} />
          <main class="app">
            <header class="measure">
              <h1>Error</h1>
              <h2>${state.errorCode}</h2>
              <p>${state.errorMessage}</p>
            </header>
          </main>
          <PageFooter diagnostics={state.error} />
        </div>
      );
    }

    return (
      <div id="link-beoordelaar">
        <PageHeader repo={repo} help={help} />
        <main class="app">${this.props.children}</main>
        <PageFooter />
      </div>
    );
  }
}

function PageHeader(props: { repo: string; help: string }) {
  return (
    <header class="colophon">
      <div>
        <a target="_blank" href="https://github.com/${props.repo}">
          ${props.repo}
        </a>
      </div>
      <div>
        <a target="_blank" href={props.help}>
          HELP
        </a>
      </div>
    </header>
  );
}

function PageFooter(props: { diagnostics?: string }) {
  const params = new URLSearchParams(window.location.search);
  const sessionKey = params.get("session");
  if (!sessionKey) return <></>;
  const diagnostics = window.localStorage.getItem(sessionKey);
  return (
    <footer class="diagnostics">
      <details>
        <summary>Diagnostica</summary>
        <code id="debug-diagnostics">${diagnostics}</code>
      </details>
    </footer>
  );
}
