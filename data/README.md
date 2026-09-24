# Site data

These CSV files are the editable source for roster, recruiting, staff, and schedule information.

| File | Purpose |
| --- | --- |
| `players.csv` | Varsity and freshman rosters, recruiting profiles, measurements, profile links, and player images |
| `staff.csv` | Managers and trainers |
| `schedules.csv` | Varsity, JV, and freshman games and results |
| `badges.csv` | Repeatable recruiting badges tied to a `player_id` |
| `offers.csv` | College offers, interest, and commitments tied to a `player_id` |
| `game-programs.csv` | Weekly program copy, records, facts, broadcast links, and photo-album links tied to a `game_id` |
| `game-leaders.csv` | Repeatable weekly stat leaders tied to a game and player |
| `game-captains.csv` | Repeatable game captains tied to a game and player |
| `lewisville-college-contacts.csv` | Reference snapshot of the 896 programs in Lewisville Recruiting's College Search Tool, including staff, camp, questionnaire, and program X links |
| `lewisville-coach-contacts.csv` | Reference snapshot of individual college coaches in Lewisville Recruiting's Share Portal, including school, role, email, and personal X link |

## Editing rules

- Keep the first header row unchanged.
- Use the existing stable `player_id`, `staff_id`, and `game_id` values when updating a row.
- Use `yes` or `no` in the player and staff flag columns.
- Use `Offer`, `Interest`, or `Committed` in `offers.csv`. A player can have only one `Committed` row.
- Connect every program row to the corresponding `game_id` in `schedules.csv`.
- Set `published` to `yes` when a program is ready to become available. The first upcoming published program is used at `/program/`.
- Put long program copy in `intro_1` and `intro_2`. Spreadsheet applications will quote these cells automatically when exporting CSV.
- Add one row per leader or captain; do not add numbered columns for additional people.
- Leave an unknown value blank. Do not type placeholders such as `TBD` for player measurements.
- Do not add commas to a value unless your spreadsheet application saves the value with CSV quotes.
- Treat the `lewisville-*.csv` files as reference lists. Their records were copied from Lewisville Recruiting on September 23, 2026 and were not independently verified with each college.

## Update workflow

1. Edit the CSV files in GitHub, Excel, Numbers, Google Sheets, or a text editor. Export as standard UTF-8 CSV if using a spreadsheet.
2. Run `npm run data:sync` to validate the files and regenerate the TypeScript data used by the site.
3. Run `npm run build` and publish the updated site. The build automatically runs the sync step again.

The deployed site currently uses committed static pages, so editing a CSV in GitHub alone does not immediately change the public page. After an edit, ask Codex to **sync the CSV data and deploy the site**. The CSV files are also copied to `/data/` in the deployed site for inspection.

The `lewisville-*.csv` files are intentionally not consumed by the site or copied into the deployed `/data/` directory. They are kept in the repository for recruiting research and link checking only.
