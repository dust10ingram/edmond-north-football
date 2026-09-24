import {
  badges,
  collegePrograms,
  offers,
  players,
} from '../generated-site-data';

const activeRecruits = players.filter(
  (player) =>
    player.active === 'yes' &&
    player.team === 'Varsity' &&
    player.recruiting_profile === 'yes',
);

const recruits = activeRecruits.map((player) => ({
  number: player.number,
  name: player.name,
  position: player.position || 'Position pending',
  year: player.class_year || 'Pending',
  image: player.image || 'recruiting-fallback.jpg',
  recognition: badges
    .filter((badge) => badge.player_id === player.player_id)
    .map((badge) => badge.badge),
}));

const playerProfiles: Record<
  string,
  { x?: string; hudl?: string; maxpreps?: string }
> = Object.fromEntries(
  activeRecruits.map((player) => [
    player.name,
    {
      x: player.x_url || undefined,
      hudl: player.hudl_url || undefined,
      maxpreps: player.maxpreps_url || undefined,
    },
  ]),
);

const recruitingStatus: Record<
  string,
  { offers?: string[]; committed?: string }
> = Object.fromEntries(
  activeRecruits.map((player) => {
    const playerOffers = offers.filter(
      (offer) => offer.player_id === player.player_id,
    );
    return [
      player.name,
      {
        offers: playerOffers
          .filter((offer) => offer.status !== 'Committed')
          .map((offer) => offer.school),
        committed: playerOffers.find((offer) => offer.status === 'Committed')
          ?.school,
      },
    ];
  }),
);

const profileLink = (name: string, service: 'x' | 'hudl' | 'maxpreps') => {
  const direct = playerProfiles[name]?.[service];
  if (direct) return direct;
  const query = encodeURIComponent(`"${name}" "Edmond North" football`);
  if (service === 'x') return `https://x.com/search?q=${query}&src=typed_query`;
  const domain =
    service === 'hudl' ? 'hudl.com/profile' : 'maxpreps.com/athlete';
  return `https://www.google.com/search?q=${encodeURIComponent(`site:${domain} "${name}" "Edmond North"`)}`;
};

const measurements: Record<string, { height?: string; weight?: string }> =
  Object.fromEntries(
    activeRecruits.map((player) => [
      player.name,
      {
        height: player.height || undefined,
        weight: player.weight || undefined,
      },
    ]),
  );

const schoolMark = (school: string) =>
  school
    .split(/\s+/)
    .filter(
      (word) =>
        !['of', 'the', 'and', 'university', 'college'].includes(
          word.toLowerCase(),
        ),
    )
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

