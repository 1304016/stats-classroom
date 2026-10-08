/* The same scores seen with two units of analysis. Switch between "one student" and "one class".
   Classes are cfg.size students each, taken in order from cfg.scores. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl,n2=SC.n2;

window.DEMOS.units=function(el,cleanup,cfg){
  var S=cfg.ui,sc=cfg.scores,size=cfg.size,k=sc.length/size,unit="student",i,j;
  var cls=[];
  for(i=0;i<k;i++){var part=sc.slice(i*size,(i+1)*size);cls.push({name:cfg.classNames[i],mean:part.reduce(function(a,b){return a+b;},0)/size});}
  var all=sc.reduce(function(a,b){return a+b;},0)/sc.length;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="presets"><button class="btn" type="button" data-u="student" aria-pressed="true">'+esc(S.unitStudent)+'</button><button class="btn" type="button" data-u="class" aria-pressed="false">'+esc(S.unitClass)+'</button></div>'+
    '<div class="tablewrap tall"><table class="tally cols"><thead></thead><tbody></tbody></table></div>'+
    '<div class="stats" aria-live="polite"><div class="stat"><div class="n a" data-k="n"></div><div class="k" data-k="nl"></div></div><div class="stat"><div class="n b" data-k="top"></div><div class="k" data-k="tl"></div></div><div class="stat"><div class="n" data-k="mean"></div><div class="k">'+esc(S.meanLabel)+'</div></div></div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  function q(x){return el.querySelector('[data-k="'+x+'"]');}
  function render(){
    var head,body="",top,who;
    if(unit==="student"){
      head='<tr><th>'+esc(S.hStudent)+'</th><th>'+esc(S.hClass)+'</th><th>'+esc(S.hScore)+'</th></tr>';
      sc.forEach(function(v,x){body+='<tr><td>'+tpl(S.stuName,{i:x+1})+'</td><td>'+esc(cfg.classNames[Math.floor(x/size)])+'</td><td>'+v+'</td></tr>';});
      top=Math.max.apply(null,sc);who=sc.map(function(v,x){return v===top?tpl(S.stuName,{i:x+1}):null;}).filter(Boolean).join(S.and);
      q("n").textContent=sc.length;q("nl").textContent=S.nStudent;q("top").textContent=top;q("tl").textContent=S.topStudent;
      q("msg").textContent=tpl(S.msgStudent,{n:sc.length,top:top,who:who});
    }else{
      head='<tr><th>'+esc(S.hClass)+'</th><th>'+esc(S.hCount)+'</th><th>'+esc(S.hMean)+'</th></tr>';
      cls.forEach(function(c){body+='<tr><td>'+esc(c.name)+'</td><td>'+size+'</td><td>'+n2(c.mean)+'</td></tr>';});
      top=Math.max.apply(null,cls.map(function(c){return c.mean;}));who=cls.filter(function(c){return c.mean===top;}).map(function(c){return c.name;}).join(S.and);
      q("n").textContent=k;q("nl").textContent=S.nClass;q("top").textContent=n2(top);q("tl").textContent=S.topClass;
      q("msg").textContent=tpl(S.msgClass,{n:k,size:size,top:n2(top),who:who});
    }
    q("mean").textContent=n2(all);
    el.querySelector("thead").innerHTML=head;el.querySelector("tbody").innerHTML=body;
    el.querySelectorAll("[data-u]").forEach(function(b){b.setAttribute("aria-pressed",b.getAttribute("data-u")===unit?"true":"false");});
  }
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-u]");
    if(!b)return;
    unit=b.getAttribute("data-u");render();
  });
  render();
};
})();
