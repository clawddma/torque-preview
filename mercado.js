/* ═══════════════════════════════════════════════════════════════════
   TORQ — Mercado automotor
   Sigue el estándar de los tableros de Daniel (dashboard-qlub / 360):
   Chart.js, multiselect acumulable de año y mes, barras agrupadas por
   año, botón YTD, selector de métrica global, tortas de composición y
   expandir a modal.

   MODELO DE FILAS: el dato vive en un cubo plano de enteros (cubo.js),
   7 por celda: [ym, combustible, clase, departamento, marca, unidades,
   conCrédito]. Los filtros filtran celdas (OR dentro de una dimensión,
   AND entre dimensiones) y se re-agregan. Nunca sobre arrays pre-sumados:
   eso rompe los filtros.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
"use strict";
var C = window.CUBO;
var $ = function(id){ return document.getElementById(id) };
var mil = function(n){ return Math.round(n).toLocaleString("es-CO") };
function esc(s){ return String(s==null?"":s).replace(/[<>&"]/g,function(c){
  return {"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[c] }) }
function pct(n,d){ return d ? (n/d*100) : 0 }
function fpct(v,dec){ return (Math.round(v*(dec?10:1))/(dec?10:1)).toString().replace(".",",")+"%" }

/* año y mes de cada índice del cubo, precalculados */
var YMY = C.ym.map(function(y){ return Math.floor(y/100) });
var YMM = C.ym.map(function(y){ return y%100 });
var ANIOS = C.ym.map(function(y){return Math.floor(y/100)}).filter(function(v,i,a){return a.indexOf(v)===i}).sort();
var MESES = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

/* Último mes cerrado: el archivo llega hasta el 8 de julio de 2026, así
   que julio está incompleto y el YTD tiene que parar en junio. */
var ULT_ANIO = ANIOS[ANIOS.length-1];
var mesesUlt = C.ym.filter(function(y){return Math.floor(y/100)===ULT_ANIO}).map(function(y){return y%100});
var ULT_CERRADO = Math.max.apply(null, mesesUlt) - 1;

