const $=(selector,context=document)=>context.querySelector(selector);
const $$=(selector,context=document)=>Array.from(context.querySelectorAll(selector));

const sitePreloader=$('#sitePreloader');
const hideSitePreloader=()=>{
  if(!sitePreloader || sitePreloader.classList.contains('is-hidden')) return;
  sitePreloader.classList.add('is-hidden');
  window.setTimeout(()=>sitePreloader.remove(),450);
};
if(document.readyState==='complete') window.requestAnimationFrame(hideSitePreloader);
else window.addEventListener('load',()=>window.setTimeout(hideSitePreloader,180),{once:true});
window.setTimeout(hideSitePreloader,5000);

const mainImage=$('#mainImage');
const heroVideo=$('#heroVideo');
const specifications=$('#specifications');
const featureModeTabs=$$('.mode-choice');
const featureModes={
  tap:{number:'01',title:'Tap',count:'5 tapping modes',action:'Focused, rhythmic tapping.',first:'Power on',firstCopy:'Hold top button · 3 sec',second:'Change mode',secondCopy:'Short-press top button',symbol:'◎'},
  vibrate:{number:'02',title:'Vibrate',count:'8 vibration modes',action:'Find your vibration rhythm.',first:'Power on',firstCopy:'Hold lower button · 3 sec',second:'Change mode',secondCopy:'Short-press lower button',symbol:'≋'},
  combine:{number:'03',title:'Combine',count:'Tap + vibration',action:'Both sensations, together.',first:'Start one function',firstCopy:'Hold its button · 3 sec',second:'Add the other',secondCopy:'Short-press the other button',symbol:'◎≋'}
};
const setFeatureMode=(mode)=>{
  const details=featureModes[mode];
  if(!details) return;
  featureModeTabs.forEach(tab=>{
    const active=tab.dataset.featureMode===mode;
    tab.classList.toggle('is-active',active);
    tab.setAttribute('aria-selected',String(active));
    tab.tabIndex=active?0:-1;
  });
  $$('.mode-showcase-dots button').forEach(dot=>{
    const active=dot.dataset.modeDot===mode;
    dot.classList.toggle('is-active',active);
    dot.setAttribute('aria-pressed',String(active));
  });
  $('#featureModePanel').setAttribute('aria-labelledby',`featureTab${mode[0].toUpperCase()}${mode.slice(1)}`);
  const fields={featureModeNumber:'number',featureModeTitle:'title',featureModeCount:'count',featureModeAction:'action',featureStepOneTitle:'first',featureStepOneCopy:'firstCopy',featureStepTwoTitle:'second',featureStepTwoCopy:'secondCopy',featureStepTwoIcon:'symbol'};
  Object.entries(fields).forEach(([id,key])=>{$('#'+id).textContent=details[key];});
};
featureModeTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>setFeatureMode(tab.dataset.featureMode));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?3:(index+(event.key==='ArrowRight'?1:3))%4;
    featureModeTabs[next].focus();
    setFeatureMode(featureModeTabs[next].dataset.featureMode);
  });
});
$$('.mode-showcase-dots button').forEach(dot=>dot.addEventListener('click',()=>setFeatureMode(dot.dataset.modeDot)));
const featureModeVideo=$('.feature-mode-video');
if(featureModeVideo){
  const playFeatureVideo=()=>{featureModeVideo.muted=true;const attempt=featureModeVideo.play();if(attempt) attempt.catch(()=>{});};
  featureModeVideo.addEventListener('canplay',playFeatureVideo,{once:true});
  window.addEventListener('pageshow',playFeatureVideo);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden) playFeatureVideo();});
}
if(specifications && 'IntersectionObserver' in window){
  new IntersectionObserver((entries,observer)=>{entries.forEach((entry)=>{if(entry.isIntersecting){specifications.classList.add('in-view');observer.disconnect();}})},{threshold:.16}).observe(specifications);
}else if(specifications){specifications.classList.add('in-view');}
const startHeroVideo=(restart=false)=>{
  if(!heroVideo || heroVideo.hidden) return;
  heroVideo.muted=true;
  heroVideo.defaultMuted=true;
  heroVideo.loop=true;
  heroVideo.playsInline=true;
  if(restart && heroVideo.readyState>=1) heroVideo.currentTime=0;
  const playback=heroVideo.play();
  if(playback && typeof playback.catch==='function') playback.catch(()=>{});
};
if(heroVideo){
  if(heroVideo.readyState>=2) startHeroVideo();
  else heroVideo.addEventListener('canplay',()=>startHeroVideo(),{once:true});
  document.addEventListener('visibilitychange',()=>{
    if(!document.hidden && !heroVideo.hidden) startHeroVideo();
  });
  window.addEventListener('pageshow',()=>{
    if(!heroVideo.hidden) startHeroVideo();
  });
}
let heroSelection=0;
$$('.thumb').forEach((button)=>{
  button.addEventListener('click',()=>{
    const selection=++heroSelection;
    $$('.thumb').forEach((item)=>item.classList.remove('active'));
    button.classList.add('active');
    if(heroVideo && button.dataset.media==='video'){
      heroVideo.hidden=false;
      if(mainImage) mainImage.hidden=true;
      heroVideo.setAttribute('aria-label',button.dataset.alt || 'Durex Play Slide & Ride product video');
      const source=heroVideo.querySelector('source');
      if(source.getAttribute('src')!==button.dataset.src){
        heroVideo.pause();
        heroVideo.poster=button.dataset.poster || '';
        source.setAttribute('src',button.dataset.src);
        heroVideo.load();
        startHeroVideo();
      }else startHeroVideo(true);
      return;
    }
    if(mainImage){
      const nextImage=new Image();
      nextImage.decoding='async';
      nextImage.onload=()=>{
        if(selection!==heroSelection) return;
        mainImage.classList.toggle('hero-cutout',button.dataset.src.includes('hero-cutout-'));
        mainImage.style.animation='none';
        void mainImage.offsetWidth;
        mainImage.style.animation='';
        mainImage.src=button.dataset.src; mainImage.classList.toggle('slide-hero-cutout',button.dataset.src.endsWith('product.png'));
        mainImage.alt=button.dataset.alt || 'Durex Play Slide & Ride product image';
        mainImage.hidden=false;
        if(heroVideo){
          heroVideo.hidden=true;
          heroVideo.pause();
        }
        mainImage.style.opacity='0';
        window.requestAnimationFrame(()=>{
          window.requestAnimationFrame(()=>{mainImage.style.opacity='1';});
        });
      };
      nextImage.src=button.dataset.src;
      nextImage.onerror=()=>{
        mainImage.style.opacity='1';
      };
    }
  });
});