export default function Recruiting() {
  return (
    <main className="recruiting-page">
      <header className="subpage-header">
        <a href="/">← Back to Edmond North Football</a>
        <img src="/assets/wordmark.png" alt="Edmond North Football" />
      </header>
      <section className="recruiting recruiting-standalone">
        <div className="recruiting-watermark" aria-hidden="true">
          North
        </div>
        <div className="recruiting-intro">
          <div>
            <p className="eyebrow blue">Recruiting center</p>
            <h1>
              Built here.
              <br />
              Ready for next.
            </h1>
            <p>
              Meet the student-athletes representing Edmond North. Open a card
              for profile details, highlight access, and direct recruiting
              contact with the program.
            </p>
            <p className="mock-profile-note">
              Demo profiles · Recognition badges and measurements require staff
              verification.
            </p>
          </div>
          <div
            className="recruiting-view-switch"
            role="tablist"
            aria-label="Recruiting center view"
          >
            <button
              id="recruits-tab"
              type="button"
              role="tab"
              aria-selected="true"
              aria-controls="recruits-panel"
              data-recruiting-tab="recruits"
            >
              Recruits
            </button>
            <button
              id="schools-tab"
              type="button"
              role="tab"
              aria-selected="false"
              aria-controls="schools-panel"
              data-recruiting-tab="schools"
            >
              Schools
            </button>
          </div>
        </div>
        <section
          id="recruits-panel"
          className="recruiting-view-panel"
          data-recruiting-view="recruits"
          role="tabpanel"
          aria-labelledby="recruits-tab"
        >
          <div
            className="class-filter"
            role="group"
            aria-label="Filter players by graduating class"
          >
            <span>Class</span>
            {['All', '2027', '2028', '2029', '2030'].map((year, index) => (
              <button
                type="button"
                data-filter={year}
                aria-pressed={index === 0 ? 'true' : 'false'}
                key={year}
              >
                {year}
              </button>
            ))}
          </div>
          <div className="recruiting-grid">
            {recruits.map((player) => (
              <details
                id={`player-${player.number}-${player.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="player-profile"
                data-class={player.year}
                key={player.number}
              >
                <summary>
                  <div className="player-photo">
                    <img
                      src={`/assets/players/${player.image}`}
                      alt={`${player.name}, Edmond North football ${player.position}`}
                    />
                    <span className="player-number">{player.number}</span>
                    <span className="profile-prompt">
                      View profile <b aria-hidden="true">+</b>
                    </span>
                  </div>
                  <div className="player-info">
                    <div>
                      <p className="player-position">{player.position}</p>
                      <h2>{player.name}</h2>
                      <div className="player-meta">
                        <span>Class of {player.year}</span>
                        <span>
                          <small>HT</small>{' '}
                          {measurements[player.name]?.height || 'TBD'}
                        </span>
                        <span>
                          <small>WT</small>{' '}
                          {measurements[player.name]?.weight || 'TBD'}
                        </span>
                      </div>
                    </div>
                  </div>
                </summary>
                <div className="profile-detail">
                  <div className="profile-measurables">
                    <span>
                      <small>Bench</small>
                      <b>TBD</b>
                    </span>
                    <span>
                      <small>Squat</small>
                      <b>TBD</b>
                    </span>
                    <span>
                      <small>40 Time</small>
                      <b>TBD</b>
                    </span>
                  </div>
                  <div className="profile-about">
                    <h3>Beyond the field</h3>
                    <p>
                      Player-approved biography and interests will appear here
                      after staff verification.
                    </p>
                    <div className="profile-badges">
                      {player.recognition.map((item, index) => (
                        <span
                          className={
                            item === 'Team Captain' ? 'captain-badge' : ''
                          }
                          key={item}
                        >
                          <b aria-hidden="true">
                            {item === 'Team Captain'
                              ? 'C'
                              : index === 0
                                ? '★'
                                : '◆'}
                          </b>{' '}
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="profile-links-row">
                    <span>Player profiles</span>
                    <div className="profile-social-links">
                      <a
                        href={profileLink(player.name, 'x')}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Find ${player.name} on X`}
                        title="X profile"
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.2 2H22l-8.3 9.5L23.5 22h-7.7l-6-7.8L3 22H-.8l8.9-10.2L-1.3 2h7.9l5.4 7.1L18.2 2Zm-1.4 18h2.1L5.4 3.9H3.2L16.8 20Z" />
                        </svg>
                      </a>
                      <a
                        href={profileLink(player.name, 'hudl')}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Find ${player.name} on Hudl`}
                        title="Hudl profile"
                      >
                        <svg
                          className="hudl-icon"
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                        >
                          <path d="M16.0436 30.5C13.8207 30.5019 11.8867 28.9775 11.3675 26.8142C11.3603 26.7856 11.3396 26.7623 11.3122 26.7517C10.6804 26.497 10.0702 26.1914 9.48772 25.8382C9.47071 25.8278 9.45767 25.812 9.45068 25.7933C8.59873 23.5838 8.37969 21.1802 8.81821 18.8528C8.82425 18.8195 8.84868 18.7925 8.88123 18.7831H8.89892C8.92575 18.7804 8.95235 18.79 8.97135 18.8091C10.1461 20.0801 11.5696 21.0957 13.1532 21.7927C13.1645 21.7978 13.1767 21.8004 13.1891 21.8005C13.2078 21.8005 13.226 21.7947 13.2411 21.7839C15.3322 20.2801 18.2367 20.6978 19.8202 22.7301C19.8373 22.7517 19.8633 22.7644 19.8909 22.7644H19.9031C20.341 22.7046 20.7877 22.6205 21.2261 22.5154C23.8416 21.88 26.1909 20.4366 27.9406 18.3897C27.9577 18.3696 27.9828 18.3581 28.0091 18.3582C28.024 18.3582 28.0386 18.3618 28.0517 18.3687C28.0885 18.3886 28.1066 18.4313 28.0954 18.4716C27.0413 22.2018 24.34 25.2444 20.7628 26.7307C20.7352 26.7411 20.7145 26.7645 20.7075 26.7932C20.2007 28.9624 18.2693 30.4974 16.0436 30.5V30.5ZM7.07835 23.9031C7.05425 23.9034 7.03109 23.8938 7.01422 23.8766C4.29721 21.1123 3.01406 17.2436 3.54003 13.4019C3.544 13.3732 3.53368 13.3442 3.51239 13.3245C1.8941 11.8015 1.53096 9.36632 2.63442 7.4368C3.73789 5.50727 6.01978 4.58732 8.15145 5.21258C8.17936 5.22075 8.2095 5.21476 8.23217 5.19654C8.76892 4.76974 9.34014 4.38829 9.93996 4.05611C9.95318 4.04885 9.96801 4.04504 9.98309 4.04504C12.3331 4.40885 14.534 5.42487 16.336 6.97772C16.3619 6.99968 16.373 7.03444 16.3648 7.06736C16.3566 7.10048 16.3305 7.12617 16.2973 7.13376C14.6053 7.5155 13.0102 8.24262 11.6118 9.26964C11.5862 9.28842 11.5723 9.31932 11.5753 9.35098C11.5923 9.51273 11.6007 9.67527 11.6008 9.83791C11.5844 12.2256 9.82663 14.2427 7.46535 14.5833C7.43356 14.5877 7.40656 14.6088 7.39459 14.6386C7.22873 15.052 7.07614 15.4797 6.94898 15.9113C6.1923 18.493 6.26618 21.2474 7.16017 23.7847C7.16904 23.8116 7.1648 23.8411 7.14873 23.8643C7.13265 23.8876 7.10659 23.902 7.07835 23.9031V23.9031ZM22.8128 19.4261C22.7843 19.4261 22.7575 19.4126 22.7406 19.3897C22.7237 19.3668 22.7187 19.3371 22.7271 19.3099C23.2331 17.6768 23.4024 15.9579 23.2247 14.2574C23.2213 14.2261 23.2018 14.1988 23.1733 14.1855C21.4838 13.3966 20.3999 11.7038 20.3896 9.83791C20.3867 9.20966 20.5079 8.58703 20.7462 8.00582C20.7582 7.97624 20.7535 7.94252 20.734 7.91728C20.446 7.54077 20.1384 7.17968 19.8124 6.83551C17.9574 4.88553 15.5363 3.56915 12.8922 3.07284C12.851 3.06507 12.8206 3.02964 12.8193 2.98762C12.8179 2.94547 12.8459 2.90801 12.8867 2.89743C16.6716 1.91872 20.6961 2.77062 23.761 5.1993C23.7767 5.21174 23.7962 5.21855 23.8162 5.21867C23.8252 5.21881 23.8342 5.2175 23.8428 5.2148C24.2776 5.08371 24.7293 5.01697 25.1835 5.0167C27.8322 5.0167 29.9934 7.16862 30 9.81356C29.9995 11.1438 29.4502 12.4149 28.4818 13.3261C28.4606 13.3459 28.4502 13.3748 28.4542 13.4036C28.53 13.9607 28.5684 14.5223 28.5692 15.0846C28.5692 15.1372 28.5659 15.1887 28.562 15.2401L28.5559 15.3386C28.5558 15.3588 28.5488 15.3783 28.536 15.3939C27.0501 17.2417 25.0778 18.637 22.8415 19.4222L22.8128 19.4261Z" />
                        </svg>
                      </a>
                      <a
                        href={profileLink(player.name, 'maxpreps')}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Find ${player.name} on MaxPreps`}
                        title="MaxPreps profile"
                      >
                        <span className="maxpreps-icon" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                  <details className="offers-panel">
                    <summary>
                      <span>Offers</span>
                      <b>
                        {recruitingStatus[player.name]?.committed
                          ? `Committed · ${recruitingStatus[player.name].committed}`
                          : recruitingStatus[player.name]?.offers?.length
                            ? `${recruitingStatus[player.name].offers.length} listed`
                            : 'Updates pending'}
                      </b>
                      <i aria-hidden="true">+</i>
                    </summary>
                    <div>
                      {recruitingStatus[player.name]?.committed && (
                        <p className="commitment">
                          <strong>Committed</strong>
                          {recruitingStatus[player.name].committed}
                        </p>
                      )}
                      {recruitingStatus[player.name]?.offers?.length ? (
                        <ul>
                          {recruitingStatus[player.name].offers.map(
                            (school) => (
                              <li key={school}>{school}</li>
                            ),
                          )}
                        </ul>
                      ) : (
                        <p>No offers listed yet.</p>
                      )}
                    </div>
                  </details>
                  <div className="profile-actions">
                    <a
                      href={`mailto:huskies@edmondnorthfb.com?subject=${encodeURIComponent(`Recruiting inquiry: ${player.name} #${player.number}`)}`}
                    >
                      Contact coaches <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>
        <section
          id="schools-panel"
          className="school-directory recruiting-view-panel"
          data-recruiting-view="schools"
          role="tabpanel"
          aria-labelledby="schools-tab"
          hidden
        >
          <div className="school-directory-heading">
            <p className="eyebrow blue">College directory</p>
            <h2>Find your fit.</h2>
          </div>
          <div className="school-search">
            <label htmlFor="school-search">Search schools</label>
            <div>
              <input
                id="school-search"
                type="search"
                placeholder="School, state, division, conference…"
                autoComplete="off"
              />
              <span aria-hidden="true">⌕</span>
            </div>
            <p className="school-results" aria-live="polite"></p>
          </div>
          <div className="school-grid">
            {collegePrograms.map((program) => (
              <details
                className="school-profile"
                data-search={`${program.school} ${program.city} ${program.state} ${program.division} ${program.conference}`.toLowerCase()}
                key={program.reference_id}
              >
                <summary>
                  <span className="school-mark" aria-hidden="true">
                    {schoolMark(program.school)}
                  </span>
                  <div>
                    <p>
                      {program.division}
                      {program.conference ? ` · ${program.conference}` : ''}
                    </p>
                    <h3>{program.school}</h3>
                    <span>
                      {program.city}
                      {program.city && program.state ? ', ' : ''}
                      {program.state}
                    </span>
                  </div>
                  <b aria-hidden="true">+</b>
                </summary>
                <div className="school-profile-detail">
                  <a
                    href={program.coaching_staff_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Staff page <span aria-hidden="true">↗</span>
                  </a>
                  {program.camp_url && (
                    <a href={program.camp_url} target="_blank" rel="noreferrer">
                      Camp page <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {program.recruiting_questionnaire_url && (
                    <a
                      className="school-questionnaire-link"
                      href={program.recruiting_questionnaire_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Recruiting questionnaire <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {program.program_x_url && (
                    <a
                      className="school-x-link"
                      href={program.program_x_url}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${program.school} on X`}
                      title={`${program.school} on X`}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M18.2 2H22l-8.3 9.5L23.5 22h-7.7l-6-7.8L3 22H-.8l8.9-10.2L-1.3 2h7.9l5.4 7.1L18.2 2Zm-1.4 18h2.1L5.4 3.9H3.2L16.8 20Z" />
                      </svg>
                    </a>
                  )}
                </div>
              </details>
            ))}
          </div>
          <button className="school-load-more" type="button">
            Show more schools
          </button>
        </section>
      </section>
      <script
        dangerouslySetInnerHTML={{
          __html: `(()=>{const viewButtons=[...document.querySelectorAll('[data-recruiting-tab]')];const viewPanels=[...document.querySelectorAll('[data-recruiting-view]')];const classButtons=[...document.querySelectorAll('.class-filter button')];const playerCards=[...document.querySelectorAll('.player-profile')];const search=document.querySelector('#school-search');const schoolCards=[...document.querySelectorAll('.school-profile')];const resultText=document.querySelector('.school-results');const loadMore=document.querySelector('.school-load-more');let schoolLimit=48;const applySchoolFilter=()=>{const query=(search?.value||'').trim().toLowerCase();let matches=0;let shown=0;schoolCards.forEach(card=>{const match=!query||card.dataset.search.includes(query);if(match)matches+=1;const visible=match&&shown<schoolLimit;if(visible)shown+=1;card.hidden=!visible;if(!visible)card.removeAttribute('open')});if(resultText)resultText.textContent=\`Showing \${shown} of \${matches} schools\`;if(loadMore)loadMore.hidden=shown>=matches};const activateView=view=>{viewButtons.forEach(button=>button.setAttribute('aria-selected',String(button.dataset.recruitingTab===view)));viewPanels.forEach(panel=>panel.hidden=panel.dataset.recruitingView!==view);if(view==='schools')applySchoolFilter()};viewButtons.forEach(button=>button.addEventListener('click',()=>activateView(button.dataset.recruitingTab)));classButtons.forEach(button=>button.addEventListener('click',()=>{const value=button.dataset.filter;classButtons.forEach(item=>item.setAttribute('aria-pressed',String(item===button)));playerCards.forEach(card=>{const show=value==='All'||card.dataset.class===value;card.hidden=!show;if(!show)card.removeAttribute('open')})}));search?.addEventListener('input',()=>{schoolLimit=48;applySchoolFilter()});loadMore?.addEventListener('click',()=>{schoolLimit+=48;applySchoolFilter()});applySchoolFilter()})()`,
        }}
      />
    </main>
  );
}
