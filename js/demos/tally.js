/* Tally table with bars. The visitor adds or removes people from each group and watches the counts and shares change.
   cfg.cols picks the columns ("freq" and optionally "rel"), cfg.chart picks count bars or percent bars. */
(function(){
var SC=window.SC,fmt1=SC.fmt1,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.tally=function(el,cleanup,cfg){
  var S=cfg.ui,names=cfg.items.map(function(x){return x[0];}),START=cfg.items.map(function(x){return x[1];});
  var c=START.slice(),last=-1,lastDir=0,rel=cfg.cols.indexOf("rel")>-1,pct=cfg.chart==="rel";
  var H=250,ML=pct?58:46,MR=12,MT=22,MB=40;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="chart-box"></div>'+
    '<table class="tally"><thead><tr><th>'+esc(S.catHead)+'</th><th>'+esc(S.freqHead)+'</th>'+(rel?'<th>'+esc(S.relHead)+'</th>':'')+'<th></th></tr></thead><tbody>'+
    names.map(function(nm,i){return '<tr><td>'+esc(nm)+'</td><td class="num" data-k="f'+i+'"></td>'+(rel?'<td class="num" data-k="r'+i+'"></td>':'')+
      '<td><div class="acts"><button class="tbtn" type="button" data-i="'+i+'" data-d="-1" aria-label="'+esc(tpl(S.minusAria,{c:nm}))+'">−</button><button class="tbtn" type="button" data-i="'+i+'" data-d="1" aria-label="'+esc(tpl(S.plusAria,{c:nm}))+'">+</button></div></td></tr>';}).join("")+
    '</tbody><tfoot><tr><td>'+esc(S.totalLabel)+'</td><td data-k="ft"></td>'+(rel?'<td data-k="rt"></td>':'')+'<td></td></tr></tfoot></table>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="reset">'+esc(S.reset)+'</button></div>';
  var box=el.querySelector(".chart-box");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function total(){return c.reduce(function(a,b){return a+b;},0);}
  function render(){
    var W=SC.width(box),pw=W-ML-MR,ph=H-MT-MB,n=total(),k=names.length,t;
    var vals=c.map(function(v){return pct?(n?100*v/n:0):v;});
    var mx=Math.max.apply(null,vals),ym=pct?Math.max(50,Math.ceil(mx/10)*10):Math.max(10,Math.ceil(mx/5)*5),st=pct?10:(ym<=10?2:5);
    var Y=function(v){return MT+ph*(1-v/ym);},slot=pw/k,bw=slot*0.6;
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    for(t=0;t<=ym;t+=st)g+='<line class="grid" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(t)+'" y2="'+Y(t)+'"/><text class="t" x="'+(ML-8)+'" y="'+(Y(t)+4)+'" text-anchor="end">'+t+(pct?'%':'')+'</text>';
    vals.forEach(function(v,j){
      var bx=ML+slot*j+(slot-bw)/2;
      g+='<rect class="tbar'+(j===last?' hot':'')+'" x="'+bx+'" y="'+Y(v)+'" width="'+bw+'" height="'+(Y(0)-Y(v))+'"/>';
      g+='<text class="t strong" x="'+(bx+bw/2)+'" y="'+(Y(v)-6)+'" text-anchor="middle">'+(pct?fmt1(v)+'%':c[j])+'</text>';
      g+='<text class="t" x="'+(bx+bw/2)+'" y="'+(Y(0)+20)+'" text-anchor="middle">'+esc(names[j])+'</text>';
    });
    g+='<line class="axis" x1="'+ML+'" x2="'+(W-MR)+'" y1="'+Y(0)+'" y2="'+Y(0)+'"/>';
    g+='<text class="t strong" transform="translate(12 '+(MT+ph/2)+') rotate(-90)" text-anchor="middle">'+esc(pct?S.yPct:S.yCount)+'</text>';
    g+='</svg>';
    box.innerHTML=g;
    c.forEach(function(v,j){q("f"+j).textContent=v;if(rel)q("r"+j).textContent=n?fmt1(100*v/n)+"%":"0%";});
    q("ft").textContent=n;if(rel)q("rt").textContent=n?"100%":"0%";
    var top=0;c.forEach(function(v,j){if(v>c[top])top=j;});
    var m;
    if(last>-1)m=tpl(rel?(lastDir>0?S.addedRel:S.removedRel):(lastDir>0?S.added:S.removed),{c:names[last],k:c[last],n:n});
    else m=tpl(rel?S.startRel:S.start,{n:n,top:names[top],k:c[top],p:n?fmt1(100*c[top]/n):0});
    q("msg").textContent=m;
    el.querySelectorAll(".tbtn").forEach(function(b){
      var d=+b.getAttribute("data-d"),j=+b.getAttribute("data-i");
      b.disabled=d<0?c[j]<=0:n>=cfg.maxTotal;
    });
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-d")){
      var j=+b.getAttribute("data-i"),d=+b.getAttribute("data-d");
      if(d<0&&c[j]<=0)return;
      if(d>0&&total()>=cfg.maxTotal)return;
      c[j]+=d;last=j;lastDir=d;render();
    }else if(b.getAttribute("data-act")==="reset"){c=START.slice();last=-1;render();}
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
