"use client";

import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useState } from "react";

type FeedbackTone = "success" | "info" | "error";
type FeedbackItem = { id: number; message: string; tone: FeedbackTone };
type FeedbackContextValue = { notify: (message: string, tone?: FeedbackTone) => void };

const FeedbackContext = createContext<FeedbackContextValue | null>(null);

export function ActionFeedbackProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<FeedbackItem[]>([]);

  const notify = useCallback((message: string, tone: FeedbackTone = "success") => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((current) => [...current, { id, message, tone }].slice(-3));
    window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3500);
  }, []);

  return (
    <FeedbackContext.Provider value={{ notify }}>
      {children}
      <div className="action-toasts" aria-live="polite" aria-atomic="true">
        {items.map((item) => (
          <div className={item.tone === "error" ? "action-toast action-toast-error" : "action-toast"} key={item.id}>
            {item.tone === "success" ? <CheckCircle2 size={16} /> : item.tone === "error" ? <AlertCircle size={16} /> : <Info size={16} />}
            <span>{item.message}</span>
            <button type="button" className="toast-dismiss" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} aria-label="Dismiss notification">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </FeedbackContext.Provider>
  );
}

export function useActionFeedback() {
  const context = useContext(FeedbackContext);
  if (!context) throw new Error("useActionFeedback must be used inside ActionFeedbackProvider");
  return context;
}
