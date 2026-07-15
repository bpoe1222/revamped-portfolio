import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>That page is not on the bench.</h1>
      <Link href="/">Return home →</Link>
    </main>
  );
}