var COL_A = {}; ANIOS.forEach(function(a,i){
  var v=["--a22","--a23","--a24","--a25","--a26"];
  COL_A[a] = "var("+(v[i]||"--a26")+")";
});
function cssVar(v){
  if(!/^var\(/.test(v)) return v;
  return getComputedStyle(document.documentElement).getPropertyValue(v.slice(4,-1)).trim()||"#3987e5";
}
var COL_G = {"Gasolina":"#4a4f57","Diésel":"#6b7280","Híbrido":"#3987e5",
  "Eléctrico":"#199e70","Gas":"#e0a112","Híbrido diésel":"#8b5cf6","Otro":"#3f4450"};
var SOST = {"Híbrido":1,"Eléctrico":1,"Híbrido diésel":1};

/* regiones comerciales: como se lee el mercado en la práctica, no como
   lo divide el RUNT. Bogotá y Cundinamarca son un solo mercado. */
var REGION = {
  "Bogota D.C.":"Bogotá y Cundinamarca", "Cundinamarca":"Bogotá y Cundinamarca",
  "Atlantico":"Costa Caribe","Bolivar":"Costa Caribe","Magdalena":"Costa Caribe",
  "Cesar":"Costa Caribe","Cordoba":"Costa Caribe","Sucre":"Costa Caribe",
  "La Guajira":"Costa Caribe","Archipielago de San Andres, Providencia":"Costa Caribe",
  "Caldas":"Eje Cafetero","Risaralda":"Eje Cafetero","Quindio":"Eje Cafetero",
  "Santander":"Santanderes","Norte de Santander":"Santanderes"
};

/* Segmento comercial, derivado de la clase. El RUNT no lo trae: se
   agrupa aquí para poder mirar el mercado como se habla de él. */
var SEGS=["Livianos","Pesados","Otros"];
var SEG_CLASE={"Automóvil":0,"Camioneta":0,"Campero":0,"Microbús":0,
               "Camión":1,"Tractocamión":1,"Bus":1,"Volqueta":1};
var SEG_DE=C.clase.map(function(nom){ var v=SEG_CLASE[nom]; return v===undefined?2:v });

var METRICAS = {
  unid: {lbl:"Unidades",    f:function(a){return a.n},                fmt:mil,  eje:"unidades"},
  cred: {lbl:"% a crédito", f:function(a){return pct(a.cred,a.n)},    fmt:function(v){return fpct(v,1)}, eje:"% con prenda", max:100},
  sost: {lbl:"% sostenible",f:function(a){return pct(a.sost,a.n)},    fmt:function(v){return fpct(v,1)}, eje:"% híbrido + eléctrico", max:100}
};

var F = { anio:new Set(), mes:new Set(), seg:new Set(), g:new Set(), clase:new Set(),
          depto:new Set(), marca:new Set(), ytd:false, metrica:"unid", region:"dep" };
var ORD = { marca:{k:"v",d:-1}, depto:{k:"v",d:-1}, linea:{k:"v",d:-1} };
var CH = {};

/* ── recorrido del cubo ─────────────────────────────────────────── */
function pasa(i, saltar, anios, meses){
  var ym=C.cubo[i];
  if(anios && !anios.has(YMY[ym])) return false;
  if(meses && !meses.has(YMM[ym])) return false;
  if(saltar!=="seg"   && F.seg.size   && !F.seg.has(SEG_DE[C.cubo[i+2]])) return false;
  if(saltar!=="g"     && F.g.size     && !F.g.has(C.cubo[i+1]))     return false;
  if(saltar!=="clase" && F.clase.size && !F.clase.has(C.cubo[i+2])) return false;
  if(saltar!=="depto" && F.depto.size && !F.depto.has(C.cubo[i+3])) return false;
  if(saltar!=="marca" && F.marca.size && !F.marca.has(C.cubo[i+4])) return false;
  return true;
}
function setAnios(desplazar){
  var s = F.anio.size ? new Set(Array.from(F.anio)) : new Set(ANIOS);
  if(desplazar){ var r=new Set(); s.forEach(function(a){r.add(a-1)}); return r }
  return s;
}
function setMeses(){
  if(F.ytd) { var m=new Set(); for(var i=1;i<=ULT_CERRADO;i++) m.add(i); return m }
  return F.mes.size ? new Set(Array.from(F.mes)) : null;
}
function agregar(saltar, desplazar){
  var anios=setAnios(desplazar), meses=setMeses(), n=C.cubo;
  var o={ n:0, cred:0, sost:0, g:{}, clase:{}, depto:{}, marca:{},
          credMarca:{}, credDepto:{}, sostMarca:{}, sostDepto:{}, ymAnio:{} };
  for(var i=0;i<n.length;i+=7){
    if(!pasa(i,saltar,anios,meses)) continue;
    var ym=n[i], gi=n[i+1], cl=n[i+2], de=n[i+3], ma=n[i+4], v=n[i+5], cr=n[i+6];
    var es = SOST[C.g[gi]] ? v : 0;
    o.n+=v; o.cred+=cr; o.sost+=es;
    o.g[gi]=(o.g[gi]||0)+v;
    o.clase[cl]=(o.clase[cl]||0)+v;
    var reg = F.region==="com" ? (REGION[C.depto[de]]||C.depto[de]) : C.depto[de];
    o.depto[reg]=(o.depto[reg]||0)+v;
    o.credDepto[reg]=(o.credDepto[reg]||0)+cr;
    o.sostDepto[reg]=(o.sostDepto[reg]||0)+es;
    o.marca[ma]=(o.marca[ma]||0)+v;
    o.credMarca[ma]=(o.credMarca[ma]||0)+cr;
    o.sostMarca[ma]=(o.sostMarca[ma]||0)+es;
    var a=YMY[ym], mm=YMM[ym];
    (o.ymAnio[a]=o.ymAnio[a]||{})[mm]=((o.ymAnio[a]||{})[mm]||0)+v;
  }
  return o;
}
function agregarMeses(meses, desplazar){
  var anios=setAnios(desplazar), n=C.cubo, o={n:0,cred:0,sost:0};
  for(var i=0;i<n.length;i+=7){
    var ym=n[i];
    if(!anios.has(YMY[ym])) continue;
    if(meses && meses.size && !meses.has(YMM[ym])) continue;
    if(F.seg.size && !F.seg.has(SEG_DE[n[i+2]])) continue;
    if(F.g.size && !F.g.has(n[i+1])) continue;
    if(F.clase.size && !F.clase.has(n[i+2])) continue;
    if(F.depto.size && !F.depto.has(n[i+3])) continue;
    if(F.marca.size && !F.marca.has(n[i+4])) continue;
    o.n+=n[i+5]; o.cred+=n[i+6];
    if(SOST[C.g[n[i+1]]]) o.sost+=n[i+5];
  }
  return o;
}
function agregarPorAnioMes(){
  /* {anio:{mes:{n,cred,sost}}} para la métrica activa */
  var anios=setAnios(), meses=setMeses(), n=C.cubo, o={};
  for(var i=0;i<n.length;i+=7){
    if(!pasa(i,null,anios,meses)) continue;
    var ym=n[i], a=YMY[ym], mm=YMM[ym], v=n[i+5], cr=n[i+6];
    var es = SOST[C.g[n[i+1]]] ? v : 0;
    var c=(o[a]=o[a]||{}); var d=(c[mm]=c[mm]||{n:0,cred:0,sost:0});
    d.n+=v; d.cred+=cr; d.sost+=es;
  }
  return o;
}
function referencias(desplazar){
  var anios=setAnios(desplazar), meses=setMeses(), n=C.lineas, m={};
  for(var i=0;i<n.length;i+=3){
    var ym=n[i];
    if(!anios.has(YMY[ym])) continue;
    if(meses && !meses.has(YMM[ym])) continue;
    var nom=C.linea[n[i+1]];
    if(F.marca.size){
      var ix=C.marca.indexOf(nom.split("|")[0]);
      if(ix<0 || !F.marca.has(ix)) continue;
    }
    m[nom]=(m[nom]||0)+n[i+2];
  }
  return m;
}
function financiacion(){
  var anios=setAnios(), n=C.entCubo, m={};
  for(var i=0;i<n.length;i+=4){
    if(!anios.has(C.entAnos[n[i]])) continue;
    if(F.g.size && !F.g.has(n[i+1])) continue;
    var e=C.ent[n[i+2]];
    m[e]=(m[e]||0)+n[i+3];
  }
  return m;
}

/* Meses que TIENEN dato en un año. Comparar un año completo contra uno
   en curso sin igualar los meses da una caida falsa: 2026 "cae 20%"
   solo porque le faltan cinco meses. */
var MESES_ANIO={};
C.ym.forEach(function(y){ var a=Math.floor(y/100), m=y%100;
  /* el ultimo mes del ultimo ano viene incompleto (el archivo corta el
     dia 8): no cuenta como mes comparable, o compararia 8 dias contra 30 */
  if(a===Math.floor(C.ym[C.ym.length-1]/100) && m===C.ym[C.ym.length-1]%100) return;
  (MESES_ANIO[a]=MESES_ANIO[a]||new Set()).add(m) });
function mesesComunes(anios){
  var s=null;
  anios.forEach(function(a){
    var m=MESES_ANIO[a]||new Set();
    if(s===null) s=new Set(Array.from(m));
    else s=new Set(Array.from(s).filter(function(x){return m.has(x)}));
  });
  return s||new Set();
}
function delta(act,ant){ return (ant==null||ant===0)?null:(act/ant-1)*100 }
function celdaDelta(v){
  if(v===null) return '<span style="color:var(--mut2)">&mdash;</span>';
  return '<span class="'+(v>=0?"pos":"neg")+'">'+(v>0?"+":"")+Math.round(v)+"%</span>";
}

/* ── Chart.js: base oscura común ────────────────────────────────── */
Chart.defaults.font.family = "Inter, system-ui, sans-serif";
Chart.defaults.font.size = 11;
Chart.defaults.color = "#8b9199";
var OPTS={};
function mk(id, type, data, opts){
  var el=$(id); if(!el) return;
  if(CH[id]) CH[id].destroy();
  var conf=Object.assign({
    responsive:true, maintainAspectRatio:false,
    interaction:{mode:"index",intersect:false},
    plugins:{
      legend:{labels:{boxWidth:10,boxHeight:10,usePointStyle:true,pointStyle:"rectRounded",padding:14}},
      tooltip:{backgroundColor:"#141719",borderColor:"#2a2e35",borderWidth:1,
               titleColor:"#fafafa",bodyColor:"#c9ced4",padding:11,cornerRadius:7,displayColors:true}
    },
    scales:{
      x:{grid:{color:"#1a1d22",drawTicks:false},border:{color:"#2a2e35"},ticks:{padding:7}},
      y:{grid:{color:"#1a1d22",drawTicks:false},border:{display:false},ticks:{padding:9}}
    }
  }, opts||{});
  OPTS[id]=conf;
  CH[id]=new Chart(el, {type:type, data:data, options:conf});
  return CH[id];
}

/* ── métricas ───────────────────────────────────────────────────── */
function pintarMetricas(){
  $("mets").innerHTML=Object.keys(METRICAS).map(function(k){
    return '<button class="met'+(F.metrica===k?" on":"")+'" data-met="'+k+'">'+METRICAS[k].lbl+'</button>';
  }).join("");
  $("mets").querySelectorAll("[data-met]").forEach(function(b){
    b.onclick=function(){ F.metrica=b.dataset.met; pintar() };
  });
}

/* ── menús ──────────────────────────────────────────────────────── */
var DIMS = {
  anio:  {lbl:"Todos", vals:function(){return ANIOS.map(function(a){return{i:a,n:String(a)}})}},
  mes:   {lbl:"Todos", vals:function(){return MESES.map(function(m,i){return{i:i+1,n:m}})}},
  seg:   {lbl:"Todos", vals:function(){return SEGS.map(function(s,i){return{i:i,n:s}})}},
  g:     {lbl:"Todos", arr:"g"},
  clase: {lbl:"Todas", arr:"clase"},
  depto: {lbl:"Todas", arr:"depto"},
  marca: {lbl:"Todas", arr:"marca"}
};
function pintarMenu(dim){
  var caja=document.querySelector('[data-dd="'+dim+'"]'), items;
  if(DIMS[dim].vals){
    var tot={};
    var anios=(dim==="anio")?new Set(ANIOS):setAnios();
    var meses=(dim==="mes")?null:setMeses();
    for(var i=0;i<C.cubo.length;i+=7){
      var ym=C.cubo[i];
      if(!anios.has(YMY[ym]) && dim!=="anio") continue;
      if(dim!=="mes" && meses && !meses.has(YMM[ym])) continue;
      if(dim!=="seg" && F.seg.size && !F.seg.has(SEG_DE[C.cubo[i+2]])) continue;
      if(F.seg.size && !F.seg.has(SEG_DE[C.cubo[i+2]])) continue;
      if(F.g.size && !F.g.has(C.cubo[i+1])) continue;
      if(F.clase.size && !F.clase.has(C.cubo[i+2])) continue;
      if(F.depto.size && !F.depto.has(C.cubo[i+3])) continue;
      if(F.marca.size && !F.marca.has(C.cubo[i+4])) continue;
      var k=(dim==="anio")?YMY[ym]:(dim==="mes"?YMM[ym]:SEG_DE[C.cubo[i+2]]);
      tot[k]=(tot[k]||0)+C.cubo[i+5];
    }
    items=DIMS[dim].vals().map(function(x){ return {i:x.i,n:x.n,v:tot[x.i]||0} });
  }else{
    var datos=agregar(dim);
    var mapa = dim==="g"?datos.g : dim==="clase"?datos.clase : dim==="marca"?datos.marca : null;
    if(dim==="depto"){
      /* el desglose por región usa nombres, no índices */
      var d2=agregar("depto");
      items=C.depto.map(function(nom,i){
        var reg = F.region==="com" ? (REGION[nom]||nom) : nom;
        return {i:i,n:nom,v:0,reg:reg};
      });
      var porNom={};
      for(var j=0;j<C.cubo.length;j+=7){
        if(!pasa(j,"depto",setAnios(),setMeses())) continue;
        porNom[C.cubo[j+3]]=(porNom[C.cubo[j+3]]||0)+C.cubo[j+5];
      }
      items.forEach(function(x){ x.v=porNom[x.i]||0 });
    }else{
      items=C[DIMS[dim].arr].map(function(nom,i){ return {i:i,n:nom,v:mapa[i]||0} });
    }
  }
  items=items.filter(function(x){ return x.v>0 || F[dim].has(x.i) })
             .sort(function(a,b){ return (dim==="mes"||dim==="anio") ? a.i-b.i : b.v-a.v });
  var h='<div class="acc"><button data-acc="todo">Todos</button><button data-acc="nada">Ninguno</button></div>';
  h+=items.map(function(x){
    return '<label><input type="checkbox" value="'+x.i+'"'+(F[dim].has(x.i)?" checked":"")+'>'
      +'<span>'+esc(x.n)+'</span><span class="tot num">'+mil(x.v)+'</span></label>';
  }).join("");
  caja.innerHTML=h;
  caja.querySelectorAll("input").forEach(function(inp){
    inp.onchange=function(){
      var v=+inp.value;
      if(inp.checked) F[dim].add(v); else F[dim].delete(v);
      if(dim==="mes" && F.ytd){ F.ytd=false }
      pintar();
    };
  });
  caja.querySelectorAll("[data-acc]").forEach(function(b){
    b.onclick=function(){
      if(b.dataset.acc==="todo") items.forEach(function(x){F[dim].add(x.i)}); else F[dim].clear();
      pintarMenu(dim); pintar();
    };
  });
}
function botones(){
  Object.keys(DIMS).forEach(function(dim){
    var b=document.querySelector('[data-dim="'+dim+'"]'), n=F[dim].size;
    b.className="ms"+(n?" has":"");
    var txt=DIMS[dim].lbl;
    if(n===1){
      var v=Array.from(F[dim])[0];
      txt = DIMS[dim].vals ? String(DIMS[dim].vals().filter(function(x){return x.i===v})[0].n)
                           : C[DIMS[dim].arr][v];
    }else if(n>1) txt="Varios";
    b.innerHTML=esc(txt)+(n>1?'<span class="n">'+n+'</span>':'<span class="ar">&#9660;</span>');
  });
}
document.querySelectorAll("[data-dim]").forEach(function(b){
  b.onclick=function(e){
    e.stopPropagation();
    var dim=b.dataset.dim, dd=document.querySelector('[data-dd="'+dim+'"]');
    var abierto=dd.classList.contains("on");
    document.querySelectorAll(".dd").forEach(function(x){x.classList.remove("on")});
    if(!abierto){ pintarMenu(dim); dd.classList.add("on") }
  };
});
document.querySelectorAll(".dd").forEach(function(d){ d.onclick=function(e){e.stopPropagation()} });
document.addEventListener("click",function(){
  document.querySelectorAll(".dd").forEach(function(x){x.classList.remove("on")});
});

function chips(){
  var h="";
  if(F.ytd) h+='<span class="chip">YTD &middot; ene a '+MESES[ULT_CERRADO-1]
    +'<button data-q="ytd" aria-label="Quitar">&times;</button></span>';
  Object.keys(DIMS).forEach(function(dim){
    Array.from(F[dim]).forEach(function(i){
      var nom = DIMS[dim].vals ? DIMS[dim].vals().filter(function(x){return x.i===i})[0].n
                               : C[DIMS[dim].arr][i];
      h+='<span class="chip">'+esc(nom)+'<button data-q="'+dim+'" data-i="'+i+'" aria-label="Quitar">&times;</button></span>';
    });
  });
  $("chips").innerHTML=h;
  $("chips").querySelectorAll("button").forEach(function(b){
    b.onclick=function(){
      if(b.dataset.q==="ytd") F.ytd=false; else F[b.dataset.q].delete(+b.dataset.i);
      pintar();
    };
  });
}

/* ── gráficos ───────────────────────────────────────────────────── */
function chartEvo(){
  var M=METRICAS[F.metrica], porAnio=agregarPorAnioMes();
  var anios=Object.keys(porAnio).map(Number).sort();
  var meses=setMeses();
  var labels=MESES.filter(function(m,i){ return !meses || meses.has(i+1) });
  var idx=MESES.map(function(m,i){return i+1}).filter(function(i){ return !meses || meses.has(i) });
  var ds=anios.map(function(a){
    return {
      label:String(a),
      data: idx.map(function(m){ var d=porAnio[a][m]; return d?M.f(d):null }),
      backgroundColor: cssVar(COL_A[a]||"var(--a26)"),
      borderRadius:3, borderSkipped:false, maxBarThickness:34
    };
  });
  mk("c-evo","bar",{labels:labels,datasets:ds},{
    scales:{
      x:{grid:{color:"#1a1d22",drawTicks:false},border:{color:"#2a2e35"}},
      y:{beginAtZero:true, max:M.max, grid:{color:"#1a1d22",drawTicks:false},border:{display:false},
         ticks:{callback:function(v){ return F.metrica==="unid" ? (v>=1000?(v/1000)+"k":v) : v+"%" }},
         title:{display:true,text:M.eje,color:"#5d636b",font:{size:10}}}
    },
    plugins:{tooltip:{callbacks:{label:function(c){
      return c.dataset.label+": "+(c.parsed.y==null?"—":M.fmt(c.parsed.y)) }}}}
  });

  var ult=anios[anios.length-1], pri=anios[0];
  /* solo los meses que los dos años tienen: si no, un año en curso
     "cae" simplemente porque le faltan meses */
  var com=mesesComunes([pri,ult]);
  var usar=idx.filter(function(m){ return com.has(m) });
  var sUlt=0,sPri=0;
  usar.forEach(function(m){ if(porAnio[ult]&&porAnio[ult][m]) sUlt+=porAnio[ult][m].n;
                            if(porAnio[pri]&&porAnio[pri][m]) sPri+=porAnio[pri][m].n });
  var txt="";
  if(anios.length>1){
    var d=delta(sUlt,sPri);
    var etiq = usar.length<12 ? 'De <b>'+MESES[usar[0]-1]+'</b> a <b>'+MESES[usar[usar.length-1]-1]+'</b>, que es lo comparable entre los dos, '
                              : 'Con los meses seleccionados, ';
    txt=etiq+'<b>'+pri+'</b> suma '+mil(sPri)+' unidades y <b>'+ult+'</b> '+mil(sUlt)+'. ';
    if(d!==null) txt+= d>=0?'Es <b>'+Math.round(d)+'% más</b>. ':'Es <b>'+Math.round(Math.abs(d))+'% menos</b>. ';
  }else{
    txt='Año '+pri+': <b>'+mil(sUlt||sPri)+'</b> unidades en los meses seleccionados. Marca varios años arriba para compararlos lado a lado. ';
  }
  if(ult===ULT_ANIO && (!meses || Array.from(meses).some(function(m){return m>ULT_CERRADO})))
    txt+='<b>Ojo:</b> '+MESES[ULT_CERRADO]+' de '+ULT_ANIO+' está incompleto (el archivo llega al día 8), por eso esa barra se ve corta. Usa <b>YTD</b> para comparar solo meses cerrados.';
  $("ins-evo").innerHTML='<span class="t">Lectura</span>'+txt;
}

function chartAnio(){
  var M=METRICAS[F.metrica], porAnio=agregarPorAnioMes();
  var anios=Object.keys(porAnio).map(Number).sort();
  var vals=anios.map(function(a){
    var t={n:0,cred:0,sost:0};
    Object.keys(porAnio[a]).forEach(function(m){ var d=porAnio[a][m]; t.n+=d.n; t.cred+=d.cred; t.sost+=d.sost });
    return M.f(t);
  });
  mk("c-anio","bar",{labels:anios.map(String),datasets:[{
    label:M.lbl, data:vals, backgroundColor:anios.map(function(a){return cssVar(COL_A[a]||"var(--a26)")}),
    borderRadius:4, borderSkipped:false, maxBarThickness:70
  }]},{
    plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){return M.fmt(c.parsed.y)}}}},
    scales:{y:{beginAtZero:true,max:M.max,grid:{color:"#1a1d22",drawTicks:false},border:{display:false},
      ticks:{callback:function(v){return F.metrica==="unid"?(v>=1000?(v/1000)+"k":v):v+"%"}}},
      x:{grid:{display:false},border:{color:"#2a2e35"}}}
  });
}