const howUseVideo=$('#howUseVideo');
const howModeCards=$$('[data-how-step]',$('#how-to-use'));
const howOptions=$('#howDemoOptions');
const howCaption=$('#howDemoCaption');
const howCopy=['Wash with warm water and mild soap before use.','Use a water-based lubricant on the opening and inside.','A manual sleeve: gently squeeze out excess air and control the movement by hand.','Wash, dry with a lint-free cloth and store in the included pouch.'];
const howReducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let activeHowStep=-1;
const setHowStep=(step)=>{
  if(!howModeCards.length) return;
  const nextStep=Math.max(0,Math.min(howModeCards.length-1,step));
  if(nextStep===activeHowStep) return;
  activeHowStep=nextStep;
  howModeCards.forEach((card,index)=>{
    const active=index===nextStep;
    card.classList.toggle('is-active',active);
    card.setAttribute('aria-pressed',String(active));
  });
  if(howCaption) howCaption.textContent=howCopy[nextStep];
  if(howOptions && howOptions.scrollWidth>howOptions.clientWidth+1){
    const card=howModeCards[nextStep];
    const box=howOptions.getBoundingClientRect();
    const item=card.getBoundingClientRect();
    if(item.left<box.left || item.right>box.right){
      howOptions.scrollTo({left:Math.max(0,Math.min(howOptions.scrollWidth-howOptions.clientWidth,howOptions.scrollLeft+item.left-box.left)),behavior:howReducedMotion.matches?'auto':'smooth'});
    }
  }
};
const syncHowStepToVideo=()=>{
  if(!howUseVideo || !Number.isFinite(howUseVideo.duration) || howUseVideo.duration<=0) return;
  const progress=Math.min(.9999,Math.max(0,howUseVideo.currentTime/howUseVideo.duration));
  setHowStep(Math.floor(progress*howModeCards.length));
};
if(howUseVideo){
  const playHowVideo=()=>{const attempt=howUseVideo.play();if(attempt && typeof attempt.catch==='function') attempt.catch(()=>{});};
  const chooseHowStep=index=>{
    setHowStep(index);playHowVideo();
  };
  howUseVideo.muted=true;howUseVideo.defaultMuted=true;howUseVideo.loop=true;
  howUseVideo.addEventListener('loadedmetadata',()=>{if(activeHowStep<0)setHowStep(0);});
  // Instruction selection stays stable while the demonstration loops.
  howUseVideo.addEventListener('ended',()=>setHowStep(0));
  howModeCards.forEach((card,index)=>{
    card.addEventListener('click',()=>chooseHowStep(index));
    card.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?3:(index+(event.key==='ArrowRight'?1:3))%4;
      howModeCards[next].focus({preventScroll:true});chooseHowStep(next);
    });
  });
  $$('[data-how-direction]').forEach(button=>button.addEventListener('click',()=>chooseHowStep((Math.max(0,activeHowStep)+Number(button.dataset.howDirection)+4)%4)));
  setHowStep(0);
  if('IntersectionObserver' in window){
    new IntersectionObserver(entries=>entries.forEach(entry=>{
      if(entry.isIntersecting){playHowVideo();}
      else howUseVideo.pause();
    }),{threshold:.12}).observe(howUseVideo);
  }else playHowVideo();
}

