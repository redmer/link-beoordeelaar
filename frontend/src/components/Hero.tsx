import type { Subject } from "../types.js";
import label from "../util/lang.js";

export function Hero(props: {
  title: string;
  desc: string;
  unjudgedSubjects?: number;
  totalSubjects?: number;
  subject?: Subject;
  onClick?: () => void;
}) {
  return (
    <header className="measure">
      <div className="">
        <h1>{props.title}</h1>
        <h4>
          <code>{props?.subject?.url}</code>
          {props.onClick ? (
            <button className="reopen-popup" onClick={props.onClick}>
              {label("REOPEN_POPUP")}
            </button>
          ) : (
            <></>
          )}
        </h4>
        <p>{props.desc}</p>
      </div>
    </header>
  );
}