function chartMix(datos){
  var arr=Object.keys(datos.g).map(function(i){return {n:C.g[i],v:datos.g[i]}})
              .sort(function(a,b){return b.v-a.v});
  mk("c-mix","doughnut",{labels:arr.map(function(r){return r.n}),datasets:[{
    data:arr.map(function(r){return r.v}),
    backgroundColor:arr.map(function(r){return COL_G[r.n]||"#444"}),
    borderColor:"#0e1013", borderWidth:2
  }]},{
    cutout:"58%",
    scales:{x:{display:false},y:{display:false}},
    plugins:{legend:{position:"right",labels:{boxWidth:10,boxHeight:10,usePointStyle:true,pointStyle:"circle",padding:11}},
      tooltip:{callbacks:{label:function(c){
        return c.label+": "+mil(c.parsed)+" ("+fpct(pct(c.parsed,datos.n),1)+")" }}}}
  });
}

function chartClase(datos){
  var arr=Object.keys(datos.clase).map(function(i){return {n:C.clase[i],v:datos.clase[i]}})
              .sort(function(a,b){return b.v-a.v}).slice(0,8);
  mk("c-clase","bar",{labels:arr.map(function(r){return r.n}),datasets:[{
    label:"Unidades", data:arr.map(function(r){return r.v}),
    backgroundColor:"#3987e5", borderRadius:3, borderSkipped:false
  }]},{
    indexAxis:"y",
    plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){
      return mil(c.parsed.x)+" ("+fpct(pct(c.parsed.x,datos.n),1)+")" }}}},
    scales:{x:{beginAtZero:true,grid:{color:"#1a1d22",drawTicks:false},border:{display:false},
      ticks:{callback:function(v){return v>=1000?(v/1000)+"k":v}}},
      y:{grid:{display:false},border:{color:"#2a2e35"}}}
  });
  if(arr.length) $("ins-clase").innerHTML='<span class="t">Lectura</span><b>'+esc(arr[0].n)+'</b> concentra '
    +fpct(pct(arr[0].v,datos.n),1)+' del mercado filtrado'
    +(arr[1]?', seguida de <b>'+esc(arr[1].n)+'</b> con '+fpct(pct(arr[1].v,datos.n),1):'')+'.';
}

