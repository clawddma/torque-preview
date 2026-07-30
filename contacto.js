/* ═══════════════════════════════════════════════════════════════════
   TORQ — calificador y salida a WhatsApp, compartido por index, vigo
   y box. Se monta en <div id="qz-host" data-vehiculo="Vigo">.

   Misma malla que el calificador de la Mage: la calificación vive en la
   página, no en la conversación, para que el asesor reciba el lead ya
   calificado y con su código de campaña.
   ═══════════════════════════════════════════════════════════════════ */
(function(){
"use strict";
var host=document.getElementById("qz-host");
if(!host) return;

/* ÚNICO punto a tocar: la línea de WhatsApp, sin "+" ni espacios. */
var WA="573054310851";
/* URL del Apps Script que registra los leads (ver LEADS.md). Vacío =
   el calificador funciona pero no deja registro. */
var LEADS_URL="";

var VEH=host.dataset.vehiculo||"";
/* el atributo puede cambiar en caliente (el simulador deja elegir el
   vehículo a contrastar): se relee al redactar y al registrar */
function vehAhora(){ return host.dataset.vehiculo || VEH }

/* código de campaña: viaja en ?c= desde el anuncio y sobrevive la
   navegación entre páginas del sitio */
var m=location.search.match(/[?&](?:c|utm_content)=([^&]+)/);
var COD=m?decodeURIComponent(m[1].replace(/\+/g," ")):"";
try{ if(COD) sessionStorage.setItem("tq_c",COD); else COD=sessionStorage.getItem("tq_c")||"" }catch(e){}
COD=(COD||"directo").slice(0,40);

var CIUDADES=["Bogotá","Medellín","Copacabana","Cali","Barranquilla","Bucaramanga",
  "Cúcuta","Villavicencio","Montería","Valledupar","Pasto","Pereira","Manizales",
  "Ibagué","Neiva","Popayán","Duitama","Tunja","Cartagena","Santa Marta","Otra ciudad"];

var PASOS=[
  {k:"Ciudad", q:"¿En qué ciudad estás?", select:CIUDADES},
  {k:"Compra", q:"¿Para cuándo la estás pensando?",
   opts:["Este mes","En 1 a 3 meses","Más adelante","Todavía estoy mirando"]},
  {k:"Pago",   q:"¿Cómo la comprarías?", opts:["Con crédito","De contado","Aún no lo sé"], two:true},
  {k:"Retoma", q:"¿Tienes vehículo para entregar en parte de pago?", opts:["Sí","No"], two:true},
  {k:"Nombre", q:"¿Cómo te llamas?", campo:"Tu nombre"}
];
if(!VEH){
  PASOS.unshift({k:"Vehiculo", q:"¿Cuál te interesa?",
    opts:["Vigo eléctrica","Box eléctrico","Mage híbrida","Todavía no sé"]});
}

var i=0, r={};
function esc(s){ return String(s==null?"":s).replace(/[<>&"]/g,function(x){
  return {"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"}[x] }) }

var css=document.createElement("style");
css.textContent=
'#qz-host{margin-top:34px;max-width:560px}'+
'.qz{border:1px solid var(--line2);border-radius:14px;background:var(--ink2);padding:28px 26px 26px;position:relative;overflow:hidden}'+
'.qz-bar{position:absolute;top:0;left:0;height:2px;background:var(--acc);transition:width .35s cubic-bezier(.4,0,.2,1)}'+
'.qz-n{font-size:9.5px;letter-spacing:.18em;text-transform:uppercase;color:var(--mut2);font-weight:700}'+
'.qz-q{font-size:21px;font-weight:700;letter-spacing:-.02em;margin:11px 0 20px;line-height:1.25}'+
'.qz-opts{display:grid;gap:8px}.qz-opts.two{grid-template-columns:1fr 1fr}'+
'.qz-chip{background:var(--ink);border:1px solid var(--line2);color:var(--paper);padding:14px 17px;'+
 'border-radius:10px;font-size:14px;cursor:pointer;text-align:left;font-family:inherit;transition:border-color .2s,background .2s}'+
'.qz-chip:hover{border-color:var(--acc);background:rgba(200,242,74,.05)}'+
'.qz-field{width:100%;background:var(--ink);border:1px solid var(--line2);color:var(--paper);'+
 'padding:14px 15px;border-radius:10px;font-size:16px;font-family:inherit}'+
'.qz-field:focus{outline:none;border-color:var(--acc)}'+
'.qz-send{display:block;width:100%;margin-top:12px;background:var(--acc);color:#0a0c07;border:none;'+
 'padding:15px;border-radius:10px;font-weight:700;font-size:15px;cursor:pointer;text-align:center;text-decoration:none;font-family:inherit}'+
'.qz-send[aria-disabled="true"]{background:var(--ink3);color:var(--mut2);border:1px solid var(--line2)}'+
'.qz-back{background:none;border:none;color:var(--mut);font-size:13px;cursor:pointer;margin-top:14px;font-family:inherit;text-decoration:none;display:inline-block}'+
'.qz-back:hover{color:var(--paper)}'+
'.qz-sum{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0}'+
'.qz-sum span{background:var(--ink);border:1px solid var(--line);border-radius:100px;padding:5px 12px;font-size:11.5px;color:var(--mut)}'+
'.qz-consent{display:flex;gap:11px;align-items:flex-start;margin:18px 0 4px;font-size:12px;color:var(--mut);line-height:1.6;cursor:pointer;padding:11px;border-radius:9px;transition:background .2s}'+
'.qz-consent.pide{background:rgba(217,89,38,.1);outline:1px solid rgba(217,89,38,.45)}'+
'.qz-consent input{margin-top:2px;accent-color:var(--acc);width:16px;height:16px;flex:none}'+
'.qz-consent a{color:var(--acc)}'+
'.qz-hint{font-size:11.5px;color:var(--mut2);text-align:center;margin-top:9px;min-height:15px}'+
'.qz-conf{color:var(--mut);font-size:13.5px;line-height:1.7;margin-top:6px}';
document.head.appendChild(css);

host.innerHTML='<div class="qz"><div class="qz-bar" id="qz-bar"></div><div id="qz-in"></div></div>';
var box=document.getElementById("qz-in"), bar=document.getElementById("qz-bar");

function avanzar(v){ r[PASOS[i].k]=v; i++; pintar() }

function pintar(){
  bar.style.width=(i/PASOS.length*100)+"%";
  if(i>=PASOS.length) return cerrar();
  var p=PASOS[i], h="";
  h+='<div class="qz-n">Pregunta '+(i+1)+' de '+PASOS.length+'</div>';
  h+='<div class="qz-q">'+p.q+'</div>';
  if(p.select){
    h+='<select class="qz-field" id="qz-sel"><option value="">Elige tu ciudad</option>'
      +p.select.map(function(c){return '<option>'+c+'</option>'}).join("")+'</select>';
  }else if(p.campo){
    h+='<input class="qz-field" id="qz-txt" type="text" autocomplete="given-name" '
      +'enterkeyhint="done" placeholder="'+p.campo+'" maxlength="40">';
  }else{
    h+='<div class="qz-opts'+(p.two?" two":"")+'">'
      +p.opts.map(function(o){return '<button class="qz-chip" data-v="'+esc(o)+'">'+o+'</button>'}).join("")
      +'</div>';
  }
  if(i>0) h+='<button class="qz-back" id="qz-back">Volver</button>';
  box.innerHTML=h;

  var sel=document.getElementById("qz-sel");
  if(sel) sel.onchange=function(){ if(sel.value) avanzar(sel.value) };
  var txt=document.getElementById("qz-txt");
  if(txt){
    var ir=function(){ if(txt.value.trim().length>1) avanzar(txt.value.trim()) };
    txt.onkeydown=function(e){ if(e.key==="Enter"){e.preventDefault();ir()} };
    box.insertAdjacentHTML("beforeend",'<button class="qz-send" id="qz-ok">Continuar</button>');
    document.getElementById("qz-ok").onclick=ir;
  }
  Array.prototype.forEach.call(box.querySelectorAll(".qz-chip"),function(b){
    b.onclick=function(){ avanzar(b.dataset.v) };
  });
  var back=document.getElementById("qz-back");
  if(back) back.onclick=function(){ i--; pintar() };
}

/* El mensaje lo escribe el CLIENTE: tiene que sonar a persona, no a
   volcado de formulario. El código de campaña solo se agrega si de
   verdad vino de un anuncio. */
function redactar(){
  var nom=(r.Nombre||"").trim().split(" ")[0];
  var veh=vehAhora() || ({"Vigo eléctrica":"Vigo","Box eléctrico":"Box","Mage híbrida":"Mage"}[r.Vehiculo]||"");
  var cuando={
    "Este mes":"la estoy pensando para este mes",
    "En 1 a 3 meses":"la estoy pensando para los próximos meses",
    "Más adelante":"todavía no tengo fecha definida",
    "Todavía estoy mirando":"por ahora estoy comparando opciones"
  }[r.Compra]||"";
  var pago={
    "Con crédito":"La compraría con crédito.",
    "De contado":"La compraría de contado.",
    "Aún no lo sé":"Todavía no defino la forma de pago."
  }[r.Pago]||"";

  var t="Hola"+(nom?", soy "+nom:"")+". ";
  t += veh ? "Vi la "+veh+" en TORQ y me interesa." : "Vi los carros de TORQ y quisiera asesoría.";
  var l2=[];
  if(r.Ciudad) l2.push("Estoy en "+r.Ciudad);
  if(cuando)   l2.push(cuando);
  if(l2.length) t+="\n\n"+l2.join(" y ")+".";
  if(pago) t+=" "+pago;
  if(r.Retoma==="Sí") t+=" Tengo un vehículo para entregar en parte de pago.";
  t+="\n\nQuedo atento.";
  if(COD!=="directo") t+="\n\n— ref "+COD;
  return t;
}
function enlace(txt){
  return WA ? "https://wa.me/"+WA+"?text="+encodeURIComponent(txt) : "";
}
function registrar(){
  if(!LEADS_URL) return;
  try{
    fetch(LEADS_URL,{method:"POST",mode:"no-cors",
      headers:{"Content-Type":"text/plain;charset=utf-8"},
      body:JSON.stringify({ciudad:r.Ciudad||"",compra:r.Compra||"",pago:r.Pago||"",
        retoma:r.Retoma||"",nombre:r.Nombre||"",campana:COD,
        vehiculo:vehAhora()||r.Vehiculo||"Sin definir"})});
  }catch(e){}
}

function confirmado(href){
  var nom=(r.Nombre||"").trim().split(" ")[0];
  var h='<div class="qz-n">Recibido</div>';
  h+='<div class="qz-q">Gracias'+(nom?", "+esc(nom):"")+'. Un asesor te contacta en las próximas 24 horas.</div>';
  h+='<p class="qz-conf">Te va a acompañar en todo el proceso: disponibilidad real, prueba de ruta y condiciones de compra o renting. Si prefieres adelantar algo, escríbenos por el mismo chat.</p>';
  h+='<a class="qz-send" href="'+href+'" target="_blank" rel="noopener">¿No se abrió WhatsApp? Ábrelo aquí</a>';
  box.innerHTML=h;
  try{ box.scrollIntoView({block:"center",behavior:"smooth"}) }catch(e){}
}

function cerrar(){
  bar.style.width="100%";
  var texto=redactar();
  var resumen=PASOS.filter(function(p){return p.k!=="Nombre"});
  var h='<div class="qz-n">Último paso</div>';
  h+='<div class="qz-q">Listo, '+esc((r.Nombre||"").split(" ")[0])+'. Te escribimos por WhatsApp.</div>';
  h+='<div class="qz-sum">'+resumen.map(function(p){
      return '<span>'+esc(r[p.k]||"—")+'</span>' }).join("")+'</div>';
  /* La autorización debe mencionar la transferencia: entregar el lead al
     concesionario es una transferencia a un tercero (Ley 1581). */
  h+='<label class="qz-consent"><input type="checkbox" id="qz-ok-datos">'
    +'<span>Autorizo el tratamiento de mis datos conforme a la '
    +'<a href="politica-datos.html">Política de Tratamiento de Datos Personales</a> '
    +'y su transferencia al concesionario aliado para ser contactado con una oferta comercial.</span></label>';
  h+='<a class="qz-send" id="qz-wa" aria-disabled="true" role="button">Abrir WhatsApp</a>';
  h+='<div class="qz-hint" id="qz-hint">Marca la autorización para continuar</div>';
  h+='<button class="qz-back" id="qz-back">Volver</button>';
  box.innerHTML=h;

  var chk=document.getElementById("qz-ok-datos"), wa=document.getElementById("qz-wa");
  var cons=box.querySelector(".qz-consent"), hint=document.getElementById("qz-hint");
  function estado(){
    if(chk.checked && WA){
      wa.setAttribute("aria-disabled","false");
      wa.href=enlace(texto); wa.target="_blank"; wa.rel="noopener";
      cons.classList.remove("pide"); hint.textContent="";
    }else{
      wa.setAttribute("aria-disabled","true"); wa.removeAttribute("href");
      hint.textContent = WA ? "Marca la autorización para continuar"
                            : "Falta configurar la línea de WhatsApp";
    }
  }
  chk.onchange=estado;
  /* el botón bloqueado sí responde: señala la casilla en vez de no hacer nada */
  wa.addEventListener("click",function(e){
    if(wa.getAttribute("aria-disabled")==="true"){
      e.preventDefault();
      cons.classList.add("pide");
      cons.scrollIntoView({block:"center",behavior:"smooth"});
      try{ chk.focus() }catch(err){}
      return;
    }
    registrar();
    setTimeout(function(){ confirmado(wa.href) },400);
  });
  estado();
  document.getElementById("qz-back").onclick=function(){ i--; pintar() };
}

pintar();
})();
