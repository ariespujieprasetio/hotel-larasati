"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type ComponentProps,
} from "react";
import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import {
  localeCookie,
  parseLocale,
  translate,
  type Locale,
} from "@/lib/i18n/messages";

const LanguageContext = createContext<{
  locale: Locale;
  setLocale: (locale: Locale) => void;
}>({ locale: "id", setLocale: () => {} });

export function LanguageProvider({
  locale: initialLocale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const router = useRouter();
  function setLocale(next: Locale) {
    const value = parseLocale(next);
    document.cookie = `${localeCookie}=${value}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
    document.documentElement.lang = value;
    updateLocale(value);
    router.refresh();
  }
  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  return {
    ...context,
    t: (message: string) => translate(context.locale, message),
  };
}

/** Only wrap application-owned messages, never names, notes, or other record values. */
export function T({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return typeof children === "string" ? t(children) : children;
}

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <label className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-input bg-card px-2 py-1.5 text-xs text-foreground">
      <Languages aria-hidden="true" className="size-3.5 text-primary" />
      <span className="sr-only">Bahasa / Language</span>
      <select
        aria-label="Bahasa / Language"
        value={locale}
        onChange={(event) => setLocale(parseLocale(event.target.value))}
        className="max-w-24 cursor-pointer bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-ring sm:max-w-none"
      >
        <option value="id">Indonesia</option>
        <option value="en">English</option>
      </select>
    </label>
  );
}

// Attribute translation happens during React rendering, not by mutating the DOM.
export function LocalizedInput(props: ComponentProps<"input">) {
  const { t } = useLanguage();
  return (
    <input
      {...props}
      placeholder={props.placeholder ? t(props.placeholder) : undefined}
      aria-label={props["aria-label"] ? t(props["aria-label"]) : undefined}
      title={props.title ? t(props.title) : undefined}
    />
  );
}
export function LocalizedTextarea(props: ComponentProps<"textarea">) {
  const { t } = useLanguage();
  return (
    <textarea
      {...props}
      placeholder={props.placeholder ? t(props.placeholder) : undefined}
      aria-label={props["aria-label"] ? t(props["aria-label"]) : undefined}
    />
  );
}
