/* A small table of students. The visitor picks a column (cfg.pick "col") or a row (cfg.pick "row").
   cfg.rule "var" tells whether the column is a variable, "data" lists its values, "row" lists the row.
   A button adds more students. cfg.stats picks the number boxes. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.columns=function(el,cleanup,cfg){
  var S=cfg.ui,cols=cfg.columns,byRow=cfg.pick==="row",rule=cfg.rule||"var",STATS=cfg.stats||["distinct","rows"],sel=-1,more=false;
  var CLS={distinct:"a",rows:"",cells:"b",perRow:""};
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="tablewrap"><table class="tally cols"><thead><tr><th>'+esc(S.rowHead)+'</th>'+cols.map(function(c,i){return '<th>'+(byRow?esc(c.name):'<button class="colbtn" type="button" data-c="'+i+'" aria-pressed="false">'+esc(c.name)+'</button>')+'</th>';}).join("")+'</tr></thead><tbody></tbody></table></div>'+
    '<div class="stats" aria-live="polite">'+STATS.map(function(k){return '<div class="stat"><div class="n '+CLS[k]+'" data-k="'+k+'">-</div><div class="k">'+esc(S[k+"Label"])+'</div></div>';}).join("")+'</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="more"></button></div>';
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function vals(c){return more?c.values.concat(c.extra):c.values;}
  function set(k,v){var b=q(k);if(b)b.textContent=v;}
  function render(){
    var n=vals(cols[0]).length,body="",r;
    for(r=0;r<n;r++){
      var rowCell=byRow?'<button class="colbtn" type="button" data-r="'+r+'" aria-pressed="'+(r===sel)+'">'+esc(tpl(S.rowName,{i:r+1}))+'</button>':tpl(S.rowName,{i:r+1});
      body+='<tr><td>'+rowCell+'</td>'+cols.map(function(c,i){return '<td class="'+((byRow?r===sel:i===sel)?'colsel':'')+'">'+esc(vals(c)[r])+'</td>';}).join("")+'</tr>';
    }
    el.querySelector("tbody").innerHTML=body;
    el.querySelectorAll(".colbtn").forEach(function(b,i){var on=byRow?+b.getAttribute("data-r")===sel:i===sel;b.setAttribute("aria-pressed",on?"true":"false");b.classList.toggle("on",on);});
    set("rows",n);set("cells",n*cols.length);set("perRow",cols.length);
    el.querySelector('[data-act="more"]').textContent=more?S.lessBtn:S.moreBtn;
    if(sel<0){set("distinct","-");q("msg").textContent=S.start;return;}
    if(byRow){
      q("msg").textContent=tpl(S.rowMsg,{i:sel+1,k:cols.length,vals:cols.map(function(c){return vals(c)[sel];}).join(", "),n:n});
      return;
    }
    var seen={},list=vals(cols[sel]);list.forEach(function(v){seen[v]=1;});
    var d=Object.keys(seen).length;
    set("distinct",d);
    q("msg").textContent=rule==="data"?tpl(S.dataMsg,{c:cols[sel].name,n:n,vals:list.slice(0,6).join(", ")}):tpl(d>1?S.isVar:S.notVar,{c:cols[sel].name,d:d,n:n});
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-c"))sel=+b.getAttribute("data-c");
    else if(b.hasAttribute("data-r"))sel=+b.getAttribute("data-r");
    else if(b.getAttribute("data-act")==="more")more=!more;
    render();
  });
  render();
};
})();