var CAUTIVAS=/TOYOTA|RCI|GM FINANCIAL|BMW|MERCEDES|VOLKSWAGEN FIN|FCA|STELLANTIS/i;
function chartFin(){
  var m=financiacion();
  var arr=Object.keys(m).map(function(e){return {n:e,v:m[e]}}).sort(function(a,b){return b.v-a.v}).slice(0,12);
  if(!arr.length){ $("ins-fin").innerHTML=""; return }
  var tot=arr.reduce(function(a,b){return a+b.v},0);
  mk("c-fin","bar",{labels:arr.map(function(r){return r.n.length>34?r.n.slice(0,32)+"…":r.n}),datasets:[{
    label:"Prendas", data:arr.map(function(r){return r.v}),
    backgroundColor:arr.map(function(r){return CAUTIVAS.test(r.n)?"#d95926":"#3987e5"}),
    borderRadius:3, borderSkipped:false
  }]},{
    indexAxis:"y",
    plugins:{legend:{display:false},tooltip:{callbacks:{label:function(c){
      return mil(c.parsed.x)+" ("+fpct(pct(c.parsed.x,tot),1)+")" }}}},
    scales:{x:{beginAtZero:true,grid:{color:"#1a1d22",drawTicks:false},border:{display:false},
      ticks:{callback:function(v){return v>=1000?(v/1000)+"k":v}}},
      y:{grid:{display:false},border:{color:"#2a2e35"},ticks:{font:{size:10}}}}
  });
  var cau=arr.filter(function(r){return CAUTIVAS.test(r.n)});
  var sc=cau.reduce(function(a,b){return a+b.v},0);
  $("ins-fin").innerHTML='<span class="t">Lectura</span>De las prendas del filtro, <b>'
    +esc(arr[0].n)+'</b> pone el '+fpct(pct(arr[0].v,tot),1)+'. '
    +(sc>0?'<b>'+fpct(pct(sc,tot),1)+' es financiación cautiva de marca</b> ('
        +cau.map(function(r){return esc(r.n.split(" ")[0])}).join(", ")
        +'): plata que financia sus propios carros y que un distribuidor sin banco propio no iguala. Es la pregunta para Corautos.'
      :'No aparece financiación cautiva en este corte: el terreno está parejo.');
}

