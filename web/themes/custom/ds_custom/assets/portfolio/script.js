// ---------- Utilities ----------
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// helper for raw Views JSON (array of { value } or { url/uri })
function firstVal(a, key = 'value') {
  return Array.isArray(a) && a.length ? (a[0][key] ?? '') : '';
}

function stripHtml(s='') {
  const d = document.createElement('div');
  d.innerHTML = s;
  return d.textContent || d.innerText || '';
}
function absUrl(u='') {
  if (!u) return '';
  return u.startsWith('http') ? u : `${window.location.origin}${u}`;
}
function extractImgSrc(html='') {
  const m = html.match(/src="([^"]+)"/i);
  return m ? m[1] : '';
}

async function fetchProjects(){
  const res = await fetch('/api/projects');
  const rows = await res.json();
  return rows.map(r => {
    const rawTitle = r.title || r.title_1 || '';
    const rawImg   = r.field_image || '';
    const imgSrc   = extractImgSrc(rawImg) || rawImg; // handle <img ...> or bare path

    return {
      title: stripHtml(rawTitle),
      desc: r.field_summary || '',
      meta: r.field_meta || '',
      tags: stripHtml(r.field_tags || '')
              .split(',')
              .map(s => s.trim().toLowerCase())
              .filter(Boolean),
      img: absUrl(imgSrc),
      link: r.field_link || '#'
    };
  });
}

async function fetchSkills(){
  const res = await fetch('/api/skills');
  const rows = await res.json();
  return rows.map(r => r.name || r.title || r.field_name).filter(Boolean);
}

function parseUrlFromLines(s=''){
  // fields like "Linkedin\nhttps://...\n" -> extract last http(s) URL
  const lines = String(s).split(/\n+/).map(t=>t.trim()).filter(Boolean);
  const url = lines.reverse().find(l=>/^https?:\/\//i.test(l)) || '';
  return url;
}

async function fetchProfile(){
  const res = await fetch('/api/profile');
  const rows = await res.json();
  return rows && rows[0] ? rows[0] : null;
}

function fmtMonthYear(ym=''){
  if (!ym) return '';
  const m = String(ym).match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!m) return ym;
  const year = m[1];
  const month = m[2] ? Math.max(1, Math.min(12, parseInt(m[2],10))) : null;
  if (!month) return year;
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${names[month-1]} ${year}`;
}

function splitSentences(text=''){
  if (!text) return [];
  const normalized = String(text).replace(/\r/g,' ').replace(/\s+\n/g,' ').replace(/\n+/g,' ').trim();
  if (!normalized) return [];
  const parts = normalized.split(/(?<=[.!?])\s+(?=[A-Z(0-9])/);
  return parts.map(s=>s.trim()).filter(Boolean).map(s=>/^[•\-]/.test(s)?s.replace(/^\s*[•\-]\s*/,''):s);
}

async function fetchExperience(){
  const res = await fetch('/api/experience');
  const rows = await res.json();
  const items = rows.map(r => ({
    title: r.title || '',
    company: r.field_company || '',
    location: r.field_location || '',
    start: r.field_start || '',
    end: r.field_end || '',
    bullets: splitSentences(r.field_bullets || '')
  }));
  items.sort((a,b)=>String(b.start).localeCompare(String(a.start)));
  return items;
}


function setupFilters(all){
  // Filters removed from UI; render all projects by default.
  // Keeping function as a no-op for compatibility.
}

// ---------- Renderers ----------
function renderProjects(list){
  const grid = document.getElementById('projectGrid') || document.getElementById('projects-grid');
  if (!grid) return;
  grid.innerHTML = '';
  list.forEach(p => {
    const href = p.link && p.link !== '#' ? p.link : null;
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `
      ${p.img ? `<img class="card__media" src="${p.img}" alt="${p.title} image" loading="lazy">` : ''}
      <div class="card__body">
        <h4 class="card__title">${href ? `<a href="${p.link}" target="_blank" rel="noopener">${p.title}</a>` : p.title}</h4>
        <p class="card__meta">${p.meta || ''}</p>
        <p class="card__desc">${p.desc || ''}</p>
        <div class="card__tags">${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>`;
    grid.appendChild(el);
  });
}

function renderSkills(names=[]){
  const list = document.getElementById('am-skills');
  const chips = document.getElementById('skills-chips');
  if (list) {
    list.innerHTML = names.map(n => `<li><span class=\"am-tag\">${n}</span></li>`).join('');
    return;
  }
  if (chips) {
    chips.innerHTML = names.map(n => `<button class=\"chip\" type=\"button\" disabled>${n}</button>`).join(' ');
  }
}

function yearPart(ym=''){
  const m = String(ym).match(/^(\d{4})/);
  return m ? m[1] : '';
}

