/* A small table of students. The visitor picks a column and sees whether it is a variable,
   meaning the values differ, or the same for everyone. A button adds more students. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.columns=function(el,cleanup,cfg){
  var S=cfg.ui,cols=cfg.columns,sel=-1,more=false;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="tablewrap"><table class="tally cols"><thead><tr><th>'+esc(S.rowHead)+'</th>'+cols.map(function(c,i){return '<th><button class="colbtn" type="button" data-c="'+i+'" aria-pressed="false">'+esc(c.name)+'</button></th>';}).join("")+'</tr></thead><tbody></tbody></table></div>'+
    '<div class="stats" aria-live="polite"><div class="stat"><div class="n a" data-k="distinct">-</div><div class="k">'+esc(S.distinctLabel)+'</div></div><div class="stat"><div class="n" data-k="rows"></div><div class="k">'+esc(S.rowsLabel)+'</div></div></div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="more"></button></div>';
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function vals(c){return more?c.values.concat(c.extra):c.values;}
  function render(){
    var n=vals(cols[0]).length,body="",r;
    for(r=0;r<n;r++)body+='<tr><td>'+tpl(S.rowName,{i:r+1})+'</td>'+cols.map(function(c,i){return '<td class="'+(i===sel?'colsel':'')+'">'+esc(vals(c)[r])+'</td>';}).join("")+'</tr>';
    el.querySelector("tbody").innerHTML=body;
    el.querySelectorAll(".colbtn").forEach(function(b,i){b.setAttribute("aria-pressed",i===sel?"true":"false");b.classList.toggle("on",i===sel);});
    q("rows").textContent=n;
    el.querySelector('[data-act="more"]').textContent=more?S.lessBtn:S.moreBtn;
    if(sel<0){q("distinct").textContent="-";q("msg").textContent=S.start;return;}
    var set={};vals(cols[sel]).forEach(function(v){set[v]=1;});
    var d=Object.keys(set).length;
    q("distinct").textContent=d;
    q("msg").textContent=tpl(d>1?S.isVar:S.notVar,{c:cols[sel].name,d:d,n:n});
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button");
    if(!b)return;
    if(b.hasAttribute("data-c"))sel=+b.getAttribute("data-c");
    else if(b.getAttribute("data-act")==="more")more=!more;
    render();
  });
  render();
};
})();
