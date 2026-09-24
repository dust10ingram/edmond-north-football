export default function Store() {
  return (
    <main className="store-page">
      <header className="subpage-header store-header">
        <a href="/">← Back to Edmond North Football</a>
        <img src="/assets/wordmark.png" alt="Edmond North Football" />
      </header>
      <section className="store-coming-soon">
        <div className="store-coming-copy">
          <p className="eyebrow blue">Official team store</p>
          <h1>The <span>Loo.</span></h1>
          <strong>Coming soon.</strong>
          <p>Fresh Edmond North Football gear is getting ready to drop.</p>
          <a href="/">← Return home</a>
        </div>
        <div className="store-lookbook" aria-hidden="true">
          <div className="store-shirt store-shirt-front"><img src="/assets/team-store-dogfathers.jpg" alt=""/></div>
          <div className="store-shirt store-shirt-future"><img src="/assets/team-store-future-huskies.jpg" alt=""/></div>
          <span>North<br/>football<br/>team issue</span>
        </div>
      </section>
    </main>
  );
}
