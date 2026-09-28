# Robex — Local website

React + TypeScript + Vite + Tailwind CSS. An initial draft for local development.

## Running locally

Node.js 20.19+ or 22 LTS is recommended. Installation and builds were also verified with Node 20.11 in the original development environment.

```sh
npm ci
npm run dev
```

Open the localhost URL shown in the terminal. Press Ctrl+C to stop the server.

```sh
npm run build
npm run preview
```

## Editing content

Edit the files below to update content while keeping the design intact. The development server reflects saved changes automatically; deployed versions require a rebuild.

| Content | File |
| --- | --- |
| Member names, roles, emails, photos, and websites | `src/content/people.json` |
| Alumni | `src/content/alumni.json` |
| Research areas | `src/content/research.json` |
| Lab introduction | `src/content/about.md` |
| News on Home and the News tab | `src/content/news.json` |
| Publications | `src/content/publications.json` |
| Photos | `public/people/` |
| Layout and page structure | `src/main.tsx` |
| Colors, fonts, and responsive styles | `src/styles.css` |

Copy existing JSON entries to add new ones, preserving commas and quotation marks. Member `image` paths use the format `people/name.jpg`; use an empty string if no photo is available. Entries appear in data order.

Example publication (for format reference only, not an actual publication):

```json
[
  {
    "title": "Paper title",
    "authors": "Author list",
    "venue": "Conference or journal",
    "year": 2026,
    "url": "https://example.com/paper"
  }
]
```

Currently, publications.json is empty, and the site links to the actual publication list on Google Scholar. The Home Highlights section lists verified awards from 2025.

## Implementation and future considerations

- Six views: Home, Research, People, Publications, News, and Contact.
- Hash URLs such as `#people` allow page refreshes on static hosting without additional routing configuration.
- Runs without a separate backend, database, login, or tracking tools.
- Includes a mobile menu, keyboard focus styles, a skip-to-content link, and per-view titles.
- Dedicated page URLs and static HTML/metadata for search engines remain to be implemented before public release.
- Uses file-based editing; no browser-based admin editor is included.

## Content and photo sources

Verified on 2026-09-18:

- Twelve members and one alumnus: https://robex.engin.umich.edu/team/
- Team photos: original WordPress uploads from the Team page above, copied for the local prototype.
- Home/research photo: https://alanpapalia.github.io/assets/img/river_pavilion.jpg
- Introduction and awards: https://name.engin.umich.edu/people/alan-papalia/ and https://alanpapalia.github.io/
- Application guidance: https://alanpapalia.github.io/join/
- Publication links: https://alanpapalia.github.io/publications/

The research descriptions and introductory text are editorial drafts based on the official sources above. The GitHub Pages deployment target is `KJYoung/RobexTemp`. The lab should verify photo permissions and final wording before public release.

## Logo and header

The site uses the original user-provided `public/robex-logo.png`. The `.logo-crop` style visually hides the outer whitespace while preserving the original image. Affiliation links are in the footer. Legacy `#join-us` links open Contact.

## Individual profiles and Topics

Member photos and names link to individual profiles such as `#people/alan-papalia`. Since `id` is used in the URL, keep it stable when possible, even if the displayed name changes.

- `src/content/topics.json`: shared tag list. Entries use the format `{ "id": "slam", "label": "SLAM" }`.
- `topics` in `people.json` or `alumni.json`: an array of IDs from the shared list, such as `["slam"]`.
- `fullBio`: a Markdown string.
- `researches`: an array of entries such as `{ "title": "...", "description": "Markdown content", "url": "https://..." }`. The URL is optional.
- Selecting a tag in the right-hand panel on People displays members and alumni with that tag. The PI always remains visible, with Topics hidden in both the list and the individual profile. Filters are preserved when returning to the list from a profile.

Topic 1 / Topic 2 are currently assigned randomly for design review, and profile bios and research entries contain temporary example text. They do not represent actual research interests or experience. Replace them with real content before public release.

Emails are stored in data files as `name (at) umich (dot) edu` and displayed as plain text. The site does not use `mailto:` links.

## GitHub Pages deployment

`.github/workflows/deploy.yml` builds and deploys the site on pushes to `main` or manual runs. Set Settings → Pages → Source to GitHub Actions. The deployment base path is read automatically from the Pages settings. Continue using `npm run dev` for local development.

Planned URL: https://kjyoung.github.io/RobexTemp/

## Google Sheets → live People updates

