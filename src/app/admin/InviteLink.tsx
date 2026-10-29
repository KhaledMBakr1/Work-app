"use client";

import { useState } from "react";

type Props = {
  link: string;
  text: { copyLink: string; copied: string; shareWhatsApp: string; whatsappMessage: string };
};

// The invite link with copy and WhatsApp buttons.
export default function InviteLink({ link, text }: Props) {
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
    </div>
  );
}
