import './pagenotfound.scss';

function Page() {
  return (
    <main className="pnf-container">
      <section className="pnf-text-container" aria-labelledby="not-found-title">
        <p className="eyebrow">404</p>
        <h1 id="not-found-title">That page does not exist.</h1>
        <a href="/">Return Home</a>
      </section>
    </main>
  );
}

export default Page;
