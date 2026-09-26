import {animate,hover,inView,stagger} from 'motion';

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const mountHeroTicker=()=>{
  const hero=document.querySelector<HTMLElement>('.hero');
  if(!hero||hero.querySelector('.hero-ticker'))return;
  const style=document.createElement('style');
  style.textContent='.hero-ticker{position:absolute;z-index:2;top:0;left:0;right:0;overflow:hidden;border-top:1px solid rgba(255,255,255,.58);border-bottom:1px solid rgba(255,255,255,.58);background:rgba(2,14,32,.52);color:#fff}.hero-ticker-track{display:flex;width:max-content;animation:hero-ticker-scroll 24s linear infinite}.hero-ticker span{display:flex;align-items:center;gap:26px;white-space:nowrap;padding:9px 26px;font-size:.66rem;font-weight:900;letter-spacing:.22em;text-transform:uppercase}.hero-ticker span:after{content:"◆";color:#4e9ff1;font-size:.5rem}@keyframes hero-ticker-scroll{to{transform:translateX(-50%)}}@media (prefers-reduced-motion:reduce){.hero-ticker-track{animation:none}}@media (max-width:640px){.hero-ticker span{padding-block:8px;font-size:.6rem}}';
  document.head.append(style);
  const ticker=document.createElement('div');
  ticker.className='hero-ticker';
  ticker.setAttribute('aria-label','City Champions. Edmond North beats Memorial 39 to 36.');
  ticker.innerHTML='<div class="hero-ticker-track"><span>City Champions</span><span>Edmond North beats Memorial 39–36</span><span aria-hidden="true">City Champions</span><span aria-hidden="true">Edmond North beats Memorial 39–36</span></div>';
  hero.querySelector('.hero-shade')?.insertAdjacentElement('afterend',ticker);
};

mountHeroTicker();

const parseDataCsv=(text:string)=>{
  const rows:string[][]=[];
  let row:string[]=[],value='',quoted=false;
  for(let index=0;index<text.length;index+=1){
    const char=text[index];
    if(quoted){if(char==='"'&&text[index+1]==='"'){value+='"';index+=1;}else if(char==='"')quoted=false;else value+=char;}
    else if(char==='"')quoted=true;
    else if(char===','){row.push(value);value='';}
    else if(char==='\n'){row.push(value.replace(/\r$/,''));if(row.some(cell=>cell!==''))rows.push(row);row=[];value='';}
    else value+=char;
  }
  if(value||row.length){row.push(value.replace(/\r$/,''));if(row.some(cell=>cell!==''))rows.push(row);}
  const [headers,...records]=rows;
  return records.map(record=>Object.fromEntries(headers.map((header,index)=>[header,record[index]||''])));
};

const setProgramCountdown=(game:Record<string,string>)=>{
  const current=document.querySelector<HTMLElement>('.gameday-page .program-countdown');
  if(!current)return;
  const countdown=current.cloneNode(true) as HTMLElement;
  current.replaceWith(countdown);
  const target=new Date(`${game.date_iso}T19:00:00-05:00`).getTime();
  countdown.dataset.kickoff=`${game.date_iso}T19:00:00-05:00`;
  countdown.setAttribute('aria-label',`Countdown to ${game.opponent} kickoff`);
  const tick=()=>{
    const remaining=Math.max(0,target-Date.now());
    const values={days:Math.floor(remaining/86400000),hours:Math.floor(remaining/3600000)%24,minutes:Math.floor(remaining/60000)%60,seconds:Math.floor(remaining/1000)%60};
    Object.entries(values).forEach(([unit,value])=>{const digit=countdown.querySelector<HTMLElement>(`[data-unit="${unit}"]`);if(digit)digit.textContent=String(value).padStart(2,'0');});
  };
  tick();
  setInterval(tick,1000);
};

