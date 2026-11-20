(() => {
  const rail = document.getElementById('vibeRail');
  if (!rail) return;
  const cards = [...rail.querySelectorAll('.vibe-card')];
  const dots = [...document.querySelectorAll('[data-vibe-index]')];
  const mobile = window.matchMedia('(max-width:700px)');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const mark = (index) => dots.forEach((dot, i) => {
    dot.classList.toggle('is-active', i === index);
    dot.setAttribute('aria-pressed', String(i === index));
  });
  const show = (index) => {
    if (!mobile.matches) return;
    const card = cards[Math.max(0, Math.min(cards.length - 1, index))];
    const left = card.getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft - 18;
    rail.scrollTo({left, behavior: reduced.matches ? 'auto' : 'smooth'});
  };
  dots.forEach((dot, index) => dot.addEventListener('click', () => show(index)));
  let scheduled = false;
  rail.addEventListener('scroll', () => {
    if (scheduled || !mobile.matches) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      const origin = rail.getBoundingClientRect().left + 18;
      const nearest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left - origin) < Math.abs(cards[best].getBoundingClientRect().left - origin) ? index : best, 0);
      mark(nearest);
    });
  }, {passive:true});
  rail.addEventListener('keydown', (event) => {
    if (event.target !== rail || !mobile.matches) return;
    const current = dots.findIndex(dot => dot.classList.contains('is-active'));
    const next = {ArrowRight:current + 1, ArrowLeft:current - 1, Home:0, End:cards.length - 1}[event.key];
    if (next === undefined) return;
    event.preventDefault();
    show(next);
  });
  mobile.addEventListener('change', () => {rail.scrollLeft = 0;mark(0);});
})();
