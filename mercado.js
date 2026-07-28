/* ═══════════════════════════════════════════════════════════════════
   TORQ — Mercado automotor
   Explora el cubo de CUBO (cubo.js) con filtros que se cruzan entre sí.

   El cubo es un arreglo plano de enteros, 7 por celda:
     [ym, combustible, clase, departamento, marca, unidades, conCrédito]
   Los cinco primeros son índices a los diccionarios del propio cubo. Un
   arreglo plano pesa mucho menos que objetos y recorrerlo entero son
   ~100k iteraciones: instantáneo, y evita tener que pre-calcular cada
   combinación posible de filtros.
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

/* colores por combustible: identidad, no magnitud */
var COL = {"Gasolina":"var(--neutral)","Diésel":"#6b7280","Híbrido":"var(--s1)",
  "Eléctrico":"var(--s3)","Gas":"var(--s5)","Híbrido diésel":"var(--s4)","Otro":"#3f4450"};
var SOST = {"Híbrido":1,"Eléctrico":1,"Híbrido diésel":1};

var F = { d1:0, d2:C.ym.length-1, g:new Set(), clase:new Set(), depto:new Set(), marca:new Set() };
var ORD = { marca:{k:"v",d:-1}, depto:{k:"v",d:-1}, linea:{k:"v",d:-1} };

/* etiqueta legible de un ym numérico: 202603 → mar 2026 */
var MES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
function lblYm(ym){ return MES[(ym%100)-1]+" "+Math.floor(ym/100) }

/* ── recorrido del cubo ───────────────────────────────────────────
   Devuelve totales y desgloses en UNA pasada. `saltar` permite pedir
   el desglose de una dimensión ignorando su propio filtro, que es lo
   que hace que un menú siga mostrando las demás opciones. */
function recorrer(i1, i2, saltar){
  var n=C.cubo, out={
    tot:0, cred:0, sost:0,
    porYm:{}, porG:{}, porClase:{}, porDepto:{}, porMarca:{},
    credMarca:{}, credDepto:{}
  };
  for(var i=0;i<n.length;i+=7){
    var ym=n[i], g=n[i+1], cl=n[i+2], de=n[i+3], ma=n[i+4], v=n[i+5], cr=n[i+6];
    if(ym<i1||ym>i2) continue;
    if(saltar!=="g"     && F.g.size     && !F.g.has(g))         continue;
    if(saltar!=="clase" && F.clase.size && !F.clase.has(cl))    continue;
    if(saltar!=="depto" && F.depto.size && !F.depto.has(de))    continue;
    if(saltar!=="marca" && F.marca.size && !F.marca.has(ma))    continue;
    out.tot+=v; out.cred+=cr;
    if(SOST[C.g[g]]) out.sost+=v;
    out.porYm[ym]=(out.porYm[ym]||0)+v;
    out.porG[g]=(out.porG[g]||0)+v;
    out.porClase[cl]=(out.porClase[cl]||0)+v;
    out.porDepto[de]=(out.porDepto[de]||0)+v;
    out.porMarca[ma]=(out.porMarca[ma]||0)+v;
    out.credMarca[ma]=(out.credMarca[ma]||0)+cr;
    out.credDepto[de]=(out.credDepto[de]||0)+cr;
  }
  return out;
}
/* serie por combustible y mes, para el gráfico apilado */
function serieEvo(i1,i2){
  var n=C.cubo, m={};
  for(var i=0;i<n.length;i+=7){
    var ym=n[i], g=n[i+1];
    if(ym<i1||ym>i2) continue;
    if(F.g.size && !F.g.has(g)) continue;
    if(F.clase.size && !F.clase.has(n[i+2])) continue;
    if(F.depto.size && !F.depto.has(n[i+3])) continue;
    if(F.marca.size && !F.marca.has(n[i+4])) continue;
    (m[ym]=m[ym]||{})[g]=(m[ym][g]||0)+n[i+5];
  }
  return m;
}
/* referencias: viven en su propio cubo (ym, referencia, unidades) y
   solo se pueden filtrar por período y por marca */
