/* Routing, sidebar and lesson rendering. All visible text comes from UI, TERMS and LESSONS. */
(function(){
"use strict";
var UI=window.UI,TERMS=window.TERMS,LESSONS=window.LESSONS,DEMOS=window.DEMOS,SC=window.SC;
var esc=SC.esc,tpl=SC.tpl;

/* Static page text */
document.querySelectorAll("[data-t]").forEach(function(n){n.textContent=UI[n.getAttribute("data-t")];});
document.querySelectorAll("[data-a]").forEach(function(n){
  n.getAttribute("data-a").split(";").forEach(function(p){var kv=p.split("=");n.setAttribute(kv[0],UI[kv[1]]);});
});

/* Light and dark theme. The choice is kept in localStorage when it is available. */
var root=document.documentElement,themebtn=document.getElementById("themebtn");
function setTheme(t,save){
  root.setAttribute("data-theme",t);
  themebtn.setAttribute("aria-label",t==="dark"?UI.themeToLight:UI.themeToDark);
  if(save){try{localStorage.setItem("sc-theme",t);}catch(e){}}
}
(function(){
  var t=root.getAttribute("data-theme");
  if(t!=="dark"&&t!=="light")t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";
  setTheme(t,false);
})();
themebtn.addEventListener("click",function(){setTheme(root.getAttribute("data-theme")==="dark"?"light":"dark",true);});

/* Term list */
var ALL=[],BY={};
TERMS.forEach(function(c){c.terms.forEach(function(t){t.cat=c.name;t.i=ALL.length;ALL.push(t);BY[t.slug]=t;});});
function title(t){return t.bn+" ("+t.en+")";}

var nav=document.getElementById("nav"),side=document.getElementById("side"),scrim=document.getElementById("scrim");
var navopen=document.getElementById("navopen"),qbox=document.getElementById("q"),none=document.getElementById("none");
var railbtn=document.getElementById("railbtn"),homelink=document.getElementById("homelink");
var readyCount=ALL.filter(function(t){return LESSONS[t.slug];}).length;
document.getElementById("tag").textContent=tpl(UI.tag,{n:readyCount});

TERMS.forEach(function(c){
  var d=document.createElement("details");d.className="cat";
  var items=c.terms.map(function(t){
    var ok=!!LESSONS[t.slug];
    return '<li class="'+(ok?'ready':'')+'" data-name="'+esc((t.bn+" "+t.en).toLowerCase())+'"><a href="#'+t.slug+'" data-slug="'+t.slug+'"><span class="dot" aria-hidden="true"></span><span class="tn"><span>'+esc(t.bn)+'</span><span class="en">'+esc(t.en)+'</span></span>'+(ok?'<span class="sr">'+esc(UI.readySr)+'</span>':'')+'</a></li>';
  }).join("");
  d.innerHTML='<summary><span>'+esc(c.name)+'</span><span class="count">'+c.terms.length+'</span></summary><ul class="terms">'+items+'</ul>';
  nav.appendChild(d);
});
qbox.addEventListener("input",function(){
  var v=qbox.value.trim().toLowerCase(),total=0;
  nav.querySelectorAll("details.cat").forEach(function(d){
    var any=0;
    d.querySelectorAll("li").forEach(function(li){var m=!v||li.getAttribute("data-name").indexOf(v)>-1;li.hidden=!m;if(m)any++;});
    d.hidden=!any;total+=any;
    if(v&&any)d.open=true;
  });
  none.hidden=total>0;
});
function openNav(o){
  side.classList.toggle("open",o);scrim.hidden=!o;
  navopen.setAttribute("aria-expanded",o?"true":"false");
}
navopen.addEventListener("click",function(){openNav(true);});
scrim.addEventListener("click",function(){openNav(false);});
function pinRail(o){
  side.classList.toggle("pinned",o);
  if(o)side.classList.remove("shut");
  railbtn.setAttribute("aria-expanded",o?"true":"false");
  railbtn.setAttribute("aria-label",o?UI.railClose:UI.railOpen);
}
pinRail(false);
railbtn.addEventListener("click",function(){pinRail(!side.classList.contains("pinned"));});
side.addEventListener("mouseleave",function(){side.classList.remove("shut");});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){openNav(false);pinRail(false);}});
side.addEventListener("click",function(e){
  if(!e.target.closest("a"))return;
  openNav(false);
  pinRail(false);
  side.classList.add("shut");
});

