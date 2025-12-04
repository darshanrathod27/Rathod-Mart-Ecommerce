// ========================================
// USE TOGGLE HOOK
// Simple boolean state toggling
// ========================================

import { useState, useCallback } from "react";

export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue((v) => !v);
  }, []);

  const setTrue = useCallback(() => {
    setValue(true);
  }, []);

  const setFalse = useCallback(() => {
    setValue(false);
  }, []);

  return [value, toggle, setTrue, setFalse];
};

// Usage example:
// const [isOpen, toggleOpen, openModal, closeModal] = useToggle(false);
