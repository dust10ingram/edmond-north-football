import {animate,hover,inView,stagger} from 'motion';

const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;

const parseDataCsv=(text:string)=>{
  const [headers,...rows]=text.trim().split(/\r?\n/).map(line=>line.split(','));
  return rows.map(row=>Object.fromEntries(headers.map((header,index)=>[header,row[index]||''])));
};

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

void loadProgramCaptains();

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
