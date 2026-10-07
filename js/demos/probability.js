/* Probability and distributions. Bell curve with mean and spread sliders. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.bell=function(el,cleanup,cfg){
  var S=cfg.ui,mu=165,sd=7,k=1,H=270,ML=16,MR=16,MT=24,MB=46,LO=110,HI=220,YM=0.105,PCT=[68.3,95.4,99.7];
  el.innerHTML=
    '<div class="ctl"><label for="nm">'+esc(S.meanLabel)+' <span class="val" data-k="mv"></span></label><input id="nm" type="range" min="150" max="180" step="1" value="165"></div>'+
    '<div class="ctl"><label for="ns">'+esc(S.sdLabel)+' <span class="val" data-k="sv"></span></label><input id="ns" type="range" min="4" max="12" step="1" value="7"></div>'+
    SC.presets(S.presets,"kk",1)+
    '<div class="chart-box"></div>'+
    '<div class="stats" aria-live="polite">'+
      '<div class="stat"><div class="n a" data-k="pct"></div><div class="k">'+esc(S.pctLabel)+'</div></div>'+
      '<div class="stat"><div class="n" data-k="rng" style="font-size:1.5rem"></div><div class="k">'+esc(S.rangeLabel)+'</div></div>'+
    '</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),rm=el.querySelector("#nm"),rs=el.querySelector("#ns");
  function q(kk){return el.querySelector('[data-k="'+kk+'"]');}
  function render(){
    var W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB,h;
    var X=function(a){return ML+pw*(a-LO)/(HI-LO);},Y=function(d){return MT+ph*(1-d/YM);};
    var f=function(a){return Math.exp(-0.5*Math.pow((a-mu)/sd,2))/(sd*Math.sqrt(2*Math.PI));};
    var lo=mu-k*sd,hi=mu+k*sd;
    var curve="",area="M"+X(lo)+" "+Y(0)+" L"+X(lo)+" "+Y(f(lo));
    for(h=LO;h<=HI;h++){curve+=(h===LO?"M":"L")+X(h)+" "+Y(f(h))+" ";}
    for(h=lo+1;h<hi;h++){area+=" L"+X(h)+" "+Y(f(h));}
    area+=" L"+X(hi)+" "+Y(f(hi))+" L"+X(hi)+" "+Y(0)+" Z";
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    g+='<path class="area" d="'+area+'"/><path class="curve" d="'+curve+'"/>';
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/>';
    for(h=120;h<=220;h+=20){g+='<line class="axis" x1="'+X(h)+'" x2="'+X(h)+'" y1="'+Y(0)+'" y2="'+(Y(0)+5)+'"/><text class="t" x="'+X(h)+'" y="'+(Y(0)+21)+'" text-anchor="middle">'+h+'</text>';}
    g+='<line class="meanln" x1="'+X(mu)+'" x2="'+X(mu)+'" y1="'+(MT-2)+'" y2="'+Y(0)+'"/>';
    g+='<text class="t strong" x="'+X(mu)+'" y="'+(MT-9)+'" text-anchor="middle">'+esc(tpl(S.meanMark,{v:mu}))+'</text>';
    g+='<text class="t strong" x="'+(ML+pw/2)+'" y="'+(H-6)+'" text-anchor="middle">'+esc(S.xTitle)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    q("mv").textContent=tpl(S.meanValue,{v:mu});
    q("sv").textContent=tpl(S.sdValue,{v:sd});
    q("pct").textContent=PCT[k-1]+"%";
    q("rng").textContent=tpl(S.rangeValue,{lo:lo,hi:hi});
    el.querySelectorAll("[data-kk]").forEach(function(b){b.setAttribute("aria-pressed",+b.getAttribute("data-kk")===k?"true":"false");});
    q("msg").textContent=tpl(S.msg,{p:PCT[k-1],lo:lo,hi:hi,tail:S.tails[k]});
  }
  rm.addEventListener("input",function(){mu=+rm.value;render();});
  rs.addEventListener("input",function(){sd=+rs.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-kk]");
    if(!b)return;
    k=+b.getAttribute("data-kk");render();
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