// Desktop shows all four care steps; mobile scrolls the same cards horizontally.
const careRoutine=$('#product-care.care-routine');
if(careRoutine){
  const cards=$$('[data-routine-step]',careRoutine);
  const dots=$$('[data-routine-dot]',careRoutine);
  const careTrack=$('.care-routine-grid',careRoutine);
  const careMobile=window.matchMedia('(max-width:700px)');
  const selectCareStep=(index,reveal=true)=>{
    [cards,dots].forEach(group=>group.forEach((item,i)=>{
      item.classList.toggle('is-selected',i===index);
      item.setAttribute('aria-pressed',String(i===index));
    }));
    if(reveal && careMobile.matches){
      careTrack.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:'auto'});
    }
  };
  let careScrollFrame=0;
  careTrack.addEventListener('scroll',()=>{
    if(!careMobile.matches || careScrollFrame) return;
    careScrollFrame=requestAnimationFrame(()=>{
      careScrollFrame=0;
      const origin=cards[0].offsetLeft;
      let nearest=0;
      cards.forEach((card,index)=>{
        if(Math.abs(card.offsetLeft-origin-careTrack.scrollLeft)<Math.abs(cards[nearest].offsetLeft-origin-careTrack.scrollLeft)) nearest=index;
      });
      selectCareStep(nearest,false);
    });
  },{passive:true});
  [cards,dots].forEach(group=>group.forEach((item,index)=>{
    item.addEventListener('click',()=>selectCareStep(index));
    item.addEventListener('keydown',event=>{
      if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
      event.preventDefault();
      const next=event.key==='Home'?0:event.key==='End'?3:(index+(event.key==='ArrowRight'?1:3))%4;
      selectCareStep(next);
      group[next].focus();
    });
  }));
}

let qty=1;
const qtyNode=$('#qty');
const minus=$('#minus');
const plus=$('#plus');
const stickyQtyNode=$('#stickyQty');
const stickyMinus=$('#stickyMinus');
const stickyPlus=$('#stickyPlus');
const setQuantity=(nextQuantity)=>{
  qty=Math.min(9,Math.max(1,nextQuantity));
  if(qtyNode) qtyNode.textContent=String(qty);
  if(stickyQtyNode) stickyQtyNode.textContent=String(qty);
};
minus?.addEventListener('click',()=>setQuantity(qty-1));
plus?.addEventListener('click',()=>setQuantity(qty+1));
stickyMinus?.addEventListener('click',()=>setQuantity(qty-1));
stickyPlus?.addEventListener('click',()=>setQuantity(qty+1));

