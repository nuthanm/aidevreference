"use client";

import { useEffect, useState } from "react";

const SYMBOLS = ["·", "✢", "✳", "✶", "✻", "✽"];
const WORDS = [
  "Cogitating",
  "Architecting",
  "Bootstrapping",
  "Coalescing",
  "Computing",
  "Crafting",
  "Crunching",
  "Deliberating",
  "Elucidating",
  "Generating",
  "Harmonizing",
  "Iterating",
  "Orchestrating",
  "Pondering",
  "Synthesizing",
  "Wrangling",
];

export function useFooterTicker() {
  const [symbolIndex, setSymbolIndex] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const symbolTimer = setInterval(() => {
      setSymbolIndex((prev) => (prev + 1) % SYMBOLS.length);
    }, 380);

    const wordTimer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length);
    }, 1900);

    return () => {
      clearInterval(symbolTimer);
      clearInterval(wordTimer);
    };
  }, []);

  return {
    symbol: SYMBOLS[symbolIndex],
    word: WORDS[wordIndex],
  };
}
