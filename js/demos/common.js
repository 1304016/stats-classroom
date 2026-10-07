/* Shared helpers for every demo template. Demos never contain visible text. They read strings from the lesson data. */
window.DEMOS=window.DEMOS||{};
window.SC=(function(){
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function fmt1(v){return String(Math.round(v*10)/10);}
  function anchor(x,W){return x<64?"start":(x>W-64?"end":"middle");}
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
  function tpl(s,o){return String(s).replace(/\{(\w+)\}/g,function(m,k){return o&&o[k]!==undefined?o[k]:m;});}
  function invNorm(p){
    var t=Math.sqrt(-2*Math.log(p<0.5?p:1-p));
    var c=[2.515517,0.802853,0.010328],d=[1.432788,0.189269,0.001308];
    var x=t-((c[2]*t+c[1])*t+c[0])/(((d[2]*t+d[1])*t+d[0])*t+1);
    return p<0.5?-x:x;
  }
  function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;var t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
  /* Redraw whenever the chart container changes width, so charts always use the real width. */
  function watch(box,cleanup,fn){
    var last=-1;
    if(typeof ResizeObserver==="undefined")return;
    var ro=new ResizeObserver(function(){var w=Math.floor(box.clientWidth);if(w!==last){last=w;fn();}});
    ro.observe(box);
    cleanup.push(function(){ro.disconnect();});
  }
  /* Row of preset buttons. items is [[value,label],...]. attr is the data attribute name. */
  function presets(items,attr,pressed){
    return '<div class="presets">'+items.map(function(p){
      return '<button class="btn" type="button" data-'+attr+'="'+p[0]+'"'+(pressed===undefined?'':' aria-pressed="'+(pressed===p[0])+'"')+'>'+esc(p[1])+'</button>';
    }).join("")+'</div>';
  }
  function width(box){return Math.max(280,Math.floor(box.clientWidth));}
  return{clamp:clamp,fmt1:fmt1,anchor:anchor,esc:esc,tpl:tpl,invNorm:invNorm,mulberry32:mulberry32,watch:watch,presets:presets,width:width};
})();
