import type { Subject } from "../types.js";

export function PropertiesTable(props: {
  metadata: Subject["metadata"];
  keys: string[];
}) {
  return (
    <dl className="subject-properties measure-wide">
      {props.metadata &&
        Object.entries(props.metadata).map(([key, rawvalue]) => {
          // If there are allowed-keys, then skip if key is in them
          if (props.keys.length > 0 && props.keys.indexOf(key) == -1)
            return null;

          // If the value is None, N/A, etc., skip
          if (["", undefined, null].indexOf(rawvalue as any) != -1) return null;

          const value = String(rawvalue);

          return (
            <div className="keep-together kv-pair" key={key + value}>
              <dt>{key}</dt>
              <dd>
                <code>{value}</code>
              </dd>
            </div>
          );
        })}
    </dl>
  );
}
