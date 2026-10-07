/* Describing data. Draggable dots on a number line, and a spread slider. */
(function(){
var SC=window.SC,clamp=SC.clamp,fmt1=SC.fmt1,esc=SC.esc,tpl=SC.tpl;

/* Dots on a number line with mean and median. */
window.DEMOS.dots=function(el,cleanup,cfg){
  var S=cfg.ui,START=cfg.start,MAXN=cfg.max;
  var s=START.slice(),drag=-1,L=20,RM=20,H=272;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="chart-box"></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n b" data-k="mean"></div><div class="k">'+esc(S.mean)+'</div></div>'+
      '<div class="stat"><div class="n a" data-k="median"></div><div class="k">'+esc(S.median)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="count"></div><div class="k">'+esc(S.count)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="add">'+esc(S.add)+'</button><button class="btn" type="button" data-act="reset">'+esc(S.reset)+'</button></div>';
  var box=el.querySelector(".chart-box");
  box.style.touchAction="none";
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function calc(){
    var sorted=s.slice().sort(function(a,b){return a-b;}),n=sorted.length;
    var mean=s.reduce(function(a,b){return a+b;},0)/n;
    var med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
    return{mean:mean,med:med,n:n};
  }
  function render(){
    var W=SC.width(box);
    var x=function(v){return L+(W-L-RM)*v/100;};
    var c=calc(),mx=x(c.med),ax=x(c.mean);
    var order=s.map(function(v,i){return i;}).sort(function(a,b){return s[a]-s[b];});
    var rows=[],pos=[];
    order.forEach(function(i){var px=x(s[i]),r=0;while(rows[r]!==undefined&&px-rows[r]<17)r++;rows[r]=px;pos[i]={px:px,r:r};});
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="group" aria-label="'+esc(S.aria)+'">';
    g+='<line class="axis" x1="'+L+'" x2="'+(W-RM)+'" y1="200" y2="200"/>';
    for(var v=0;v<=100;v+=20){g+='<line class="axis" x1="'+x(v)+'" x2="'+x(v)+'" y1="200" y2="206"/><text class="t" x="'+x(v)+'" y="222" text-anchor="middle">'+v+'</text>';}
    g+='<line class="medline" x1="'+mx+'" x2="'+mx+'" y1="38" y2="200"/>';
    g+='<path class="medmark" d="M'+(mx-7)+' 24 L'+(mx+7)+' 24 L'+mx+' 38 Z"/>';
    g+='<text class="t strong a" x="'+mx+'" y="16" text-anchor="'+SC.anchor(mx,W)+'">'+esc(S.median)+' '+fmt1(c.med)+'</text>';
    g+='<path class="meanmark" d="M'+ax+' 228 L'+(ax-7)+' 241 L'+(ax+7)+' 241 Z"/>';
    g+='<text class="t strong b" x="'+ax+'" y="262" text-anchor="'+SC.anchor(ax,W)+'">'+esc(S.mean)+' '+fmt1(c.mean)+'</text>';
    s.forEach(function(v,i){
      var p=pos[i];
      g+='<circle class="dot-s'+(i>=START.length?' extra':'')+'" data-i="'+i+'" cx="'+p.px+'" cy="'+(180-p.r*17)+'" r="8" tabindex="0" role="slider" aria-label="'+esc(tpl(S.sAria,{i:i+1}))+'" aria-valuemin="0" aria-valuemax="100" aria-valuenow="'+v+'"><title>'+esc(tpl(S.sTitle,{i:i+1,v:v}))+'</title></circle>';
    });
    g+='</svg>';
    box.innerHTML=g;
    q("mean").textContent=fmt1(c.mean);
    q("median").textContent=fmt1(c.med);
    q("count").textContent=c.n;
    var d=c.mean-c.med;
    q("msg").textContent=Math.abs(d)<1.5?S.close:(d<0?S.low:S.high);
    el.querySelector('[data-act="add"]').disabled=s.length>=MAXN;
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
    var r=box.getBoundingClientRect(),W=SC.width(box);
    s[drag]=clamp(Math.round(100*(e.clientX-r.left-L)/(W-L-RM)),0,100);
    render();
  });
  function end(){drag=-1;}
  box.addEventListener("pointerup",end);
  box.addEventListener("pointercancel",end);
  box.addEventListener("keydown",function(e){
    var t=e.target.closest&&e.target.closest("circle[data-i]");
    if(!t)return;
    var i=+t.getAttribute("data-i"),d=0;
    if(e.key==="ArrowLeft"||e.key==="ArrowDown")d=-1;else if(e.key==="ArrowRight"||e.key==="ArrowUp")d=1;else return;
    e.preventDefault();
    s[i]=clamp(s[i]+d*(e.shiftKey?5:1),0,100);
    render();
    var n=box.querySelector('circle[data-i="'+i+'"]');if(n)n.focus();
  });
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-act]");
    if(!b)return;
    if(b.getAttribute("data-act")==="add"&&s.length<MAXN)s.push(cfg.addValue);
    if(b.getAttribute("data-act")==="reset")s=START.slice();
    render();
  });
  render();
  SC.watch(box,cleanup,render);
};

