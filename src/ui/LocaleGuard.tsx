import type { ReactNode } from "react";

function isEnglishLocale(): boolean {
  const lang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || "en";
  return lang.toLowerCase().startsWith("en");
}

export function LocaleGuard({ children }: { children: ReactNode }) {
  if (!isEnglishLocale()) {
    return (
      <div className="loading-overlay locale-block">
        <h1>Rack Circular Economy Explorer</h1>
        <p style={{ marginTop: "1rem", color: "var(--fg-muted)" }}>
          This Explorer requires an English-language browser setting. Please set your browser
          language to English (en-US) and reload the page.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
