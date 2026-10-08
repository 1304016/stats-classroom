/* Shape of a distribution. One template with a slider. cfg.family is "skew" or "tails".
   The curve is drawn with mean 50 and standard deviation 15 so only the shape changes. */
(function(){
var SC=window.SC,esc=SC.esc,tpl=SC.tpl,n2=SC.n2;
var MU=50,SD=15;

function erf(x){var t=1/(1+0.3275911*Math.abs(x)),y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y;}
function Phi(x){return 0.5*(1+erf(x/Math.SQRT2));}
function phi(x){return Math.exp(-0.5*x*x)/Math.sqrt(2*Math.PI);}
function lgamma(z){
  var c=[76.18009172947146,-86.50532032941677,24.01409824083091,-1.231739572450155,0.1208650973866179e-2,-0.5395239384953e-5],y=z,t=z+5.5,s=1.000000000190015,j;
  t-=(z+0.5)*Math.log(t);for(j=0;j<6;j++){y+=1;s+=c[j]/y;}
  return -t+Math.log(2.5066282746310005*s/z);
}
/* Skew-normal density in a standard form, moved to mean 50 and sd 15. Returns the curve and its numbers. */
function skewShape(alpha){
  var N=2400,lo=-6,hi=6,h=(hi-lo)/N,f=[],t=[],i,sum=0,m1=0,m2=0,m3=0;
  for(i=0;i<=N;i++){t.push(lo+i*h);f.push(2*phi(t[i])*Phi(alpha*t[i]));sum+=f[i]*h;}
  for(i=0;i<=N;i++){f[i]/=sum;m1+=t[i]*f[i]*h;}
  for(i=0;i<=N;i++){var d=t[i]-m1;m2+=d*d*f[i]*h;m3+=d*d*d*f[i]*h;}
  var sd=Math.sqrt(m2),acc=0,med=0;
  for(i=0;i<=N;i++){acc+=f[i]*h;if(acc>=0.5){med=t[i];break;}}
  var pts=[];
  for(i=0;i<=N;i+=4){pts.push([MU+SD*(t[i]-m1)/sd,f[i]*sd/SD]);}
  return{pts:pts,skew:m3/(sd*sd*sd),median:MU+SD*(med-m1)/sd};
}
/* Student t curve scaled to unit variance, then moved to mean 50 and sd 15. L=0 means the normal curve. */
function tailShape(L){
  var normal=L===0,nu=normal?1e9:4+48/L,s=normal?1:Math.sqrt(nu/(nu-2)),pts=[],tail=0,z,h=0.02;
  var logc=normal?0:lgamma((nu+1)/2)-lgamma(nu/2)-0.5*Math.log(nu*Math.PI);
  function dens(z){return normal?phi(z):s*Math.exp(logc-(nu+1)/2*Math.log(1+z*s*z*s/nu));}
  for(z=-40;z<=40;z+=h){if(Math.abs(z)>3)tail+=dens(z)*h;}
  for(z=-4;z<=4+1e-9;z+=0.05){pts.push([MU+SD*z,dens(z)/SD]);}
  return{pts:pts,kurt:normal?3:3+6/(nu-4),tail:100*tail};
}
var NORMAL_TAIL=200*(1-Phi(3));

window.DEMOS.shape=function(el,cleanup,cfg){
  var S=cfg.ui,fam=cfg.family,val=cfg.start,H=272,L=20,RM=20,YM=0.032;
  var cmin=fam==="skew"?-8:0,cmax=fam==="skew"?8:12;
  el.innerHTML=
    '<p class="hint">'+esc(S.hint)+'</p>'+
    '<div class="ctl"><label for="shr">'+esc(S.label)+' <span class="val" data-k="val"></span></label>'+
    '<input id="shr" type="range" min="'+cmin+'" max="'+cmax+'" step="1" value="'+val+'"></div>'+
    SC.presets(S.presets,"sv")+
    '<div class="chart-box"></div>'+
    '<div class="swatches">'+S.swatches.map(function(x){return '<span><i class="sw '+x[0]+'"></i>'+esc(x[1])+'</span>';}).join("")+'</div>'+
    '<div class="stats" aria-live="polite">'+S.stats.map(function(k){return '<div class="stat"><div class="n '+(S.cls[k]||"")+'" data-k="'+k+'"></div><div class="k">'+esc(S[k])+'</div></div>';}).join("")+'</div>'+
    '<p class="msg" data-k="msg" aria-live="polite"></p>';
  var box=el.querySelector(".chart-box"),range=el.querySelector("#shr");
  function q(k){return el.querySelector('[data-k="'+k+'"]');}
  function path(pts,X,Y){return pts.filter(function(p){return p[0]>=0&&p[0]<=100;}).map(function(p,i){return(i?"L":"M")+X(p[0])+" "+Y(p[1]);}).join(" ");}
  function render(){
    var W=SC.width(box),X=function(v){return L+(W-L-RM)*v/100;},Y=function(d){return 200-170*d/YM;};
    var g='<svg class="chart" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="'+esc(S.aria)+'">';
    var r,m;
    g+='<line class="axis" x1="'+L+'" x2="'+(W-RM)+'" y1="200" y2="200"/>';
    for(var v=0;v<=100;v+=20){g+='<line class="axis" x1="'+X(v)+'" x2="'+X(v)+'" y1="200" y2="206"/><text class="t" x="'+X(v)+'" y="222" text-anchor="middle">'+v+'</text>';}
    if(fam==="skew"){
      r=skewShape(val);
      g+='<path class="area" d="'+path(r.pts,X,Y)+' L'+X(Math.min(100,r.pts[r.pts.length-1][0]))+' 200 L'+X(Math.max(0,r.pts[0][0]))+' 200 Z"/>';
      g+='<path class="curve" d="'+path(r.pts,X,Y)+'"/>';
      g+='<line class="meanln" x1="'+X(MU)+'" x2="'+X(MU)+'" y1="38" y2="200"/>';
      g+='<path class="meanmark" d="M'+X(MU)+' 228 L'+(X(MU)-7)+' 241 L'+(X(MU)+7)+' 241 Z"/>';
      g+='<text class="t strong b" x="'+X(MU)+'" y="262" text-anchor="middle">'+esc(S.mean)+' '+MU+'</text>';
      g+='<line class="medline" x1="'+X(r.median)+'" x2="'+X(r.median)+'" y1="38" y2="200"/>';
      g+='<path class="medmark" d="M'+(X(r.median)-7)+' 24 L'+(X(r.median)+7)+' 24 L'+X(r.median)+' 38 Z"/>';
      g+='<text class="t strong a" x="'+X(r.median)+'" y="16" text-anchor="'+SC.anchor(X(r.median),W)+'">'+esc(S.median)+' '+SC.fmt1(r.median)+'</text>';
      var sk=Math.abs(r.skew)<0.005?0:r.skew;
      q("skew").textContent=(sk>0?"+":"")+sk.toFixed(2).replace("-","−");
      q("mean").textContent=MU;q("median").textContent=SC.fmt1(r.median);
      m=Math.abs(r.skew)<0.15?S.sym:(r.skew>0?S.right:S.left);
      m=tpl(m,{mean:MU,median:SC.fmt1(r.median)});
      q("val").textContent=val===0?S.zero:tpl(val>0?S.valRight:S.valLeft,{v:Math.abs(val)});
    }else{
      r=tailShape(val);var nrm=tailShape(0);
      var lt=r.pts.filter(function(p){return p[0]<=5;}),rt=r.pts.filter(function(p){return p[0]>=95;});
      [lt,rt].forEach(function(a){if(a.length)g+='<path class="area" d="M'+X(a[0][0])+' 200 '+a.map(function(p){return"L"+X(p[0])+" "+Y(p[1]);}).join(" ")+' L'+X(a[a.length-1][0])+' 200 Z" style="fill:var(--c2);fill-opacity:.55"/>';});
      g+='<path class="ref" d="'+path(nrm.pts,X,Y)+'"/>';
      g+='<path class="curve" d="'+path(r.pts,X,Y)+'"/>';
      g+='<line class="meanln" x1="'+X(MU)+'" x2="'+X(MU)+'" y1="38" y2="200"/>';
      g+='<text class="t strong" x="'+X(MU)+'" y="16" text-anchor="middle">'+esc(S.meanMark)+'</text>';
      q("kurt").textContent=n2(r.kurt);
      q("tail").textContent=r.tail.toFixed(2)+"%";
      m=val===0?S.normalMsg:tpl(val<=4?S.mild:S.heavy,{tail:r.tail.toFixed(2),nt:NORMAL_TAIL.toFixed(2)});
      q("val").textContent=val===0?S.zero:tpl(S.valTail,{v:val});
    }
    g+='</svg>';box.innerHTML=g;
    q("msg").textContent=m;
  }
  range.addEventListener("input",function(){val=+range.value;render();});
  el.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest("button[data-sv]");
    if(!b)return;
    val=+b.getAttribute("data-sv");range.value=val;render();
  });
  render();
  SC.watch(box,cleanup,render);
};
})();
