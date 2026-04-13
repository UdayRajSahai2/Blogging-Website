// frontend/src/components/common/Modal.jsx
import { createPortal } from "react-dom";

export default function Modal({ children }) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      {children}
    </div>,
    document.body,
  );
}
