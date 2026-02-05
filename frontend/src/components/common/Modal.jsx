import React, { Children } from "react";
import "../../css/common/modal.css";

const Modal = ({ children, onClose }) => {
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative" }}
      >
        <button className="modal-close" aria-label="Close" onClick={onClose}>
          ❌
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
