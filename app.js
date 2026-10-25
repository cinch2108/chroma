/* ---------- color math ---------- */
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
const hex2rgb=h=>{h=h.replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h.slice(0,6),16);return[(n>>16)&255,(n>>8)&255,n&255]};
const rgb2hex=(r,g,b)=>'#'+[r,g,b].map(v=>Math.round(clamp(v,0,255)).toString(16).padStart(2,'0')).join('');
function rgb2hsl(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b);let h=0,s=0,l=(M+m)/2;if(M!==m){const d=M-m;s=l>.5?d/(2-M-m):d/(M+m);h=M===r?(g-b)/d+(g<b?6:0):M===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,s*100,l*100]}
function hsl2rgb(h,s,l){h=((h%360)+360)%360;s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return[f(0)*255,f(8)*255,f(4)*255]}
function rgb2hsv(r,g,b){r/=255;g/=255;b/=255;const M=Math.max(r,g,b),m=Math.min(r,g,b),d=M-m;let h=0;if(d){h=M===r?(g-b)/d+(g<b?6:0):M===g?(b-r)/d+2:(r-g)/d+4;h*=60}return[h,M?d/M*100:0,M*100]}
function rgb2cmyk(r,g,b){r/=255;g/=255;b/=255;const k=1-Math.max(r,g,b);if(k===1)return[0,0,0,100];return[(1-r-k)/(1-k)*100,(1-g-k)/(1-k)*100,(1-b-k)/(1-k)*100,k*100]}
const lin=c=>{c/=255;return c<=.04045?c/12.92:Math.pow((c+.055)/1.055,2.4)};
const delin=c=>255*(c<=.0031308?12.92*c:1.055*Math.pow(c,1/2.4)-.055);
function rgb2oklab(r,g,b){r=lin(r);g=lin(g);b=lin(b);
 const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);
 return[.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s]}
function oklab2rgb(L,a,b){const l=(L+.3963377774*a+.2158037573*b)**3,m=(L-.1055613458*a-.0638541728*b)**3,s=(L-.0894841775*a-1.291485548*b)**3;
 return[delin(4.0767416621*l-3.3077115913*m+.2309699292*s),delin(-1.2684380046*l+2.6097574011*m-.3413193965*s),delin(-.0041960863*l-.7034186147*m+1.707614701*s)]}
