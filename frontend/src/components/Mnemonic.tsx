export interface Props {
  keyboard: string;
}

export function Mnemonic(props: Props) {
  return (
    <div className="mnemonic">
      <kbd title={`press ${props.keyboard} with keyboard`}>
        {props.keyboard}
      </kbd>
    </div>
  );
}
