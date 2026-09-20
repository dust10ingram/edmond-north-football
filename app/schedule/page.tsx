const varsityGames = [
  ['AUG 20','Yukon','Scrimmage · 6:00 PM','Home','yukon-2a179732.png',''],
  ['AUG 28','Edmond Santa Fe','Season opener · 7:00 PM','Home','edmond-santa-fe-6c4a73a2.png','','W|48–21'],
  ['SEP 04','Deer Creek','Friday · 7:00 PM','Away','deer-creek-d9a03f17.png','','L|27–38'],
  ['SEP 11','Putnam City North','Friday · 7:00 PM','Away','putnam-city-north-c27f1bef.png','','W|42–13'],
  ['SEP 25','Edmond Memorial','Friday · 7:00 PM','Away','edmond-memorial-45f59d00.png','https://gofan.co/event/6743866?schoolId=OK21048'],
  ['OCT 02','Norman North','Homecoming · 7:00 PM','Home','norman-north-b7d4bc4b.png','https://gofan.co/event/6739397?schoolId=OK21048'],
  ['OCT 09','Mustang','Friday · 7:00 PM','Away','mustang-6cf56a6f.png','https://gofan.co/event/6723321?schoolId=OK21048'],
  ['OCT 15','Westmoore','Thursday · 7:00 PM','Home','westmoore-edf593ef.png',''],
  ['OCT 23','Bixby','Friday · 7:00 PM','Home','bixby-06708da4.png','https://gofan.co/event/6739395?schoolId=OK21048'],
  ['OCT 30','Southmoore','Friday · 7:00 PM','Away','southmoore-823ad3d7.png',''],
  ['NOV 05','Broken Arrow','Senior Night · 7:00 PM','Home','broken-arrow-84cc9e55.png','https://gofan.co/event/6739394?schoolId=OK21048'],
];

const jvGames = [
  ['SEP 28','Edmond Memorial','7:00–9:00 PM','Home'],
  ['OCT 05','Norman North','7:00–9:00 PM','Away'],
  ['OCT 12','Opponent TBA','7:00–9:00 PM','TBD'],
  ['OCT 19','Westmoore','7:00–9:00 PM','Away'],
  ['OCT 26','Southmoore','7:00–9:00 PM','Home'],
];

const freshmanGames = [
  ['SEP 21','Moore','5:30–7:00 PM','Home'],
  ['SEP 28','Edmond Memorial','5:30–7:00 PM','Home'],
  ['OCT 05','Norman North','5:30–7:00 PM','Away'],
  ['OCT 12','Opponent TBA','5:30–7:00 PM','TBD'],
  ['OCT 19','Westmoore','5:30–7:00 PM','Away'],
  ['OCT 26','Southmoore','5:30–7:00 PM','Home'],
];

function LevelSchedule({id,title,games}:{id:string;title:string;games:string[][]}) {
  return <section id={id} className="level-schedule"><div className="level-schedule-heading"><p className="eyebrow blue">Remaining 2026 games</p><h2>{title}</h2></div><div className="level-game-list">{games.map(([date,opponent,time,place])=><article key={`${date}-${opponent}`}><time>{date}</time><div><strong>{opponent}</strong><small>{time}</small></div><span className={`location ${place.toLowerCase()}`}>{place}</span></article>)}</div></section>;
}

export default function Schedule(){return <main className="standalone-page"><header className="subpage-header"><a href="/">← Home</a><img src="/assets/wordmark.png" alt="Edmond North Football"/></header><nav className="schedule-level-nav" aria-label="Team schedules"><a href="#varsity">Varsity</a><a href="#jv">JV</a><a href="#freshman">Freshman</a></nav><section id="varsity" className="full-schedule standalone-schedule"><p className="eyebrow blue">2026 Varsity</p><h1>The road ahead.</h1><div className="schedule-list">{varsityGames.map(([date,opponent,detail,place,logo,ticket,result],i)=>{const [outcome,score]=result?.split('|')||[];return <article className={result?'completed-game':''} key={opponent}><span className="game-number">{String(i+1).padStart(2,'0')}</span><time>{date}</time><img src={`/assets/opponents/${logo}`} alt=""/><div><strong>{opponent}</strong><small>{detail}</small>{result&&<span className={`game-result ${outcome==='W'?'win':'loss'}`}><b>{outcome}</b> {score}</span>}</div><span className={`location ${place.toLowerCase()}`}>{place}</span>{ticket&&<a className="ticket-link" href={ticket} target="_blank" rel="noreferrer" aria-label={`Buy tickets for Edmond North versus ${opponent}`}><span aria-hidden="true">🎟</span> Tickets</a>}</article>})}</div></section><LevelSchedule id="jv" title="JV schedule" games={jvGames}/><LevelSchedule id="freshman" title="Freshman schedule" games={freshmanGames}/></main>}
