export function Progress(props: {
  unjudgedSubjects: number;
  totalSubjects: number;
}) {
  if (!props.totalSubjects) return <></>;
  const done = props.totalSubjects - props.unjudgedSubjects;
  const max = props.totalSubjects;
  const percentage = done / max;

  return (
    <h4>
      <progress id="voortgang" value={done} max={max}>
        {percentage.toFixed(0)}%
      </progress>
      <label htmlFor="voortgang">
        {done}/{max}
      </label>
    </h4>
  );
}