/* ── tablas ─────────────────────────────────────────────────────── */
function tabla(id, filas, total, cols){
  var o=ORD[id];
  filas.sort(function(a,b){
    var A=o.k==="n"?a.n:(o.k==="c"?pct(a.c,a.v):(o.k==="d"?(a.d===null?-1e9:a.d):a.v));
    var B=o.k==="n"?b.n:(o.k==="c"?pct(b.c,b.v):(o.k==="d"?(b.d===null?-1e9:b.d):b.v));
    return o.k==="n" ? o.d*String(A).localeCompare(String(B)) : o.d*(A-B);
  });
  var mx=Math.max.apply(null,filas.map(function(r){return r.v}))||1;
  var tb=$("tb-"+id);
  if(!filas.length){ tb.innerHTML='<tr><td colspan="5" class="vacio">Sin datos con estos filtros.</td></tr>'; return }
  tb.innerHTML=filas.slice(0,14).map(function(r){
    var h='<tr><td>'+esc(r.n)+'<span class="bar-in" style="width:'+(r.v/mx*100)+'%"></span></td>'
      +'<td class="r num">'+mil(r.v)+'</td>';
    if(cols>2) h+='<td class="r num">'+fpct(pct(r.v,total),1)+'</td>';
    h+='<td class="r num">'+celdaDelta(r.d)+'</td>';
    if(cols>3) h+='<td class="r num">'+(r.v?fpct(pct(r.c,r.v),0):"&mdash;")+'</td>';
    return h+'</tr>';
  }).join("");
}
document.querySelectorAll("th[data-s]").forEach(function(th){
  th.onclick=function(){
    var id=th.closest("table").querySelector("tbody").id.replace("tb-","");
    var k=th.dataset.s;
    if(ORD[id].k===k) ORD[id].d*=-1; else { ORD[id].k=k; ORD[id].d=(k==="n"?1:-1) }
    pintar();
  };
});

