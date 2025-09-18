console.log('DS Custom theme loaded');
// Smooth-scroll for header links
document.querySelectorAll('.am-nav a[href^="#"], .am-btn--primary[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    e.preventDefault();
    const el = document.querySelector(a.getAttribute('href'));
    el && el.scrollIntoView({behavior:'smooth', block:'start'});
  });
});

// Filter chip UI state (your projects JS should already read data-filter and hide/show)
document.querySelectorAll('.am-chip').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.am-chip').forEach(b=>b.classList.remove('am-chip--active'));
    btn.classList.add('am-chip--active');
  });
});
