/* Showing data. Histogram with a bar width slider. */
(function(){
var SC=window.SC,clamp=SC.clamp,esc=SC.esc,tpl=SC.tpl;
var HIST=(function(){var R=SC.mulberry32(11),out=[],n=40,i,v;for(i=0;i<n;i++){v=62+12.5*SC.invNorm((i+0.5)/n)+(R()-0.5)*5;out.push(clamp(Math.round(v),0,100));}return out;})();

window.DEMOS.histogram=function(el,cleanup,cfg){
  var S=cfg.ui,w=10,sel=-1,H=290,ML=40,MR=14,MT=18,MB=50;
  el.innerHTML=
    '<div class="ctl"><label for="hw">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="hw" type="range" min="2" max="25" step="1" value="10"></div>'+
    SC.presets(S.presets,"w")+
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="chart-box"></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n a" data-k="nb"></div><div class="k">'+esc(S.barsLabel)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="top"></div><div class="k">'+esc(S.topLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),range=el.querySelector("#hw");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function geom(){var W=SC.width(box),nb=Math.ceil(101/w);return{W:W,pw:W-ML-MR,nb:nb,D:nb*w};}
  function counts(nb){var c=[],i;for(i=0;i<nb;i++)c.push(0);HIST.forEach(function(v){c[Math.floor(v/w)]++;});return c;}
  function render(){
    var g0=geom(),W=g0.W,pw=g0.pw,nb=g0.nb,D=g0.D,c=counts(nb),ph=H-MT-MB;
    var mx=Math.max.apply(null,c),ym=Math.max(4,mx+1),st=ym<=8?1:(ym<=16?2:5),t,v;
    ym=Math.ceil(ym/st)*st;
    var X=function(a){return ML+pw*a/D;},Y=function(n){return MT+ph*(1-n/ym);};
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    for(t=0;t<=ym;t+=st){g+='<line class="grid" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(t)+'" y2="'+Y(t)+'"/><text class="t" x="'+(ML-8)+'" y="'+(Y(t)+4)+'" text-anchor="end">'+t+'</text>';}
    c.forEach(function(n,i){
      var x0=X(i*w)+0.5,x1=X((i+1)*w)-0.5;
      if(n>0)g+='<rect class="hbar'+(i===sel?' hot':'')+'" x="'+x0+'" y="'+Y(n)+'" width="'+Math.max(1,x1-x0)+'" height="'+(Y(0)-Y(n))+'"/>';
      if(n>0&&x1-x0>=16)g+='<text class="t strong" x="'+((x0+x1)/2)+'" y="'+(Y(n)-5)+'" text-anchor="middle">'+n+'</text>';
    });
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/>';
    for(v=0;v<=D&&v<=100;v+=20){g+='<line class="axis" x1="'+X(v)+'" x2="'+X(v)+'" y1="'+Y(0)+'" y2="'+(Y(0)+5)+'"/><text class="t" x="'+X(v)+'" y="'+(Y(0)+20)+'" text-anchor="middle">'+v+'</text>';}
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='<text class="t strong" transform="translate(11 '+(MT+ph/2)+') rotate(-90)" text-anchor="middle">'+esc(S.yTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("val").textContent=tpl(S.value,{w:w});
    q("nb").textContent=nb;
    q("top").textContent=mx;
    var m;
    if(sel>=0&&sel<nb)m=tpl(S.pick,{n:c[sel],a:sel*w,b:Math.min((sel+1)*w-1,100)});
    else if(w<=4)m=S.narrow;
    else if(w>=18)m=S.wide;
    else m=S.good;
    q("msg").textContent=m;
  }
  function pick(e){
    var r=box.getBoundingClientRect(),g0=geom(),v=(e.clientX-r.left-ML)/g0.pw*g0.D,i=Math.floor(v/w);
    return(v>=0&&i>=0&&i<g0.nb)?i:-1;
  }
  box.addEventListener("pointermove",function(e){var i=pick(e);if(i!==sel){sel=i;render();}});
  box.addEventListener("pointerdown",function(e){var i=pick(e);if(i!==sel){sel=i;render();}});
  box.addEventListener("pointerleave",function(e){if(e.pointerType==="mouse"&&sel!==-1){sel=-1;render();}});
  range.addEventListener("input",function(){w=+range.value;sel=-1;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-w]");
    if(!b)return;
    w=+b.getAttribute("data-w");range.value=w;sel=-1;render();
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
