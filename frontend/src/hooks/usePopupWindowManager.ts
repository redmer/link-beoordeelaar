import { useCallback, useEffect, useRef, useState } from "react";

interface PopupWindowManagerOptions {
  name: string;
  features: string;
}

export function usePopupWindowManager(options: PopupWindowManagerOptions) {
  const popupRef = useRef<Window | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(
    (url: string): boolean => {
      const popup = window.open(url, options.name, options.features);
      popupRef.current = popup;
      const blocked = popup == null;
      setIsBlocked(blocked);
      setIsOpen(!blocked);
      return !blocked;
    },
    [options.features, options.name],
  );

  const navigate = useCallback((url: string): boolean => {
    if (!popupRef.current || popupRef.current.closed) {
      setIsOpen(false);
      return false;
    }

    try {
      popupRef.current.location = url;
      setIsOpen(true);
      return true;
    } catch {
      setIsOpen(false);
      return false;
    }
  }, []);

  const syncOrOpen = useCallback(
    (url: string): boolean => {
      if (navigate(url)) return true;
      return open(url);
    },
    [navigate, open],
  );

  useEffect(() => {
    return () => {
      if (!popupRef.current) return;
      try {
        popupRef.current.close();
      } catch {
        // no-op
      }
    };
  }, []);

  return {
    isBlocked,
    isOpen,
    navigate,
    open,
    popupRef,
    syncOrOpen,
  };
}
