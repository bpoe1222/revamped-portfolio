import { ContactUs } from './components/contact_form/contact_form';
import './App.scss';

const navModules = [
  {
    index: '01',
    title: 'About',
    href: '#about',
    description: 'Background, approach, and what drives me.',
  },
  {
    index: '02',
    title: 'Featured Work',
    href: '#work',
    description: 'Select initiatives that improve delivery.',
  },
  {
    index: '03',
    title: 'Experience',
    href: '#experience',
    description: 'Roles, scope, and measurable results.',
  },
  {
    index: '04',
    title: 'Skills',
    href: '#skills',
    description: 'Core strengths across product and quality.',
  },
  {
    index: '05',
    title: 'Contact',
    href: '#contact',
    description: 'Let us connect and build great things.',
  },
];

const featuredWork = [
  {
    index: '01',
    title: 'Quality System Redesign',
    description:
      'Reframed quality workflows into clearer intake, ownership, and readiness checkpoints.',
  },
  {
    index: '02',
    title: 'Program Operations Framework',
    description:
      'Built repeatable operating rhythms for cross-functional teams managing complex releases.',
  },
  {
    index: '03',
    title: 'Release Readiness',
    description:
      'Aligned quality signals, stakeholder decisions, and launch criteria into a sharper go/no-go process.',
  },
];

const experienceRows = [
  {
    label: 'Current',
    title: 'Quality Program Manager, HP',
    detail: 'Program leadership, quality systems, operational clarity.',
  },
  {
    label: 'Focus',
    title: 'Cross-functional Execution',
    detail: 'Translating ambiguity into action, owners, dates, and quality bars.',
  },
  {
    label: 'Practice',
    title: 'Front-end Development',
    detail: 'Building clean React interfaces with a quality-minded eye.',
  },
];

const skillGroups = [
  'Quality systems',
  'Program operations',
  'Release readiness',
  'Stakeholder alignment',
  'Risk management',
  'Process design',
  'React',
  'JavaScript',
  'Sass',
];

function App() {
  return (
    <main className="site-shell">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero__content">
          <p className="eyebrow">Quality Program Manager</p>
          <h1 id="hero-title">Bailey Poe</h1>
          <div className="accent-rule" aria-hidden="true" />
          <p className="hero__statement">
            Quality systems, program leadership, and operational clarity.
          </p>
        </div>
        <aside className="hero__marker" aria-label="Portfolio section marker">
          <span>01</span>
          <p>Focused on outcomes. Driven by quality.</p>
        </aside>
      </section>

      <nav className="module-nav" aria-label="Portfolio sections">
        {navModules.map((item) => (
          <a className="module-tile" href={item.href} key={item.index}>
            <span className="module-tile__index">{item.index}</span>
            <span className="module-tile__title">{item.title}</span>
            <span className="module-tile__arrow" aria-hidden="true">
              →
            </span>
            <span className="module-tile__line" aria-hidden="true" />
            <span className="module-tile__description">{item.description}</span>
          </a>
        ))}
      </nav>

      <section className="section-block section-block--about" id="about">
        <div className="section-block__meta">
          <span>01</span>
          <p>About</p>
        </div>
        <div className="section-block__content">
          <h2>Quality-led program work with operational focus.</h2>
          <p>
            I build scalable quality processes, align cross-functional teams, and improve outcomes
            across the product lifecycle.
          </p>
          <p>
            My work sits at the intersection of quality systems, program execution, and practical
            process improvement. The goal is simple: make the work easier to understand, easier to
            measure, and easier to improve.
          </p>
        </div>
      </section>

      <section className="section-block section-block--work" id="work">
        <div className="section-block__meta">
          <span>02</span>
          <p>Featured Work</p>
        </div>
        <div className="work-list">
          {featuredWork.map((project) => (
            <article className="work-row" key={project.index}>
              <span className="work-row__index">{project.index}</span>
              <div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
              </div>
              <span className="work-row__arrow" aria-hidden="true">
                →
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section" id="experience">
        <div className="section-block__meta">
          <span>03</span>
          <p>Experience</p>
        </div>
        <div className="timeline">
          {experienceRows.map((row) => (
            <article className="timeline-row" key={row.label}>
              <span>{row.label}</span>
              <div>
                <h3>{row.title}</h3>
                <p>{row.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="split-section split-section--skills" id="skills">
        <div className="section-block__meta">
          <span>04</span>
          <p>Skills</p>
        </div>
        <div className="skills-panel">
          <h2>Clear systems. Calm execution. Practical craft.</h2>
          <div className="skills-grid" aria-label="Core skills">
            {skillGroups.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-section__intro">
          <div className="section-block__meta">
            <span>05</span>
            <p>Contact</p>
          </div>
          <h2>Let us build what matters.</h2>
          <p>
            Send a note about product quality, program operations, or a team that needs more
            clarity in the work.
          </p>
        </div>
        <ContactUs />
      </section>
    </main>
  );
}

export default App;
