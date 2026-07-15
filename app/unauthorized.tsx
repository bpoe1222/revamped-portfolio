import Link from "next/link";

export default function Unauthorized() {
  return (
    <main className="not-found">
      <p className="eyebrow">401</p>
      <h1>Your administrator session is missing or expired.</h1>
      <Link href="/admin/login">Sign in again →</Link>
    </main>
  );
}
