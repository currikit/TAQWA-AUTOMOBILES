/* Taqwa Automobiles website: interactions.
   Needs js/i18n.js loaded first. No libraries. */
(function(){
  var WA = '917021925347';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function(id){ return document.getElementById(id); };
  var inr = function(n){ return Math.round(n).toLocaleString('en-IN'); };
  var lakh = function(n){ return '₹' + (n/100000).toFixed(2).replace(/\.?0+$/,'') + ' L'; };
  function waLink(text){ return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(text); }
  function emi(P, annual, n){ var r = annual/1200; if(P<=0) return 0; if(r===0) return P/n; var f = Math.pow(1+r,n); return P*r*f/(f-1); }
  function thump(el){ if(!el) return; el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }

  var M = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  var d = new Date(), today = String(d.getDate()).padStart(2,'0') + ' ' + M[d.getMonth()] + ' ' + d.getFullYear();
  $('today').textContent = today; $('today2').textContent = today;

  /* ---------- Translations (have a native speaker review Hindi and Marathi) ---------- */
  var T = window.TAQWA_T;
  document.querySelectorAll('[data-i18n]').forEach(function(el){ T.en[el.dataset.i18n] = el.innerHTML; });
  Object.assign(T.en, {rc_head:'Registration particulars',sample_img:'Sample image',f_maker:'Maker',f_fuel:'Fuel',f_seats:'Seating',f_class:'Class',f_use:'Best for',onroad:'On-road price',emifrom:'EMI from',ask:'Ask on WhatsApp',usecalc:'Work out EMI',affix:'Affix real photograph of vehicle',r_home_big:'Left every month after EMI',earn_note:'Sample figures. Real earnings depend on the app, hours and area.',ready:'papers ready',affix_d:'Affix delivery photograph',copy:'Copy',copied:'Copied',svc_do:'What we do',months:'months',j_err_name:'Please write your name.',j_err_phone:'Please write a 10-digit mobile number.'});
  var lang = 'en';
  try { var s = localStorage.getItem('taqwa-lang'); if (s && T[s]) lang = s; } catch(e){}
  function t(k){ return (T[lang] && T[lang][k]) || T.en[k] || k; }
  function applyLang(){
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(function(el){ el.innerHTML = t(el.dataset.i18n); });
    document.querySelectorAll('.lang button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.lang===lang); });
    renderCars(); renderSvcTabs(); renderSvc(); renderList(); renderDeliv(); update(); fillWa();
  }
  document.querySelectorAll('.lang button').forEach(function(b){ b.addEventListener('click', function(){ lang = b.dataset.lang; try{ localStorage.setItem('taqwa-lang', lang);}catch(e){} applyLang(); }); });

  /* ---------- Cars (sample prices) ---------- */
  var CARS = [
    {id:'wagonr',name:'WagonR Tour',maker:'Maruti Suzuki',type:'hatch',price:620000,seats:5,use:'City rides',reg:'MH 46 · T'},
    {id:'dzire',name:'Dzire Tour S',maker:'Maruti Suzuki',type:'sedan',price:732000,seats:5,use:'City, airport, Prime',reg:'MH 46 · T'},
    {id:'aura',name:'Aura',maker:'Hyundai',type:'sedan',price:830000,seats:5,use:'City, airport',reg:'MH 46 · T'},
    {id:'ertiga',name:'Ertiga Tour',maker:'Maruti Suzuki',type:'mpv',price:1120000,seats:7,use:'Outstation, XL',reg:'MH 46 · T'}
  ];
  function renderCars(){
    $('carList').innerHTML = CARS.map(function(c,i){
      var m = emi(c.price*0.9,10,60), msg = 'Hi Taqwa Automobiles, I want the on-road price and EMI for the ' + c.maker + ' ' + c.name + '.';
      return '<article class="sheet rc"><div class="rc-head"><span>'+t('rc_head')+'</span><span>Entry '+(i+1)+' / '+CARS.length+'</span></div>'+
        '<div class="rc-body"><div class="photo tape ph"><img src="images/cars/'+c.id+'.svg" alt="Sample illustration of the '+c.maker+' '+c.name+'" width="640" height="400" loading="lazy"><span class="sample-tag">'+t('sample_img')+'</span></div>'+
        '<div><span class="maker">'+c.maker+'</span><h3>'+c.name+'</h3><dl class="fields">'+
        '<dt>'+t('f_fuel')+'</dt><dd>CNG / Petrol</dd><dt>'+t('f_seats')+'</dt><dd>'+c.seats+'</dd><dt>'+t('f_class')+'</dt><dd>T-Permit / Private</dd><dt>'+t('f_use')+'</dt><dd>'+c.use+'</dd><dt>'+t('onroad')+'</dt><dd class="ph">'+lakh(c.price)+'</dd></dl></div></div>'+
        '<div class="rc-foot"><div class="emi"><span class="label">'+t('emifrom')+'</span><b>₹'+inr(m)+'/mo</b></div><div class="actions">'+
        '<a class="btn small" href="'+waLink(msg)+'" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-wa"/></svg>'+t('ask')+'</a>'+
        '<button class="btn small ghost" type="button" data-use="'+c.id+'">'+t('usecalc')+'</button></div></div></article>';
    }).join('');
    $('carList').querySelectorAll('[data-use]').forEach(function(b){ b.addEventListener('click', function(){ pickCar(b.dataset.use); $('emi').scrollIntoView({behavior: reduce?'auto':'smooth'}); }); });
    $('carChips').innerHTML = CARS.map(function(c){ return '<button type="button" data-car="'+c.id+'" aria-pressed="'+(c.id===state.car)+'">'+c.name+'</button>'; }).join('') + '<button type="button" data-car="other" aria-pressed="'+(state.car==='other')+'">Other</button>';
    $('carChips').querySelectorAll('button').forEach(function(b){ b.addEventListener('click', function(){ pickCar(b.dataset.car); }); });
  }

  /* ---------- Worksheet ---------- */
  var state = {car:'dzire', months:60, mode:'emi', stamp:''};
  function pickCar(id){ state.car = id; var c = CARS.filter(function(x){return x.id===id;})[0]; if(c) $('price').value = c.price;
    document.querySelectorAll('#carChips button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.car===id); }); update(); }
  var shownBig = 0, liveT;
  function rollBig(to){ var el = $('bigVal'), from = shownBig; shownBig = to; var neg = to < 0;
    if (reduce){ el.textContent = (neg?'-':'') + '₹' + inr(Math.abs(to)); return; }
    var st = null; function step(ts){ if(!st) st = ts; var p = Math.min(1,(ts-st)/450), e = 1-Math.pow(1-p,3), v = from + (to-from)*e;
      el.textContent = (v<0?'-':'') + '₹' + inr(Math.abs(v)); if(p<1 && shownBig===to) requestAnimationFrame(step); } requestAnimationFrame(step); }
  function setStamp(txt, cls){ var s = $('slipStamp'); if (state.stamp === txt) return; state.stamp = txt; s.textContent = txt; s.className = 'stamp' + (cls?' '+cls:''); thump(s); }
  function update(){
    var price = +$('price').value, dp = +$('down').value, rate = +$('rate').value, n = state.months;
    var down = price*dp/100, loan = price-down, m = emi(loan,rate,n), total = m*n;
    $('priceOut').textContent = lakh(price); $('downOut').textContent = dp + '% · ₹' + inr(down);
    $('rateOut').textContent = rate.toFixed(2).replace(/\.00$/,'').replace(/(\.\d)0$/,'$1') + '%'; $('tenureOut').textContent = n + ' ' + t('months');
    $('payNow').textContent = '₹'+inr(down); $('loanOut').textContent = '₹'+inr(loan); $('intOut').textContent = '₹'+inr(total-loan); $('totalOut').textContent = '₹'+inr(total);
    var km = +$('km').value, pk = +$('perkm').value, days = +$('days').value, fu = +$('fuel').value, fx = +$('fixed').value;
    var gross = km*pk*days, fuel = km*fu*days, home = gross - fuel - fx - m;
    $('kmOut').textContent = km + ' km'; $('perkmOut').textContent = '₹' + pk; $('daysOut').textContent = days; $('fuelOut').textContent = '₹' + fu.toFixed(1); $('fixedOut').textContent = '₹' + inr(fx);
    $('grossOut').textContent = '₹'+inr(gross); $('fuelCost').textContent = '-₹'+inr(fuel); $('fixedCost').textContent = '-₹'+inr(fx); $('emiCost').textContent = '-₹'+inr(m);
    $('homeOut').textContent = (home<0?'-':'') + '₹'+inr(Math.abs(home)); $('homeOut').style.color = home>=0 ? 'var(--green)' : 'var(--red)';
    var earn = state.mode === 'earn';
    $('earnFields').hidden = !earn; $('earnLines').hidden = !earn; $('emiLines').hidden = earn;
    $('bigLabel').textContent = earn ? t('r_home_big') : t('r_emi');
    $('slipNote').textContent = earn ? t('earn_note') : t('emi_note');
    rollBig(earn ? home : m);
    if (earn) setStamp(home > 0 ? 'Pays for itself' : 'Recheck', home > 0 ? 'green' : ''); else setStamp('Provisional','');
    clearTimeout(liveT); liveT = setTimeout(function(){ $('slipLive').textContent = $('bigLabel').textContent + ': ' + (earn ? (home<0?'minus ':'') + '₹' + inr(Math.abs(home)) : '₹' + inr(m)) + ' per month'; }, 600);
    var c = CARS.filter(function(x){return x.id===state.car;})[0];
    var msg = 'Hi Taqwa Automobiles, I filled the worksheet on your website.\nCar: ' + (c ? c.maker+' '+c.name : 'Other') + '\nOn-road price: ₹'+inr(price)+'\nDown payment: ₹'+inr(down)+' ('+dp+'%)\nInterest: '+rate+'% for '+n+' months\nEMI: ₹'+inr(m)+'/month';
    if (earn) msg += '\nPlan: '+km+' km/day, '+days+' days/month\nEstimated left after EMI: ₹'+inr(home)+'/month';
    $('emiWa').href = waLink(msg + '\nPlease share your best offer.');
  }
  ['price','down','rate','km','perkm','days','fuel','fixed'].forEach(function(id){ $(id).addEventListener('input', function(){
    if(id==='price'){ state.car='other'; document.querySelectorAll('#carChips button').forEach(function(b){ b.setAttribute('aria-pressed', b.dataset.car==='other'); }); } update(); }); });
  document.querySelectorAll('#tenureChips button').forEach(function(b){ b.addEventListener('click', function(){ state.months = +b.dataset.m; document.querySelectorAll('#tenureChips button').forEach(function(x){ x.setAttribute('aria-pressed', x===b); }); update(); }); });
  document.querySelectorAll('.modes button').forEach(function(b){ b.addEventListener('click', function(){ state.mode = b.dataset.mode; document.querySelectorAll('.modes button').forEach(function(x){ x.setAttribute('aria-pressed', x===b); }); update(); }); });

  /* ---------- Services ---------- */
  var SVC = window.TAQWA_SVC;
  var svcIdx = 0;
  function svcData(i){ return (SVC[lang]||SVC.en)[i]; }
  function renderSvcTabs(){
    $('svcTabs').innerHTML = SVC.en.map(function(_,i){ return '<button type="button" role="tab" id="svc-tab-'+i+'" aria-controls="svcPanel" aria-selected="'+(i===svcIdx)+'" tabindex="'+(i===svcIdx?0:-1)+'">'+svcData(i).tab+'</button>'; }).join('');
    var btns = $('svcTabs').querySelectorAll('button');
    btns.forEach(function(b,i){
      b.addEventListener('click', function(){ svcIdx = i; renderSvcTabs(); renderSvc(true); $('svc-tab-'+i).focus(); });
      b.addEventListener('keydown', function(e){ var k = e.key, j = i; if(k==='ArrowRight') j=(i+1)%btns.length; else if(k==='ArrowLeft') j=(i-1+btns.length)%btns.length; else return; e.preventDefault(); svcIdx=j; renderSvcTabs(); renderSvc(true); $('svc-tab-'+j).focus(); });
    });
  }
  function renderSvc(animate){
    var s = svcData(svcIdx), p = $('svcPanel');
    p.setAttribute('aria-labelledby','svc-tab-'+svcIdx);
    p.innerHTML = '<div><span class="no">Service '+(svcIdx+1)+' of '+SVC.en.length+'</span><h3>'+s.t+'</h3><p>'+s.d+'</p></div>'+
      '<div><span class="label">'+t('svc_do')+'</span><ul>'+s.li.map(function(x){return '<li>'+x+'</li>';}).join('')+'</ul></div>';
    if (animate && !reduce){ p.animate([{opacity:.4,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:260,easing:'ease-out'}); }
  }

  /* ---------- Your file ---------- */
  var LISTS = {
    driver:['Aadhaar card','PAN card','Driving licence with transport badge','Maharashtra domicile certificate','Police verification certificate','4 passport-size photos','Bank passbook or cancelled cheque','Mobile number linked to Aadhaar'],
    vehicle:['RC book (registration certificate)','Tourist or contract carriage permit','Fitness certificate','Commercial insurance policy','PUC certificate','Road tax receipt','Car photos (front, back, both sides)'],
    loan:['Aadhaar and PAN','Address proof (light bill or rent agreement)','Last 6 months bank statement','2 passport-size photos','Income proof or app earnings statement','2 references with phone numbers','Down payment ready (cheque or transfer)']
  };
  var cur = 'driver', ticks = {}, wasDone = false;
  function renderList(){
    var items = LISTS[cur];
    $('fileTab').textContent = 'Applicant file · ' + ({driver:'Driver',vehicle:'Attachment',loan:'Car loan'})[cur];
    $('checklist').innerHTML = items.map(function(x,i){ var id='ck-'+cur+'-'+i; return '<li><label for="'+id+'"><input type="checkbox" id="'+id+'"'+(ticks[id]?' checked':'')+'><span>'+x+'</span></label></li>'; }).join('');
    $('checklist').querySelectorAll('input').forEach(function(c){ c.addEventListener('change', function(){ ticks[c.id]=c.checked; prog(true); }); });
    wasDone = false; prog(false);
  }
  function prog(anim){
    var items = LISTS[cur], n = 0, missing = []; items.forEach(function(x,i){ if(ticks['ck-'+cur+'-'+i]) n++; else missing.push(x); });
    var done = n === items.length;
    $('progress').textContent = n + ' / ' + items.length + ' ' + t('ready');
    $('fileStatus').classList.toggle('done', done);
    $('fileStamp').hidden = !done;
    if (done && !wasDone && anim) thump($('fileStamp'));
    wasDone = done;
    var msg = 'Hi Taqwa Automobiles, I am preparing my file (' + ({driver:'new driver',vehicle:'car attachment',loan:'car loan'})[cur] + ').\nI have ' + n + ' of ' + items.length + ' papers.' + (missing.length ? '\nStill missing: ' + missing.join(', ') : '\nAll papers ready. When can I visit?');
    $('fileWa').href = waLink(msg);
  }
  document.querySelectorAll('input[name=pur]').forEach(function(r){ r.addEventListener('change', function(){ cur = r.value; renderList(); }); });

  /* ---------- Delivery register (placeholders) ---------- */
  function renderDeliv(){
    var cap = ['Owner name · Dzire Tour S','Owner name · Ertiga Tour','Owner name · WagonR Tour','Owner name · Aura','Owner name · Dzire Tour S','Owner name · Ertiga Tour'];
    $('delivList').innerHTML = cap.map(function(c,i){ return '<figure class="pol"><div class="photo ph"><img src="images/deliveries/delivery-'+(i+1)+'.svg" alt="Sample illustration of a car handed over with a marigold garland" width="600" height="600" loading="lazy"><span class="sample-tag">'+t('sample_img')+'</span></div><figcaption class="ph">'+c+'<br>Delivered: DD MMM 2026</figcaption></figure>'; }).join('');
  }

  /* ---------- Job form ---------- */
  $('applyForm').addEventListener('submit', function(e){
    e.preventDefault();
    var name = $('jName').value.trim(), phone = $('jPhone').value.replace(/\D/g,'');
    if (!name){ $('jErr').textContent = t('j_err_name'); $('jName').focus(); return; }
    if (phone.length !== 10){ $('jErr').textContent = t('j_err_phone'); $('jPhone').focus(); return; }
    $('jErr').textContent = '';
    var f = e.target, msg = 'Hi Taqwa Automobiles, I want a driver job (Form DJ-1).\nName: '+name+'\nMobile: '+phone+'\nBadge: '+f.badge.value+'\nShift: '+f.shift.value+'\nArea: '+$('jArea').value;
    $('jWa').href = waLink(msg); $('jWa').hidden = false; $('jWait').hidden = true;
    $('jStamp').hidden = false; thump($('jStamp')); $('jWa').focus();
  });

  /* ---------- Misc ---------- */
  function fillWa(){
    document.querySelectorAll('[data-wa="offer"]').forEach(function(a){ a.href = waLink("Hi Taqwa Automobiles, please share today's offer on T-permit cars."); });
    document.querySelectorAll('[data-wa="hello"]').forEach(function(a){ a.href = waLink('Hi Taqwa Automobiles, I found you on your website. I need help with: '); });
  }
  document.querySelectorAll('[data-copy]').forEach(function(b){ b.addEventListener('click', function(){
    var done = function(){ b.textContent = t('copied'); setTimeout(function(){ b.textContent = t('copy'); }, 1600); };
    var sel = function(){ var r = document.createRange(); r.selectNodeContents(b.previousElementSibling); var s = getSelection(); s.removeAllRanges(); s.addRange(r); };
    try { navigator.clipboard.writeText(b.dataset.copy).then(done, sel); } catch(e){ sel(); } }); });
  $('phToggle').addEventListener('click', function(){ var on = document.body.classList.toggle('show-ph'); this.setAttribute('aria-pressed', on); });

  /* Stamps thump when they scroll into view (they are already visible at rest) */
  if ('IntersectionObserver' in window && !reduce){
    var sio = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ thump(en.target); sio.unobserve(en.target); } }); }, {threshold:.6});
    document.querySelectorAll('.proc .stamp').forEach(function(s){ sio.observe(s); });
  }
  var links = document.querySelectorAll('nav.main a');
  if ('IntersectionObserver' in window){
    var nio = new IntersectionObserver(function(es){ es.forEach(function(en){ if(en.isIntersecting){ links.forEach(function(l){ l.classList.toggle('on', l.getAttribute('href')==='#'+en.target.id); }); } }); }, {rootMargin:'-45% 0px -50% 0px'});
    ['cars','emi','services','file','jobs','visit'].forEach(function(id){ var el=$(id); if(el) nio.observe(el); });
  }

  var fab = document.querySelector('.fab'), heroCtas = document.querySelector('.hero .ctas');
  if ('IntersectionObserver' in window && fab && heroCtas){ new IntersectionObserver(function(es){ fab.classList.toggle('away', es[0].isIntersecting); }).observe(heroCtas); }
  applyLang();
  var p = 732000, dn = p*0.1; $('hDown').textContent = '₹'+inr(dn); $('hEmi').textContent = '₹'+inr(emi(p-dn,10,60))+'/mo';
  setTimeout(function(){ thump($('heroStamp')); thump($('dateStamp')); }, 350);
})();
