"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useProgress } from "@/components/ProgressProvider/ProgressProvider";
import { matchesQuery } from "@/lib/search";
import { xpForDifficulty } from "@/lib/progress";
import type { ContentItem, Difficulty } from "@/lib/types";
import styles from "./Catalog.module.scss";

type CatalogProps = {
  items: ContentItem[];
  basePath: string;
  variant: "documentation" | "learning";
};

const difficultyStyle: Record<Difficulty, string> = {
  fácil: styles.easy,
  medio: styles.medium,
  avanzado: styles.hard,
};

export function Catalog({ items, basePath, variant }: CatalogProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();
  const progress = useProgress();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q") ?? "";
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      event.preventDefault();
      inputRef.current?.focus();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function updateQuery(value: string) {
    setQuery(value);
    const params = new URLSearchParams(window.location.search);
    if (value.trim()) params.set("q", value);
    else params.delete("q");
    const next = params.toString();
    const href = next ? `${window.location.pathname}?${next}` : window.location.pathname;
    window.history.replaceState(null, "", href);
  }

  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag]) => tag);
  }, [items]);

  const visible = items
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => matchesQuery(item, query));

  const done = items.filter(
    (item) => item.type === "learning" && progress.isComplete(item.slug),
  ).length;

  return (
    <section className={styles.catalog}>
      <div className={styles.tools}>
        <label className={styles.label} htmlFor={inputId}>
          Buscar en título, descripción y etiquetas
        </label>
        <div className={styles.field}>
          <input
            ref={inputRef}
            id={inputId}
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            placeholder="Pedal, MIDI, acordes…"
            autoComplete="off"
            enterKeyHint="search"
          />
          {query ? (
            <button type="button" onClick={() => updateQuery("")}>
              Limpiar
            </button>
          ) : (
            <kbd>/</kbd>
          )}
        </div>
        <div className={styles.tags}>
          {tags.map((tag) => {
            const pressed = query.toLocaleLowerCase("es") === tag.toLocaleLowerCase("es");
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={pressed}
                onClick={() => updateQuery(pressed ? "" : tag)}
              >
                {tag}
              </button>
            );
          })}
        </div>
        <p className={styles.live} aria-live="polite">
          {visible.length} {visible.length === 1 ? "resultado" : "resultados"}
          {variant === "learning" && progress.ready
            ? ` · ${done} de ${items.length} prácticas hechas`
            : ""}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>
          Nada coincide con «{query}». Prueba con una etiqueta o con una palabra del título.
        </p>
      ) : (
        <ul className={variant === "learning" ? styles.path : styles.grid}>
          {visible.map(({ item, index }, order) => {
            const complete = item.type === "learning" && progress.isComplete(item.slug);
            return (
              <motion.li
                key={item.id}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(order * 0.035, 0.28) }}
              >
                <Link href={`${basePath}/${item.slug}`} className={styles.card}>
                  <span className={styles.meta}>
                    {variant === "learning" ? (
                      <>
                        <span className={styles.index}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.type === "learning" ? (
                          <span className={difficultyStyle[item.difficulty]}>
                            {item.difficulty}
                          </span>
                        ) : null}
                        {item.type === "learning" ? (
                          <span className={styles.xp}>
                            {xpForDifficulty(item.difficulty)} XP
                          </span>
                        ) : null}
                        {complete ? <span className={styles.done}>Hecha</span> : null}
                      </>
                    ) : (
                      <span>{item.tags[0]}</span>
                    )}
                  </span>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  <span className={styles.more}>Abrir ficha</span>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
