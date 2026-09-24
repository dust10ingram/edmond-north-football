export default function Menu() {
  return (
    <main className="menu-page">
      <header className="subpage-header">
        <a href="/">← Home</a>
        <img src="/assets/wordmark.png" alt="Edmond North Football" />
      </header>
      <section>
        <p className="eyebrow blue">Edmond North Football</p>
        <h1>Explore the program.</h1>
        <nav className="menu-links">
          <a href="/schedule/">
            Full schedule <span>→</span>
          </a>
          <a href="/roster/">
            Rosters <span>→</span>
          </a>
          <a href="/huskies-football/">
            The Huskies <span>→</span>
          </a>
          <a href="/program/">
            Game day program <span>→</span>
          </a>
          <a href="/recruiting/">
            Recruiting <span>→</span>
          </a>
          <a href="/store/">
            The Loo Team Store <span>→</span>
          </a>
          <a href="/#media">
            Media <span>→</span>
          </a>
          <a href="/#support">
            Sled Team & sponsors <span>→</span>
          </a>
          <a href="mailto:huskies@edmondnorthfb.com">
            Contact the program <span>→</span>
          </a>
        </nav>
      </section>
    </main>
  );
}