/* ── KPIs ───────────────────────────────────────────────────────── */
function kpis(datos, justo, justoAnt, comun){
  var meses=setMeses();
  var nMeses=(meses?meses.size:12)*(F.anio.size||ANIOS.length);
  $("k1k").textContent=METRICAS[F.metrica].lbl;
  $("k1").textContent=F.metrica==="unid"?mil(datos.n):METRICAS[F.metrica].fmt(METRICAS[F.metrica].f(datos));
  $("k1d").textContent=(F.anio.size?Array.from(F.anio).sort().join(", "):ANIOS[0]+"–"+ANIOS[ANIOS.length-1])
    +(F.ytd?" · YTD a "+MESES[ULT_CERRADO-1]:"");
  $("k2").textContent=mil(datos.n/Math.max(nMeses,1));
  $("k2d").textContent=nMeses+(nMeses===1?" mes":" meses")+" en el filtro";
  var d=justoAnt&&justoAnt.n?delta(justo.n,justoAnt.n):null;
  var e3=$("k3");
  if(d===null){ e3.textContent="—"; e3.className="v num"; $("k3d").textContent="sin año anterior comparable" }
  else{ e3.textContent=(d>0?"+":"")+Math.round(d)+"%"; e3.className="v num"+(d>=0?" w":" a");
        var nm=comun?comun.size:0;
        $("k3d").textContent = nm && nm<12 ? "solo los "+nm+" meses comparables" : "mismos meses del año anterior" }
  $("k4").textContent=fpct(pct(datos.sost,datos.n),1);
  $("k4d").textContent="híbridos y eléctricos";
  $("k5").textContent=fpct(pct(datos.cred,datos.n),1);
  $("k5d").textContent=mil(datos.cred)+" con prenda";
}