function referencias(i1,i2){
  var n=C.lineas, m={};
  for(var i=0;i<n.length;i+=3){
    if(n[i]<i1||n[i]>i2) continue;
    var nom=C.linea[n[i+1]];
    if(F.marca.size){
      var ma=nom.split("|")[0];
      if(C.marca.indexOf(ma)<0 || !F.marca.has(C.marca.indexOf(ma))) continue;
    }
    m[nom]=(m[nom]||0)+n[i+2];
  }
  return m;
}

/* ── período anterior de igual duración ──────────────────────── */
function rangoAnterior(){
  var d=F.d2-F.d1+1, a=F.d1-d;
  return a<0 ? null : {i1:a, i2:F.d1-1};
}
function delta(act,ant){
  if(ant==null||ant===0) return null;
  return (act/ant-1)*100;
}
function celdaDelta(v){
  if(v===null) return '<span style="color:var(--mut2)">&mdash;</span>';
  var c = v>=0 ? "pos" : "neg";
  return '<span class="'+c+'">'+(v>0?"+":"")+Math.round(v)+"%</span>";
}

/* ── menús desplegables ──────────────────────────────────────── */
var DIMS = {
  g:     {arr:"g",     lbl:"Todos"},
  clase: {arr:"clase", lbl:"Todas"},
  depto: {arr:"depto", lbl:"Todas"},
  marca: {arr:"marca", lbl:"Todas"}
};
function pintarMenu(dim){
  var conf=DIMS[dim], caja=document.querySelector('[data-dd="'+dim+'"]');
  var datos=recorrer(F.d1, F.d2, dim);
  var mapa = dim==="g"?datos.porG : dim==="clase"?datos.porClase :
             dim==="depto"?datos.porDepto : datos.porMarca;
  var items=C[conf.arr].map(function(nom,i){ return {i:i,n:nom,v:mapa[i]||0} })
                       .filter(function(x){ return x.v>0 || F[dim].has(x.i) })
                       .sort(function(a,b){ return b.v-a.v });
  var h='<div class="acc"><button data-acc="todo">Todos</button><button data-acc="nada">Ninguno</button></div>';
  h+=items.map(function(x){
    return '<label><input type="checkbox" value="'+x.i+'"'+(F[dim].has(x.i)?" checked":"")+'>'
      +'<span>'+esc(x.n)+'</span><span class="tot num">'+mil(x.v)+'</span></label>';
  }).join("");
  caja.innerHTML=h;
  caja.querySelectorAll('input').forEach(function(inp){
    inp.onchange=function(){
      var v=+inp.value;
      if(inp.checked) F[dim].add(v); else F[dim].delete(v);
      pintar();
    };
  });
  caja.querySelectorAll('[data-acc]').forEach(function(b){
    b.onclick=function(){
      if(b.dataset.acc==="todo") items.forEach(function(x){F[dim].add(x.i)});
      else F[dim].clear();
      pintarMenu(dim); pintar();
    };
  });
}
function botones(){
  Object.keys(DIMS).forEach(function(dim){
    var b=document.querySelector('[data-dim="'+dim+'"]');
    var n=F[dim].size;
    b.className="ms"+(n?" has":"");
    b.innerHTML=(n?(n===1?esc(C[DIMS[dim].arr][Array.from(F[dim])[0]]):DIMS[dim].lbl.replace(/^Tod\w+/,"Varios"))
                 :DIMS[dim].lbl)+' <span class="ar">&#9660;</span>'+(n>1?'<span class="n">'+n+'</span>':'');
  });
}
document.querySelectorAll('[data-dim]').forEach(function(b){
  b.onclick=function(e){
    e.stopPropagation();
    var dim=b.dataset.dim, dd=document.querySelector('[data-dd="'+dim+'"]');
    var abierto=dd.classList.contains("on");
    document.querySelectorAll('.dd').forEach(function(x){x.classList.remove("on")});
    if(!abierto){ pintarMenu(dim); dd.classList.add("on") }
  };
});
document.querySelectorAll('.dd').forEach(function(d){ d.onclick=function(e){e.stopPropagation()} });
document.addEventListener("click",function(){
  document.querySelectorAll('.dd').forEach(function(x){x.classList.remove("on")});
});