const loadStaticProgram=async()=>{
  const page=document.querySelector<HTMLElement>('.gameday-page');
  if(!page)return;
  try{
    const [programsText,schedulesText]=await Promise.all([fetch('/data/game-programs.csv').then(response=>response.text()),fetch('/data/schedules.csv').then(response=>response.text())]);
    const programs=parseDataCsv(programsText).filter(program=>program.published==='yes');
    const games=parseDataCsv(schedulesText);
    const path=location.pathname.split('/').filter(Boolean).at(-1);
    const program=programs.find(item=>item.slug===path)||programs.find(item=>!games.find(game=>game.game_id===item.game_id)?.result)||programs.at(-1);
    const game=games.find(item=>item.game_id===program?.game_id);
    if(!program||!game)return;
    const date=new Date(`${game.date_iso}T12:00:00`).toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'});
    const hero=page.querySelector('.gameday-hero');
    const week=hero?.querySelector(':scope > span');if(week)week.textContent=`Week ${program.week} · ${date}`;
    const title=hero?.querySelector('h1');if(title)title.innerHTML=`${program.headline}<br><em>${program.headline_emphasis}</em>`;
    const summary=[...hero?.querySelectorAll<HTMLElement>(':scope > p')||[]].find(item=>!item.classList.contains('eyebrow'));if(summary)summary.textContent=program.hero_summary;
    const ticket=hero?.querySelector<HTMLAnchorElement>('.button.light');if(ticket&&game.ticket_url)ticket.href=game.ticket_url;
    const matchup=[...page.querySelectorAll<HTMLElement>('.gameday-matchup > div')];
    if(matchup[0]){const values=matchup[0].querySelectorAll('small,strong,span');if(values[2])values[2].textContent=program.north_record;}
    if(matchup[1]){const values=matchup[1].querySelectorAll('small,strong,span');if(values[0])values[0].textContent=game.opponent;if(values[1])values[1].textContent=program.opponent_mascot;if(values[2])values[2].textContent=`${program.opponent_record} · ${game.detail}`;}
    const story=page.querySelector('.program-story');
    const label=story?.querySelector('.eyebrow');if(label)label.textContent=program.story_label;
    const headline=story?.querySelector('h2');if(headline)headline.textContent=program.story_headline;
    const paragraphs=[...story?.querySelectorAll<HTMLElement>(':scope > p')||[]].filter(item=>!item.classList.contains('eyebrow'));
    if(paragraphs[0])paragraphs[0].textContent=program.intro_1;
    if(paragraphs[1])paragraphs[1].textContent=program.intro_2;
    const fact=page.querySelector('.program-fact');
    const factTitle=fact?.querySelector('h3');if(factTitle)factTitle.textContent=program.game_fact_title;
    const factCopy=[...fact?.querySelectorAll('p')||[]].find(item=>!item.classList.contains('eyebrow'));if(factCopy)factCopy.textContent=program.game_fact_body;
    const weeklyNote=page.querySelector('.weekly-board-heading > span');if(weeklyNote)weeklyNote.textContent=`Updated for week ${program.week}`;
    const results=page.querySelector<HTMLElement>('.program-results');
    if(results){
      const played=games.filter(item=>item.team===game.team&&item.result&&item.date_iso<game.date_iso);
      results.querySelectorAll(':scope > article').forEach(card=>card.remove());
      const link=results.querySelector(':scope > a');
      played.forEach(item=>{
        const card=document.createElement('article');
        const result=document.createElement('b');result.className=item.result==='W'?'win':'loss';result.textContent=item.result;
        const opponent=document.createElement('span');opponent.textContent=item.opponent;
        const score=document.createElement('strong');score.textContent=item.score;
        card.append(result,opponent,score);
        results.insertBefore(card,link);
      });
    }
    setProgramCountdown(game);
  }catch{
    // The committed markup remains available if program data cannot load.
  }
};

const programDataReady=loadStaticProgram();

