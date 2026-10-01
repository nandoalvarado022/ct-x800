import styles from "./PageIntro.module.scss";

type PageIntroProps = {
  kicker: string;
  title: string;
  lede: string;
};

export function PageIntro({ kicker, title, lede }: PageIntroProps) {
  return (
    <header className={styles.header}>
      <p>{kicker}</p>
      <h1>{title}</h1>
      <p className={styles.lede}>{lede}</p>
    </header>
  );
}