/* ── pintar ─────────────────────────────────────────────────────── */
function pintar(){
  var datos=agregar(), prev=agregar(null,true);
  /* para el comparativo interanual se recortan ambos lados a los meses
     que existen en los dos periodos */
  var selA=Array.from(setAnios()), comun=mesesComunes(selA.concat(selA.map(function(a){return a-1})));
  var justo=agregarMeses(comun,false), justoAnt=agregarMeses(comun,true);
  pintarMetricas(); botones(); chips(); kpis(datos,justo,justoAnt,comun);
  chartEvo(); chartAnio(); chartMix(datos); chartClase(datos); chartFin();

  $("sub-region").innerHTML = F.region==="com"
    ? "Agrupada como se lee el mercado en la práctica: <b>Bogotá y Cundinamarca son un solo mercado</b>, y la Costa, el Eje Cafetero y los Santanderes van juntos."
    : "Departamento <b>donde vive el comprador</b>, no donde se matriculó la placa. Ojo: Bogotá D.C. y Cundinamarca aparecen separados, como los divide el RUNT.";

  tabla("marca", Object.keys(datos.marca).map(function(i){
    return {n:C.marca[i], v:datos.marca[i], c:datos.credMarca[i]||0,
            d:delta(datos.marca[i], prev.marca[i])};
  }), datos.n, 4);

  tabla("depto", Object.keys(datos.depto).map(function(k){
    return {n:k, v:datos.depto[k], c:datos.credDepto[k]||0, d:delta(datos.depto[k], prev.depto[k])};
  }), datos.n, 4);

  var ref=referencias(), refAnt=referencias(true);
  tabla("linea", Object.keys(ref).map(function(k){
    return {n:k.replace("|"," "), v:ref[k], c:0, d:delta(ref[k],refAnt[k])};
  }), datos.n, 2);
}

