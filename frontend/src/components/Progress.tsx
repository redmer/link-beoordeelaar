import label from "../util/lang.js";

export interface ProgressProps {
  unjudgedSubjects?: number;
  totalSubjects?: number;
}

export function Progress({ totalSubjects, unjudgedSubjects }: ProgressProps) {
  if (!totalSubjects) {
    return <progress></progress>;
  }

  const unjudged = unjudgedSubjects ?? 0;

  const judgedSubjects = totalSubjects - unjudged;
  const percentage = judgedSubjects / totalSubjects;
  const pctfmt = new Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  });
  const decfmt = new Intl.NumberFormat(undefined, {
    style: "decimal",
    maximumFractionDigits: 0,
  });

  const title = `${label("ITEMS_DONE", pctfmt.format(percentage), decfmt.format(totalSubjects))}`;

  return (
    <div className="progress-container" title={title}>
      <progress
        id="progress-dataset"
        value={judgedSubjects}
        max={totalSubjects}
      >
        {title}
      </progress>
      <label htmlFor="progress-dataset">
        {label("ITEMS_REMAINING", unjudged.toFixed(0))}
      </label>
    </div>
  );
}