const loadProgramCaptains=async()=>{
  const container=document.querySelector<HTMLElement>('.gameday-page .captains');
  const week=container?.closest('.gameday-page')?.querySelector('.gameday-hero > span')?.textContent?.match(/Week\s+(\d+)/)?.[1];
  if(!container||!week)return;

  try{
    const [captainsText,playersText,programsText]=await Promise.all([
      fetch('/data/game-captains.csv').then(response=>response.text()),
      fetch('/data/players.csv').then(response=>response.text()),
      fetch('/data/game-programs.csv').then(response=>response.text()),
    ]);
    const program=parseDataCsv(programsText).find(row=>row.week===week);
    if(!program)return;
    const players=new Map(parseDataCsv(playersText).map(player=>[player.player_id,player]));
    const captains=parseDataCsv(captainsText)
      .filter(captain=>captain.game_id===program.game_id)
      .map(captain=>({...captain,player:players.get(captain.player_id)}))
      .filter(captain=>captain.player);
    if(!captains.length)return;

    container.querySelectorAll(':scope > b,:scope > .captain-placeholders').forEach(node=>node.remove());
    const list=document.createElement('div');
    list.className='captain-list';
    list.style.cssText='display:flex;flex-wrap:wrap;gap:10px;margin:9px 0';
    captains.forEach(({player,role})=>{
      const card=document.createElement('b');
      card.style.cssText='display:flex;flex-direction:column;padding:11px 14px;background:#eaf4fc;border-left:3px solid #4da3f5';
      card.textContent=player.name;
      const label=document.createElement('small');
      label.textContent=role;
      label.style.cssText='margin-top:4px;color:#697b90;font-size:.58rem;letter-spacing:.08em';
      card.append(label);
      list.append(card);
    });
    const rosterLink=container.querySelector(':scope > a');
    container.insertBefore(list,rosterLink);
  }catch{
    // The static page retains its existing placeholder if the data files cannot load.
  }
};

void programDataReady.then(loadProgramCaptains);

const displayMeasurement=(value:string)=>value||'TBD';

const insertRosterPlayer=(player:Record<string,string>)=>{
  const roster=document.querySelector<HTMLElement>('.roster-list');
  if(!roster||[...roster.querySelectorAll('article strong')].some(node=>node.textContent===player.name))return;
  const card=document.createElement('article');
  card.className='roster-varsity';
  const number=document.createElement('span');number.className='roster-number';number.textContent=player.number;
  const details=document.createElement('div');
  const name=document.createElement('strong');name.textContent=player.name;
  const position=document.createElement('small');position.textContent=player.position;
  details.append(name,position);
  const graduating=document.createElement('span');graduating.className='roster-class';graduating.textContent=`Class of ${player.class_year}`;
  const index=document.createElement('span');index.className='roster-index';
  card.append(number,details,graduating,index);
  const next=[...roster.querySelectorAll<HTMLElement>('article.roster-varsity')].find(item=>Number(item.querySelector('.roster-number')?.textContent)>Number(player.number));
  roster.insertBefore(card,next||null);
  [...roster.querySelectorAll<HTMLElement>('article.roster-varsity .roster-index')].forEach((item,position)=>item.textContent=String(position+1).padStart(2,'0'));
};

const insertRecruitingPlayer=(player:Record<string,string>)=>{
  const grid=document.querySelector<HTMLElement>('#recruits-panel .recruiting-grid');
  if(!grid||[...grid.querySelectorAll('.player-profile h2')].some(node=>node.textContent===player.name))return;
  const source=grid.querySelector<HTMLDetailsElement>('.player-profile');
  if(!source)return;
  const card=source.cloneNode(true) as HTMLDetailsElement;
  const key=`player-${player.number}-${player.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`;
  card.id=key;
  card.dataset.class=player.class_year;
  const photo=card.querySelector<HTMLImageElement>('.player-photo img');
  if(photo){photo.src=`/assets/players/${player.image}`;photo.alt=`${player.name}, Edmond North football ${player.position}`;}
  const number=card.querySelector('.player-number');if(number)number.textContent=player.number;
  const position=card.querySelector('.player-position');if(position)position.textContent=player.position;
  const name=card.querySelector('h2');if(name)name.textContent=player.name;
  const meta=[...card.querySelectorAll<HTMLElement>('.player-meta > span')];
  if(meta[0])meta[0].textContent=`Class of ${player.class_year}`;
  if(meta[1])meta[1].innerHTML=`<small>HT</small> ${displayMeasurement(player.height)}`;
  if(meta[2])meta[2].innerHTML=`<small>WT</small> ${displayMeasurement(player.weight)}`;
  const links=[...card.querySelectorAll<HTMLAnchorElement>('.profile-social-links a')];
  const query=encodeURIComponent(`"${player.name}" "Edmond North" football`);
  if(links[0]){links[0].href=player.x_url||`https://x.com/search?q=${query}&src=typed_query`;links[0].setAttribute('aria-label',`Find ${player.name} on X`);}
  if(links[1]){links[1].href=player.hudl_url||`https://www.hudl.com/search?query=${encodeURIComponent(player.name)}`;links[1].setAttribute('aria-label',`Find ${player.name} on Hudl`);}
  if(links[2]){links[2].href=player.maxpreps_url||`https://www.maxpreps.com/search/?query=${encodeURIComponent(player.name)}`;links[2].setAttribute('aria-label',`Find ${player.name} on MaxPreps`);}
  const contact=card.querySelector<HTMLAnchorElement>('.profile-actions a');
  if(contact)contact.href=`mailto:huskies@edmondnorthfb.com?subject=${encodeURIComponent(`Recruiting inquiry: ${player.name} #${player.number}`)}`;
  const next=[...grid.querySelectorAll<HTMLDetailsElement>('.player-profile')].find(item=>Number(item.querySelector('.player-number')?.textContent)>Number(player.number));
  grid.insertBefore(card,next||null);
};

