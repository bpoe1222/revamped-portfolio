import './Blog.scss';

function Blog() {
  return (
    <main className="blog-container">
      <section className="blog-intro">
        <p className="eyebrow">Notes</p>
        <h1>No GUI Needed Blog</h1>
        <p>Notes on things I am learning and building.</p>
      </section>

      <section className="blog-posts" aria-label="Blog posts">
        <a href="/" aria-label="First Issue">
          <span>01</span>
          <div>
            <h2>First Issue</h2>
            <p>This is a simple test post for the blog.</p>
          </div>
          <time dateTime="2026-11-25">11/25/26</time>
        </a>
      </section>
    </main>
  );
}

export default Blog;
