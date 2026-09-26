(() => {
  const viewButtons = [...document.querySelectorAll('[data-recruiting-tab]')];
  const viewPanels = [...document.querySelectorAll('[data-recruiting-view]')];
  const classButtons = [...document.querySelectorAll('.class-filter button')];
  const playerCards = [...document.querySelectorAll('.player-profile')];
  const search = document.querySelector('#school-search');
  let schoolCards = [...document.querySelectorAll('.school-profile')];
  const resultText = document.querySelector('.school-results');
  const loadMore = document.querySelector('.school-load-more');
  const staffPanels = [...document.querySelectorAll('.school-staff-panel')];
  let schoolLimit = 48;
  let coachDirectoryPromise;

  const applySchoolFilter = () => {
    const query = (search?.value || '').trim().toLowerCase();
    let matches = 0;
    let shown = 0;
    schoolCards.forEach((card) => {
      const match = !query || card.dataset.search.includes(query);
      if (match) matches += 1;
      const visible = match && shown < schoolLimit;
      if (visible) shown += 1;
      card.hidden = !visible;
      if (!visible) card.removeAttribute('open');
    });
    if (resultText)
      resultText.textContent = `Showing ${shown} of ${matches} schools`;
    if (loadMore) loadMore.hidden = shown >= matches;
  };

  const activateView = (view) => {
    viewButtons.forEach((button) =>
      button.setAttribute(
        'aria-selected',
        String(button.dataset.recruitingTab === view),
      ),
    );
    viewPanels.forEach((panel) => {
      panel.hidden = panel.dataset.recruitingView !== view;
    });
    if (view === 'schools') applySchoolFilter();
  };

  const getCoachDirectory = () => {
    coachDirectoryPromise ??= fetch('/data/college-coach-x.json').then(
      (response) => {
        if (!response.ok)
          throw new Error('Coach directory could not be loaded.');
        return response.json();
      },
    );
    return coachDirectoryPromise;
  };

  const sortSchoolsByDistance = async () => {
    const grid = document.querySelector('.school-grid');
    if (!grid) return;
    try {
      const text = await fetch('/data/lewisville-college-contacts.csv').then(
        (response) => response.text(),
      );
      const [header, ...rows] = text.trim().split(/\r?\n/);
      const columns = header.split(',');
      const schoolIndex = columns.indexOf('school');
      const distanceIndex = columns.indexOf('distance_miles');
      if (schoolIndex < 0 || distanceIndex < 0) return;
      const distances = new Map(
        rows.map((row) => {
          const cells = row.split(',');
          return [cells[schoolIndex], Number(cells[distanceIndex]) || Infinity];
        }),
      );
      schoolCards.sort((first, second) => {
        const firstName = first.querySelector('h3')?.textContent?.trim() || '';
        const secondName = second.querySelector('h3')?.textContent?.trim() || '';
        return (
          (distances.get(firstName) || Infinity) -
            (distances.get(secondName) || Infinity) ||
          firstName.localeCompare(secondName)
        );
      });
      grid.append(...schoolCards);
      applySchoolFilter();
    } catch {
      // Alphabetical order remains available if the data file cannot load.
    }
  };

  const coachLink = ([name, position, url]) => {
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.setAttribute('aria-label', `${name} on X`);

    const identity = document.createElement('span');
    const coachName = document.createElement('strong');
    const coachPosition = document.createElement('small');
    coachName.textContent = name;
    coachPosition.textContent = position || 'Football staff';
    identity.append(coachName, coachPosition);

    const icon = document.createElement('span');
    icon.className = 'coach-x-icon';
    icon.textContent = 'X';
    icon.setAttribute('aria-hidden', 'true');
    link.append(identity, icon);
    return link;
  };

  const loadStaff = async (panel) => {
    if (panel.dataset.loaded) return;
    panel.dataset.loaded = 'loading';
    const list = panel.querySelector('.school-staff-list');
    const count = panel.querySelector('summary b');
    if (list) list.innerHTML = '<p>Loading staff profiles…</p>';
    try {
      const directory = await getCoachDirectory();
      const coaches = directory[panel.dataset.schoolKey] || [];
      list?.replaceChildren();
      if (count)
        count.textContent = coaches.length
          ? `${coaches.length} profile${coaches.length === 1 ? '' : 's'}`
          : 'No profiles';
      if (!coaches.length) {
        const empty = document.createElement('p');
        empty.textContent = 'No staff X profiles are listed for this school.';
        list?.append(empty);
      } else coaches.forEach((coach) => list?.append(coachLink(coach)));
      panel.dataset.loaded = 'true';
    } catch {
      if (list) list.innerHTML = '<p>Staff profiles could not be loaded.</p>';
      delete panel.dataset.loaded;
    }
  };

  viewButtons.forEach((button) =>
    button.addEventListener('click', () =>
      activateView(button.dataset.recruitingTab),
    ),
  );
  classButtons.forEach((button) =>
    button.addEventListener('click', () => {
      const value = button.dataset.filter;
      classButtons.forEach((item) =>
        item.setAttribute('aria-pressed', String(item === button)),
      );
      playerCards.forEach((card) => {
        const show = value === 'All' || card.dataset.class === value;
        card.hidden = !show;
        if (!show) card.removeAttribute('open');
      });
    }),
  );
  search?.addEventListener('input', () => {
    schoolLimit = 48;
    applySchoolFilter();
  });
  loadMore?.addEventListener('click', () => {
    schoolLimit += 48;
    applySchoolFilter();
  });
  staffPanels.forEach((panel) =>
    panel.addEventListener('toggle', () => {
      if (panel.open) loadStaff(panel);
    }),
  );
  applySchoolFilter();
  void sortSchoolsByDistance();
})();
