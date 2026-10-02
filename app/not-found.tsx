import Link from "next/link";
import { getLocale } from "@/lib/get-locale";
import { messages } from "@/lib/messages";
import styles from "./status.module.scss";

export default async function NotFound() {
  const copy = messages[await getLocale()].status;

  return (
    <section className={styles.box}>
      <p>404</p>
      <h1>{copy.notFound}</h1>
      <Link href="/documentacion">{copy.backDocs}</Link>
    </section>
  );
}
