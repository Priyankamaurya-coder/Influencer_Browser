const DATA_URL = "influencers.jsonl";
let creators = [];
let activePlatform = "All";
const grid = document.getElementById("creatorGrid");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("profileModal");
const profileContent = document.getElementById("profileContent");

function safe(value, fallback = "Not provided") {
  return value === undefined || value === null || value === "" ? fallback : value;
}
function number(value) {
  const n = Number(value || 0);
  if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "K";
  return n.toLocaleString();
}
function platformClass(platform) { return platform === "YouTube" ? "youtube" : ""; }
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function imageUrl(url) {
  return url || "https://placehold.co/300x300/ece8ff/7158e8?text=Creator";
}
async function loadCreators() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error("Could not load data file");
    const text = await response.text();
    creators = text.split(/\r?\n/).filter(line => line.trim()).map(line => JSON.parse(line));
    render();
  } catch (error) {
    grid.innerHTML = `<div class="empty-state"><h3>Couldn't load influencer data</h3><p>Run this folder with VS Code Live Server, or use the included start_server.py helper.</p></div>`;
    console.error(error);
  }
}
function render() {
  const term = searchInput.value.trim().toLowerCase();
  const visible = creators.filter(c => {
    const matchesPlatform = activePlatform === "All" || c.platform === activePlatform;
    const matchesTerm = `${c.name} ${c.user_name} ${c.platform}`.toLowerCase().includes(term);
    return matchesPlatform && matchesTerm;
  }).sort((a,b) => Number(b.engagement_rate || 0) - Number(a.engagement_rate || 0));
  grid.innerHTML = visible.map(c => `
    <article class="creator-card" tabindex="0" role="button" aria-label="View ${escapeHtml(c.name)} profile" data-id="${escapeHtml(c.user_id)}">
      <div class="card-top ${platformClass(c.platform)}"></div>
      <div class="card-main">
        <div class="person-row">
          <img class="avatar" src="${escapeHtml(imageUrl(c.profile_picture_thumbnail_url))}" alt="${escapeHtml(c.name)}" loading="lazy" onerror="this.src='https://placehold.co/300x300/ece8ff/7158e8?text=Creator'">
          <div class="person-meta"><h3>${escapeHtml(c.name)}</h3><div class="username">${escapeHtml(c.user_name)}</div></div>
          <span class="platform-pill ${platformClass(c.platform)}">${escapeHtml(c.platform)}</span>
        </div>
        <div class="bio-line"><span>✦</span> ${number(c.no_of_posts)} posts <span class="bullet"></span> Creator profile</div>
        <div class="metric-grid">
          <div class="metric"><span class="metric-label">Followers</span><div class="metric-value">${number(c.followers)}</div></div>
          <div class="metric"><span class="metric-label">Avg. views</span><div class="metric-value">${number(c.avg_views)}</div></div>
          <div class="metric"><span class="metric-label">Engagement</span><div class="metric-value">${safe(c.engagement_rate, 0)}<small>%</small></div></div>
        </div>
        <div class="engagement-row"><span class="engagement-label">Engagement rate</span><span class="engagement-value">${safe(c.engagement_rate, 0)}%</span></div>
        <div class="engagement-track"><span style="width:${Math.min(Number(c.engagement_rate || 0) * 10, 100)}%"></span></div>
      </div>
      <div class="card-footer"><span>View creator insights</span><span class="view-link">View profile ↗</span></div>
    </article>`).join("");
  document.getElementById("creatorCount").textContent = creators.length;
  document.getElementById("allCount").textContent = creators.length;
  document.getElementById("igCount").textContent = creators.filter(c => c.platform === "Instagram").length;
  document.getElementById("ytCount").textContent = creators.filter(c => c.platform === "YouTube").length;
  document.getElementById("resultLabel").textContent = `Showing ${visible.length} of ${creators.length} creators`;
  document.getElementById("emptyState").hidden = visible.length !== 0;
}
function splitCard(title, data) {
  const entries = Object.entries(data || {});
  if (!entries.length) return `<div class="split-card"><h4>${title}</h4><p>Not provided</p></div>`;
  return `<div class="split-card"><h4>${title}</h4>${entries.map(([label, value]) => {
    const pct = Math.max(0, Math.min(100, Number(value) || 0));
    return `<div class="split-line"><div class="split-line-top"><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}%</b></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
  }).join("")}</div>`;
}
function openProfile(id) {
  const c = creators.find(item => String(item.user_id) === String(id));
  if (!c) return;
  const posts = Array.isArray(c.recent_posts) ? c.recent_posts : [];
  const sentiment = c.sentiment_analysis || {};
  const sentimentValue = (key) => Number(sentiment[key] || 0);
  profileContent.innerHTML = `
    <div class="profile-cover ${platformClass(c.platform)}"></div>
    <div class="profile-head">
      <img class="profile-avatar" src="${escapeHtml(imageUrl(c.profile_picture_thumbnail_url))}" alt="${escapeHtml(c.name)}" onerror="this.src='https://placehold.co/300x300/ece8ff/7158e8?text=Creator'">
      <div class="profile-title"><h2 id="modalName">${escapeHtml(c.name)}</h2><p>${escapeHtml(c.user_name)} · ID ${escapeHtml(c.user_id)}</p></div>
      <span class="platform-pill ${platformClass(c.platform)}">${escapeHtml(c.platform)}</span>
    </div>
    <div class="profile-body">
      <div class="profile-summary">
        <div class="summary-box"><span>Followers</span><strong>${number(c.followers)}</strong></div>
        <div class="summary-box"><span>Average views</span><strong>${number(c.avg_views)}</strong></div>
        <div class="summary-box"><span>Engagement rate</span><strong>${safe(c.engagement_rate, 0)}%</strong></div>
        <div class="summary-box"><span>Total posts</span><strong>${number(c.no_of_posts)}</strong></div>
      </div>
      <section class="detail-section"><h3>Audience insights</h3><div class="split-grid">
        ${splitCard("Age distribution", c.audience_age_split)}
        ${splitCard("Top locations", c.audience_location_split)}
        ${splitCard("Gender distribution", c.audience_gender_split)}
      </div></section>
      <section class="detail-section"><h3>Recent posts <span style="color:#999cad;font-weight:500">(${posts.length})</span></h3>
        <div class="posts-grid">${posts.length ? posts.map(post => `<article class="post-card">
          <img src="${escapeHtml(imageUrl(post.thumbnail_url || post.thumbnail || post.profile_picture_thumbnail_url))}" alt="" loading="lazy" onerror="this.src='https://placehold.co/300x200/f0eef8/7158e8?text=Post'">
          <div class="post-info"><h4>${escapeHtml(post.title || post.caption || "Recent post")}</h4>
          <p>▶ ${number(post.views)} views &nbsp; ♥ ${number(post.likes)} &nbsp; ◌ ${number(post.comments)}</p>
          <a href="${escapeHtml(post.url || post.video_url || "#")}" target="_blank" rel="noopener noreferrer">Open post ↗</a></div>
        </article>`).join("") : "<p>No recent posts available.</p>"}</div>
      </section>
      <section class="detail-section"><h3>Sentiment analysis</h3><div class="sentiment-box">
        <div class="sentiment-bars">
          <div><div class="sentiment-label"><span>Positive</span><b>${sentimentValue("positive")}%</b></div><div class="sentiment-bar"><span style="width:${sentimentValue("positive")}%"></span></div></div>
          <div><div class="sentiment-label"><span>Neutral</span><b>${sentimentValue("neutral")}%</b></div><div class="sentiment-bar neutral"><span style="width:${sentimentValue("neutral")}%"></span></div></div>
          <div><div class="sentiment-label"><span>Negative</span><b>${sentimentValue("negative")}%</b></div><div class="sentiment-bar negative"><span style="width:${sentimentValue("negative")}%"></span></div></div>
        </div>
        <p>${escapeHtml(sentiment.summary || "No sentiment summary available.")}</p>
      </div></section>
      <a class="profile-link" href="${escapeHtml(c.channel_link || "#")}" target="_blank" rel="noopener noreferrer">Visit ${escapeHtml(c.platform)} channel ↗</a>
    </div>`;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  document.getElementById("closeModal").focus();
}
function closeProfile() { modal.hidden = true; document.body.style.overflow = ""; }
document.querySelectorAll(".filter").forEach(button => button.addEventListener("click", () => {
  activePlatform = button.dataset.platform;
  document.querySelectorAll(".filter").forEach(b => b.classList.toggle("active", b === button));
  render();
}));
searchInput.addEventListener("input", render);
grid.addEventListener("click", event => {
  const card = event.target.closest(".creator-card");
  if (card) openProfile(card.dataset.id);
});
grid.addEventListener("keydown", event => {
  if ((event.key === "Enter" || event.key === " ") && event.target.classList.contains("creator-card")) {
    event.preventDefault(); openProfile(event.target.dataset.id);
  }
});
document.getElementById("closeModal").addEventListener("click", closeProfile);
modal.addEventListener("click", event => { if (event.target.dataset.close === "true") closeProfile(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.hidden) closeProfile();
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault(); searchInput.focus();
  }
});
loadCreators();
