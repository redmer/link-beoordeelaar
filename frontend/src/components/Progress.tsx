import label from "../util/lang.js";

export interface ProgressProps {
  unjudgedSubjects?: number;
  /**
   * Total number of subjects in the session's *scope* — the denominator
   * of the progress bar. `null` (or otherwise falsy) means "no scope
   * declared by the session"; we then suppress the bar and render only
   * the "X remaining" label, because the dataset-wide count would be a
   * misleading denominator for a scoped queue.
   */
  totalSubjects?: number | null;
}

export function Progress({ totalSubjects, unjudgedSubjects }: ProgressProps) {
  // Stats not loaded yet at all — render an indeterminate bar so the
  // header doesn't jump in height once stats arrive.
  if (totalSubjects === undefined && unjudgedSubjects === undefined) {
    return <progress></progress>;
  }

  const unjudged = unjudgedSubjects ?? 0;
  const decfmt = new Intl.NumberFormat(undefined, {
    style: "decimal",
    maximumFractionDigits: 0,
  });

  // No scope declared (or zero-sized scope): show only the "X remaining"
  // label. We deliberately omit the <progress> element here rather than
  // rendering it without a max — a bar without a denominator can't
  // communicate progress and would be visually noisy.
  if (!totalSubjects) {
    return (
      <div className="progress-container">
        <label>{label("ITEMS_REMAINING", decfmt.format(unjudged))}</label>
      </div>
    );
  }

  const judgedSubjects = totalSubjects - unjudged;
  const percentage = judgedSubjects / totalSubjects;
  const pctfmt = new Intl.NumberFormat(undefined, {
    style: "percent",
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
        {label("ITEMS_REMAINING", decfmt.format(unjudged))}
      </label>
    </div>
  );
}
