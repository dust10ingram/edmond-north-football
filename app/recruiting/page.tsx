const recruits = [
  ['75','Player 75','Offensive Line','2026','f75-8821a6a2.jpg'], ['18','Player 18','Wide Receiver','2026','f18-3c46f50a.jpg'],
  ['49','Player 49','Linebacker','2027','f49-8e881ab6.jpg'], ['51','Player 51','Offensive Line','2027','f51-30e2bd94.jpg'],
  ['85','Player 85','Tight End','2027','f85-34ada187.jpg'], ['72','Player 72','Defensive Line','2028','f72-0599625c.jpg'],
];

export default function Recruiting() {
  return <main className="recruiting-page"><header className="subpage-header"><a href="/">← Back to Edmond North Football</a><img src="/assets/wordmark.png" alt="Edmond North Football" /></header><section className="recruiting recruiting-standalone"><div className="recruiting-intro"><div><p className="eyebrow blue">Recruiting center</p><h1>Put the next level on notice.</h1><p>Player profiles are being updated. These cards and Hudl links are placeholders until the staff adds verified information.</p></div><a className="button dark" href="mailto:huskies@edmondnorthfb.com?subject=Edmond%20North%20Football%20Recruiting">Contact the program →</a></div><div className="recruiting-grid">{recruits.map(([number,name,position,year,image])=><article className="player-card" key={number}><div className="player-photo"><img src={`/assets/players/${image}`} alt={`${name}, Edmond North football ${position}`}/><span className="player-number">{number}</span></div><div className="player-info"><div><p className="player-position">{position}</p><h2>{name}</h2><span>{year} · 6A-I Varsity</span></div><a className="hudl-link" href="https://www.hudl.com" target="_blank" rel="noreferrer">Mock Hudl link ↗</a></div></article>)}</div></section></main>;
}
