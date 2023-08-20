import { Portal } from "./portal";

interface props {
  children: React.ReactNode;
  isOpen: boolean;
  ariaLabel?: string;
  className?: string;
  hideModal: () => void;
}

export const Modal: React.FC<props> = ({
  children,
  isOpen,
  ariaLabel,
  className,
  hideModal,
}) => {
  if (!isOpen) return null;
  return (
    <Portal wrapperId="modal">
      <div
        className="fixed inset-0 overflow-y-auto bg-gray-600 bg-opacity-80"
        aria-labelledby={ariaLabel ?? "modal-title"}
        role="dialog"
        aria-modal="true"
        onClick={hideModal}
      ></div>
      <div className="fixed inset-0 pointer-events-none flex justify-center items-center">
        <div
          className={`pointer-events-auto md:rounded-xl bg-white p-6 ${className}`}
        >
          {children}
        </div>
      </div>
    </Portal>
  );
};