function rgb2oklch(r,g,b){const[L,a,bb]=rgb2oklab(r,g,b);let h=Math.atan2(bb,a)*180/Math.PI;if(h<0)h+=360;return[L,Math.hypot(a,bb),h]}
function inGamut(rgb){return rgb.every(v=>v>=-0.5&&v<=255.5)}
function oklch2rgb(L,C,h){let c=C,rgb;for(let i=0;i<30;i++){rgb=oklab2rgb(L,c*Math.cos(h*Math.PI/180),c*Math.sin(h*Math.PI/180));if(inGamut(rgb))break;c*=.93}return rgb.map(v=>clamp(v,0,255))}
const oklchHex=(L,C,h)=>rgb2hex(...oklch2rgb(L,C,h));
const lum=([r,g,b])=>.2126*lin(r)+.7152*lin(g)+.0722*lin(b);
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const isLight=hex=>lum(hex2rgb(hex))>.36;
const NAMED={black:'#000000',white:'#ffffff',red:'#ff0000',green:'#008000',blue:'#0000ff',yellow:'#ffff00',orange:'#ffa500',purple:'#800080',pink:'#ffc0cb',gray:'#808080',grey:'#808080',brown:'#a52a2a',cyan:'#00ffff',magenta:'#ff00ff',lime:'#00ff00',navy:'#000080',teal:'#008080',maroon:'#800000',olive:'#808000',coral:'#ff7f50',salmon:'#fa8072',gold:'#ffd700',indigo:'#4b0082',violet:'#ee82ee',turquoise:'#40e0d0',crimson:'#dc143c',lavender:'#e6e6fa',beige:'#f5f5dc',mint:'#98ff98',tomato:'#ff6347',orchid:'#da70d6',plum:'#dda0dd',khaki:'#f0e68c',silver:'#c0c0c0',skyblue:'#87ceeb',hotpink:'#ff69b4',chocolate:'#d2691e',tan:'#d2b48c',aqua:'#00ffff',rebeccapurple:'#663399'};
function parseColor(s){s=String(s).slice(0,80).trim().toLowerCase();if(NAMED[s.replace(/\s/g,'')])return hex2rgb(NAMED[s.replace(/\s/g,'')]);
 let m;if(m=s.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/))return hex2rgb(m[1]);
 const nums=(s.match(/-?[\d.]+%?/g)||[]).map(x=>parseFloat(x));
 if(/^rgba?\(/.test(s)&&nums.length>=3)return nums.slice(0,3);
 if(/^hsla?\(/.test(s)&&nums.length>=3)return hsl2rgb(...nums.slice(0,3));
 if(/^hsv\(|^hsb\(/.test(s)&&nums.length>=3){let[h,sv,v]=nums;sv/=100;v/=100;const l=v*(1-sv/2),sl=(l===0||l===1)?0:(v-l)/Math.min(l,1-l);return hsl2rgb(h,sl*100,l*100)}
 if(/^oklch\(/.test(s)&&nums.length>=3){let L=nums[0];if(s.match(/oklch\(\s*[\d.]+%/))L/=100;return oklch2rgb(L,nums[1],nums[2])}
 if(/^cmyk\(/.test(s)&&nums.length>=4){const[c,mm,y,k]=nums.map(v=>v/100);return[255*(1-c)*(1-k),255*(1-mm)*(1-k),255*(1-y)*(1-k)]}
 return null}
/* simple color naming via nearest from a curated list */
const NAMES=[['Black','#000000'],['Charcoal','#36454f'],['Graphite','#4b4e53'],['Slate','#708090'],['Silver','#c0c0c0'],['Snow','#fffafa'],['Ivory','#fffff0'],['Cream','#fffdd0'],['Beige','#f5f5dc'],['Sand','#c2b280'],['Tan','#d2b48c'],['Camel','#c19a6b'],['Caramel','#af6f09'],['Chocolate','#7b3f00'],['Espresso','#4e312d'],['Brown','#8b4513'],['Rust','#b7410e'],['Terracotta','#e2725b'],['Burnt Orange','#cc5500'],['Orange','#ff8c00'],['Tangerine','#f28500'],['Apricot','#fbceb1'],['Peach','#ffcba4'],['Coral','#ff7f50'],['Salmon','#fa8072'],['Tomato','#ff6347'],['Red','#e0201b'],['Crimson','#dc143c'],['Cherry','#990f2b'],['Burgundy','#800020'],['Maroon','#800000'],['Wine','#722f37'],['Rose','#ff007f'],['Raspberry','#e30b5c'],['Hot Pink','#ff69b4'],['Blush','#de5d83'],['Pink','#ffc0cb'],['Bubblegum','#ffc1cc'],['Magenta','#ff00ff'],['Fuchsia','#c154c1'],['Orchid','#da70d6'],['Plum','#8e4585'],['Mauve','#e0b0ff'],['Lilac','#c8a2c8'],['Lavender','#b57edc'],['Violet','#8f00ff'],['Amethyst','#9966cc'],['Purple','#6a0dad'],['Grape','#6f2da8'],['Eggplant','#614051'],['Indigo','#4b0082'],['Iris','#5a4fcf'],['Periwinkle','#ccccff'],['Navy','#000080'],['Midnight','#191970'],['Sapphire','#0f52ba'],['Royal Blue','#4169e1'],['Cobalt','#0047ab'],['Blue','#1e5eff'],['Azure','#007fff'],['Cornflower','#6495ed'],['Sky','#87ceeb'],['Baby Blue','#89cff0'],['Ice','#d6ecef'],['Steel Blue','#4682b4'],['Denim','#1560bd'],['Cerulean','#2a52be'],['Cyan','#00e5ff'],['Aqua','#00ffff'],['Turquoise','#40e0d0'],['Teal','#008080'],['Petrol','#005f6a'],['Seafoam','#71eeb8'],['Mint','#98ff98'],['Jade','#00a86b'],['Emerald','#50c878'],['Green','#22b14c'],['Kelly Green','#4cbb17'],['Forest','#228b22'],['Hunter','#355e3b'],['Pine','#01796f'],['Sage','#9caf88'],['Olive','#808000'],['Moss','#8a9a5b'],['Lime','#a7f432'],['Chartreuse','#7fff00'],['Pear','#d1e231'],['Lemon','#fff44f'],['Yellow','#ffe600'],['Canary','#ffef00'],['Butter','#fffd96'],['Mustard','#e1ad01'],['Gold','#ffd700'],['Amber','#ffbf00'],['Honey','#eba937'],['Ochre','#cc7722'],['White','#ffffff'],['Gray','#808080'],['Ash','#b2beb5'],['Stone','#928e85'],['Taupe','#483c32'],['Gunmetal','#2a3439'],['Onyx','#353839']].map(([n,h])=>[n,rgb2oklab(...hex2rgb(h))]);
function colorName(hex){const p=rgb2oklab(...hex2rgb(hex));let best,bd=1e9;for(const[n,q]of NAMES){const d=(p[0]-q[0])**2*1.4+(p[1]-q[1])**2+(p[2]-q[2])**2;if(d<bd){bd=d;best=n}}const L=p[0];return (L>.9&&bd>.002&&!/White|Snow|Ivory|Cream/.test(best)?'Pale ':L<.25&&bd>.002&&!/Black|Midnight|Onyx|Espresso/.test(best)?'Deep ':'')+best}

/* ---------- ui helpers ---------- */
'use strict';
/* Frame-buster: GitHub Pages can't send frame-ancestors / X-Frame-Options, so if another origin frames this page, break out (or blank the page if breaking out is blocked). */
if (typeof window !== 'undefined' && window.top !== window.self) {
  let sameOrigin = false;
  try { sameOrigin = window.top.location.origin === window.location.origin; } catch (e) { sameOrigin = false; }
  if (!sameOrigin) {
    try { window.top.location.replace(window.location.href); } catch (e) { /* sandboxed */ }
    document.documentElement.style.display = 'none';
  }
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
document.addEventListener('click',e=>{const t=e.target.closest('[data-copy]');if(t)copy(t.dataset.copy)});
const $=s=>document.querySelector(s);
const toast=msg=>{const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),1400)};
const copy=(txt,label)=>{navigator.clipboard?.writeText(txt);toast((label||txt)+' copied')};

function show(v){document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x.dataset.v===v));document.querySelectorAll('.view').forEach(x=>x.classList.toggle('active',x.id==='v-'+v))}
const rnd=(a,b)=>a+Math.random()*(b-a);

/* ---------- palette generator ---------- */
let pal=[],hist=[];
function generate(keep=true){
  const n=+$('#count').value,mode=$('#mode').value;
  const base=rnd(0,360);let out=[];
  for(let i=0;i<n;i++){let L,C,h;const t=n>1?i/(n-1):0;
    switch(mode){
      case'analogous':h=base+(t-.5)*90;L=.35+t*.5;C=rnd(.09,.17);break;
      case'complementary':h=base+(i%2)*180;L=.3+t*.6;C=rnd(.08,.18);break;
      case'split':h=base+[0,150,210][i%3];L=.32+t*.55;C=rnd(.09,.17);break;
      case'triadic':h=base+(i%3)*120;L=.35+t*.5;C=rnd(.1,.17);break;
      case'tetradic':h=base+(i%4)*90;L=.38+t*.45;C=rnd(.1,.16);break;
      case'mono':h=base;L=.22+t*.72;C=.04+.12*Math.sin(t*Math.PI);break;
      case'pastel':h=base+i*(360/n)+rnd(-15,15);L=rnd(.86,.93);C=rnd(.04,.08);break;
      case'vivid':h=base+i*(360/n)*.8;L=rnd(.62,.75);C=rnd(.18,.26);break;
      case'earth':h=rnd(30,120);L=rnd(.35,.8);C=rnd(.03,.1);break;
      case'dark':h=base+(i===n-1?180:0);L=i<n-1?.14+i*.1:.72;C=i<n-1?.02+i*.01:.17;break;
      default:{const step=rnd(25,60)*(Math.random()<.5?1:-1);h=base+i*step;L=clamp(.25+t*.68+rnd(-.08,.08),.15,.97);C=rnd(.05,.2)*Math.sin(.3+t*2.5);C=Math.abs(C)+.02}
    }
    out.push(oklchHex(clamp(L,.08,.98),C,h));}
  if(mode==='mono'||mode==='auto'&&Math.random()<.5)out.sort((a,b)=>lum(hex2rgb(a))-lum(hex2rgb(b)));
  if(pal.length)hist.push(pal.map(p=>({...p})));
  pal=out.map((hex,i)=>keep&&pal[i]&&pal[i].lock?pal[i]:{hex,lock:false});
  renderPal();}
function renderPal(){
  const el=$('#palette');el.innerHTML='';
  pal.forEach((p,i)=>{const d=document.createElement('div');d.className='sw'+(isLight(p.hex)?' dark':'')+(p.lock?' locked':'');d.style.background=p.hex;d.style.color=isLight(p.hex)?'#111':'#fff';
    d.innerHTML=`<div class="tools"><button class="ic" data-a="lock" title="Lock">${p.lock?'🔒':'🔓'}</button><button class="ic" data-a="edit" title="Edit">🎚️</button><button class="ic" data-a="left" title="Move left">←</button><button class="ic" data-a="del" title="Remove">✕</button></div><div class="hex">${p.hex.toUpperCase().slice(1)}</div><div class="name">${colorName(p.hex)}</div><input type="color" value="${p.hex}">`;
    d.querySelector('.hex').onclick=()=>copy(p.hex.toUpperCase());
    const ci=d.querySelector('input');ci.oninput=e=>{p.hex=e.target.value;renderPal()};
    d.querySelectorAll('.ic').forEach(b=>b.onclick=()=>{const a=b.dataset.a;
      if(a==='lock'){p.lock=!p.lock;renderPal()}
      if(a==='edit')ci.showPicker?ci.showPicker():ci.click();
      if(a==='left'&&i>0){[pal[i-1],pal[i]]=[pal[i],pal[i-1]];renderPal()}
      if(a==='del'&&pal.length>2){pal.splice(i,1);renderPal()}});
    el.appendChild(d)});
  if(document.body.dataset.view==='palette')location.hash='p='+pal.map(p=>p.hex.slice(1)).join('-');
  renderExport();renderCB();}
function renderExport(){const f=$('#expfmt').value,hs=pal.map(p=>p.hex);const nm=h=>colorName(h).toLowerCase().replace(/\s+/g,'-');let s='';
  if(f==='css')s=':root {\n'+hs.map((h,i)=>`  --color-${i+1}: ${h}; /* ${colorName(h)} */`).join('\n')+'\n}';
  if(f==='scss')s=hs.map((h,i)=>`$${nm(h)}: ${h};`).join('\n');
  if(f==='tw')s='// tailwind.config.js\ntheme: {\n  extend: {\n    colors: {\n'+hs.map(h=>`      '${nm(h)}': '${h}',`).join('\n')+'\n    }\n  }\n}';
  if(f==='json')s=JSON.stringify(hs.map(h=>({name:colorName(h),hex:h,rgb:hex2rgb(h)})),null,2);
  if(f==='array')s=JSON.stringify(hs);
  if(f==='svg')s=`<svg xmlns="http://www.w3.org/2000/svg" width="${hs.length*100}" height="100">\n`+hs.map((h,i)=>`  <rect x="${i*100}" width="100" height="100" fill="${h}"/>`).join('\n')+'\n</svg>';
  $('#export').textContent=s}
/* Machado et al. 2009 full-severity matrices */
const CB={Protanopia:[[.152286,1.052583,-.204868],[.114503,.786281,.099216],[-.003882,-.048116,1.051998]],Deuteranopia:[[.367322,.860646,-.227968],[.280085,.672501,.047413],[-.01182,.04294,.968881]],Tritanopia:[[1.255528,-.076749,-.178779],[-.078411,.930809,.147602],[.004733,.691367,.3039]],Achromatopsia:'gray'};
function simCB(hex,m){const rgb=hex2rgb(hex).map(lin);if(m==='gray'){const y=delin(.2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]);return rgb2hex(y,y,y)}return rgb2hex(...m.map(r=>delin(clamp(r[0]*rgb[0]+r[1]*rgb[1]+r[2]*rgb[2]))))}
function renderCB(){$('#cbsim').innerHTML=Object.entries(CB).map(([n,m])=>`<div><div class="hint">${n}</div><div class="strip">${pal.map(p=>`<div style="background:${simCB(p.hex,m)}"></div>`).join('')}</div></div>`).join('')}
$('#gen').onclick=()=>generate();$('#mode').onchange=()=>generate();$('#count').onchange=()=>generate();$('#expfmt').onchange=renderExport;
$('#copyexp').onclick=()=>copy($('#export').textContent,'Code');
$('#undo').onclick=()=>{if(hist.length){pal=hist.pop();renderPal()}};
$('#share').onclick=()=>copy(location.href,'Link');
$('#savepng').onclick=()=>{const c=document.createElement('canvas'),w=300;c.width=w*pal.length;c.height=420;const x=c.getContext('2d');pal.forEach((p,i)=>{x.fillStyle=p.hex;x.fillRect(i*w,0,w,340);x.fillStyle='#fff';x.fillRect(i*w,340,w,80);x.fillStyle='#111';x.font='bold 26px monospace';x.fillText(p.hex.toUpperCase(),i*w+24,380);x.fillStyle='#777';x.font='18px sans-serif';x.fillText(colorName(p.hex),i*w+24,405)});const a=document.createElement('a');a.download='palette.png';a.href=c.toDataURL();a.click()};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&$('#v-palette').classList.contains('active')&&!/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)){e.preventDefault();generate()}
  if((e.ctrlKey||e.metaKey)&&e.key==='z'&&$('#v-palette').classList.contains('active')){$('#undo').click()}});

