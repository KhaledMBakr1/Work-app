"use client";

import { useState } from "react";
import { checkIn } from "./actions";

export default function CheckInButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    if (!navigator.geolocation) {
      setError("This phone or browser can't share its location.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const result = await checkIn({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        if (!result.ok) setError(result.error);
        setBusy(false);
      },
      () => {
        setError("Please allow location access so your workplace can be recorded.");
        setBusy(false);
      },
      { enableHighAccuracy: true, timeout: 20000 },
    );
  }

  return (
    <div className="stack">
      <button className="big" onClick={handleClick} disabled={busy}>
        {busy ? "Getting your location…" : "I've arrived at work"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
