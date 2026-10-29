"use client";

import { useState } from "react";
import { LogoutIcon, PinIcon } from "@/components/Icons";
import { checkIn, checkOut } from "./actions";

type Text = {
  label: string;
  hint: string;
  gettingLocation: string;
  noGeolocation: string;
  allowLocation: string;
  // Translations for the error codes the server can return.
  errors: Record<string, string>;
};

// Records the phone's location and checks the worker in or out.
export default function LocationButton({ kind, text }: { kind: "in" | "out"; text: Text }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!navigator.geolocation) {
      setError(text.noGeolocation);
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const position = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        };
        const result = kind === "in" ? await checkIn(position) : await checkOut(position);
        if (!result.ok) setError(text.errors[result.error] ?? result.error);
        setBusy(false);
      },
      () => {
        setError(text.allowLocation);
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 20000 },
    );
  }

  return (
    <div className="stack">
      <button
        className={kind === "in" ? "checkin-button" : "checkin-button checkout"}
        onClick={handleClick}
        disabled={busy}
      >
        {kind === "in" ? <PinIcon /> : <LogoutIcon className="flip-rtl" />}
        {busy ? text.gettingLocation : text.label}
      </button>
      <p className="muted small center">{text.hint}</p>
      {error && <p className="alert alert-error">{error}</p>}
    </div>
  );
}
