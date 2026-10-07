/* Relationships and regression. Scatter with a correlation slider, and scatter with draggable dots and a best-fit line. */
(function(){
var SC=window.SC,clamp=SC.clamp,fmt1=SC.fmt1,esc=SC.esc,tpl=SC.tpl;

var CORR=(function(){
  var R=SC.mulberry32(7),n=40,z1=[],z2=[],i;
  function g(){var u=R(),v=R();if(u<1e-9)u=1e-9;return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);}
  function std(a){var m=a.reduce(function(s,v){return s+v;},0)/a.length;a=a.map(function(v){return v-m;});var sd=Math.sqrt(a.reduce(function(s,v){return s+v*v;},0)/(a.length-1));return a.map(function(v){return v/sd;});}
  for(i=0;i<n;i++){z1.push(g());z2.push(g());}
  z1=std(z1);z2=std(z2);
  var c12=z1.reduce(function(s,v,k){return s+v*z2[k];},0)/(n-1);
  z2=std(z2.map(function(v,k){return v-c12*z1[k];}));
  return{z1:z1,z2:z2,n:n};
})();

function fmtR(r){return((r>0?"+":"")+r.toFixed(2)).replace("-","−");}
function describeR(r,W){
  var a=Math.abs(r);
  if(a<0.1)return W.none;
  var w=a<0.3?"weak":a<0.6?"mod":a<0.85?"strong":"vstrong";
  return W[w+(r>0?"Pos":"Neg")];
}

window.DEMOS["scatter-corr"]=function(el,cleanup,cfg){
  var S=cfg.ui,r=0.8,H=310,ML=48,MR=16,MT=14,MB=52;
  el.innerHTML=
    '<div class="ctl"><label for="rr">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="rr" type="range" min="-1" max="1" step="0.05" value="0.8"></div>'+
    SC.presets(S.presets,"r")+
    '<div class="chart-box"></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n a" data-k="r"></div><div class="k">'+esc(S.rLabel)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="word" style="font-size:1.35rem"></div><div class="k">'+esc(S.wordLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),range=el.querySelector("#rr");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function render(){
    var W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB;
    var X=function(h){return ML+pw*h/20;},Y=function(v){return MT+ph*(1-v/100);};
    var k=Math.sqrt(Math.max(0,1-r*r)),pts=[],i;
    for(i=0;i<CORR.n;i++){var a=CORR.z1[i];pts.push({h:10+3*a,s:60+12*(r*a+k*CORR.z2[i])});}
    var mh=0,ms=0;pts.forEach(function(p){mh+=p.h;ms+=p.s;});mh/=pts.length;ms/=pts.length;
    var sxy=0,sxx=0;pts.forEach(function(p){sxy+=(p.h-mh)*(p.s-ms);sxx+=(p.h-mh)*(p.h-mh);});
    var b=sxy/sxx,a0=ms-b*mh;
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    g+='<defs><clipPath id="plotclip"><rect x="'+ML+'" y="'+MT+'" width="'+pw+'" height="'+ph+'"/></clipPath></defs>';
    for(var v=0;v<=100;v+=20){g+='<line class="grid" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="t" x="'+(ML-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';}
    for(var h=0;h<=20;h+=5){g+='<text class="t" x="'+X(h)+'" y="'+(H-MB+20)+'" text-anchor="middle">'+h+'</text>';}
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/><line class="axis" x1="'+ML+'" x2="'+ML+'" y1="'+MT+'" y2="'+Y(0)+'"/>';
    g+='<g clip-path="url(#plotclip)"><line class="fit" x1="'+X(0)+'" x2="'+X(20)+'" y1="'+Y(a0)+'" y2="'+Y(a0+b*20)+'"/>';
    pts.forEach(function(p){g+='<circle class="pt" cx="'+X(p.h)+'" cy="'+Y(p.s)+'" r="5"/>';});
    g+='</g>';
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='<text class="t strong" transform="translate(13 '+(MT+ph/2)+') rotate(-90)" text-anchor="middle">'+esc(S.yTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("val").textContent=fmtR(r);
    q("r").textContent=fmtR(r);
    q("word").textContent=describeR(r,S.words);
    var m=r>=0.1?S.pos:(r<=-0.1?S.neg:S.zero);
    if(Math.abs(r)>=0.99)m+=S.exact;
    q("msg").textContent=m;
  }
  range.addEventListener("input",function(){r=+range.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-r]");
    if(!b)return;
    r=+b.getAttribute("data-r");range.value=r;render();
  });
  render();
  SC.watch(box,cleanup,render);
};

window.DEMOS["scatter-reg"]=function(el,cleanup,cfg){
  var S=cfg.ui,START=cfg.start;
  var pts=START.map(function(p){return p.slice();}),gaps=true,drag=-1,H=330,ML=48,MR=16,MT=14,MB=52;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="chart-box"></div>'+
    '<div class="swatches"><span><i class="sw d"></i>'+esc(S.swDot)+'</span><span><i class="sw b"></i>'+esc(S.swLine)+'</span><span><i class="sw f"></i>'+esc(S.swGap)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n b" data-k="b"></div><div class="k">'+esc(S.bLabel)+'</div></div>'+
      '<div class="stat"><div class="n a" data-k="r2"></div><div class="k">'+esc(S.r2Label)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="pred"></div><div class="k">'+esc(S.predLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="gaps" aria-pressed="true">'+esc(S.showGaps)+'</button><button class="btn" type="button" data-act="reset">'+esc(S.reset)+'</button></div>';
  var box=el.querySelector(".chart-box");
  box.style.touchAction="none";
  function q(kk){return el.querySelector('[data-k="'+kk+'"]');}
  function fit(){
    var n=pts.length,mh=0,ms=0,sxy=0,sxx=0,syy=0;
    pts.forEach(function(p){mh+=p[0];ms+=p[1];});mh/=n;ms/=n;
    pts.forEach(function(p){sxy+=(p[0]-mh)*(p[1]-ms);sxx+=(p[0]-mh)*(p[0]-mh);syy+=(p[1]-ms)*(p[1]-ms);});
    if(sxx<1e-6)return null;
    return{b:sxy/sxx,a:ms-(sxy/sxx)*mh,r2:syy<1e-9?0:(sxy*sxy)/(sxx*syy)};
  }
  function render(){
    var W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB,v,h;
    var X=function(a){return ML+pw*a/20;},Y=function(a){return MT+ph*(1-a/100);};
    var f=fit();
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="group" aria-label="'+esc(S.aria)+'">';
    g+='<defs><clipPath id="regclip"><rect x="'+ML+'" y="'+MT+'" width="'+pw+'" height="'+ph+'"/></clipPath></defs>';
    for(v=0;v<=100;v+=20){g+='<line class="grid" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(v)+'" y2="'+Y(v)+'"/><text class="t" x="'+(ML-8)+'" y="'+(Y(v)+4)+'" text-anchor="end">'+v+'</text>';}
    for(h=0;h<=20;h+=5){g+='<text class="t" x="'+X(h)+'" y="'+(H-MB+20)+'" text-anchor="middle">'+h+'</text>';}
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/><line class="axis" x1="'+ML+'" x2="'+ML+'" y1="'+MT+'" y2="'+Y(0)+'"/>';
    g+='<g clip-path="url(#regclip)">';
    if(f){
      if(gaps)pts.forEach(function(p){g+='<line class="res" x1="'+X(p[0])+'" x2="'+X(p[0])+'" y1="'+Y(p[1])+'" y2="'+Y(f.a+f.b*p[0])+'"/>';});
      g+='<line class="fit" x1="'+X(0)+'" x2="'+X(20)+'" y1="'+Y(f.a)+'" y2="'+Y(f.a+f.b*20)+'"/>';
    }
    g+='</g>';
    pts.forEach(function(p,i){
      var lab=esc(tpl(S.sAria,{i:i+1,h:fmt1(p[0]),s:Math.round(p[1])}));
      g+='<circle class="dot-s" data-i="'+i+'" cx="'+X(p[0])+'" cy="'+Y(p[1])+'" r="8" tabindex="0" role="slider" aria-label="'+lab+'" aria-valuenow="'+Math.round(p[1])+'" aria-valuemin="0" aria-valuemax="100"><title>'+lab+'</title></circle>';
    });
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='<text class="t strong" transform="translate(13 '+(MT+ph/2)+') rotate(-90)" text-anchor="middle">'+esc(S.yTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    var m;
    if(f){
      q("b").textContent=(f.b>0?"+":"")+fmt1(f.b).replace("-","−");
      q("r2").textContent=Math.round(f.r2*100)+"%";
      q("pred").textContent=Math.round(f.a+f.b*10);
      m=tpl(f.b>=0?S.msgUp:S.msgDown,{b:fmt1(Math.abs(f.b))})+tpl(S.msgR2,{r:Math.round(f.r2*100)});
      if(f.r2>0.85)m+=S.tight;
      else if(f.r2<0.3)m+=S.loose;
    }else{
      q("b").textContent="-";q("r2").textContent="-";q("pred").textContent="-";
      m=S.noLine;
    }
    q("msg").textContent=m;
    el.querySelector('[data-act="gaps"]').setAttribute("aria-pressed",gaps?"true":"false");
  }
  box.addEventListener("pointerdown",function(e){
    var t=e.target.closest&&e.target.closest("circle[data-i]");
    if(!t)return;
    drag=+t.getAttribute("data-i");
    try{box.setPointerCapture(e.pointerId);}catch(err){}
    e.preventDefault();
  });
  box.addEventListener("pointermove",function(e){
    if(drag<0)return;
    var r=box.getBoundingClientRect(),W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB;
    pts[drag][0]=clamp(Math.round(20*(e.clientX-r.left-ML)/pw*2)/2,0,20);
    pts[drag][1]=clamp(Math.round(100*(1-(e.clientY-r.top-MT)/ph)),0,100);
    render();
  });
  function end(){drag=-1;}
  box.addEventListener("pointerup",end);
  box.addEventListener("pointercancel",end);
  box.addEventListener("keydown",function(e){
    var t=e.target.closest&&e.target.closest("circle[data-i]");
    if(!t)return;
    var i=+t.getAttribute("data-i"),dx=0,dy=0;
    if(e.key==="ArrowLeft")dx=-0.5;else if(e.key==="ArrowRight")dx=0.5;else if(e.key==="ArrowUp")dy=1;else if(e.key==="ArrowDown")dy=-1;else return;
    e.preventDefault();
    pts[i][0]=clamp(pts[i][0]+dx,0,20);pts[i][1]=clamp(pts[i][1]+dy*(e.shiftKey?5:1),0,100);
    render();
    var n=box.querySelector('circle[data-i="'+i+'"]');if(n)n.focus();
  });
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-act]");
    if(!b)return;
    if(b.getAttribute("data-act")==="gaps")gaps=!gaps;
    if(b.getAttribute("data-act")==="reset")pts=START.map(function(p){return p.slice();});
    render();
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
