(() => {
  const section = document.querySelector('#product-story');
  if (!section) return;
  const rail = section.querySelector('.story-rail');
  const cards = [...rail.querySelectorAll('.story-card')];
  const buttons = [...section.querySelectorAll('[data-story-direction]')];
  const counter = section.querySelector('#storyCurrent');
  const progress = section.querySelector('#storyProgress');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const maxScroll = () => Math.max(0, rail.scrollWidth - rail.clientWidth);
  const update = () => {
    const max = maxScroll();
    const x = Math.max(0, Math.min(max, rail.scrollLeft));
    const ratio = max > 1 ? x / max : 0;
    const current = Math.min(cards.length, 1 + Math.round(ratio * (cards.length - 1)));
    counter.textContent = String(current).padStart(2, '0');
    progress.style.width = `${100/cards.length + ratio * (100-100/cards.length)}%`;
    buttons.forEach(button => {
      button.disabled = Number(button.dataset.storyDirection) < 0 ? x <= 1 : max <= 1 || x >= max - 1;
    });
  };
  const go = target => rail.scrollTo({left:Math.max(0,Math.min(maxScroll(),target)),behavior:reducedMotion.matches?'auto':'smooth'});
  const step = direction => go(rail.scrollLeft + direction * (cards[1].offsetLeft - cards[0].offsetLeft));
  buttons.forEach(button => button.addEventListener('click', () => step(Number(button.dataset.storyDirection))));
  rail.addEventListener('keydown', event => {
    if (event.target !== rail || !['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') go(0);
    else if (event.key === 'End') go(maxScroll());
    else step(event.key === 'ArrowRight' ? 1 : -1);
  });
  let frame = 0;
  const schedule = () => {if (!frame) frame = requestAnimationFrame(() => {frame=0;update();});};
  rail.addEventListener('scroll',schedule,{passive:true});
  if ('ResizeObserver' in window) new ResizeObserver(schedule).observe(rail);
  else window.addEventListener('resize',schedule,{passive:true});
  update();
})();