/* ── chips de filtros activos ────────────────────────────────── */
function chips(){
  var h="";
  Object.keys(DIMS).forEach(function(dim){
    Array.from(F[dim]).forEach(function(i){
      h+='<span class="chip">'+esc(C[DIMS[dim].arr][i])
        +'<button data-q="'+dim+'" data-i="'+i+'" aria-label="Quitar">&times;</button></span>';
    });
  });
  $("chips").innerHTML=h;
  $("chips").querySelectorAll('button').forEach(function(b){
    b.onclick=function(){ F[b.dataset.q].delete(+b.dataset.i); pintar() };
  });
}

/* ── gráfico de evolución ────────────────────────────────────── */
function evo(datos){
  var m=serieEvo(F.d1,F.d2);
  var yms=Object.keys(m).map(Number).sort(function(a,b){return a-b});  /* indices */
  if(!yms.length){ $("evo").innerHTML='<div class="vacio">No hay datos con estos filtros.</div>'; $("leg-evo").innerHTML=""; return }
  var gs={}; yms.forEach(function(y){ Object.keys(m[y]).forEach(function(g){ gs[g]=(gs[g]||0)+m[y][g] }) });
  var orden=Object.keys(gs).map(Number).sort(function(a,b){return gs[b]-gs[a]});
  var W=1300,H=340,ml=62,mr=20,mt=22,mb=42;
  var mx=0; yms.forEach(function(y){ var t=0; orden.forEach(function(g){t+=m[y][g]||0}); if(t>mx)mx=t });
  mx*=1.08;
  var bw=(W-ml-mr)/yms.length;
  var Y=function(v){ return mt+(1-v/mx)*(H-mt-mb) };
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Evolución mensual">';
  var paso=Math.pow(10,Math.floor(Math.log10(mx)));
  if(mx/paso<3) paso/=2;
  for(var g=0;g<=mx;g+=paso){
    s+='<line class="gl" x1="'+ml+'" y1="'+Y(g)+'" x2="'+(W-mr)+'" y2="'+Y(g)+'"/>';
    s+='<text class="tk" x="'+(ml-9)+'" y="'+(Y(g)+3.5)+'" text-anchor="end">'+(g>=1000?(g/1000)+"k":g)+'</text>';
  }
  yms.forEach(function(y,i){
    var x=ml+i*bw+bw*0.16, w=Math.max(bw*0.68,1.5), acc=0;
    orden.forEach(function(gi){
      var v=m[y][gi]||0; if(!v) return;
      var alto=Y(acc)-Y(acc+v);
      s+='<rect x="'+x+'" y="'+Y(acc+v)+'" width="'+w+'" height="'+Math.max(alto,0.6)+'" fill="'+(COL[C.g[gi]]||"#444")+'" fill-opacity=".9"><title>'+lblYm(C.ym[y])+' · '+esc(C.g[gi])+': '+mil(v)+'</title></rect>';
      acc+=v;
    });
  });
  var cada=Math.max(1,Math.ceil(yms.length/14));
  yms.forEach(function(y,i){
    if(i%cada) return;
    s+='<text class="tk" x="'+(ml+i*bw+bw/2)+'" y="'+(H-mb+18)+'" text-anchor="middle">'+lblYm(C.ym[y])+'</text>';
  });
  s+='</svg>';
  $("evo").innerHTML=s;
  $("leg-evo").innerHTML=orden.map(function(gi){
    return '<i><b style="background:'+(COL[C.g[gi]]||"#444")+'"></b>'+esc(C.g[gi])+'</i>';
  }).join("");

  /* lectura que se recalcula con el filtro */
  var pri=m[yms[0]], ult=m[yms[yms.length-1]];
  var tp=0,tu=0; orden.forEach(function(g){ tp+=pri[g]||0; tu+=ult[g]||0 });
  var mejor=orden[0];
  var txt='En <b>'+lblYm(C.ym[yms[0]])+'</b> el mercado filtrado matriculó <b>'+mil(tp)+'</b> unidades y en <b>'+lblYm(C.ym[yms[yms.length-1]])+'</b> '+mil(tu)+'. ';
  var d=delta(tu,tp);
  if(d!==null) txt += d>=0 ? 'Es un crecimiento de <b>'+Math.round(d)+'%</b> entre puntas. '
                           : 'Es una caída de <b>'+Math.round(Math.abs(d))+'%</b> entre puntas. ';
  txt+='El combustible dominante es <b>'+esc(C.g[mejor])+'</b>, con '+fpct(pct(gs[mejor],datos.tot),1)+' del total del período. ';
  if(C.ym[yms[yms.length-1]]===202607) txt+='<b>Ojo:</b> julio de 2026 va hasta el día 8, por eso la última barra se ve corta.';
  $("ins-evo").innerHTML='<span class="t">Lectura</span>'+txt;
}