/* ---------- saved palettes (local only) ---------- */
const SKEY='chroma.saved.v1';
const loadSaved=()=>{try{const a=JSON.parse(localStorage.getItem(SKEY)||'[]');return Array.isArray(a)?a.filter(p=>Array.isArray(p)&&p.every(h=>/^#[0-9a-f]{6}$/i.test(h))).slice(0,60):[]}catch{return[]}};
function renderSaved(){const a=loadSaved(),el=$('#saved');if(!a.length){el.innerHTML='<span class="hint">Nothing saved yet. Hit ♥ Save on a palette you like.</span>';return}
  el.innerHTML=a.map((p,i)=>`<div class="sp" data-i="${i}"><div class="strip">${p.map(h=>`<div style="background:${h}"></div>`).join('')}</div><button class="ic2" data-del="${i}" title="Delete">✕</button></div>`).join('')}
$('#save').onclick=()=>{const a=loadSaved();a.unshift(pal.map(p=>p.hex));localStorage.setItem(SKEY,JSON.stringify(a.slice(0,60)));renderSaved();toast('Palette saved')};
$('#saved').onclick=e=>{const d=e.target.closest('[data-del]');if(d){const a=loadSaved();a.splice(+d.dataset.del,1);localStorage.setItem(SKEY,JSON.stringify(a));return renderSaved()}
  const sp=e.target.closest('.sp');if(sp){hist.push(pal);pal=loadSaved()[+sp.dataset.i].map(hex=>({hex,lock:false}));renderPal();scrollTo({top:0,behavior:'smooth'})}};

/* ---------- converter ---------- */
function convert(rgb){const hex=rgb2hex(...rgb),[r,g,b]=rgb.map(Math.round),[h,s,l]=rgb2hsl(...rgb),[hv,sv,vv]=rgb2hsv(...rgb),cm=rgb2cmyk(...rgb),[L,C,H]=rgb2oklch(...rgb),lab=rgb2oklab(...rgb);
  $('#cvsw').style.background=hex;$('#cvpick').value=hex;$('#cvname').innerHTML=`<b style="color:var(--text)">${colorName(hex)}</b> · contrast ${contrast(rgb,[255,255,255]).toFixed(2)}:1 on white, ${contrast(rgb,[0,0,0]).toFixed(2)}:1 on black`;
  const R=x=>Math.round(x),F=(x,d=3)=>+x.toFixed(d);
  const rows=[['HEX',hex.toUpperCase()],['RGB',`rgb(${r}, ${g}, ${b})`],['HSL',`hsl(${R(h)}, ${R(s)}%, ${R(l)}%)`],['HSV',`hsv(${R(hv)}, ${R(sv)}%, ${R(vv)}%)`],['CMYK',`cmyk(${cm.map(R).join('%, ')}%)`],['OKLCH',`oklch(${F(L*100,1)}% ${F(C)} ${F(H,1)})`],['OKLAB',`oklab(${F(lab[0])} ${F(lab[1])} ${F(lab[2])})`],['Swift',`Color(red: ${F(r/255)}, green: ${F(g/255)}, blue: ${F(b/255)})`],['Android',`Color(0xFF${hex.slice(1).toUpperCase()})`],['Int',`${parseInt(hex.slice(1),16)}`]];
  $('#fmts').innerHTML=rows.map(([k,v])=>`<div class="fmt"><b>${k}</b><span class="mono">${v}</span><button class="btn" data-copy="${esc(v)}">Copy</button></div>`).join('');
  const steps=[50,100,200,300,400,500,600,700,800,900,950],Ls=[.975,.94,.88,.8,.71,.62,.53,.45,.37,.29,.21];
  window._scale=steps.map((st,i)=>{const c=C*(1-Math.abs(Ls[i]-.6)*.9);return[st,oklchHex(Ls[i],Math.max(.005,c),H)]});
  $('#scale').innerHTML=_scale.map(([st,hx])=>`<div style="background:${hx};color:${isLight(hx)?'#111':'#fff'}" data-copy="${hx}"><span>${st}</span><span>${hx.slice(1).toUpperCase()}</span></div>`).join('');
  const hs={Complementary:[0,180],Analogous:[-30,0,30],Triadic:[0,120,240],'Split complementary':[0,150,210],Tetradic:[0,90,180,270],Square:[0,60,180,240]};
  $('#harm').innerHTML=Object.entries(hs).map(([n,a])=>`<div class="h"><div class="hint">${n}</div><div class="strip">${a.map(d=>{const x=oklchHex(L,C,H+d);return`<div style="background:${x}" title="${x}" data-copy="${x}"></div>`}).join('')}</div></div>`).join('')}
function cvUpdate(v){const rgb=parseColor(v);if(rgb){$('#cvin').style.borderColor='';convert(rgb)}else $('#cvin').style.borderColor='#ff6b7f'}
$('#cvin').oninput=e=>cvUpdate(e.target.value);$('#cvpick').oninput=e=>{$('#cvin').value=e.target.value;cvUpdate(e.target.value)};
$('#copyscale').onclick=()=>copy(`'brand': {\n${_scale.map(([s,h])=>`  ${s}: '${h}',`).join('\n')}\n}`,'Tailwind scale');

/* ---------- contrast ---------- */
function ctUpdate(){const f=parseColor($('#fgt').value),b=parseColor($('#bgt').value);if(!f||!b)return;const fh=rgb2hex(...f),bh=rgb2hex(...b);$('#fgp').value=fh;$('#bgp').value=bh;
  const r=contrast(f,b);$('#ratio').textContent=r.toFixed(2)+':1';const pv=$('#preview');pv.style.background=bh;pv.style.color=fh;
  const tests=[['AA body text',4.5],['AAA body text',7],['AA large text',3],['AAA large text',4.5],['UI & icons',3],['Logos','any']];
  $('#badges').innerHTML=tests.map(([n,t])=>{const ok=t==='any'||r>=t;return`<div class="badge"><span>${n}</span><span class="${ok?'pass':'fail'}">${ok?'✓ Pass':'✕ Fail'}</span></div>`}).join('');
  $('#verdict').textContent=r>=7?'Excellent. Easy to read for almost everyone.':r>=4.5?'Good for all text.':r>=3?'OK for big headings and icons only.':'Too low. Hard to read, try "Fix contrast".';
  $('#ratio').style.color=r>=4.5?'#5cffa0':r>=3?'#ffd35c':'#ff6b7f'}
const bindPair=(p,t)=>{$(p).oninput=e=>{$(t).value=e.target.value;ctUpdate()};$(t).oninput=ctUpdate};bindPair('#fgp','#fgt');bindPair('#bgp','#bgt');
$('#swap').onclick=()=>{const a=$('#fgt').value;$('#fgt').value=$('#bgt').value;$('#bgt').value=a;ctUpdate()};
$('#fix').onclick=()=>{const f=parseColor($('#fgt').value),b=parseColor($('#bgt').value);if(!f||!b)return;if(contrast(f,b)>=4.5)return toast('Already passes AA');let[L,C,H]=rgb2oklch(...f);const dir=lum(b)>.18?-1:1;
  for(let i=0;i<100;i++){L=clamp(L+dir*.01);const t=oklch2rgb(L,C,H);if(contrast(t,b)>=4.6){$('#fgt').value=rgb2hex(...t);ctUpdate();return toast('Adjusted text color to pass AA')}}
  $('#fgt').value=dir<0?'#000000':'#ffffff';ctUpdate()};

/* ---------- gradient ---------- */
let stops=[{c:'#7c5cff',p:0},{c:'#ff5c9d',p:55},{c:'#ffb35c',p:100}],sel=0;
function gcss(){const t=$('#gtype').value,a=$('#gangle').value,ip=$('#ginterp').value==='oklch'?' in oklch':'';const st=[...stops].sort((x,y)=>x.p-y.p).map(s=>`${s.c} ${s.p}%`).join(', ');
  return t==='linear'?`linear-gradient(${a}deg${ip}, ${st})`:t==='radial'?`radial-gradient(circle${ip}, ${st})`:`conic-gradient(from ${a}deg${ip}, ${st})`}
function gRender(){const css=gcss();$('#gprev').style.background=css;const bar=$('#gbar');bar.style.background=`linear-gradient(90deg, ${[...stops].sort((x,y)=>x.p-y.p).map(s=>`${s.c} ${s.p}%`).join(', ')})`;
  bar.querySelectorAll('.stop').forEach(x=>x.remove());stops.forEach((s,i)=>{const d=document.createElement('div');d.className='stop'+(i===sel?' sel':'');d.style.left=s.p+'%';d.style.background=s.c;
    d.onpointerdown=e=>{e.stopPropagation();sel=i;gRender();const r=bar.getBoundingClientRect();const mv=ev=>{s.p=Math.round(clamp((ev.clientX-r.left)/r.width)*100);gRender()};const up=()=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up)};addEventListener('pointermove',mv);addEventListener('pointerup',up)};
    d.ondblclick=e=>{e.stopPropagation();if(stops.length>2){stops.splice(i,1);sel=0;gRender()}};bar.appendChild(d)});
  $('#gstopc').value=stops[sel].c;$('#gstopt').value=stops[sel].c;$('#anglbl').textContent=`Angle ${$('#gangle').value}°`;
  $('#gcss').textContent=`background: ${stops[0].c};\nbackground: ${css};`}
$('#gbar').onclick=e=>{if(e.target.id!=='gbar')return;const r=e.currentTarget.getBoundingClientRect(),p=Math.round((e.clientX-r.left)/r.width*100);const s=[...stops].sort((a,b)=>a.p-b.p);let a=s[0],b=s[s.length-1];for(let i=0;i<s.length-1;i++)if(p>=s[i].p&&p<=s[i+1].p){a=s[i];b=s[i+1]}
  const t=(p-a.p)/((b.p-a.p)||1),ca=hex2rgb(a.c),cb=hex2rgb(b.c);stops.push({c:rgb2hex(...ca.map((v,i)=>v+(cb[i]-v)*t)),p});sel=stops.length-1;gRender()};
$('#gstopc').oninput=e=>{stops[sel].c=e.target.value;gRender()};$('#gstopt').onchange=e=>{const c=parseColor(e.target.value);if(c){stops[sel].c=rgb2hex(...c);gRender()}};
['#gtype','#gangle','#ginterp'].forEach(s=>$(s).oninput=gRender);
$('#grev').onclick=()=>{stops.forEach(s=>s.p=100-s.p);gRender()};
$('#grand').onclick=()=>{const n=2+Math.floor(Math.random()*3),h=rnd(0,360),step=rnd(40,120);stops=Array.from({length:n},(_,i)=>({c:oklchHex(rnd(.55,.85),rnd(.12,.22),h+i*step),p:Math.round(i/(n-1)*100)}));sel=0;$('#gangle').value=Math.floor(rnd(0,360));gRender()};
$('#gcopy').onclick=()=>copy($('#gcss').textContent,'CSS');
$('#gpng').onclick=()=>{const c=document.createElement('canvas');c.width=2560;c.height=1440;const x=c.getContext('2d'),t=$('#gtype').value,a=+$('#gangle').value*Math.PI/180,W=c.width,H=c.height;let g;
  if(t==='linear'){const len=Math.abs(W*Math.sin(a))+Math.abs(H*Math.cos(a)),dx=Math.sin(a)*len/2,dy=-Math.cos(a)*len/2;g=x.createLinearGradient(W/2-dx,H/2-dy,W/2+dx,H/2+dy)}else if(t==='radial')g=x.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.hypot(W,H)/2);else g=x.createConicGradient(a-Math.PI/2,W/2,H/2);
  [...stops].sort((p,q)=>p.p-q.p).forEach(s=>g.addColorStop(s.p/100,s.c));x.fillStyle=g;x.fillRect(0,0,W,H);const l=document.createElement('a');l.download='gradient.png';l.href=c.toDataURL();l.click()};
const PRESETS=[['#ff9a9e','#fecfef'],['#a18cd1','#fbc2eb'],['#fad0c4','#ffd1ff'],['#ff6a00','#ee0979'],['#00c6ff','#0072ff'],['#43e97b','#38f9d7'],['#fa709a','#fee140'],['#30cfd0','#330867'],['#667eea','#764ba2'],['#f093fb','#f5576c'],['#5ee7df','#b490ca'],['#0f2027','#2c5364'],['#ffecd2','#fcb69f'],['#c471f5','#fa71cd'],['#f83600','#f9d423'],['#13547a','#80d0c7'],['#ee9ca7','#ffdde1'],['#8360c3','#2ebf91'],['#000000','#434343'],['#7c5cff','#ff5c9d','#ffb35c']];
$('#presets').innerHTML=PRESETS.map((p,i)=>`<div data-i="${i}" style="background:linear-gradient(135deg,${p.join(',')})"></div>`).join('');
$('#presets').onclick=e=>{const i=e.target.dataset.i;if(i==null)return;const p=PRESETS[i];stops=p.map((c,j)=>({c,p:Math.round(j/(p.length-1)*100)}));sel=0;gRender()};

/* ---------- image ---------- */
const cv=$('#cv'),cx=cv.getContext('2d',{willReadFrequently:true});let imgPal=[];
const OK_TYPES=['image/png','image/jpeg','image/webp','image/gif','image/avif','image/bmp'];
function loadImg(file){if(!file)return;if(!OK_TYPES.includes(file.type))return toast('Please use a PNG, JPG, WebP, GIF, AVIF or BMP image');if(file.size>25*1024*1024)return toast('Image is over 25 MB');const img=new Image();img.onload=()=>{const max=900,s=Math.min(1,max/Math.max(img.width,img.height));cv.width=img.width*s;cv.height=img.height*s;cx.drawImage(img,0,0,cv.width,cv.height);$('#imgwrap').style.display='block';$('#imgout').style.display='block';extract()};img.onerror=()=>toast('That file could not be read as an image');const u=URL.createObjectURL(file);img.addEventListener('load',()=>URL.revokeObjectURL(u),{once:true});img.src=u}
function extract(){const k=+$('#kcount').value,data=cx.getImageData(0,0,cv.width,cv.height).data,pts=[];const step=Math.max(1,Math.floor(data.length/4/12000));
  for(let i=0;i<data.length/4;i+=step){if(data[i*4+3]<128)continue;pts.push(rgb2oklab(data[i*4],data[i*4+1],data[i*4+2]))}
  // k-means++ in OKLab
  let cs=[pts[Math.floor(Math.random()*pts.length)]];while(cs.length<k){const d=pts.map(p=>Math.min(...cs.map(c=>(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2)));const sum=d.reduce((a,b)=>a+b,0);let r=Math.random()*sum,j=0;while((r-=d[j])>0&&j<d.length-1)j++;cs.push(pts[j])}
  let counts;for(let it=0;it<14;it++){const acc=cs.map(()=>[0,0,0,0]);for(const p of pts){let bi=0,bd=1e9;cs.forEach((c,i)=>{const d=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(d<bd){bd=d;bi=i}});const a=acc[bi];a[0]+=p[0];a[1]+=p[1];a[2]+=p[2];a[3]++}cs=acc.map((a,i)=>a[3]?[a[0]/a[3],a[1]/a[3],a[2]/a[3]]:cs[i]);counts=acc.map(a=>a[3])}
  imgPal=cs.map((c,i)=>({hex:rgb2hex(...oklab2rgb(...c).map(v=>clamp(v,0,255))),n:counts[i]})).sort((a,b)=>b.n-a.n);
  $('#imgpal').innerHTML=imgPal.map(p=>`<div class="sw" style="background:${p.hex};color:${isLight(p.hex)?'#111':'#fff'};padding:14px 4px"><div class="hex" style="font-size:14px" data-copy="${p.hex.toUpperCase()}">${p.hex.slice(1).toUpperCase()}</div><div class="name">${Math.round(p.n/pts.length*100)}%</div></div>`).join('')}
$('#drop').onclick=()=>$('#file').click();$('#file').onchange=e=>loadImg(e.target.files[0]);
$('#drop').ondragover=e=>{e.preventDefault();$('#drop').classList.add('over')};$('#drop').ondragleave=()=>$('#drop').classList.remove('over');
$('#drop').ondrop=e=>{e.preventDefault();$('#drop').classList.remove('over');loadImg(e.dataTransfer.files[0])};
document.addEventListener('paste',e=>{const f=[...(e.clipboardData?.files||[])][0];if(f){show('image');loadImg(f)}});
$('#kcount').oninput=extract;
const px=e=>{const r=cv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left)*cv.width/r.width),y=Math.floor((e.clientY-r.top)*cv.height/r.height);const d=cx.getImageData(x,y,1,1).data;return rgb2hex(d[0],d[1],d[2])};
cv.onmousemove=e=>{const l=$('#loupe'),h=px(e);l.style.display='block';l.style.left=e.clientX+18+'px';l.style.top=e.clientY+18+'px';l.style.background=h};cv.onmouseleave=()=>$('#loupe').style.display='none';
cv.onclick=e=>{const h=px(e),el=$('#picked');if(el.querySelector('.hint'))el.innerHTML='';const c=document.createElement('div');c.className='chip';c.innerHTML=`<i style="background:${h}"></i>${h.toUpperCase()}`;c.onclick=()=>copy(h.toUpperCase());el.prepend(c);copy(h.toUpperCase())};
$('#imgtopal').onclick=()=>{if(document.body.dataset.view!=='palette'){location.href=document.querySelector('.tab[data-v=palette]').href+'#p='+imgPal.map(p=>p.hex.slice(1)).join('-');return}if(pal.length)hist.push(pal);pal=imgPal.map(p=>({hex:p.hex,lock:false}));renderPal();show('palette');scrollTo(0,0)};

/* ---------- init ---------- */
const m=location.hash.slice(0,200).match(/p=([0-9a-f-]+)/i);
if(m){pal=m[1].split('-').slice(0,12).filter(x=>/^[0-9a-f]{6}$/i.test(x)).map(h=>({hex:'#'+h.toLowerCase(),lock:false}));if(pal.length)renderPal();else generate()}else{pal=['#1b1b3a','#693668','#a74482','#f84aa7','#ff3562'].map(hex=>({hex,lock:false}));renderPal()}
show(document.body.dataset.view||'palette');renderSaved();cvUpdate('#7c5cff');ctUpdate();gRender();

/* ---------- consent (needed before showing personalised ads in EU/UK) ---------- */
const CKEY='chroma.consent';
if(!localStorage.getItem(CKEY))$('#consent').classList.add('show');
$('#c-yes').onclick=()=>{localStorage.setItem(CKEY,'granted');$('#consent').classList.remove('show')};
$('#c-no').onclick=()=>{localStorage.setItem(CKEY,'denied');$('#consent').classList.remove('show')};
