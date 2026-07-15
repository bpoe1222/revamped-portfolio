import { portfolioResumeMetadata } from "@/lib/seo";

export const metadata = portfolioResumeMetadata;

const highlights = [
  ["Role", "Quality Program Manager"],
  ["Focus", "Quality systems, program operations, release readiness"],
  ["Practice", "React, JavaScript, Sass, systems thinking"],
];

export default function ResumePage() {
  return (
    <main className="resume-page">
      <section className="resume-hero" aria-labelledby="resume-title">
        <p className="eyebrow">Resume</p>
        <h1 id="resume-title">A concise view of the work.</h1>
        <p>
          Program leadership grounded in quality systems, practical execution,
          and clear cross-functional communication.
        </p>
        <a className="resume-download" href="/Bailey_Poe.pdf" download>
          Download Resume <span aria-hidden="true">→</span>
        </a>
      </section>
      <section className="resume-highlights" aria-label="Resume highlights">
        {highlights.map(([label, value]) => (
          <article className="resume-highlight" key={label}>
            <span>{label}</span>
            <p>{value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