const toast=$('#toast');
const addToCart=$('#addToCart');
const stickyPurchaseBar=$('#stickyPurchaseBar');
const stickyAddToCart=$('#stickyAddToCart');
const pageFooter=$('.footer');
const howToUseSection=$('#how-to-use');
let stickyTicking=false;
const updateStickyPurchase=()=>{
  if(!stickyPurchaseBar) return;
  const mainCtaRect=addToCart?.getBoundingClientRect();
  const mainCtaHasScrolledPast=Boolean(mainCtaRect && mainCtaRect.bottom<=0);
  const howToUseRect=howToUseSection?.getBoundingClientRect();
  const howToUseHasEntered=Boolean(howToUseRect && howToUseRect.top<=window.innerHeight);
  const footerVisible=pageFooter ? pageFooter.getBoundingClientRect().top<window.innerHeight : false;
  const visible=mainCtaHasScrolledPast && howToUseHasEntered && !footerVisible;
  stickyPurchaseBar.classList.toggle('is-visible',visible);
  stickyPurchaseBar.setAttribute('aria-hidden',String(!visible));
  stickyPurchaseBar.inert=!visible;
};
const scheduleStickyPurchase=()=>{
  if(stickyTicking) return;
  stickyTicking=true;
  window.requestAnimationFrame(()=>{updateStickyPurchase();stickyTicking=false;});
};
window.addEventListener('scroll',scheduleStickyPurchase,{passive:true});
window.addEventListener('resize',scheduleStickyPurchase,{passive:true});
stickyAddToCart?.addEventListener('click',()=>addToCart?.click());
updateStickyPurchase();
const productShare=$('#productShare');
if(productShare){
  productShare.addEventListener('click',async()=>{
    const shareData={title:'Durex Play Slide & Ride',text:'Explore Durex Play Slide & Ride',url:window.location.href};
    try{
      if(navigator.share){await navigator.share(shareData);return;}
      await navigator.clipboard.writeText(window.location.href);
      if(toast){toast.textContent='Product link copied';toast.classList.add('show');window.setTimeout(()=>{toast.classList.remove('show');toast.textContent='Added to cart';},1800);}
    }catch(error){
      if(error && error.name!=='AbortError' && toast){toast.textContent='Unable to share';toast.classList.add('show');window.setTimeout(()=>{toast.classList.remove('show');toast.textContent='Added to cart';},1800);}
    }
  });
}
$$('.bundle-content button').forEach(button=>button.addEventListener('click',()=>window.open(button.dataset.productUrl,'_blank','noopener')));

// Add the review hierarchy before cloning so both marquee groups match.
$$('.review-card').forEach((card) => {
  if (card.querySelector('.review-stars') || card.classList.contains('client-review')) return;
  const ratingNode = $('.review-rating', card);
  const ratingText = ratingNode ? ratingNode.textContent : '5/5';
  const rating = Math.max(0, Math.min(5, Number.parseInt(ratingText, 10) || 5));
  const stars = document.createElement('div');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', `${rating} out of 5 stars`);
  for (let index = 0; index < 5; index += 1) {
    const star = document.createElement('span');
    star.textContent = '★';
    if (index < rating) star.classList.add('filled');
    stars.appendChild(star);
  }
  card.insertBefore(stars, card.firstChild);

  const author = $('.review-author', card);
  const footer = document.createElement('div');
  footer.className = 'review-footer';
  if (author) footer.appendChild(author);
  const verified = document.createElement('span');
  verified.className = 'verified-purchase';
  verified.innerHTML = '<span class="verified-icon" aria-hidden="true">✓</span><span>Verified Purchase</span>';
  // Reviews are not marked verified in the source; do not add a verification badge.
  card.appendChild(footer);
});

// Duplicate the complete review group for a seamless right-to-left loop.
const reviewSection = $('#reviews');
const reviewGroup = $('.review-group');
if (reviewSection && reviewGroup) {
  const copy = reviewGroup.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.inert = true;
  $('.review-track').appendChild(copy);
  const pause = $('.review-pause');
  pause.addEventListener('click', () => {
    const paused = reviewSection.classList.toggle('reviews-paused');
    pause.setAttribute('aria-pressed', String(paused));
    pause.textContent = paused ? 'Play' : 'Pause';
  });
}

