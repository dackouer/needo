import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { languages, translateText, type Language } from "./translations";

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const storageKey = "needo.language";
const textNodeSources = new WeakMap<Text, string>();
const translatedAttributes = ["placeholder", "title", "aria-label", "alt"];

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "zh";
  }

  const stored = window.localStorage.getItem(storageKey);

  if (stored === "zh" || stored === "ja" || stored === "en") {
    return stored;
  }

  const browserLanguage = window.navigator.language.toLowerCase();

  if (browserLanguage.startsWith("ja")) {
    return "ja";
  }

  if (browserLanguage.startsWith("en")) {
    return "en";
  }

  return "zh";
}

function shouldSkipNode(node: Node) {
  const parent = node.parentElement;

  if (!parent) {
    return true;
  }

  if (parent.closest("[data-no-i18n]")) {
    return true;
  }

  return ["SCRIPT", "STYLE", "NOSCRIPT", "CODE", "PRE"].includes(parent.tagName);
}

function translateTextNodes(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (shouldSkipNode(node)) {
        return NodeFilter.FILTER_REJECT;
      }

      return node.nodeValue?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }
  });

  const nodes: Text[] = [];
  let current = walker.nextNode();

  while (current) {
    nodes.push(current as Text);
    current = walker.nextNode();
  }

  nodes.forEach((node) => {
    const source = textNodeSources.get(node) ?? node.nodeValue ?? "";
    textNodeSources.set(node, source);
    const next = translateText(source, language);

    if (node.nodeValue !== next) {
      node.nodeValue = next;
    }
  });
}

function translateAttributes(root: ParentNode, language: Language) {
  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    if (element.closest("[data-no-i18n]")) {
      return;
    }

    translatedAttributes.forEach((attribute) => {
      const currentValue = element.getAttribute(attribute);

      if (!currentValue?.trim()) {
        return;
      }

      const sourceAttribute = `data-i18n-source-${attribute}`;
      const source = element.getAttribute(sourceAttribute) ?? currentValue;
      element.setAttribute(sourceAttribute, source);

      const next = translateText(source, language);

      if (currentValue !== next) {
        element.setAttribute(attribute, next);
      }
    });
  });
}

function translateDocument(language: Language) {
  const htmlLang = languages.find((item) => item.code === language)?.htmlLang ?? "zh-CN";
  document.documentElement.lang = htmlLang;
  translateTextNodes(document.body, language);
  translateAttributes(document.body, language);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage(nextLanguage) {
        setLanguageState(nextLanguage);
        window.localStorage.setItem(storageKey, nextLanguage);
      }
    }),
    [language]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function I18nRuntime({ children }: { children: ReactNode }) {
  const { language } = useI18n();
  const location = useLocation();

  useEffect(() => {
    let frame = 0;

    const scheduleTranslate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => translateDocument(language));
    };

    scheduleTranslate();

    const observer = new MutationObserver(scheduleTranslate);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: translatedAttributes
    });

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [language, location.pathname, location.search]);

  return children;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within I18nProvider");
  }

  return context;
}
