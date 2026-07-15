import Link from "next/link";
import { SignOutButton } from "@/components/admin/auth-buttons";

export function AdminShell({
  children,
  email,
}: {
  children: React.ReactNode;
  email: string;
}) {
  return (
    <div className="admin-shell" data-site-layout="admin">
      <header className="admin-header">
        <Link href="/admin/blog">
          <strong>The Honest Build</strong>
          <span>Administration</span>
        </Link>
        <nav aria-label="Administration navigation">
          <Link href="/blog" target="_blank" rel="noreferrer">
            View blog ↗
          </Link>
          <span>{email}</span>
          <SignOutButton />
        </nav>
      </header>
      {children}
    </div>
  );
}
