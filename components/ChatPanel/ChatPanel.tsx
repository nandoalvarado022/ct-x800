"use client";

import { FormEvent, useRef, useState } from "react";
import styles from "./ChatPanel.module.scss";

type Role = "user" | "expert";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

const suggestions = [
  "¿Cómo asigno el pedal a sostenuto?",
  "¿Qué MIDI puedo cargar en el CT-X800?",
  "¿En qué se diferencian Listen, Watch y Remember?",
  "¿Por qué oigo las notas dos veces con el DAW?",
];

const greeting: ChatMessage = {
  id: "greeting",
  role: "expert",
  text: "Pregúntame por el pedal, las lecciones Step Up, el banco de 160 canciones o cómo llevar un MIDI al CT-X800. Respondo solo sobre este teclado.",
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([greeting]);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  async function ask(text: string) {
    const question = text.trim();
    if (!question || pending) return;

    const history = messages
      .filter((message) => message.id !== "greeting")
      .map((message) => ({ role: message.role, text: message.text }));

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: question,
    };

    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setPending(true);
    setError("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question, history }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || "No hubo respuesta.");
      }
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "expert", text: data.reply as string },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "No hubo respuesta.");
    } finally {
      setPending(false);
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(draft);
  }

  return (
    <section className={styles.panel} aria-label="Chat con el experto">
      <div className={styles.list} ref={listRef} aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={message.role === "user" ? styles.user : styles.expert}>
            <p>{message.role === "user" ? "Tú" : "Experto"}</p>
            <div>{message.text}</div>
          </article>
        ))}
        {pending ? <p className={styles.pending}>El experto está pensando…</p> : null}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.suggestions}>
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => void ask(suggestion)} disabled={pending}>
            {suggestion}
          </button>
        ))}
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.sr} htmlFor="expert-question">
          Tu pregunta sobre el CT-X800
        </label>
        <textarea
          id="expert-question"
          value={draft}
          rows={3}
          maxLength={2000}
          placeholder="Escribe la duda concreta…"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void ask(draft);
            }
          }}
        />
        <button type="submit" disabled={pending || draft.trim().length === 0}>
          {pending ? "Enviando" : "Preguntar"}
        </button>
      </form>
      <p className={styles.hint}>Enter envía. Mayús+Enter baja de línea.</p>
    </section>
  );
}