/* ── tablas ──────────────────────────────────────────────────── */
function tabla(id, filas, total, conCredito){
  var o=ORD[id];
  filas.sort(function(a,b){
    var A = o.k==="n"?a.n:(o.k==="v"?a.v:(o.k==="p"?a.v:(o.k==="c"?a.c:(a.d===null?-1e9:a.d))));
    var B = o.k==="n"?b.n:(o.k==="v"?b.v:(o.k==="p"?b.v:(o.k==="c"?b.c:(b.d===null?-1e9:b.d))));
    if(o.k==="n") return o.d*String(A).localeCompare(String(B));
    return o.d*(A-B);
  });
  var mx=Math.max.apply(null,filas.map(function(r){return r.v}))||1;
  var tb=$("tb-"+id);
  if(!filas.length){ tb.innerHTML='<tr><td colspan="5" class="vacio">Sin datos con estos filtros.</td></tr>'; return }
  tb.innerHTML=filas.slice(0,14).map(function(r){
    var h='<tr><td>'+esc(r.n)+'<span class="bar-in" style="width:'+(r.v/mx*100)+'%"></span></td>'
      +'<td class="r num">'+mil(r.v)+'</td>';
    if(conCredito!=="corta") h+='<td class="r num">'+fpct(pct(r.v,total),1)+'</td>';
    h+='<td class="r num">'+celdaDelta(r.d)+'</td>';
    if(conCredito===true) h+='<td class="r num">'+(r.v?fpct(pct(r.c,r.v),0):"&mdash;")+'</td>';
    return h+'</tr>';
  }).join("");
}
document.querySelectorAll('th[data-s]').forEach(function(th){
  th.onclick=function(){
    var id=th.closest("table").querySelector("tbody").id.replace("tb-","");
    var k=th.dataset.s;
    if(ORD[id].k===k) ORD[id].d*=-1; else { ORD[id].k=k; ORD[id].d=(k==="n"?1:-1) }
    pintar();
  };
});

/* ── categorías ──────────────────────────────────────────────── */
function clases(datos){
  var arr=Object.keys(datos.porClase).map(function(i){ return {n:C.clase[i], v:datos.porClase[i]} })
                .sort(function(a,b){return b.v-a.v}).slice(0,8);
  if(!arr.length){ $("clases").innerHTML='<div class="vacio">Sin datos.</div>'; $("ins-clase").innerHTML=""; return }
  var W=560,H=arr.length*30+16,ml=118,mr=64;
  var mx=arr[0].v;
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Categorías">';
  arr.forEach(function(r,i){
    var y=8+i*30, w=r.v/mx*(W-ml-mr);
    s+='<text class="lbm" x="'+(ml-11)+'" y="'+(y+15)+'" text-anchor="end" fill="var(--paper)">'+esc(r.n)+'</text>';
    s+='<rect x="'+ml+'" y="'+(y+3)+'" width="'+Math.max(w,1)+'" height="16" rx="3" fill="var(--s1)" fill-opacity=".8"/>';
    s+='<text class="tk" x="'+(ml+w+8)+'" y="'+(y+15.5)+'">'+mil(r.v)+'</text>';
  });
  s+='</svg>';
  $("clases").innerHTML=s;
  var top=arr[0];
  $("ins-clase").innerHTML='<span class="t">Lectura</span><b>'+esc(top.n)+'</b> concentra '
    +fpct(pct(top.v,datos.tot),1)+' del mercado filtrado'
    +(arr[1]?', seguida de <b>'+esc(arr[1].n)+'</b> con '+fpct(pct(arr[1].v,datos.tot),1):'')+'.';
}

