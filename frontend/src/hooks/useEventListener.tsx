import React from "react";

type DOMTarget = Window | Document | HTMLElement;
type MaybeRef<T> = T | React.RefObject<T | null>;

export function useEventListener<E extends Event = Event>(
  target: MaybeRef<DOMTarget | null>,
  eventName: string,
  handler: (event: E) => void,
  options?: boolean | AddEventListenerOptions,
): void {
  const onEvent = React.useEffectEvent(handler);

  React.useEffect(() => {
    const targetElement =
      "current" in (target as object)
        ? (target as React.RefObject<DOMTarget>).current
        : (target as DOMTarget);

    if (!targetElement) return;

    const listener = (event: Event) => {
      onEvent(event as E);
    };

    targetElement.addEventListener(eventName, listener, options);

    return () => {
      targetElement.removeEventListener(eventName, listener, options);
    };
  }, [target, eventName, options]);
}
