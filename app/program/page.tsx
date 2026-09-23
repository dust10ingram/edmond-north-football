'use client';

import {useEffect, useState} from 'react';
import MotionPhotoRecap from '../components/MotionPhotoRecap';
import {gameCaptains, gameLeaders, gamePrograms, players, schedules} from '../generated-site-data';

const publishedPrograms = gamePrograms.filter((program) => program.published === 'yes');
const defaultProgram = publishedPrograms.find((program) => !schedules.find((game) => game.game_id === program.game_id)?.result) || publishedPrograms.at(-1);
const playerById = new Map(players.map((player) => [player.player_id, player]));

const displayDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
});

export default function GameDayProgram() {
  const [program, setProgram] = useState<(typeof gamePrograms)[number] | undefined>(defaultProgram);
  const [countdown, setCountdown] = useState({days: '00', hours: '00', minutes: '00', seconds: '00'});

  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('game');
    if (!requested) return;
    const match = publishedPrograms.find((item) => item.slug === requested || item.game_id === requested);
    if (match) setProgram(match);
  }, []);

  const game = schedules.find((item) => item.game_id === program?.game_id);

  useEffect(() => {
    if (!game) return;
    const target = new Date(`${game.date_iso}T19:00:00-05:00`).getTime();
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      setCountdown({
        days: String(Math.floor(left / 86400000)).padStart(2, '0'),
        hours: String(Math.floor(left / 3600000) % 24).padStart(2, '0'),
        minutes: String(Math.floor(left / 60000) % 60).padStart(2, '0'),
        seconds: String(Math.floor(left / 1000) % 60).padStart(2, '0'),
      });
    };
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [game]);

  if (!program) return <main className="gameday-page"><p>No published game program is available.</p></main>;
  if (!game) return <main className="gameday-page"><p>This program is missing its schedule entry.</p></main>;

  const leaders = gameLeaders
    .filter((leader) => leader.game_id === program.game_id)
    .sort((a, b) => Number(a.sort_order) - Number(b.sort_order));
  const captains = gameCaptains
    .filter((captain) => captain.game_id === program.game_id)
    .map((captain) => ({...captain, player: playerById.get(captain.player_id)}))
    .filter((captain) => captain.player);
  const results = schedules.filter((item) =>
    item.team === game.team && item.result && item.date_iso < game.date_iso
  );

  return <main className="gameday-page">
    <header className="subpage-header"><a href="/">← Back home</a><img src="/assets/wordmark.png" alt="Edmond North Football"/></header>
    <section className="gameday-hero">
      <p className="eyebrow">Official game day program</p>
      <span>Week {program.week} · {displayDate(game.date_iso)}</span>
      <h1>{program.headline}<br/><em>{program.headline_emphasis}</em></h1>
      <p>{program.hero_summary}</p>
      <div className="gameday-actions">
        {game.ticket_url && <a className="button light" href={game.ticket_url} target="_blank" rel="noreferrer">🎟 Get tickets</a>}
        {program.broadcast_url && <a className="button outline" href={program.broadcast_url} target="_blank" rel="noreferrer">Watch on KREF</a>}
      </div>
    </section>

    <section className="gameday-matchup">
      <div><small>Edmond North</small><strong>Huskies</strong><span>{program.north_record}</span></div>
      <b>VS</b>
      <div><small>{game.opponent}</small><strong>{program.opponent_mascot}</strong><span>{program.opponent_record} · {game.detail}</span></div>
    </section>

    <section className="gameday-content"><div className="program-story">
      <p className="eyebrow blue">{program.story_label}</p>
      <h2>{program.story_headline}</h2>
      <p>{program.intro_1}</p>
      {program.intro_2 && <p>{program.intro_2}</p>}
      <div className="program-countdown kickoff-countdown" data-kickoff={`${game.date_iso}T19:00:00-05:00`} aria-label={`Countdown to ${game.opponent} kickoff`}>
        <p>Kickoff in</p><div><span><b data-unit="days">{countdown.days}</b><small>Days</small></span><span><b data-unit="hours">{countdown.hours}</b><small>Hours</small></span><span><b data-unit="minutes">{countdown.minutes}</b><small>Minutes</small></span><span><b data-unit="seconds">{countdown.seconds}</b><small>Seconds</small></span></div>
      </div>
      <div className="captains">
        <span>Game day captains</span>
        {captains.length ? <div className="captain-list">{captains.map((captain) => <b key={captain.player_id}>{captain.player?.name}<small>{captain.role}</small></b>)}</div> : <><b>Announced at kickoff</b><div className="captain-placeholders" aria-label="Game day captains to be announced"><i/><i/><i/></div></>}
        <a href="/roster/">View the full Varsity roster <span aria-hidden="true">→</span></a>
      </div>
    </div></section>

    <section className="weekly-board">
      <div className="weekly-board-heading"><p className="eyebrow blue">Huskies by the numbers</p><h2>Season leaders.</h2><span>Updated for week {program.week}</span></div>
      <div className="leader-grid">{leaders.map((leader) => {const player = playerById.get(leader.player_id); return <article key={`${leader.game_id}-${leader.category}`}><small>{leader.category}{leader.ranking ? ` · ${leader.ranking}` : ''}</small><strong>{player?.name || 'Player pending'} {player?.number && <i className="stat-jersey">#{player.number}</i>}</strong><b>{leader.primary_stat} <em>{leader.primary_label}</em></b><p>{leader.secondary_stats}</p></article>})}</div>
      <div className="weekly-details">
        <article className="program-fact"><p className="eyebrow blue">Husky fact</p><h3>{program.game_fact_title}</h3><p>{program.game_fact_body}</p></article>
        <article className="program-standings"><p className="eyebrow blue">District standings</p><ol><li><b>1</b><span>Bixby</span><strong>3–0</strong></li><li><b>2</b><span>Broken Arrow</span><strong>3–0</strong></li><li><b>3</b><span>Norman North</span><strong>3–0</strong></li><li><b>4</b><span>Edmond North</span><strong>2–1</strong></li><li><b>5</b><span>Edmond Memorial</span><strong>2–1</strong></li><li><b>6</b><span>Mustang</span><strong>2–1</strong></li><li><b>7</b><span>Southmoore</span><strong>0–3</strong></li><li><b>8</b><span>Westmoore</span><strong>0–3</strong></li></ol><small>District 6A Division I-1 · Current standings</small></article>
      </div>
      <MotionPhotoRecap albumUrl={program.photo_album_url}/>
    </section>

    <section className="program-results-section"><div className="program-results"><p className="eyebrow blue">Results so far</p>{results.map((result) => <article key={result.game_id}><b className={result.result === 'W' ? 'win' : 'loss'}>{result.result}</b><span>{result.opponent}</span><strong>{result.score}</strong></article>)}<a href="/schedule/">Full varsity schedule <span>→</span></a></div></section>
    <section className="program-sponsors"><p className="eyebrow">This week’s supporters</p><h2>Back the pack.</h2><div><article><small>Game day partner</small><strong>Citizens Bank<br/>of Edmond</strong></article><article><small>Husky supporter</small><strong>Club<br/>Car Wash</strong></article><article><small>Program sponsor</small><strong>Firehouse<br/>Subs</strong></article></div><a href="/donate/">Become a sponsor <span>→</span></a></section>
    <section className="program-update"><p className="eyebrow blue">New every week</p><h2>Keep the program in your pocket.</h2><p>This page is the home for each week’s matchup, final results, player notes, sponsor messages, and game-night links.</p></section>
  </main>;
}