/* ── financiación ────────────────────────────────────────────── */
var CAUTIVAS=/TOYOTA|RCI|GM FINANCIAL|BMW|MERCEDES|VOLKSWAGEN FIN|FCA|STELLANTIS/i;
function financiacion(datos){
  var a1=C.ym[F.d1], a2=C.ym[F.d2], m={};
  for(var i=0;i<C.entCubo.length;i+=4){
    var y=C.entAnos[C.entCubo[i]], g=C.entCubo[i+1];
    if(y*100+12 < a1 || y*100+1 > a2) continue;
    if(F.g.size && !F.g.has(g)) continue;
    var e=C.ent[C.entCubo[i+2]];
    m[e]=(m[e]||0)+C.entCubo[i+3];
  }
  var arr=Object.keys(m).map(function(e){return {n:e,v:m[e]}}).sort(function(a,b){return b.v-a.v}).slice(0,12);
  if(!arr.length){ $("fin").innerHTML='<div class="vacio">Sin datos de financiación con estos filtros.</div>'; $("ins-fin").innerHTML=""; return }
  var tot=arr.reduce(function(a,b){return a+b.v},0);
  var W=1300,H=arr.length*28+16,ml=300,mr=90;
  var mx=arr[0].v;
  var s='<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Entidades financiadoras">';
  arr.forEach(function(r,i){
    var y=8+i*28, w=r.v/mx*(W-ml-mr), cau=CAUTIVAS.test(r.n);
    s+='<text class="lbm" x="'+(ml-11)+'" y="'+(y+14)+'" text-anchor="end" fill="var(--paper)">'+esc(r.n.length>42?r.n.slice(0,40)+"…":r.n)+'</text>';
    s+='<rect x="'+ml+'" y="'+(y+2)+'" width="'+Math.max(w,1)+'" height="15" rx="3" fill="'+(cau?"var(--s2)":"var(--s1)")+'" fill-opacity=".82"/>';
    s+='<text class="tk" x="'+(ml+w+8)+'" y="'+(y+13.5)+'">'+mil(r.v)+' &middot; '+fpct(pct(r.v,tot),1)+'</text>';
  });
  s+='</svg>';
  $("fin").innerHTML='<div class="leg"><i><b style="background:var(--s1)"></b>Banca abierta</i>'
    +'<i><b style="background:var(--s2)"></b>Financiación cautiva de marca</i></div>'+s;
  var cau=arr.filter(function(r){return CAUTIVAS.test(r.n)});
  var sc=cau.reduce(function(a,b){return a+b.v},0);
  $("ins-fin").innerHTML='<span class="t">Lectura</span>'
    +'De las prendas del período filtrado, <b>'+esc(arr[0].n)+'</b> pone el '+fpct(pct(arr[0].v,tot),1)+'. '
    +(sc>0 ? '<b>'+fpct(pct(sc,tot),1)+' es financiación cautiva de marca</b> ('+cau.map(function(r){return esc(r.n.split(" ")[0])}).join(", ")
             +'): plata que financia sus propios carros y que un distribuidor sin banco propio no puede igualar. Es la pregunta que hay que hacerle a Corautos.'
           : 'No aparece financiación cautiva de marca en este corte: el terreno está parejo.');
}

/* ── KPIs ────────────────────────────────────────────────────── */
function kpis(datos){
  var meses=F.d2-F.d1+1;
  var ant=rangoAnterior();
  var dAnt=null;
  if(ant){
    var pv=recorrer(ant.i1,ant.i2);
    dAnt=delta(datos.tot,pv.tot);
  }
  $("k1").textContent=mil(datos.tot);
  $("k1d").textContent=lblYm(C.ym[F.d1])+" a "+lblYm(C.ym[F.d2]);
  $("k2").textContent=mil(datos.tot/meses);
  $("k2d").textContent=meses+(meses===1?" mes":" meses")+" en el rango";
  var e3=$("k3");
  if(dAnt===null){ e3.textContent="—"; e3.className="v num"; $("k3d").textContent="sin período anterior comparable" }
  else{ e3.textContent=(dAnt>0?"+":"")+Math.round(dAnt)+"%"; e3.className="v num"+(dAnt>=0?" w":" a");
        $("k3d").textContent="contra los "+meses+" meses anteriores" }
  $("k4").textContent=fpct(pct(datos.sost,datos.tot),1);
  $("k4d").textContent="híbridos y eléctricos";
  $("k5").textContent=fpct(pct(datos.cred,datos.tot),1);
  $("k5d").textContent=mil(datos.cred)+" con prenda";
}

