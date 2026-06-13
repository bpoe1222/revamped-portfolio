import './Resume.scss';
import myResume from './Bailey_Poe.pdf';

const resumeHighlights = [
  {
    label: 'Role',
    value: 'Quality Program Manager',
  },
  {
    label: 'Focus',
    value: 'Quality systems, program operations, release readiness',
  },
  {
    label: 'Practice',
    value: 'React, JavaScript, Sass, systems thinking',
  },
];

function Resume() {
  return (
    <main className="resume-page">
      <section className="resume-hero" aria-labelledby="resume-title">
        <p className="eyebrow">Resume</p>
        <h1 id="resume-title">A concise view of the work.</h1>
        <p>
          Program leadership grounded in quality systems, practical execution, and clear
          cross-functional communication.
        </p>
        <a className="resume-download" href={myResume} download="Bailey_Poe.pdf">
          Download Resume <span aria-hidden="true">→</span>
        </a>
      </section>

      <section className="resume-highlights" aria-label="Resume highlights">
        {resumeHighlights.map((item) => (
          <article className="resume-highlight" key={item.label}>
            <span>{item.label}</span>
            <p>{item.value}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

export default Resume;
