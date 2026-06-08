import { Component, type PropsWithChildren } from "react";

export class ErrorBoundary extends Component<PropsWithChildren> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error: error };
  }

  componentDidCatch(error: Error) {
    console.error(error);
    this.setState({ error: error });
  }

  render() {
    if (this.state.error) {
      return (
        <div className="measure">
          <h1>Error 🩻</h1>
          <h2>{(this.state.error as Error).name}</h2>
          <p>{(this.state.error as Error).message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}