const loadMissingStaticPlayers=async()=>{
  if(!document.querySelector('.roster-list,.recruiting-page'))return;
  try{
    const players=parseDataCsv(await fetch('/data/players.csv').then(response=>response.text()));
    players
      .filter(player=>player.team==='Varsity'&&player.active==='yes')
      .forEach(player=>{
        insertRosterPlayer(player);
        if(player.recruiting_profile==='yes')insertRecruitingPlayer(player);
      });
  }catch{
    // Existing static content remains available if the player data cannot load.
  }
};

void loadMissingStaticPlayers();

const createResult=(game:Record<string,string>)=>{
  const result=document.createElement('span');
  result.className=`game-result ${game.result==='W'?'win':'loss'}`;
  const letter=document.createElement('b');
  letter.textContent=game.result;
  result.append(letter,document.createTextNode(` ${game.score}`));
  return result;
};

const setFeaturedCountdown=(game:Record<string,string>)=>{
  const current=document.querySelector<HTMLElement>('.schedule-strip .kickoff-countdown');
  if(!current)return;
  // Replace the element to detach the original page's countdown interval before
  // starting one for the next unplayed game.
  const countdown=current.cloneNode(true) as HTMLElement;
  current.replaceWith(countdown);
  const target=new Date(`${game.date_iso}T19:00:00-05:00`).getTime();
  countdown.dataset.kickoff=`${game.date_iso}T19:00:00-05:00`;
  countdown.setAttribute('aria-label',`Countdown to ${game.opponent} kickoff`);
  const tick=()=>{
    const remaining=Math.max(0,target-Date.now());
    const values={days:Math.floor(remaining/86400000),hours:Math.floor(remaining/3600000)%24,minutes:Math.floor(remaining/60000)%60,seconds:Math.floor(remaining/1000)%60};
    Object.entries(values).forEach(([unit,value])=>{
      const digit=countdown.querySelector<HTMLElement>(`[data-unit="${unit}"]`);
      if(digit)digit.textContent=String(value).padStart(2,'0');
    });
    if(!remaining)countdown.classList.add('kickoff-live');
  };
  tick();
  setInterval(tick,1000);
};