/* Lesson view. The book banner shows on lesson pages only. */
var bannerEl=document.querySelector(".banner"),bannerIO=null;
function armBanner(on){
  if(bannerIO){bannerIO.disconnect();bannerIO=null;}
  bannerEl.classList.remove("reveal","in");
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(!on||reduce||!("IntersectionObserver" in window))return;
  bannerEl.classList.add("reveal");
  bannerIO=new IntersectionObserver(function(es){
    if(es.some(function(e){return e.isIntersecting;})){bannerEl.classList.add("in");bannerIO.disconnect();bannerIO=null;}
  },{root:main,threshold:0.2});
  bannerIO.observe(bannerEl);
}
var main=document.getElementById("main"),lesson=document.getElementById("lesson"),cleanup=[];
function pagerLink(t,label){
  if(!t)return "<span></span>";
  return '<a class="btn" href="#'+t.slug+'"><small>'+esc(label)+'</small><span>'+esc(t.bn)+'</span></a>';
}
function para(t){return "<p>"+esc(t)+"</p>";}
function show(slug,scroll){
  bannerEl.hidden=false;
  armBanner(true);
  cleanup.forEach(function(f){f();});cleanup=[];
  var t=BY[slug],L=LESSONS[slug];
  var html='<header class="head"><div class="crumb">'+esc(t.cat)+'</div><h1 class="term">'+esc(title(t))+'</h1><p class="def">'+esc(L?L.def:t.meaning)+'</p></header>';
  if(L){
    html+='<section class="sec"><h2 class="label">'+esc(UI.labels.classroom)+'</h2>'+L.example.map(para).join("")+'</section>'+
      '<section class="panel demo"><h2 class="label">'+esc(UI.labels.demo)+'</h2><div id="demo"></div></section>'+
      '<section class="remember"><h2 class="label">'+esc(UI.labels.remember)+'</h2><p>'+esc(L.remember)+'</p></section>';
  }else{
    html+='<section class="panel soon"><h2 class="label">'+esc(UI.soonTitle)+'</h2><p>'+esc(UI.soonBody)+'</p></section>';
  }
  html+='<div class="pager">'+pagerLink(ALL[t.i-1],UI.prev)+pagerLink(ALL[t.i+1],UI.next)+'</div>';
  lesson.innerHTML=html;
  if(L){
    var box=document.getElementById("demo"),fn=DEMOS[L.demo.id];
    if(fn)fn(box,cleanup,L.demo);else box.textContent=UI.demoMissing;
  }
  document.title=title(t)+" | "+UI.brand;
  markCurrent(slug);
  if(scroll)main.scrollTop=0;
}
/* Home page */
function segments(str){
  if(window.Intl&&Intl.Segmenter){return Array.from(new Intl.Segmenter("bn",{granularity:"grapheme"}).segment(str),function(x){return x.segment;});}
  return Array.from(str);
}
/* Typewriter. Types grapheme clusters so Bengali conjuncts never break. Shows the speaker name after each quote. */
function typewriter(el,quotes){
  var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var text=el.querySelector(".typer-text"),cur=el.querySelector(".cursor"),by=el.querySelector(".qlive .qby");
  function label(q){return tpl(UI.quoteLabel,{q:q.q,by:q.by});}
  if(reduce){text.textContent=quotes[0].q;by.textContent=quotes[0].by;by.classList.add("on");cur.hidden=true;el.setAttribute("aria-label",label(quotes[0]));return;}
  var segs=quotes.map(function(q){return segments(q.q);}),li=0,n=0,timer=0;
  function draw(){text.textContent=segs[li].slice(0,n).join("");}
  function typeStep(){
    if(n===0){el.setAttribute("aria-label",label(quotes[li]));by.textContent=quotes[li].by;}
    n++;draw();
    if(n>=segs[li].length){by.classList.add("on");timer=setTimeout(eraseStep,3000);}else timer=setTimeout(typeStep,40);
  }
  function eraseStep(){
    by.classList.remove("on");
    n=Math.max(0,n-3);draw();
    if(n===0){li=(li+1)%quotes.length;timer=setTimeout(typeStep,500);}else timer=setTimeout(eraseStep,15);
  }
  typeStep();
  cleanup.push(function(){clearTimeout(timer);});
}
function showHome(scroll){
  cleanup.forEach(function(f){f();});cleanup=[];
  var first=ALL.filter(function(t){return LESSONS[t.slug];})[0];
  var cards=TERMS.map(function(c){
    return '<a class="card" href="#'+c.terms[0].slug+'"><span>'+esc(c.name)+'</span><svg class="card-arrow" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4 10h11M11 5l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg></a>';
  }).join("");
  var ghosts=UI.quotes.map(function(q){return '<div class="qghost" aria-hidden="true"><p class="qtext">'+esc(q.q)+'</p><p class="qby">'+esc(q.by)+'</p></div>';}).join("");
  lesson.innerHTML='<section class="hero"><h1 class="hero-title">'+esc(UI.brand)+'</h1>'+
    '<div class="quote" role="img"><div class="qlive" aria-hidden="true"><p class="qtext"><span class="typer-text"></span><span class="cursor"></span></p><p class="qby"></p></div>'+ghosts+'</div>'+
    '<a class="btn cta" href="#'+first.slug+'">'+esc(UI.start)+'</a></section>'+
    '<section><h2 class="label">'+esc(UI.catsTitle)+'</h2><div class="cards">'+cards+'</div></section>';
  typewriter(lesson.querySelector(".quote"),UI.quotes);
  bannerEl.hidden=true;
  armBanner(false);
  document.title=UI.docTitle;
  markCurrent(null);
  if(scroll)main.scrollTop=0;
}
function markCurrent(slug){
  nav.querySelectorAll("a[aria-current]").forEach(function(a){a.removeAttribute("aria-current");});
  if(!slug){homelink.setAttribute("aria-current","page");return;}
  homelink.removeAttribute("aria-current");
  var a=nav.querySelector('a[data-slug="'+slug+'"]');
  if(a){
    a.setAttribute("aria-current","page");
    var det=a.closest("details");if(det)det.open=true;
    try{a.scrollIntoView({block:"nearest"});}catch(err){}
  }
}
function route(initial){
  var h=decodeURIComponent(location.hash.slice(1));
  if(BY[h])show(h,!initial);else showHome(!initial);
}
window.addEventListener("hashchange",function(){route(false);});
route(true);
})();
