import * as React from "react";

type UseKeyPressOptions = {
  event?: "keydown" | "keyup" | "keypress";
  target?: EventTarget | null;
  eventOptions?: AddEventListenerOptions | boolean;
};

export function useKeyPress(
  key: string,
  cb: (event: KeyboardEvent) => void,
  options: UseKeyPressOptions = {},
) {
  const {
    event = "keydown",
    target = typeof window !== "undefined" ? window : null,
    eventOptions,
  } = options;
  const onListen = React.useEffectEvent(cb);

  React.useEffect(() => {
    if (!target || !("addEventListener" in target)) return;

    const handler = (event: KeyboardEvent) => {
      if (event.key === key) {
        onListen(event);
      }
    };

    target.addEventListener(event, handler as EventListener, eventOptions);

    return () => {
      target.removeEventListener(event, handler as EventListener, eventOptions);
    };
  }, [key, target, event, eventOptions]);
}
