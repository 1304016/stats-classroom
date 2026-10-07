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

/* Term list */
var ALL=[],BY={};
TERMS.forEach(function(c){c.terms.forEach(function(t){t.cat=c.name;t.i=ALL.length;ALL.push(t);BY[t.slug]=t;});});
function title(t){return t.bn+" ("+t.en+")";}

var nav=document.getElementById("nav"),side=document.getElementById("side"),scrim=document.getElementById("scrim");
var navopen=document.getElementById("navopen"),qbox=document.getElementById("q"),none=document.getElementById("none");
var railbtn=document.getElementById("railbtn");
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
nav.addEventListener("click",function(e){
  if(!e.target.closest("a"))return;
  openNav(false);
  pinRail(false);
  side.classList.add("shut");
});

/* Lesson view */
var main=document.getElementById("main"),lesson=document.getElementById("lesson"),cleanup=[];
function pagerLink(t,label){
  if(!t)return "<span></span>";
  return '<a class="btn" href="#'+t.slug+'"><small>'+esc(label)+'</small><span>'+esc(t.bn)+'</span></a>';
}
function para(t){return "<p>"+esc(t)+"</p>";}
function show(slug,scroll){
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
  nav.querySelectorAll("a[aria-current]").forEach(function(a){a.removeAttribute("aria-current");});
  var a=nav.querySelector('a[data-slug="'+slug+'"]');
  if(a){
    a.setAttribute("aria-current","page");
    var det=a.closest("details");if(det)det.open=true;
    try{a.scrollIntoView({block:"nearest"});}catch(err){}
  }
  if(scroll)main.scrollTop=0;
}
function route(initial){
  var h=decodeURIComponent(location.hash.slice(1));
  show(BY[h]?h:"mean",!initial);
}
window.addEventListener("hashchange",function(){route(false);});
route(true);
})();
