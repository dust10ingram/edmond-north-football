# Site data

These CSV files are the editable source for roster, recruiting, staff, and schedule information.

| File | Purpose |
| --- | --- |
| `players.csv` | Varsity and freshman rosters, recruiting profiles, measurements, profile links, and player images |
| `staff.csv` | Managers and trainers |
| `schedules.csv` | Varsity, JV, and freshman games and results |
| `badges.csv` | Repeatable recruiting badges tied to a `player_id` |
| `offers.csv` | College offers, interest, and commitments tied to a `player_id` |

## Editing rules

- Keep the first header row unchanged.
- Use the existing stable `player_id`, `staff_id`, and `game_id` values when updating a row.
- Use `yes` or `no` in the player and staff flag columns.
- Use `Offer`, `Interest`, or `Committed` in `offers.csv`. A player can have only one `Committed` row.
- Leave an unknown value blank. Do not type placeholders such as `TBD` for player measurements.
- Do not add commas to a value unless your spreadsheet application saves the value with CSV quotes.

## Update workflow

1. Edit the CSV files in GitHub, Excel, Numbers, Google Sheets, or a text editor. Export as standard UTF-8 CSV if using a spreadsheet.
2. Run `npm run data:sync` to validate the files and regenerate the TypeScript data used by the site.
3. Run `npm run build` and publish the updated site. The build automatically runs the sync step again.

The deployed site currently uses committed static pages, so editing a CSV in GitHub alone does not immediately change the public page. After an edit, ask Codex to **sync the CSV data and deploy the site**. The CSV files are also copied to `/data/` in the deployed site for inspection.
