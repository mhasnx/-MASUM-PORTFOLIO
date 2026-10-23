import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found-page section-shell">
      <p className="eyebrow">
        <span className="eyebrow-line" />
        Not found
      </p>
      <h1>This page isn’t available.</h1>
      <p>The page may have moved or is not published.</p>
      <Link className="button button-dark" href="/">
        Return to the portfolio
      </Link>
    </main>
  );
}
