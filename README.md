# CreatorScope — Influencer Browser

A responsive, front-end influencer directory demo featuring 10 sample profiles (5 Instagram and 5 YouTube).

## Features
- Responsive influencer cards with profile photo, platform, username, followers, average views, and engagement rate.
- Search by creator name, username, or platform.
- Platform filters for All, Instagram, and YouTube.
- Click any card to view profile details, user ID, channel link, post count, audience age/location/gender splits, recent posts, and sentiment analysis.
- Recent-post thumbnails and links with sample metrics.
- Keyboard support: Enter/Space opens a focused card, Esc closes a profile, Ctrl/Cmd+K focuses search.

## Run locally
The browser fetches `influencers.jsonl`, so run a local server rather than opening `index.html` directly.

**Option A — Python**
1. Install Python 3 if needed.
2. Open a terminal in this folder.
3. Run `python start_server.py`
4. Visit `http://127.0.0.1:8000`

**Option B — VS Code Live Server**
Open this folder in VS Code, install/enable Live Server, then right-click `index.html` and select **Open with Live Server**.

## Data format
`influencers.jsonl` contains one complete JSON object per line (JSON Lines / JSONL), not a JSON array. The included objects are illustrative demo data. Profile details, sentiment scores, URLs, and metrics are sample values, not verified analytics for real creators. Replace them with the supplied influencer objects before using this for a real task.

## Files
- `index.html` — page structure
- `style.css` — responsive styling
- `script.js` — JSONL loading, search/filter, cards, profile modal
- `influencers.jsonl` — 10 demo records
- `start_server.py` — simple local server
