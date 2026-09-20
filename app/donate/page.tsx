const levels = [
  ['25', 'Fuel a workout', 'Help provide recovery drinks, snacks, and hydration after training.'],
  ['75', 'Support a week', 'Help cover a week of nutrition and daily player needs.'],
  ['150', 'Back a Husky', 'Make a larger contribution toward equipment, meals, camps, and team experiences.'],
];

export default function DonatePage() {
  return <main className="donate-page">
    <header className="subpage-header"><a href="/" aria-label="Return home"><img src="/assets/wordmark.png" alt="Edmond North Football"/></a><a href="/">← Back home</a></header>
    <section className="donate-hero"><div><p className="eyebrow">Sled Team Booster Club</p><h1>Fuel the<br/>Huskies.</h1><p>Every contribution helps Edmond North Football give its student-athletes the resources and experiences they need to compete, grow, and represent the North.</p></div></section>
    <section className="donate-story"><div><p className="eyebrow blue">Give with purpose</p><h2>Every gift moves the program forward.</h2></div><div><p>The Sled Team supports the needs that make a complete football program possible: player nutrition, equipment, camps, team meals, travel, and experiences across Varsity, JV, and 9th Grade.</p><p>Choose a suggested level or contact the booster club about a custom contribution. Any amount makes a difference for our players.</p></div></section>
    <section className="donation-levels" aria-labelledby="donation-heading"><div className="donation-heading"><p className="eyebrow">Choose your impact</p><h2 id="donation-heading">Back the pack.</h2></div><div className="donation-grid">{levels.map(([amount,title,copy])=><article key={amount}><span>${amount}</span><h3>{title}</h3><p>{copy}</p><a href={`mailto:huskies@edmondnorthfb.com?subject=${encodeURIComponent(`Edmond North Football $${amount} Donation`)}`}>Choose ${amount} <b aria-hidden="true">→</b></a></article>)}<article className="custom-donation"><span>Any</span><h3>Custom amount</h3><p>Give at the level that works for your family, business, or organization.</p><a href="mailto:huskies@edmondnorthfb.com?subject=Edmond%20North%20Football%20Custom%20Donation">Contact the Sled Team <b aria-hidden="true">→</b></a></article></div><p className="donation-note">Donation coordination and receipts are handled directly by the Edmond North Football Sled Team.</p></section>
    <footer className="donate-footer"><img src="/assets/badge.png" alt="Edmond North Huskies badge"/><div><strong>Every player. Every level. One program.</strong><a href="mailto:huskies@edmondnorthfb.com">huskies@edmondnorthfb.com</a></div></footer>
  </main>;
}
