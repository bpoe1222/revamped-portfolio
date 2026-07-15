import type { Metadata } from "next";
import { ContactUs } from "@/src/components/contact_form/contact_form";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <main className="contact-page">
      <section className="contact-page__intro" aria-labelledby="contact-title">
        <p className="eyebrow">Contact</p>
        <h1 id="contact-title">Let us build what matters.</h1>
        <p>
          Send a note about product quality, program operations, or a team that
          needs more clarity in the work.
        </p>
      </section>
      <ContactUs />
    </main>
  );
}
