import {schedules} from '../generated-site-data';

const varsityGames = schedules
  .filter((game) => game.team === 'Varsity')
  .map((game) => [
    game.date_label,
    game.opponent,
    game.detail,
    game.location,
    game.logo,
    game.ticket_url,
    game.result ? `${game.result}|${game.score}` : '',
  ]);

const jvGames = schedules
  .filter((game) => game.team === 'JV')
  .map((game) => [game.date_label, game.opponent, game.detail, game.location]);

const freshmanGames = schedules
  .filter((game) => game.team === 'Freshman')
  .map((game) => [game.date_label, game.opponent, game.detail, game.location]);

function LevelSchedule({id,title,games}:{id:string;title:string;games:string[][]}) {
  return <section id={id} className="level-schedule"><div className="level-schedule-heading"><p className="eyebrow blue">Remaining 2026 games</p><h2>{title}</h2></div><div className="level-game-list">{games.map(([date,opponent,time,place])=><article key={`${date}-${opponent}`}><time>{date}</time><div><strong>{opponent}</strong><small>{time}</small></div><span className={`location ${place.toLowerCase()}`}>{place}</span></article>)}</div></section>;
}

export default function Schedule(){return <main className="standalone-page"><header className="subpage-header"><a href="/">← Home</a><img src="/assets/wordmark.png" alt="Edmond North Football"/></header><nav className="schedule-level-nav" aria-label="Team schedules"><a href="#varsity">Varsity</a><a href="#jv">JV</a><a href="#freshman">Freshman</a></nav><section id="varsity" className="full-schedule standalone-schedule"><p className="eyebrow blue">2026 Varsity</p><h1>The road ahead.</h1><div className="schedule-list">{varsityGames.map(([date,opponent,detail,place,logo,ticket,result],i)=>{const [outcome,score]=result?.split('|')||[];return <article className={result?'completed-game':''} key={opponent}><span className="game-number">{String(i+1).padStart(2,'0')}</span><div className="opponent-mark"><img src={`/assets/opponents/${logo}`} alt=""/></div><time>{date}</time><div><strong>{opponent}</strong><small>{detail}</small>{result&&<span className={`game-result ${outcome==='W'?'win':'loss'}`}><b>{outcome}</b> {score}</span>}</div><span className={`location ${place.toLowerCase()}`}>{place}</span>{ticket&&<a className="ticket-link" href={ticket} target="_blank" rel="noreferrer" aria-label={`Buy tickets for Edmond North versus ${opponent}`}><span aria-hidden="true">🎟</span> Tickets</a>}</article>})}</div></section><LevelSchedule id="jv" title="JV schedule" games={jvGames}/><LevelSchedule id="freshman" title="Freshman schedule" games={freshmanGames}/></main>}
