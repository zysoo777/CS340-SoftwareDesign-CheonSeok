import { useRef } from "react";

// Hook creation: create the presenter once so its state (e.g. lastItem) survives re-renders
export const usePresenter = <P>(presenterFactory: () => P): P => {
  const presenterRef = useRef<P | null>(null);
  if (!presenterRef.current) {
    presenterRef.current = presenterFactory();
  }
  return presenterRef.current;
};
