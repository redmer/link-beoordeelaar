import React, { type ReactElement } from "preact/compat";

export function useEventListener(
  target: ReactElement,
  eventName,
  handler,
  options,
) {
  const onEvent = React.useEffectEvent(handler);

  React.useEffect(() => {
    const targetElement = target.current ?? target;

    if (!targetElement?.addEventListener) return;

    targetElement.addEventListener(eventName, onEvent, options);

    return () => {
      targetElement.removeEventListener(eventName, onEvent, options);
    };
  }, [target, eventName, options]);
}