const updateFeaturedGame=(games:Record<string,string>[])=>{
  const featured=document.querySelector<HTMLElement>('.game.featured');
  const today=new Date().toLocaleDateString('en-CA');
  const next=games.filter(game=>!game.result&&game.date_iso>=today).sort((a,b)=>a.date_iso.localeCompare(b.date_iso))[0];
  if(!featured||!next)return;
  const label=document.querySelector<HTMLElement>('.schedule-strip .section-lead .eyebrow');
  if(label){
    const date=new Date(`${next.date_iso}T12:00:00`);
    label.textContent=`Next up · ${date.toLocaleDateString('en-US',{month:'long',day:'numeric'}).toUpperCase()}`;
  }
  const date=featured.querySelector('.game-date');if(date)date.textContent=next.date_label;
  const logo=featured.querySelector<HTMLImageElement>('.upcoming-logo-crop img');
  if(logo){logo.src=`/assets/opponents/${next.logo}`;logo.alt=`${next.opponent} logo`;}
  const details=featured.querySelector('.game-place')?.parentElement;
  const opponent=details?.querySelector('p');if(opponent)opponent.textContent=next.opponent;
  const detail=details?.querySelector(':scope > span');if(detail)detail.textContent=next.detail;
  const location=details?.querySelector('.game-place');
  if(location){location.innerHTML='<span aria-hidden="true">◆</span>';location.append(next.location);}
  const ticket=featured.querySelector<HTMLAnchorElement>('.upcoming-ticket');
  if(ticket&&next.ticket_url){ticket.href=next.ticket_url;ticket.setAttribute('aria-label',`Buy tickets for ${next.opponent}`);}
  else ticket?.remove();
  const preview=featured.querySelector<HTMLAnchorElement>('.upcoming-preview');
  if(preview&&next.program_url)preview.href=next.program_url;
  else preview?.remove();
  setFeaturedCountdown(next);
};

const updateLevelNextGames=(games:Record<string,string>[])=>{
  const today=new Date().toLocaleDateString('en-CA');
  const nextFor=(team:string)=>games.filter(game=>game.team===team&&!game.result&&game.date_iso>=today).sort((a,b)=>a.date_iso.localeCompare(b.date_iso))[0];
  const levels:[string,string][]=[['JV','JV'],['9th Grade','Freshman']];
  levels.forEach(([heading,team])=>{
    const game=nextFor(team);
    const card=[...document.querySelectorAll<HTMLElement>('.program-levels article')].find(item=>item.querySelector(':scope > strong')?.textContent===heading);
    const compact=card?.querySelector<HTMLElement>('.compact-next-game');
    if(!game||!compact)return;
    const [month,day]=game.date_label.split(' ');
    const date=compact.querySelector<HTMLTimeElement>('time');
    if(date){date.dateTime=game.date_iso;date.innerHTML=`<b>${month}</b> ${day}`;}
    const detail=game.detail.split('–')[0].trim();
    const suffix=game.detail.match(/(AM|PM)$/)?.[1];
    const info=compact.querySelector('span');
    if(info)info.innerHTML=`<b>Next game · ${game.location}</b>${game.opponent} · ${detail}${suffix?` ${suffix}`:''}`;
  });
};

const updateProgramResults=(games:Record<string,string>[])=>{
  const results=document.querySelector<HTMLElement>('.program-results');
  const week=document.querySelector('.gameday-hero > span')?.textContent?.match(/Week\s+(\d+)/)?.[1];
  if(!results||!week)return;
  void fetch('/data/game-programs.csv').then(response=>response.text()).then(programsText=>{
    const program=parseDataCsv(programsText).find(row=>row.week===week);
    const played=games.filter(game=>game.result&&(!program||game.game_id===program.game_id||game.date_iso<=games.find(item=>item.game_id===program.game_id)?.date_iso));
    if(!played.length)return;
    results.querySelectorAll(':scope > article').forEach(card=>card.remove());
    const link=results.querySelector(':scope > a');
    played.forEach(game=>{
      const card=document.createElement('article');
      const letter=document.createElement('b');letter.className=game.result==='W'?'win':'loss';letter.textContent=game.result;
      const opponent=document.createElement('span');opponent.textContent=game.opponent;
      const score=document.createElement('strong');score.textContent=game.score;
      card.append(letter,opponent,score);
      results.insertBefore(card,link);
    });
  }).catch(()=>{});
};

