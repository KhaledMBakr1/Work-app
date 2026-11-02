"use client";

import { useState } from "react";

type Props = {
  link: string;
  qr: string;
  qrFileName: string;
  text: {
    copyLink: string;
    copied: string;
    shareWhatsApp: string;
    whatsappMessage: string;
    scanToJoin: string;
    downloadQr: string;
  };
};

// The invite link with copy and WhatsApp buttons, and a QR code workers can scan.
export default function InviteLink({ link, qr, qrFileName, text }: Props) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(text.copyLink, link);
    }
  }

  return (
    <div className="stack">
      <code className="invite-link" dir="ltr">
        {link}
      </code>
      <div className="row">
        <button type="button" onClick={copy}>
          {copied ? text.copied : text.copyLink}
        </button>
        <a
          className="button whatsapp"
          href={`https://wa.me/?text=${encodeURIComponent(text.whatsappMessage)}`}
          target="_blank"
          rel="noreferrer"
        >
          {text.shareWhatsApp}
        </a>
      </div>
      {qr && (
        <div className="invite-qr">
          <p className="muted small">{text.scanToJoin}</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- inline data URL */}
          <img src={qr} alt={link} width={240} height={240} />
          <a className="button secondary" href={qr} download={qrFileName}>
            {text.downloadQr}
          </a>
        </div>
      )}
    </div>
  );
}
