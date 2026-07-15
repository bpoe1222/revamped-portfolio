import Link from "next/link";

export default function Forbidden() {
  return (
    <main className="not-found">
      <p className="eyebrow">403</p>
      <h1>This identity is not authorized for the editorial desk.</h1>
      <Link href="/admin/login">Use an authorized account →</Link>
    </main>
  );
}
