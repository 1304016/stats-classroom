/* Grid of students. The visitor clicks students to pick a sample out of the population.
   The population is drawn in one colour and the sample in another. cfg.stats picks the number boxes
   and cfg.rule picks the live message. */
(function(){
var SC=window.SC,fmt1=SC.fmt1,n2=SC.n2,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.grid=function(el,cleanup,cfg){
  var S=cfg.ui,sc=cfg.scores,N=sc.length,pick=[],i,
      popMean=sc.reduce(function(a,b){return a+b;},0)/N,revealed=false,cost=cfg.cost;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="stugrid" style="grid-template-columns:repeat('+cfg.cols+',minmax(0,1fr))" role="group" aria-label="'+esc(S.aria)+'">'+
    sc.map(function(v,j){return '<button class="stu" type="button" data-i="'+j+'" aria-pressed="false" aria-label="'+esc(tpl(S.stuAria,{i:j+1,v:v}))+'">'+(cfg.showValue?'<span>'+v+'</span>':'')+'</button>';}).join("")+'</div>'+
    '<div class="swatches"><span><i class="sw stu-pop"></i>'+esc(S.swPop)+'</span><span><i class="sw stu-sample"></i>'+esc(S.swSample)+'</span></div>'+
    '<div class="stats" aria-live="polite">'+cfg.stats.map(function(k){return '<div class="stat"><div class="n '+((S.cls||{})[k]||"")+'" data-k="'+k+'"></div><div class="k">'+esc(S[k])+'</div></div>';}).join("")+'</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="random">'+esc(tpl(S.random,{k:cfg.randomK}))+'</button>'+(cfg.census?'<button class="btn" type="button" data-act="census">'+esc(S.censusBtn)+'</button>':'')+(cfg.reveal?'<button class="btn" type="button" data-act="reveal" aria-pressed="false">'+esc(S.revealBtn)+'</button>':'')+'<button class="btn" type="button" data-act="clear">'+esc(S.clear)+'</button></div>';
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function render(){
    var k=pick.length,sm=k?pick.reduce(function(a,j){return a+sc[j];},0)/k:0,d=sm-popMean;
    el.querySelectorAll(".stu").forEach(function(b,j){var on=pick.indexOf(j)>-1;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on?"true":"false");});
    var vals={popCount:N,sampleCount:k,fraction:tpl(S.fractionValue||"",{k:k,N:N}),paramMean:cfg.reveal&&!revealed?"?":fmt1(popMean),time:cost?tpl(S.timeValue,{m:k*cost.min}):"",cost:cost?tpl(S.costValue,{c:k*cost.tk}):"",statMean:k?n2(sm):"-",diff:k?(d>0?"+":(d<0?"−":""))+n2(Math.abs(d)):"-"};
    cfg.stats.forEach(function(key){q(key).textContent=vals[key];});
    var key=!k?"none":(k>=N&&S.all?"all":(cfg.reveal&&revealed&&S.someRev?"someRev":"some"));
    q("msg").textContent=tpl(S[key],{m:cost?k*cost.min:0,c:cost?k*cost.tk:0,M:cost?N*cost.min:0,C:cost?N*cost.tk:0,k:k,N:N,r:N-k,p:fmt1(100*k/N),pm:fmt1(popMean),sm:n2(sm),d:n2(Math.abs(d)),dir:d>0?S.higher:(d<0?S.lower:S.same)});
    el.querySelector('[data-act="clear"]').disabled=!k;
    var rb=el.querySelector('[data-act="reveal"]');if(rb){rb.setAttribute("aria-pressed",revealed?"true":"false");rb.textContent=revealed?S.hideBtn:S.revealBtn;}
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-i")){
      var j=+b.getAttribute("data-i"),at=pick.indexOf(j);
      if(at>-1)pick.splice(at,1);else if(pick.length<cfg.maxSample)pick.push(j);else{q("msg").textContent=tpl(S.full,{m:cfg.maxSample});return;}
      render();
    }else if(b.getAttribute("data-act")==="random"){
      var all=[];for(i=0;i<N;i++)all.push(i);
      for(i=N-1;i>0;i--){var r=Math.floor(Math.random()*(i+1)),t=all[i];all[i]=all[r];all[r]=t;}
      pick=all.slice(0,cfg.randomK);render();
    }else if(b.getAttribute("data-act")==="clear"){pick=[];render();
    }else if(b.getAttribute("data-act")==="census"){pick=[];for(i=0;i<N;i++)pick.push(i);render();
    }else if(b.getAttribute("data-act")==="reveal"){revealed=!revealed;render();}
  });
  render();
};
})();
