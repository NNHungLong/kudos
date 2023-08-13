import { createPortal } from "react-dom";
import { useState, useEffect } from "react";

interface props {
  children: React.ReactNode;
  wrapperId: string;
}

const createWrapper = (wrapperId: string) => {
  const wrapper = document.createElement("div");
  wrapper.setAttribute("id", wrapperId);
  document.body.append(wrapper);
  return wrapper;
};

export const Portal: React.FC<props> = ({ children, wrapperId }) => {
  const [wrapper, setWrapper] = useState<HTMLElement | null>(null);

  useEffect(() => {
    let element = document.getElementById(wrapperId);
    let created = false;
    if (!created) {
      element = createWrapper(wrapperId);
      created = true;
    }
    setWrapper(element);
    return () => {
      if (created && element?.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, [wrapperId]);
  if (wrapper === null) return null;
  return createPortal(children, wrapper);
};
