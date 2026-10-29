"use client";

import { useState } from "react";
import { PinIcon } from "@/components/Icons";
import { checkIn } from "./actions";

type Text = {
  noGeolocation: string;
  allowLocation: string;
  gettingLocation: string;
  arrived: string;
  locationSaved: string;
  alreadyCheckedIn: string;
};

export default function CheckInButton({ text }: { text: Text }) {
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
        const result = await checkIn({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
        });
        if (!result.ok) setError(result.error === "alreadyCheckedIn" ? text.alreadyCheckedIn : result.error);
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
      <button className="checkin-button" onClick={handleClick} disabled={busy}>
        <PinIcon />
        {busy ? text.gettingLocation : text.arrived}
      </button>
      <p className="muted small center">{text.locationSaved}</p>
      {error && <p className="alert alert-error">{error}</p>}
    </div>
  );
}