Source: https://docs.google.com/spreadsheets/d/1Ji6d41RBSASJ6CPgB0OV_-XoevKH5qxCY_Xt_5u2tbA/edit

In the browser, `src/hooks/usePeople.ts` reads the public sheet when the page opens and every 30 seconds. Polling pauses while the browser tab is hidden and resumes when the tab becomes visible or the network reconnects. Google's caching may introduce additional delays, so this is not an instant push mechanism. Sheet edits do not require redeployment or a page refresh.

The first row of the `People` tab contains field names, with one person per row starting in row 2. Entries are matched by `name`, ignoring leading/trailing whitespace and case. The `id` field is the individual profile URL identifier, not the name-matching key.

- The initial view uses the bundled `src/content/people.json`. Only non-empty sheet cells override the displayed data. Blank cells preserve current values, including values loaded earlier in the same page session. Opening the page again starts from JSON.
- Members missing from the sheet are retained. Unknown names are treated as errors to avoid accidental matches caused by typos. Add new members to JSON and deploy first.
- `topics`: use comma-separated values or a JSON array. New tags automatically appear in the filters and profiles.
- `fullBio`: supports multiline text and Markdown.
- `res-1-title`, `res-1-desc`, `res-1-url`: the title, description, and link for the first research entry. Increase the number to add more entries. Blank cells preserve the corresponding existing fields.
- You can also provide the entire `researches` field as a JSON array.
- Email @ and . characters are converted to (at) and (dot) for display. Non-empty numeric test values are also applied.

The sheet must be readable in visitors' browsers without signing in. If reading or validation fails, the last successfully loaded data is retained; if the first request fails, the site displays JSON data. The next polling cycle retries the request. Invalid sheets, such as those with duplicate names, are rejected as a whole rather than partially applied.

`npm run dev` and `npm run build` run without downloading the sheet. Both localhost and GitHub Pages update through the browser in the same way. The browser does not modify JSON files in the repository.

Run `npm run sync:people` only when you want to save the latest values to JSON itself. This command overwrites people.json and registers new topics in topics.json. Commit and deploy the changed files to make them the default data for future visits. Run the merge-rule tests with `npm run test:sync`.

## Live Alumni / News updates

Like People, Alumni and News refresh independently in the browser every 30 seconds. A failure in one sheet does not block updates from the others.

- Alumni: `name,destination,url,image,note,id,topics`. Entries are matched by name, and blank cells preserve current values. New entries can be added with a unique id and name. fullBio/researches have been removed from alumni.json and are not shown in alumni profiles.
- News: `id,date,type,title,text,url (optional)`. The last field is stored as `url` in JSON and may be omitted. The id is a unique string key; blank cells for an existing id preserve current values. Draft rows without a title are hidden. After a successful read, the sheet's entries are sorted by descending ID, and news removed from the sheet also disappears from the view. Entries without links appear as non-clickable cards. The type is displayed above each news item.
- Local JSON provides the initial data and fallback when the connection fails. If an existing default entry has a url, a blank sheet url preserves that link.
- The manual `npm run sync:people` file-saving command applies only to People. Alumni/News updates affect the displayed data only.

People links use `linkedin` and `homepage`. Non-empty links are displayed as LinkedIn and globe icons, respectively, in both the list and individual profiles. The legacy `url` sheet column is mapped to one of these fields based on the address, with explicitly provided new columns taking precedence. Alumni retains its url format. Latest news on Home shows the first three entries in descending ID order, displaying their dates and titles only.

News dates are displayed as CSV text without date parsing or reformatting (for example, Spring 2026). Sorting uses descending IDs regardless of date, with numeric ID 10 appearing before 9.

News uses CSV export (gid=874971636) instead of a gviz query to prevent missing values when numeric years and season text are mixed. If the News tab is deleted and recreated, update its gid in useSheet.ts as well.

Literal `\n` sequences in sheet display text are rendered as line breaks. Actual line breaks within cells are also preserved. This applies to News bodies/titles/dates, People bios/research/roles/notes, and Alumni destinations/notes. URLs and IDs are not converted.

The optional News field `tldr` appears as a short description below the title on Home. The description is omitted when empty. The News tab continues to display title and text. The tldr field also supports literal `\n` line breaks and preserves existing values when cells are blank.

People/Alumni/News all use raw CSV export to avoid automatic header and type inference. Unregistered People rows containing only a name and otherwise blank cells are ignored; unknown names with actual update values still produce an error. Update SHEET_IDS in useSheet.ts if a sheet tab is recreated.
