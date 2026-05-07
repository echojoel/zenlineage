"use client";

import { useCallback, useState } from "react";
import {
  formatAPA,
  formatBibTeX,
  formatChicago,
  formatPlain,
  type CiteEntry,
} from "@/lib/citation-formats";

/**
 * A small inline-disclosure citation widget. Click "Cite this" to
 * expand four formatted citations (Plain URL / APA / Chicago /
 * BibTeX) each with its own Copy button. Inline rather than modal
 * because modals are awkward on mobile and citation export is a
 * low-frequency action — most readers ignore it; the few who want
 * it benefit from in-place expansion that doesn't trap focus.
 */

interface Props {
  entry: CiteEntry;
}

interface Format {
  id: "plain" | "apa" | "chicago" | "bibtex";
  label: string;
  body: string;
  preformatted: boolean;
}

export default function CiteThis({ entry }: Props) {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formats: Format[] = [
    { id: "plain", label: "Plain", body: formatPlain(entry), preformatted: false },
    { id: "apa", label: "APA", body: formatAPA(entry), preformatted: false },
    {
      id: "chicago",
      label: "Chicago",
      body: formatChicago(entry),
      preformatted: false,
    },
    {
      id: "bibtex",
      label: "BibTeX",
      body: formatBibTeX(entry),
      preformatted: true,
    },
  ];

  const copy = useCallback(
    async (id: string, text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        // Reset the "Copied!" indicator after a short pause.
        window.setTimeout(() => {
          setCopiedId((current) => (current === id ? null : current));
        }, 1500);
      } catch {
        // Clipboard rejected (no HTTPS, no permission). Fall back to
        // selecting the text so the user can copy manually.
        const el = document.getElementById(`cite-format-${id}`);
        if (el) {
          const range = document.createRange();
          range.selectNodeContents(el);
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
        }
      }
    },
    []
  );

  return (
    <div className="cite-this">
      <button
        type="button"
        className={`cite-this-toggle${open ? " cite-this-toggle--open" : ""}`}
        onClick={() => setOpen((p) => !p)}
        aria-expanded={open}
      >
        <span aria-hidden="true">📖</span> Cite this
      </button>
      {open ? (
        <div className="cite-this-formats">
          {formats.map((f) => (
            <div key={f.id} className="cite-this-format">
              <div className="cite-this-format-head">
                <span className="cite-this-format-label">{f.label}</span>
                <button
                  type="button"
                  className="cite-this-copy-btn"
                  onClick={() => copy(f.id, f.body)}
                  aria-label={`Copy ${f.label} citation`}
                >
                  {copiedId === f.id ? "Copied" : "Copy"}
                </button>
              </div>
              {f.preformatted ? (
                <pre id={`cite-format-${f.id}`} className="cite-this-format-body">
                  {f.body}
                </pre>
              ) : (
                <p id={`cite-format-${f.id}`} className="cite-this-format-body">
                  {f.body}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