/* ── controles ──────────────────────────────────────────────────── */
$("ytd").onclick=function(){ F.ytd=!F.ytd; if(F.ytd) F.mes.clear(); this.classList.toggle("on",F.ytd); pintar() };
$("rg-dep").onclick=function(){ F.region="dep"; F.depto.clear();
  this.classList.add("on"); $("rg-com").classList.remove("on"); pintar() };
$("rg-com").onclick=function(){ F.region="com"; F.depto.clear();
  this.classList.add("on"); $("rg-dep").classList.remove("on"); pintar() };
$("limpiar").onclick=function(){
  Object.keys(DIMS).forEach(function(d){ F[d].clear() });
  F.ytd=false; $("ytd").classList.remove("on"); pintar();
};
$("csv").onclick=function(){
  var datos=agregar(), prev=agregar(null,true);
  var out=["dimension,valor,unidades,participacion,vs_anio_anterior,credito_pct"];
  function fila(dim,nom,v,pa,cr){
    out.push([dim,'"'+String(nom).replace(/"/g,'""')+'"',v,
      pct(v,datos.n).toFixed(2).replace(".",","),
      pa?((v/pa-1)*100).toFixed(1).replace(".",","):"",
      cr!=null?pct(cr,v).toFixed(1).replace(".",","):""].join(","));
  }
  Object.keys(datos.marca).forEach(function(i){ fila("Marca",C.marca[i],datos.marca[i],prev.marca[i],datos.credMarca[i]) });
  Object.keys(datos.depto).forEach(function(k){ fila("Region",k,datos.depto[k],prev.depto[k],datos.credDepto[k]) });
  Object.keys(datos.clase).forEach(function(i){ fila("Categoria",C.clase[i],datos.clase[i],prev.clase[i],null) });
  Object.keys(datos.g).forEach(function(i){ fila("Combustible",C.g[i],datos.g[i],prev.g[i],null) });
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["﻿"+out.join("\n")],{type:"text/csv;charset=utf-8"}));
  a.download="torq-mercado.csv";
  document.body.appendChild(a); a.click(); a.remove();
};

/* ── ampliar ────────────────────────────────────────────────────── */
(function(){
  var M=$("modal");
  function cerrar(){ M.classList.remove("on"); if(CH.modalC){CH.modalC.destroy(); delete CH.modalC}
                     document.body.style.overflow="" }
  $("modalX").onclick=cerrar;
  M.onclick=function(e){ if(e.target===M) cerrar() };
  document.addEventListener("keydown",function(e){ if(e.key==="Escape"&&M.classList.contains("on")) cerrar() });
  document.querySelectorAll("[data-amp]").forEach(function(p){
    var b=document.createElement("button");
    b.className="amp"; b.textContent="Ampliar";
    b.onclick=function(){
      var orig=CH[p.dataset.amp]; if(!orig) return;
      $("modalT").textContent=(p.querySelector("h2")||{}).textContent||"Gráfico";
      M.classList.add("on"); document.body.style.overflow="hidden";
      if(CH.modalC) CH.modalC.destroy();
      /* se reusan las opciones ORIGINALES (OPTS), no chart.options: estas
         ultimas ya vienen resueltas por Chart.js y clonarlas rompe el
         parser de colores ("t.startsWith is not a function"). */
      CH.modalC=new Chart($("modalC"),{
        type:orig.config.type,
        data:orig.config.data,
        options:OPTS[p.dataset.amp]
      });
    };
    p.appendChild(b);
  });
})();

pintar();
})();
