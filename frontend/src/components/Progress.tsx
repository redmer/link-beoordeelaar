import label from "../util/lang.js";

export interface ProgressProps {
  unjudgedSubjects?: number;
  totalSubjects?: number;
}

export function Progress({ totalSubjects, unjudgedSubjects }: ProgressProps) {
  if (!totalSubjects || !unjudgedSubjects) {
    return <progress></progress>;
  }

  const judgedSubjects = totalSubjects - unjudgedSubjects;
  const percentage = judgedSubjects / totalSubjects;
  const pctStr = Intl.NumberFormat(undefined, {
    style: "percent",
    maximumFractionDigits: 0,
  }).format(percentage);

  return (
    <div className="progress-container">
      <label htmlFor="progress-dataset">0</label>
      <progress
        id="progress-dataset"
        value={judgedSubjects}
        max={totalSubjects}
        title={pctStr}
      >
        {pctStr}
      </progress>
      <label htmlFor="progress-dataset">
        {label("ITEMS_REMAINING", unjudgedSubjects.toFixed(0))}
      </label>
    </div>
  );
}
