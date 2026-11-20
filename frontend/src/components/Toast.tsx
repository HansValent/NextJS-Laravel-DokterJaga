"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle } from "lucide-react";

type ToastProps = {
  message: string;
  type: "success" | "error";
  duration?: number;
  onClose: () => void;
};

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 150);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === "success" ? "bg-green-600" : "bg-red-600";
  const Icon = type === "success" ? CheckCircle : XCircle;

  return (
    <div
      className={`
        fixed top-1/2 left-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-xl shadow-2xl
        text-white ${bgColor}
        transition-all duration-300 ease-out
        ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
      `}
      style={{
        transform: "translate(-50%, -50%)",
        minWidth: "280px",
        maxWidth: "400px",
      }}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      <span className="flex-1 text-sm font-medium text-center">{message}</span>
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-xl overflow-hidden w-full">
        <div
          className="h-full bg-white/60 rounded-b-xl transition-all ease-linear"
          style={{
            width: "100%",
            animation: `shrink ${duration}ms linear forwards`,
          }}
        />
      </div>
    </div>
  );
}