/* A slider that changes the spread of a fixed set of dots around a mean. */
window.DEMOS.spread=function(el,cleanup,cfg){
  var S=cfg.ui,n=cfg.n,M=cfg.mean,z=[],i;
  for(i=0;i<n;i++)z.push(SC.invNorm((i+0.5)/n));
  var sdz=Math.sqrt(z.reduce(function(a,v){return a+v*v;},0)/(n-1));
  z=z.map(function(v){return v/sdz;});
  var sd=cfg.start,L=20,RM=20,H=252;
  el.innerHTML=
    '<div class="ctl"><label for="sdr">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="sdr" type="range" min="'+cfg.min+'" max="'+cfg.max+'" step="1" value="'+sd+'"></div>'+
    SC.presets(S.presets,"sd")+
    '<div class="chart-box"></div>'+
    '<div class="swatches"><span><i class="sw d"></i>'+esc(S.swIn)+'</span><span><i class="sw b"></i>'+esc(S.swOut)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n a" data-k="sd"></div><div class="k">'+esc(S.sdLabel)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="in"></div><div class="k">'+esc(S.inLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),range=el.querySelector("#sdr");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function render(){
    var W=SC.width(box);
    var x=function(v){return L+(W-L-RM)*v/100;};
    var vals=z.map(function(v){return M+sd*v;});
    var inBand=vals.filter(function(v){return Math.abs(v-M)<=sd;}).length;
    var step=12,cols={},maxStack=0;
    var pts=vals.map(function(v){var col=Math.round(x(v)/step);cols[col]=(cols[col]||0)+1;if(cols[col]>maxStack)maxStack=cols[col];return{col:col,k:cols[col]-1,v:v};});
    var sp=Math.min(step,150/Math.max(1,maxStack));
    var x1=x(M-sd),x2=x(M+sd);
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    g+='<rect class="band" x="'+x1+'" y="30" width="'+(x2-x1)+'" height="160"/>';
    g+='<line class="meanln" x1="'+x(M)+'" x2="'+x(M)+'" y1="22" y2="190"/>';
    g+='<text class="t strong" x="'+x(M)+'" y="14" text-anchor="middle">'+esc(tpl(S.meanLabel,{m:M}))+'</text>';
    g+='<line class="axis" x1="'+L+'" x2="'+(W-RM)+'" y1="190" y2="190"/>';
    for(var v=0;v<=100;v+=20){g+='<line class="axis" x1="'+x(v)+'" x2="'+x(v)+'" y1="190" y2="195"/><text class="t" x="'+x(v)+'" y="212" text-anchor="middle">'+v+'</text>';}
    pts.forEach(function(p){
      g+='<circle class="'+(Math.abs(p.v-M)<=sd?'sd-in':'sd-out')+'" cx="'+(p.col*step)+'" cy="'+(184-p.k*sp)+'" r="5.5"/>';
    });
    g+='<path class="brk" d="M'+x1+' 218 L'+x1+' 224 L'+x2+' 224 L'+x2+' 218"/>';
    g+='<text class="t a strong" x="'+x(M)+'" y="242" text-anchor="middle">'+esc(S.brace)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("val").textContent=tpl(S.value,{v:sd});
    q("sd").textContent=sd;
    q("in").textContent=tpl(S.inValue,{k:inBand,n:n});
    var m=sd<=5?S.tight:(sd<=12?S.normal:S.wide);
    q("msg").textContent=m+" "+tpl(S.share,{p:Math.round(100*inBand/n)});
  }
  range.addEventListener("input",function(){sd=+range.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-sd]");
    if(!b)return;
    sd=+b.getAttribute("data-sd");range.value=sd;render();
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
