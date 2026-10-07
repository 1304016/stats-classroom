/* Drawing conclusions. Coin p-value picture and confidence interval simulation. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl;

var BIN=(function(){var c=[1],k;for(k=1;k<=20;k++)c[k]=c[k-1]*(20-k+1)/k;return c.map(function(v){return v/1048576;});})();
function pTwoSided(obs){var d=Math.abs(obs-10),p=0;for(var k=0;k<=20;k++){if(Math.abs(k-10)>=d)p+=BIN[k];}return Math.min(1,p);}

window.DEMOS["coin-p"]=function(el,cleanup,cfg){
  var S=cfg.ui,heads=15,H=270,ML=46,MR=12,MT=14,MB=50;
  el.innerHTML=
    '<div class="ctl"><label for="hr">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="hr" type="range" min="0" max="20" step="1" value="15"></div>'+
    SC.presets(S.presets,"h")+
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="chart-box"></div>'+
    '<div class="swatches"><span><i class="sw c"></i>'+esc(S.swYours)+'</span><span><i class="sw b"></i>'+esc(S.swExt)+'</span><span><i class="sw a"></i>'+esc(S.swLess)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n" data-k="h"></div><div class="k">'+esc(S.headsLabel)+'</div></div>'+
      '<div class="stat"><div class="n b" data-k="p"></div><div class="k">'+esc(S.pLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),range=el.querySelector("#hr");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function render(){
    var W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB,YM=0.18;
    var Y=function(p){return MT+ph*(1-p/YM);};
    var slot=pw/21,bw=slot*0.78,d=Math.abs(heads-10),p=pTwoSided(heads),k;
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    [0,0.05,0.10,0.15].forEach(function(t){g+='<line class="grid" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(t)+'" y2="'+Y(t)+'"/><text class="t" x="'+(ML-8)+'" y="'+(Y(t)+4)+'" text-anchor="end">'+Math.round(t*100)+'%</text>';});
    for(k=0;k<=20;k++){
      var bx=ML+slot*k+(slot-bw)/2,ext=Math.abs(k-10)>=d;
      g+='<rect class="bar'+(ext?' ext':'')+(k===heads?' obs':'')+'" x="'+bx+'" y="'+Y(BIN[k])+'" width="'+bw+'" height="'+(Y(0)-Y(BIN[k]))+'"/>';
      if(k%2===0)g+='<text class="t" x="'+(bx+bw/2)+'" y="'+(Y(0)+18)+'" text-anchor="middle">'+k+'</text>';
    }
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/>';
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-8)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("val").textContent=heads;
    q("h").textContent=heads;
    q("p").textContent=p>=0.001?p.toFixed(3):S.pLess;
    var m;
    if(heads===10)m=S.exact;
    else if(p>=0.05)m=tpl(S.common,{n:Math.round(p*100)});
    else if(p>=0.01)m=tpl(S.rare,{n:Math.round(p*100)});
    else m=S.rareLow;
    q("msg").textContent=m+" "+(p>=0.001?tpl(S.pEq,{p:p.toFixed(3)}):S.pLt);
  }
  range.addEventListener("input",function(){heads=+range.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-h]");
    if(!b)return;
    heads=+b.getAttribute("data-h");range.value=heads;render();
  });
  render();
  SC.watch(box,cleanup,render);
};

function genSamples(rand,N,K,TRUE,SDP){
  var out=[],j,m,u,v,s1,s2,mean,sd,x;
  for(j=0;j<K;j++){
    s1=0;s2=0;
    for(m=0;m<N;m++){
      u=rand();v=rand();if(u<1e-9)u=1e-9;
      x=TRUE+SDP*Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);
      s1+=x;s2+=x*x;
    }
    mean=s1/N;sd=Math.sqrt(Math.max(0,(s2-N*mean*mean)/(N-1)));
    out.push({m:mean,sd:sd});
  }
  return out;
}

window.DEMOS.ci=function(el,cleanup,cfg){
  var S=cfg.ui,N=25,K=25,TRUE=165,SDP=8,T={80:1.318,90:1.711,95:2.064,99:2.797},level=95;
  var samples=genSamples(SC.mulberry32(11),N,K,TRUE,SDP);
  var ML=16,MR=16,MT=30,MB=50,ROW=13,LO=154,HI=176,H=MT+K*ROW+MB;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    SC.presets([80,90,95,99].map(function(v){return[v,tpl(S.level,{lv:v})];}),"lv",level)+
    '<div class="chart-box"></div>'+
    '<div class="swatches"><span><i class="sw d"></i>'+esc(S.swHit)+'</span><span><i class="sw b"></i>'+esc(S.swMiss)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n a" data-k="hits"></div><div class="k">'+esc(S.hitsLabel)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="lv"></div><div class="k">'+esc(S.lvLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="new">'+esc(S.newSamples)+'</button></div>';
  var box=el.querySelector(".chart-box");
  function q(kk){return el.querySelector('[data-k="'+kk+'"]');}
  function render(){
    var W=SC.width(box),pw=W-ML-MR,hits=0,v;
    var X=function(a){return ML+pw*(a-LO)/(HI-LO);};
    var base=MT+K*ROW+4;
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    g+='<line class="truth" x1="'+X(TRUE)+'" x2="'+X(TRUE)+'" y1="'+(MT-8)+'" y2="'+base+'"/>';
    g+='<text class="t strong" x="'+X(TRUE)+'" y="'+(MT-14)+'" text-anchor="middle">'+esc(tpl(S.truth,{v:TRUE}))+'</text>';
    samples.forEach(function(s,i){
      var h=T[level]*s.sd/Math.sqrt(N),hit=Math.abs(s.m-TRUE)<=h,y=MT+ROW*i+ROW/2;
      if(hit)hits++;
      g+='<line class="ci'+(hit?'':' miss')+'" x1="'+X(s.m-h)+'" x2="'+X(s.m+h)+'" y1="'+y+'" y2="'+y+'"/>';
      g+='<circle class="cidot'+(hit?'':' miss')+'" cx="'+X(s.m)+'" cy="'+y+'" r="3.5"/>';
    });
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+base+'" y2="'+base+'"/>';
    for(v=156;v<=176;v+=4){g+='<line class="axis" x1="'+X(v)+'" x2="'+X(v)+'" y1="'+base+'" y2="'+(base+5)+'"/><text class="t" x="'+X(v)+'" y="'+(base+21)+'" text-anchor="middle">'+v+'</text>';}
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-6)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("hits").textContent=tpl(S.hitsValue,{h:hits,k:K});
    q("lv").textContent=level+"%";
    el.querySelectorAll("[data-lv]").forEach(function(b){b.setAttribute("aria-pressed",+b.getAttribute("data-lv")===level?"true":"false");});
    q("msg").textContent=tpl(S.msg,{k:K,h:hits,lv:level,e:Math.round(K*level/100)});
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-lv")){level=+b.getAttribute("data-lv");render();}
    else if(b.getAttribute("data-act")==="new"){samples=genSamples(SC.mulberry32((Date.now()^(Math.random()*4294967296))>>>0),N,K,TRUE,SDP);render();}
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
