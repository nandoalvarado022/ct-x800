"use client";

import { FormEvent, useRef, useState } from "react";
import { useI18n } from "@/components/LocaleProvider/LocaleProvider";
import styles from "./ChatPanel.module.scss";

type Role = "user" | "expert";

type ChatMessage = {
  id: string;
  role: Role;
  text: string;
};

export function ChatPanel() {
  const { locale, m } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "greeting", role: "expert", text: m.chat.greeting },
  ]);
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
        body: JSON.stringify({ message: question, history, locale }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        throw new Error(data.error || m.chat.noReply);
      }
      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "expert", text: data.reply as string },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : m.chat.noReply);
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
    <section className={styles.panel} aria-label={m.chat.label}>
      <div className={styles.list} ref={listRef} aria-live="polite">
        {messages.map((message) => (
          <article key={message.id} className={message.role === "user" ? styles.user : styles.expert}>
            <p>{message.role === "user" ? m.chat.you : m.chat.expert}</p>
            <div>{message.text}</div>
          </article>
        ))}
        {pending ? <p className={styles.pending}>{m.chat.thinking}</p> : null}
      </div>
      {error ? <p className={styles.error}>{error}</p> : null}
      <div className={styles.suggestions}>
        {m.chat.suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => void ask(suggestion)} disabled={pending}>
            {suggestion}
          </button>
        ))}
      </div>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.sr} htmlFor="expert-question">
          {m.chat.questionLabel}
        </label>
        <textarea
          id="expert-question"
          value={draft}
          rows={3}
          maxLength={2000}
          placeholder={m.chat.placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void ask(draft);
            }
          }}
        />
        <button type="submit" disabled={pending || draft.trim().length === 0}>
          {pending ? m.chat.sending : m.chat.ask}
        </button>
      </form>
      <p className={styles.hint}>{m.chat.hint}</p>
    </section>
  );
}