/* ── pintar todo ─────────────────────────────────────────────── */
function pintar(){
  var datos=recorrer(F.d1,F.d2);
  var ant=rangoAnterior();
  var pv=ant?recorrer(ant.i1,ant.i2):null;

  botones(); chips(); kpis(datos); evo(datos); clases(datos); financiacion(datos);

  tabla("marca", Object.keys(datos.porMarca).map(function(i){
    return {n:C.marca[i], v:datos.porMarca[i], c:datos.credMarca[i]||0,
            d:pv?delta(datos.porMarca[i], pv.porMarca[i]):null};
  }), datos.tot, true);

  tabla("depto", Object.keys(datos.porDepto).map(function(i){
    return {n:C.depto[i], v:datos.porDepto[i], c:datos.credDepto[i]||0,
            d:pv?delta(datos.porDepto[i], pv.porDepto[i]):null};
  }), datos.tot, true);

  var ref=referencias(F.d1,F.d2);
  var refAnt=ant?referencias(ant.i1,ant.i2):{};
  tabla("linea", Object.keys(ref).map(function(k){
    return {n:k.replace("|"," "), v:ref[k], c:0, d:ant?delta(ref[k],refAnt[k]):null};
  }), datos.tot, "corta");
}

/* ── período ─────────────────────────────────────────────────── */
function llenarPeriodo(){
  var o=C.ym.map(function(y,i){ return '<option value="'+i+'">'+lblYm(y)+'</option>' }).join("");
  $("f-d1").innerHTML=o; $("f-d2").innerHTML=o;
  $("f-d1").value=F.d1; $("f-d2").value=F.d2;
  $("f-d1").onchange=function(){ F.d1=+this.value; if(F.d1>F.d2){F.d2=F.d1;$("f-d2").value=F.d2} pintar() };
  $("f-d2").onchange=function(){ F.d2=+this.value; if(F.d2<F.d1){F.d1=F.d2;$("f-d1").value=F.d1} pintar() };
}
$("limpiar").onclick=function(){
  F.g.clear(); F.clase.clear(); F.depto.clear(); F.marca.clear();
  F.d1=0; F.d2=C.ym.length-1; $("f-d1").value=0; $("f-d2").value=F.d2;
  pintar();
};
$("csv").onclick=function(){
  var datos=recorrer(F.d1,F.d2);
  var ant=rangoAnterior(), pv=ant?recorrer(ant.i1,ant.i2):null;
  var out=["dimension,valor,unidades,participacion,vs_anterior,credito"];
  function agrega(dim,mapa,arr,cred){
    Object.keys(mapa).forEach(function(i){
      var v=mapa[i], pa=pv?pv[arr.pv][i]:null;
      out.push([dim,'"'+C[arr.a][i].replace(/"/g,'""')+'"',v,
        (pct(v,datos.tot)).toFixed(2).replace(".",","),
        pa?((v/pa-1)*100).toFixed(1).replace(".",","):"",
        cred?(pct(cred[i]||0,v)).toFixed(1).replace(".",","):""].join(","));
    });
  }
  agrega("Marca",datos.porMarca,{a:"marca",pv:"porMarca"},datos.credMarca);
  agrega("Departamento",datos.porDepto,{a:"depto",pv:"porDepto"},datos.credDepto);
  agrega("Categoria",datos.porClase,{a:"clase",pv:"porClase"},null);
  agrega("Combustible",datos.porG,{a:"g",pv:"porG"},null);
  var a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob(["﻿"+out.join("\n")],{type:"text/csv;charset=utf-8"}));
  a.download="torq-mercado-"+C.ym[F.d1]+"-"+C.ym[F.d2]+".csv";
  document.body.appendChild(a); a.click(); a.remove();
};

llenarPeriodo();
pintar();
})();
