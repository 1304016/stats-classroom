/* Types of data. Items start in a pool. The visitor drags each one into the right box, by mouse, by touch
   or with the arrow keys. cfg.boxes is [{id,name,note}] and cfg.items is [{t,sub,box,why}], where box is
   the id of the right box and why explains the right answer. A wrong box stays marked until the item is moved. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl;

window.DEMOS.sorting=function(el,cleanup,cfg){
  var S=cfg.ui,items=cfg.items,B=cfg.boxes,N=items.length,at,drag=null,msgText=S.start;
  function reset(){at=items.map(function(){return 0;});}
  reset();
  function zoneName(z){return z===0?S.poolName:B[z-1].name;}
  function boxName(id){return B.filter(function(b){return b.id===id;})[0].name;}
  function isRight(i){return at[i]>0&&B[at[i]-1].id===items[i].box;}
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="sortarea">'+
    '<div class="zone pool" data-zone="0" role="group" aria-label="'+esc(S.poolName)+'"><div class="bname">'+esc(S.poolName)+'</div><div class="slot"></div></div>'+
    '<div class="boxes">'+B.map(function(b,j){
      return '<div class="zone box" data-zone="'+(j+1)+'" role="group" aria-label="'+esc(b.name)+'"><div class="bname">'+esc(b.name)+'</div><div class="bnote">'+esc(b.note)+'</div><div class="slot"></div></div>';
    }).join("")+'</div></div>'+
    '<div class="stats" aria-live="polite"><div class="stat"><div class="n a" data-k="ok"></div><div class="k">'+esc(S.okLabel)+'</div></div><div class="stat"><div class="n" data-k="left"></div><div class="k">'+esc(S.leftLabel)+'</div></div></div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>'+
    '<div class="controls"><button class="btn" type="button" data-act="reset">'+esc(S.reset)+'</button></div>';
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function chip(i){
    var it=items[i],z=at[i],st=z===0?"":(isRight(i)?" ok":" bad");
    return '<button class="chip'+st+'" type="button" data-i="'+i+'" aria-label="'+esc(tpl(S.chipAria,{t:it.t,sub:it.sub,z:zoneName(z)}))+'"><span class="ct">'+esc(it.t)+'</span><span class="cs">'+esc(it.sub)+'</span></button>';
  }
  function render(){
    var ok=0,left=0;
    el.querySelectorAll(".zone").forEach(function(zn){
      var z=+zn.getAttribute("data-zone"),html="";
      items.forEach(function(it,i){if(at[i]===z)html+=chip(i);});
      zn.querySelector(".slot").innerHTML=html||'<span class="ph">'+esc(z===0?S.poolEmpty:S.boxEmpty)+'</span>';
    });
    items.forEach(function(it,i){if(at[i]===0)left++;else if(isRight(i))ok++;});
    q("ok").textContent=ok+" / "+N;q("left").textContent=left;
    q("msg").textContent=msgText;
    el.querySelector('[data-act="reset"]').disabled=left===N;
  }
  function place(i,z){
    var it=items[i],ok;
    at[i]=z;
    if(z===0)msgText=tpl(S.back,{t:it.t});
    else if(isRight(i))msgText=tpl(S.right,{t:it.t,why:it.why,box:B[z-1].name});
    else msgText=tpl(S.wrong,{t:it.t,why:it.why,box:B[z-1].name,good:boxName(it.box)});
    ok=items.filter(function(x,k){return isRight(k);}).length;
    if(ok===N)msgText+=" "+tpl(S.done,{N:N});
    render();
  }
  function zoneAt(x,y,skip){
    var list=document.elementsFromPoint(x,y),k,zn;
    for(k=0;k<list.length;k++){
      if(skip&&skip.contains(list[k]))continue;
      zn=list[k].closest&&list[k].closest("[data-zone]");
      if(zn&&el.contains(zn))return zn;
    }
    return null;
  }
  function mark(zn){el.querySelectorAll(".zone").forEach(function(n){n.classList.toggle("over",n===zn);});}
  /* While a chip is held near the top or bottom edge of the scrolling page, the page scrolls so every box can be reached. */
  var scroller=el.closest("#main")||document.scrollingElement,timer=0;
  function follow(){
    var dx=drag.cx-drag.x,dy=drag.cy-drag.y+scroller.scrollTop-drag.s0;
    drag.c.style.transform="translate("+dx+"px,"+dy+"px)";
    mark(zoneAt(drag.cx,drag.cy,drag.c));
  }
  function autoscroll(){
    if(!drag||!drag.moved)return;
    var r=scroller===document.scrollingElement?{top:0,bottom:window.innerHeight}:scroller.getBoundingClientRect(),v=0;
    if(drag.cy>r.bottom-70)v=Math.ceil((drag.cy-(r.bottom-70))/5);else if(drag.cy<r.top+70)v=-Math.ceil((r.top+70-drag.cy)/5);
    if(v){scroller.scrollTop+=Math.max(-18,Math.min(18,v));follow();}
  }
  el.addEventListener("pointerdown",function(e){
    var c=e.target.closest&&e.target.closest(".chip");
    if(!c||(e.pointerType==="mouse"&&e.button!==0))return;
    drag={c:c,i:+c.getAttribute("data-i"),id:e.pointerId,x:e.clientX,y:e.clientY,cx:e.clientX,cy:e.clientY,s0:scroller.scrollTop,moved:false};
    try{c.setPointerCapture(e.pointerId);}catch(err){}
  });
  el.addEventListener("pointermove",function(e){
    if(!drag||e.pointerId!==drag.id)return;
    drag.cx=e.clientX;drag.cy=e.clientY;
    if(!drag.moved&&Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y)<6)return;
    if(!drag.moved){drag.moved=true;drag.c.classList.add("drag");timer=setInterval(autoscroll,16);}
    follow();
  });
  function end(e,cancel){
    if(!drag||e.pointerId!==drag.id)return;
    var d=drag,zn=d.moved&&!cancel?zoneAt(e.clientX,e.clientY,d.c):null;
    drag=null;clearInterval(timer);mark(null);
    d.c.classList.remove("drag");d.c.style.transform="";
    if(zn&&+zn.getAttribute("data-zone")!==at[d.i])place(d.i,+zn.getAttribute("data-zone"));
  }
  el.addEventListener("pointerup",function(e){end(e,false);});
  el.addEventListener("pointercancel",function(e){end(e,true);});
  cleanup.push(function(){clearInterval(timer);});
  el.addEventListener("keydown",function(e){
    var c=e.target.closest&&e.target.closest(".chip");
    if(!c)return;
    var i=+c.getAttribute("data-i"),d=0;
    if(e.key==="ArrowRight"||e.key==="ArrowDown")d=1;else if(e.key==="ArrowLeft"||e.key==="ArrowUp")d=-1;else return;
    e.preventDefault();
    var z=Math.max(0,Math.min(B.length,at[i]+d));
    if(z===at[i])return;
    place(i,z);
    var again=el.querySelector('.chip[data-i="'+i+'"]');
    if(again)again.focus();
  });
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest('[data-act="reset"]');
    if(!b)return;
    reset();msgText=S.start;render();
  });
  render();
};
})();