function renderExperience(items=[]){
  const ol = document.getElementById('am-experience');
  const div = document.getElementById('experience-list');
  const htmlItems = items.map(i => {
    const start = fmtMonthYear(i.start);
    const end = fmtMonthYear(i.end) || 'Present';
    const meta = [start && end ? `${start} — ${end}` : start || end, i.location].filter(Boolean).join(' · ');
    const bullets = Array.isArray(i.bullets) && i.bullets.length
      ? `<ul class=\"am-desc\">${i.bullets.map(b=>`<li>${/\.$/.test(b)?b:b+'.'}</li>`).join('')}</ul>`
      : '';
    return `
      <li class=\"am-tl__item\">
        <div class=\"am-tl__dot\" aria-hidden=\"true\"></div>
        <div class=\"am-tl__body\">
          <h3 class=\"am-h3\">${i.title}${i.company ? ` — ${i.company}` : ''}</h3>
          <div class=\"am-meta-row\">${meta}</div>
          ${bullets}
        </div>
      </li>`;
  }).join('');
  if (ol) {
    ol.innerHTML = htmlItems;
  } else if (div) {
    // fallback simple markup if no timeline list exists
    div.innerHTML = `<ul class=\"am-timeline\">${htmlItems}</ul>`;
  }
}

function renderContact(profile){
  if (!profile) return;
  const email = profile.field_email || '';
  const linkedin = parseUrlFromLines(profile.field_linkedin || '');
  const github = parseUrlFromLines(profile.field_github || '');
  const p = document.getElementById('am-contact');
  if (p) {
    const parts = [];
    if (email) parts.push(`Email: <a class=\"am-link\" href=\"mailto:${email}\">${email}</a>`);
    if (linkedin) parts.push(`LinkedIn: <a class=\"am-link\" href=\"${linkedin}\" target=\"_blank\" rel=\"noopener\">${linkedin}</a>`);
    if (github) parts.push(`GitHub: <a class=\"am-link\" href=\"${github}\" target=\"_blank\" rel=\"noopener\">${github}</a>`);
    p.innerHTML = parts.join(' · ');
    return;
  }
  // Fallback to the older anchors if present
  const aEmail = document.getElementById('contact-email');
  const aLinked = document.getElementById('contact-linkedin');
  const aGit = document.getElementById('contact-github');
  if (aEmail && email) { aEmail.href = `mailto:${email}`; aEmail.textContent = email; }
  if (aLinked && linkedin) { aLinked.href = linkedin; }
  if (aGit && github) { aGit.href = github; }
}

async function loadPortfolioData(){
  try {
    // Placeholders so sections aren't empty
    const skillsEl = document.getElementById('am-skills');
    const expEl = document.getElementById('am-experience');
    const contactEl = document.getElementById('am-contact');
    if (skillsEl) skillsEl.innerHTML = '<li class="am-tag">Loading…</li>';
    if (expEl) expEl.innerHTML = '<li class="am-tl__item"><div class="am-tl__body">Loading…</div></li>';
    if (contactEl) contactEl.textContent = 'Loading…';

    // Projects
    const projects = await fetchProjects();
    renderProjects(projects);
    setupFilters(projects);

    // Skills
    const skills = await fetchSkills();
    // Ensure a container exists even if template variant differs
    if (!document.getElementById('am-skills') && !document.getElementById('skills-chips')) {
      const skillsSection = document.getElementById('skills');
      if (skillsSection) {
        const wrap = skillsSection.querySelector('.am-wrap') || skillsSection;
        const ul = document.createElement('ul');
        ul.id = 'am-skills';
        ul.className = 'am-tags';
        ul.setAttribute('role','list');
        wrap.appendChild(ul);
      }
    }
    renderSkills(skills);

    // Experience
    const exp = await fetchExperience();
    renderExperience(exp);

    // Profile / Contact
    const profile = await fetchProfile();
    renderContact(profile);
  } catch (e) {
    console.error('Data load failed', e);
  }
}

// Ensure DOM is ready before querying containers
window.addEventListener('DOMContentLoaded', () => {
  loadPortfolioData();

  // Add compact background to nav only after user scrolls
  const nav = document.querySelector('.pf-nav');
  if (nav) {
    const onScroll = () => {
      if (window.scrollY > 8) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
});

// Theme toggle with persistence
(function(){
  const btn = document.getElementById('pfTheme');
  const key = 'pf-theme';
  const set = m => { document.documentElement.classList.toggle('pf-light', m==='light'); localStorage.setItem(key, m); btn && (btn.textContent = m==='light' ? 'Dark mode' : 'Light mode'); };
  set(localStorage.getItem(key) || 'dark');
  btn && btn.addEventListener('click', () => set(document.documentElement.classList.contains('pf-light') ? 'dark' : 'light'));
})();

// Slightly tweak existing render() output if you haven't already:
// obsolete render(list) replaced by renderProjects()

// Optional status helper so the page doesn't feel blank while loading
function showStatus(msg){ document.getElementById('projectGrid').innerHTML = `<p class="pf-status" role="status">${msg}</p>`; }

// keep status only if legacy grid exists
(async () => {
  const legacyGrid = document.getElementById('projectGrid');
  if (!legacyGrid) return; // new grid handled above
  try {
    showStatus('Loading projects…');
    const projects = await fetchProjects();
    if (!projects.length) return showStatus('No projects yet.');
    renderProjects(projects);
    setupFilters(projects);
  } catch (e) {
    console.error(e);
    showStatus('Could not load projects.');
  }
})();