const initialiseHorizontalRail=({rail,cards,previous,next,fan=false,autoAdvanceMs=0,initialIndex=0})=>{
  if(!rail || !cards.length) return;
  let activeIndex=Math.min(Math.max(initialIndex,0),cards.length-1);
  let ticking=false;
  let autoAdvanceTimer=0;
  const updateCentre=()=>{
    const railRect=rail.getBoundingClientRect();
    const centre=railRect.left+(railRect.width/2);
    let closestDistance=Number.POSITIVE_INFINITY;
    cards.forEach((card,index)=>{
      const rect=card.getBoundingClientRect();
      const distance=(rect.left+(rect.width/2))-centre;
      const absoluteDistance=Math.abs(distance);
      if(absoluteDistance<closestDistance){
        closestDistance=absoluteDistance;
        activeIndex=index;
      }
      const fanActive=typeof fan==='function'?fan():fan;
      if(fanActive){
        const ratio=Math.max(-1.4,Math.min(1.4,distance/(railRect.width/2)));
        card.style.transform=`perspective(900px) rotateY(${ratio*-9}deg) scale(${1-Math.min(.18,Math.abs(ratio)*.14)}) translateY(${Math.abs(ratio)*12}px)`;
        card.style.opacity=String(1-Math.min(.48,Math.abs(ratio)*.38));
        card.style.zIndex=String(100-Math.round(Math.abs(ratio)*40));
      }else{
        card.style.removeProperty('transform');
        card.style.removeProperty('opacity');
        card.style.removeProperty('z-index');
      }
    });
    cards.forEach((card,index)=>{
      const centred=index===activeIndex;
      card.classList.toggle('is-centred',centred);
      card.setAttribute('aria-current',centred?'true':'false');
    });
  };
  const centreCard=(index,behavior='smooth')=>{
    const nextIndex=(index+cards.length)%cards.length;
    activeIndex=nextIndex;
    const cardRect=cards[nextIndex].getBoundingClientRect();
    const railRect=rail.getBoundingClientRect();
    const distance=(cardRect.left+(cardRect.width/2))-(railRect.left+(railRect.width/2));
    rail.scrollBy({left:distance,behavior});
  };
  const stopAutoAdvance=()=>{
    window.clearInterval(autoAdvanceTimer);
    autoAdvanceTimer=0;
  };
  const startAutoAdvance=()=>{
    stopAutoAdvance();
    if(!autoAdvanceMs || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
    autoAdvanceTimer=window.setInterval(()=>centreCard(activeIndex+1),autoAdvanceMs);
  };
  rail.addEventListener('scroll',()=>{
    if(ticking) return;
    ticking=true;
    window.requestAnimationFrame(()=>{updateCentre();ticking=false;});
  },{passive:true});
  previous?.addEventListener('click',()=>centreCard(activeIndex-1));
  next?.addEventListener('click',()=>centreCard(activeIndex+1));
  rail.addEventListener('keydown',(event)=>{
    if(event.key==='ArrowLeft'){event.preventDefault();centreCard(activeIndex-1);}
    if(event.key==='ArrowRight'){event.preventDefault();centreCard(activeIndex+1);}
  });
  if(autoAdvanceMs){
    rail.addEventListener('pointerenter',stopAutoAdvance);
    rail.addEventListener('pointerleave',startAutoAdvance);
    rail.addEventListener('focusin',stopAutoAdvance);
    rail.addEventListener('focusout',()=>window.requestAnimationFrame(()=>{
      if(!rail.contains(document.activeElement)) startAutoAdvance();
    }));
    rail.addEventListener('touchstart',stopAutoAdvance,{passive:true});
    rail.addEventListener('touchend',startAutoAdvance,{passive:true});
    document.addEventListener('visibilitychange',()=>document.hidden?stopAutoAdvance():startAutoAdvance());
    startAutoAdvance();
  }
  window.addEventListener('resize',updateCentre,{passive:true});
  window.requestAnimationFrame(()=>{
    centreCard(activeIndex,'auto');
    updateCentre();
  });
};

const featureCardRail=$('#featureCardRail');
initialiseHorizontalRail({
  rail:featureCardRail,
  cards:featureCardRail?$$('.feature-card',featureCardRail):[],
  previous:$('#featurePrev'),
  next:$('#featureNext'),
  autoAdvanceMs:3200
});

const bundleRail=$('#bundleRail');
const compactRailMedia=window.matchMedia('(max-width:560px)');
initialiseHorizontalRail({
  rail:bundleRail,
  cards:$$('.bundle-card',bundleRail),
  previous:$('#bundlePrev'),
  next:$('#bundleNext'),
  fan:false,
  initialIndex:0
});
