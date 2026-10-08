/* Describing data. Draggable dots on a number line, and a spread slider. */
(function(){
var SC=window.SC,clamp=SC.clamp,fmt1=SC.fmt1,n2=SC.n2,esc=SC.esc,tpl=SC.tpl;

/* Dots on a number line. One template for mean, median, mode, range, percentile, quartile, IQR and outlier.
   cfg.markers picks what is drawn, cfg.stats picks the number boxes, cfg.rule picks the live message. */
window.DEMOS.dots=function(el,cleanup,cfg){
  var S=cfg.ui,START=cfg.start,MAXN=cfg.max||9,AX=cfg.axis||{min:0,max:100,step:20};
  var MK=cfg.markers||["median","mean"],RULE=cfg.rule||"meanMedian",STATS=cfg.stats||["mean","median","count"];
  var CLS={mean:"b",median:"a",mode:"a",range:"b",pval:"a",iqr:"b",outCount:"b"};
  var s=START.slice(),drag=-1,pp=cfg.p||90,L=20,RM=20,H=272,hasAdd=cfg.addValue!==undefined;
  function has(k){return MK.indexOf(k)>-1;}
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    (cfg.pSlider?'<div class="ctl"><label for="pr">'+esc(S.pLabel)+' <span class="val" data-k="pv"></span></label><input id="pr" type="range" min="1" max="99" step="1" value="'+pp+'"></div>':'')+
    '<div class="chart-box"></div>'+
    '<div class="stats" aria-live="polite">'+STATS.map(function(k){
      return '<div class="stat"><div class="n '+(CLS[k]||"")+'" data-k="'+k+'"></div><div class="k">'+esc(S[k])+'</div></div>';}).join("")+'</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls">'+(hasAdd?'<button class="btn" type="button" data-act="add">'+esc(S.add)+'</button>':'')+'<button class="btn" type="button" data-act="reset">'+esc(S.reset)+'</button></div>';
  var box=el.querySelector(".chart-box");
  box.style.touchAction="none";
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function calc(){
    var sorted=s.slice().sort(function(a,b){return a-b;}),n=sorted.length,c={},mc=0,k;
    var mean=s.reduce(function(a,b){return a+b;},0)/n;
    var med=n%2?sorted[(n-1)/2]:(sorted[n/2-1]+sorted[n/2])/2;
    s.forEach(function(v){c[v]=(c[v]||0)+1;if(c[v]>mc)mc=c[v];});
    var modes=mc>1?Object.keys(c).filter(function(v){return c[v]===mc;}).map(Number).sort(function(a,b){return a-b;}):[];
    var rank=Math.max(1,Math.ceil(pp/100*n)),pv=sorted[rank-1];
    var under=sorted.filter(function(v){return v<=pv;}).length;
    /* Quartiles are the medians of the lower and upper halves. With an odd count the middle value is left out. */
    function medOf(a){var m=a.length;return m%2?a[(m-1)/2]:(a[m/2-1]+a[m/2])/2;}
    var half=Math.floor(n/2),q1=medOf(sorted.slice(0,half)),q3=medOf(sorted.slice(n-half)),iqr=q3-q1,lf=q1-1.5*iqr,uf=q3+1.5*iqr;
    var out=sorted.filter(function(v){return v<lf||v>uf;});
    return{mean:mean,med:med,n:n,mc:mc,modes:modes,min:sorted[0],max:sorted[n-1],pv:pv,under:under,q1:q1,q3:q3,iqr:iqr,lf:lf,uf:uf,out:out};
  }
  function render(){
    var W=SC.width(box),span=AX.max-AX.min;
    var x=function(v){return L+(W-L-RM)*(v-AX.min)/span;};
    var c=calc(),mx=x(c.med),ax=x(c.mean);
    var order=s.map(function(v,i){return i;}).sort(function(a,b){return s[a]-s[b];});
    var rows=[],pos=[];
    order.forEach(function(i){var px=x(s[i]),r=0;while(rows[r]!==undefined&&px-rows[r]<17)r++;rows[r]=px;pos[i]={px:px,r:r};});
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="group" aria-label="'+esc(S.aria)+'">';
    if(has("percentile"))g+='<rect class="band" x="'+x(AX.min)+'" y="30" width="'+(x(c.pv)-x(AX.min))+'" height="170"/>';
    if(has("iqr"))g+='<rect class="band" x="'+x(c.q1)+'" y="30" width="'+(x(c.q3)-x(c.q1))+'" height="170"/>';
    if(has("mode"))c.modes.forEach(function(v){g+='<rect class="band" x="'+(x(v)-10)+'" y="30" width="20" height="170"/>';});
    g+='<line class="axis" x1="'+L+'" x2="'+(W-RM)+'" y1="200" y2="200"/>';
    for(var v=AX.min;v<=AX.max;v+=AX.step){g+='<line class="axis" x1="'+x(v)+'" x2="'+x(v)+'" y1="200" y2="206"/><text class="t" x="'+x(v)+'" y="222" text-anchor="middle">'+v+'</text>';}
    if(has("median")){
      g+='<line class="medline" x1="'+mx+'" x2="'+mx+'" y1="38" y2="200"/>';
      g+='<path class="medmark" d="M'+(mx-7)+' 24 L'+(mx+7)+' 24 L'+mx+' 38 Z"/>';
      g+='<text class="t strong a" x="'+mx+'" y="16" text-anchor="'+SC.anchor(mx,W)+'">'+esc(S.median)+' '+fmt1(c.med)+'</text>';
    }
    if(has("mean")){
      g+='<path class="meanmark" d="M'+ax+' 228 L'+(ax-7)+' 241 L'+(ax+7)+' 241 Z"/>';
      g+='<text class="t strong b" x="'+ax+'" y="262" text-anchor="'+SC.anchor(ax,W)+'">'+esc(S.mean)+' '+fmt1(c.mean)+'</text>';
    }
    if(has("q13"))[["q1",c.q1],["q3",c.q3]].forEach(function(q){
      var qx=x(q[1]);
      g+='<line class="medline" x1="'+qx+'" x2="'+qx+'" y1="38" y2="200"/>';
      g+='<path class="medmark" d="M'+(qx-7)+' 24 L'+(qx+7)+' 24 L'+qx+' 38 Z"/>';
      g+='<text class="t strong a" x="'+qx+'" y="16" text-anchor="'+SC.anchor(qx,W)+'">'+esc(S[q[0]])+' '+n2(q[1])+'</text>';
    });
    if(has("q2")){
      g+='<line class="medline" x1="'+mx+'" x2="'+mx+'" y1="38" y2="200"/>';
      g+='<path class="medmark" d="M'+mx+' 228 L'+(mx-7)+' 241 L'+(mx+7)+' 241 Z"/>';
      g+='<text class="t strong a" x="'+mx+'" y="262" text-anchor="'+SC.anchor(mx,W)+'">'+esc(S.median)+' '+n2(c.med)+'</text>';
    }
    if(has("iqr")){
      var i1=x(c.q1),i2=x(c.q3);
      g+='<path class="brk" d="M'+i1+' 228 L'+i1+' 236 L'+i2+' 236 L'+i2+' 228"/>';
      g+='<text class="t strong a" x="'+((i1+i2)/2)+'" y="258" text-anchor="middle">'+esc(tpl(S.iqrMark,{v:n2(c.iqr)}))+'</text>';
    }
    if(has("fence"))[["lowF",c.lf],["upF",c.uf]].forEach(function(f){
      if(f[1]<AX.min||f[1]>AX.max)return;
      var fx=x(f[1]);
      g+='<line class="truth" x1="'+fx+'" x2="'+fx+'" y1="38" y2="200"/>';
      g+='<text class="t strong" x="'+fx+'" y="262" text-anchor="'+(f[0]==="lowF"?(fx<110?"start":"end"):(fx>W-110?"end":"start"))+'">'+esc(tpl(S[f[0]],{v:n2(f[1])}))+'</text>';
    });
    if(has("mode"))c.modes.forEach(function(v){g+='<text class="t strong a" x="'+x(v)+'" y="16" text-anchor="'+SC.anchor(x(v),W)+'">'+esc(S.mode)+' '+v+'</text>';});
    if(has("range")){
      var x1=x(c.min),x2=x(c.max);
      g+='<path class="brk" d="M'+x1+' 228 L'+x1+' 236 L'+x2+' 236 L'+x2+' 228"/>';
      g+='<text class="t strong a" x="'+((x1+x2)/2)+'" y="258" text-anchor="middle">'+esc(tpl(S.rangeMark,{r:c.max-c.min}))+'</text>';
    }
    if(has("percentile")){
      var px=x(c.pv);
      g+='<line class="medline" x1="'+px+'" x2="'+px+'" y1="38" y2="200"/>';
      g+='<path class="medmark" d="M'+(px-7)+' 24 L'+(px+7)+' 24 L'+px+' 38 Z"/>';
      g+='<text class="t strong a" x="'+px+'" y="16" text-anchor="'+SC.anchor(px,W)+'">'+esc(tpl(S.pMark,{p:pp,v:c.pv}))+'</text>';
    }
    s.forEach(function(v,i){
      var p=pos[i],hit=(has("mode")&&c.modes.indexOf(v)>-1)||(has("range")&&(v===c.min||v===c.max))||(has("fence")&&(v<c.lf||v>c.uf));
      g+='<circle class="dot-s'+(i>=START.length?' extra':'')+(hit?' hit':'')+'" data-i="'+i+'" cx="'+p.px+'" cy="'+(180-p.r*17)+'" r="8" tabindex="0" role="slider" aria-label="'+esc(tpl(S.sAria,{i:i+1}))+'" aria-valuemin="'+AX.min+'" aria-valuemax="'+AX.max+'" aria-valuenow="'+v+'"><title>'+esc(tpl(S.sTitle,{i:i+1,v:v}))+'</title></circle>';
    });
    g+='</svg>';
    box.innerHTML=g;
    var vals={mean:fmt1(c.mean),median:fmt1(c.med),count:c.n,mode:c.modes.length?c.modes.join(", "):S.none,modeCount:c.mc,min:c.min,max:c.max,range:c.max-c.min,pval:c.pv,pcount:tpl(S.pcountValue||"",{k:c.under,n:c.n}),q1:n2(c.q1),q3:n2(c.q3),iqr:n2(c.iqr),lfence:n2(c.lf),ufence:n2(c.uf),outCount:c.out.length};
    STATS.forEach(function(k){q(k).textContent=vals[k];});
    if(cfg.pSlider)q("pv").textContent=tpl(S.pValue,{p:pp});
    var m,d=c.mean-c.med,r=c.max-c.min;
    if(RULE==="mode"){
      m=!c.modes.length?S.noMode:(c.modes.length===1?tpl(S.oneMode,{v:c.modes[0],c:c.mc}):tpl(S.manyMode,{vs:c.modes.join(" আর "),c:c.mc}));
    }else if(RULE==="range"){
      m=tpl(r<=cfg.tightAt?S.tight:(r>=cfg.wideAt?S.wide:S.mid),{r:r,min:c.min,max:c.max});
    }else if(RULE==="quartile"){
      m=tpl(S.qMsg,{n:c.n,q1:n2(c.q1),q2:n2(c.med),q3:n2(c.q3)});
    }else if(RULE==="iqr"){
      m=tpl(S.iqrMsg,{q1:n2(c.q1),q3:n2(c.q3),iqr:n2(c.iqr),r:r});
    }else if(RULE==="outlier"){
      m=tpl(c.out.length?S.hasOut:S.noOut,{vs:c.out.join(", "),lf:n2(c.lf),uf:n2(c.uf)});
    }else if(RULE==="percentile"){
      m=tpl(S.pMsg,{p:pp,v:c.pv,k:c.under,n:c.n,pc:Math.round(100*c.under/c.n)});
    }else{
      m=Math.abs(d)<1.5?S.close:(d<0?S.low:S.high);
      if(c.n%2===0&&S.evenNote)m+=" "+S.evenNote;
    }
    q("msg").textContent=m;
    if(hasAdd)el.querySelector('[data-act="add"]').disabled=s.length>=MAXN;
  }
  function val(e){
    var r=box.getBoundingClientRect(),W=SC.width(box);
    return clamp(Math.round(AX.min+(AX.max-AX.min)*(e.clientX-r.left-L)/(W-L-RM)),AX.min,AX.max);
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
    s[drag]=val(e);
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
    s[i]=clamp(s[i]+d*(e.shiftKey?5:1),AX.min,AX.max);
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
  if(cfg.pSlider){var pr=el.querySelector("#pr");pr.addEventListener("input",function(){pp=+pr.value;render();});}
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
  M=cfg.mean;
  el.innerHTML=
    '<div class="ctl"><label for="sdr">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="sdr" type="range" min="'+cfg.min+'" max="'+cfg.max+'" step="1" value="'+sd+'"></div>'+
    (cfg.meanSlider?'<div class="ctl"><label for="mnr">'+esc(S.meanSliderLabel)+' <span class="val" data-k="mval"></span></label><input id="mnr" type="range" min="'+cfg.meanMin+'" max="'+cfg.meanMax+'" step="1" value="'+M+'"></div>':'')+
    SC.presets(S.presets,"sd")+
    '<div class="chart-box"></div>'+
    '<div class="swatches"><span><i class="sw d"></i>'+esc(S.swIn)+'</span><span><i class="sw b"></i>'+esc(S.swOut)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+
      (cfg.showCv?'<div class="stat"><div class="n b" data-k="cv"></div><div class="k">'+esc(S.cvLabel)+'</div></div>':'')+
      (cfg.showVar?'<div class="stat"><div class="n b" data-k="var"></div><div class="k">'+esc(S.varLabel)+'</div></div>':'')+
      '<div class="stat"><div class="n a" data-k="sd"></div><div class="k">'+esc(S.sdLabel)+'</div></div>'+
      (cfg.showCv?'':'<div class="stat"><div class="n" data-k="in"></div><div class="k">'+esc(S.inLabel)+'</div></div>')+
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
    var vr=Math.round(vals.reduce(function(a,v){return a+(v-M)*(v-M);},0)/(n-1));
    if(cfg.showVar)q("var").textContent=vr;
    var cv=Math.round(1000*sd/M)/10;
    if(cfg.showCv)q("cv").textContent=cv+"%";
    if(cfg.meanSlider)q("mval").textContent=tpl(S.meanSliderValue,{m:M});
    if(!cfg.showCv)q("in").textContent=tpl(S.inValue,{k:inBand,n:n});
    var m=cfg.showCv?(cv<=cfg.cvLow?S.tight:(cv>=cfg.cvHigh?S.wide:S.normal)):(sd<=5?S.tight:(sd<=12?S.normal:S.wide));
    q("msg").textContent=m+" "+(cfg.showCv?tpl(S.cvNote,{sd:sd,m:M,cv:cv}):cfg.showVar?tpl(S.varNote,{sd:sd,v:vr}):tpl(S.share,{p:Math.round(100*inBand/n)}));
  }
  range.addEventListener("input",function(){sd=+range.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-sd]");
    if(!b)return;
    var v=b.getAttribute("data-sd");
    if(cfg.meanSlider){var ms=v.split(",");M=+ms[0];sd=+ms[1];el.querySelector("#mnr").value=M;}else sd=+v;
    range.value=sd;render();
  });
  if(cfg.meanSlider){var mr=el.querySelector("#mnr");mr.addEventListener("input",function(){M=+mr.value;render();});}
  render();
  SC.watch(box,cleanup,render);
};
})();