const loadStaticScheduleData=async()=>{
  if(!document.querySelector('.schedule-list,.game.featured,.program-results'))return;
  try{
    const allGames=parseDataCsv(await fetch('/data/schedules.csv').then(response=>response.text()));
    const games=allGames.filter(game=>game.team==='Varsity');
    document.querySelectorAll<HTMLElement>('.schedule-list article').forEach(card=>{
      const opponent=card.querySelector('strong')?.textContent?.trim();
      const date=card.querySelector('time')?.textContent?.trim();
      const game=games.find(item=>item.opponent===opponent&&item.date_label===date);
      if(!game?.result)return;
      card.classList.add('completed-game');
      card.querySelector('.ticket-link')?.remove();
      const details=card.querySelector('strong')?.parentElement;
      details?.querySelector('.game-result')?.remove();
      if(details)details.append(createResult(game));
    });
    updateFeaturedGame(games);
    updateLevelNextGames(allGames);
  }catch{
    // Static markup remains readable while a data file is unavailable.
  }
};

void loadStaticScheduleData();

if(!reduced){
  const ease=[.22,1,.36,1] as const;
  const slowEase=[.16,1,.3,1] as const;
  const prepare=(items:HTMLElement[],distance=24,scale=1)=>items.forEach(item=>{item.style.opacity='0';item.style.transform=`translateY(${distance}px) scale(${scale})`;item.style.willChange='opacity, transform'});
  const finish=(items:HTMLElement[])=>items.forEach(item=>item.style.removeProperty('will-change'));

  const hero=[...document.querySelectorAll<HTMLElement>('.hero .hero-line,.hero .hero-location,.hero .hero-actions,.hero .hero-stat')];
  if(hero.length){prepare(hero,26);animate(hero,{opacity:1,transform:'translateY(0px) scale(1)'},{duration:1.3,delay:stagger(.13),ease,onComplete:()=>finish(hero)})}

  const revealGroups=(selector:string,children:string,amount=.12,duration=2.1,step=.12)=>document.querySelectorAll<HTMLElement>(selector).forEach(section=>{const items=[...section.querySelectorAll<HTMLElement>(children)];if(!items.length)return;prepare(items);inView(section,()=>animate(items,{opacity:1,transform:'translateY(0px) scale(1)'},{duration,delay:stagger(step),ease,onComplete:()=>finish(items)}),{amount})});
  const revealEach=(selector:string,amount=.25,duration=2.4,distance=28)=>document.querySelectorAll<HTMLElement>(selector).forEach(item=>{prepare([item],distance);inView(item,()=>animate(item,{opacity:1,transform:'translateY(0px) scale(1)'},{duration,ease,onComplete:()=>finish([item])}),{amount})});

  revealEach(['.section-lead h2','.program-copy h2','.media-copy h2','.coaches > h2','.support-copy h2','.sponsors-copy h2','.standalone-schedule > h1','.level-schedule-heading h2','.recruiting-intro h1','.coach-finder-copy h2','.roster-hero h1','.camps-hero h1','.camp-list h2','.donate-hero h1','.donate-story h2','.donation-heading h2','.huskies-hero h1','.huskies-history h2','.all-time h2','.alumni h2','.menu-page section > h1','.gameday-hero h1','.program-story h2','.weekly-board-heading h2','.program-sponsors h2','.program-update h2'].join(','),.22,2.5,30);

  const tradition=document.querySelector<HTMLElement>('.tradition');
  if(tradition){const eyebrow=tradition.querySelector<HTMLElement>(':scope > .eyebrow');const quote=tradition.querySelector<HTMLElement>(':scope > blockquote');if(eyebrow)prepare([eyebrow],14);if(quote)prepare([quote],34,.985);if(quote)inView(quote,()=>{if(eyebrow)animate(eyebrow,{opacity:1,transform:'translateY(0px) scale(1)'},{duration:2.1,ease,onComplete:()=>finish([eyebrow])});animate(quote,{opacity:1,transform:'translateY(0px) scale(1)'},{duration:3.3,delay:.25,ease:slowEase,onComplete:()=>finish([quote])})},{amount:.25});revealEach('.tradition > .roster-cta,.tradition .program-levels article',.2,2.2,26)}

  revealEach('.standalone-schedule .schedule-list article,.level-schedule .level-game-list article,.roster-list article',.12,2.1,24);
  revealEach('.huskies-hero > .eyebrow,.huskies-hero > p:last-child,.coaches > .eyebrow,.coaches > div article,.all-time > .eyebrow,.all-time > p,.all-time > div article,.alumni > .eyebrow,.alumni > p,.alumni-years article,.alumni > small',.12,2.1,24);
  revealGroups('.weekly-board','.leader-grid article',.12,2.1,.1);

  document.querySelectorAll<HTMLElement>('.upcoming-logo-crop').forEach(mark=>{prepare([mark],18,.97);inView(mark,()=>animate(mark,{opacity:1,transform:'translateY(0px) scale(1)'},{duration:2.1,ease,onComplete:()=>finish([mark])}),{amount:.45})});
  document.querySelectorAll<HTMLElement>('.standalone-schedule .schedule-list article').forEach(card=>{const logo=card.querySelector<HTMLElement>('.opponent-mark img');if(logo)hover(card,()=>{animate(logo,{translateX:'-47%'},{duration:.22});return()=>animate(logo,{translateX:'-50%'},{duration:.22})})});
  document.querySelectorAll<HTMLElement>('.kickoff-countdown b[data-unit]').forEach(digit=>{let prior=digit.textContent;new MutationObserver(()=>{if(prior===digit.textContent)return;prior=digit.textContent;animate(digit,{opacity:[.25,1],transform:['translateY(-7px)','translateY(0px)']},{duration:.25,ease:'easeOut'})}).observe(digit,{childList:true,subtree:true})});
  document.querySelectorAll<HTMLDetailsElement>('.player-profile').forEach(card=>card.addEventListener('toggle',()=>{const detail=card.querySelector<HTMLElement>('.profile-detail');if(card.open&&detail)animate(detail,{opacity:[0,1],transform:['translateY(-10px)','translateY(0px)']},{duration:.45,ease})}));
  document.querySelectorAll<HTMLElement>('.leader-grid article>b').forEach(value=>{const target=Number((value.childNodes[0]?.textContent||'').trim().replace(/,/g,''));if(Number.isFinite(target))inView(value,()=>animate(0,target,{duration:1.05,ease,onUpdate:number=>{if(value.childNodes[0])value.childNodes[0].textContent=`${Math.round(number).toLocaleString()} `}}),{amount:1})});

  const roster=document.querySelector('.roster-list');if(roster){const tabs=[...roster.querySelectorAll<HTMLButtonElement>('.roster-tabs button')];const active=document.createElement('span');active.className='roster-tab-active';const selected=tabs.find(tab=>tab.getAttribute('aria-selected')==='true'||tab.classList.contains('active'));if(selected)selected.insertBefore(active,selected.firstChild);tabs.forEach(tab=>tab.addEventListener('click',()=>{tab.insertBefore(active,tab.firstChild);animate(active,{opacity:[.45,1],transform:['scaleX(.75)','scaleX(1)']},{duration:.3,ease});requestAnimationFrame(()=>{const visible=[...roster.querySelectorAll<HTMLElement>('article')].filter(item=>getComputedStyle(item).display!=='none');visible.forEach((item,index)=>animate(item,{opacity:[0,1],transform:['translateY(24px)','translateY(0px)']},{duration:2.1,delay:Math.min(index*.08,.8),ease,onComplete:()=>finish([item])}))})}))}
  const track=document.querySelector<HTMLElement>('.photo-recap-track');if(track&&innerWidth<=600){let start=0,origin=0,current=0;const minX=Math.min(0,(track.parentElement?.clientWidth||0)-track.scrollWidth);track.addEventListener('pointerdown',event=>{start=event.clientX;origin=current;track.setPointerCapture(event.pointerId)});track.addEventListener('pointermove',event=>{if(!track.hasPointerCapture(event.pointerId))return;current=Math.max(minX,Math.min(0,origin+event.clientX-start));track.style.transform=`translateX(${current}px)`});track.addEventListener('pointerup',event=>{track.releasePointerCapture(event.pointerId);const snapped=Math.max(minX,Math.min(0,Math.round(current/(innerWidth*.82))*innerWidth*.82));animate(track,{transform:`translateX(${snapped}px)`},{type:'spring',stiffness:320,damping:28});current=snapped})}
}
