import { useKeyPress } from "../hooks/useKeyPress.js";

export interface Props {
  keyboard: string;
}

export function Mnemonic(props: Props) {
  useKeyPress(props.keyboard, (ev) => console.log(`Pressed ${ev}`)); // TODO

  return (
    <span className="mnemonic">
      <kbd title={`press ${props.keyboard} with keyboard`}>
        {props.keyboard}
      </kbd>
    </span>
  );
}
