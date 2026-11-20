(()=>{
 const dialog=document.querySelector('#cartDialog'),contents=document.querySelector('#cartContents'),checkout=document.querySelector('#checkoutLink');
 let cartQty=0;try{cartQty=Math.min(99,Math.max(0,Number(localStorage.getItem('slide-ride-quantity'))||0))}catch{}
 const money=n=>'₹'+n.toLocaleString('en-IN');
 const render=()=>{
  document.querySelectorAll('.cart-count').forEach(e=>e.textContent=cartQty);
  contents.replaceChildren();
  if(cartQty){
   const item=document.createElement('div');item.className='cart-item';
   item.innerHTML='<img src="assets/slide-ride/product.png" alt="Slide & Ride"><div><strong>Durex Play Slide & Ride</strong><p></p><button class="cart-remove" type="button">Remove item</button></div>';
   item.querySelector('p').textContent=`${cartQty} × ₹2,499 · ${money(cartQty*2499)}`;
   item.querySelector('button').addEventListener('click',()=>{cartQty=0;save();render()});contents.append(item);
   checkout.href=`https://www.durexindia.com/cart/40579657990202:${cartQty}`;
  }else{const p=document.createElement('p');p.textContent='Your cart is empty.';contents.append(p)}
  checkout.hidden=!cartQty;
 };
 const save=()=>{try{localStorage.setItem('slide-ride-quantity',String(cartQty))}catch{}};
 const open=()=>{render();if(!dialog.open)dialog.showModal()};
 document.querySelector('#addToCart').addEventListener('click',()=>{cartQty=Math.min(99,cartQty+(Number(document.querySelector('#qty').textContent)||1));save();open()});
 document.querySelector('.nav-actions a[href="#shop"]').addEventListener('click',e=>{e.preventDefault();open()});
 document.querySelector('#closeCart').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 render();
 // Preserve all four manual instructions, including keyboard navigation.
 const video=document.querySelector('#howUseVideo');
 if(matchMedia('(prefers-reduced-motion: reduce)').matches){video.autoplay=false;video.pause()}
})();
