/* StudioWeb Pro — self-contained browser IDE. CodeMirror + JSZip are bundled locally. */
(() => {
  'use strict';
  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];
  const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const basename = p => p.split('/').pop();
  const dirname = p => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
  const extension = p => p.includes('.') ? basename(p).split('.').pop().toLowerCase() : '';
  const textExt = new Set(['html','htm','css','js','mjs','cjs','json','txt','md','svg','xml','webmanifest','map','ts','jsx','tsx','yml','yaml','gitignore','php']);
  const binaryExt = new Set(['png','jpg','jpeg','gif','webp','ico','avif','woff','woff2','ttf','otf','pdf','mp3','mp4','wav','webm']);
  const sleep = ms => new Promise(ok => setTimeout(ok, ms));
  const icon = name => `<svg><use href="#i-${name}"/></svg>`;
  const demo = () => ({
    projectName:'Meu Site',
    files:{
      'index.html': {type:'text',content:`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Meu Projeto | StudioWeb</title>
  <link rel="stylesheet" href="styles/style.css">
</head>
<body>
  <header class="navbar">
    <a class="logo" href="index.html"><span class="logo-ico">✳</span> orbit<span>.</span></a>
    <nav><a class="active" href="index.html">Início</a><a href="sobre.html">Sobre</a></nav>
    <a href="#contato" class="nav-cta">Vamos conversar ↗</a>
  </header>
  <main>
    <section class="hero">
      <div class="hero-tag"><span class="pulse"></span> IDEIAS QUE GANHAM VIDA</div>
      <h1>Projetos incríveis<br>começam com <em>uma ideia.</em></h1>
      <p>Este é seu espaço de criação. Edite o HTML, transforme as cores no CSS e adicione interações com JavaScript.</p>
      <div class="hero-actions"><button id="helloBtn" class="primary">Experimente agora <span>↗</span></button><a class="secondary" href="sobre.html">Conheça o projeto →</a></div>
      <div id="feedback" class="feedback" aria-live="polite"></div>
    </section>
    <section class="features">
      <article><span class="feature-ico">◈</span><h3>Crie livremente</h3><p>Seus arquivos, suas ideias, suas possibilidades.</p></article>
      <article><span class="feature-ico">⌘</span><h3>Uma ferramenta completa</h3><p>HTML, CSS e JavaScript em um só lugar.</p></article>
      <article><span class="feature-ico">↗</span><h3>Publique em qualquer lugar</h3><p>Exporte o ZIP e leve seu projeto para a web.</p></article>
    </section>
  </main>
  <footer id="contato">Feito com criatividade <span>♥</span> no StudioWeb</footer>
  <script src="scripts/main.js"></script>
</body>
</html>`},
      'sobre.html': {type:'text',content:`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sobre | Meu Projeto</title>
  <link rel="stylesheet" href="styles/style.css">
</head>
<body>
  <header class="navbar"><a class="logo" href="index.html"><span class="logo-ico">✳</span> orbit<span>.</span></a><nav><a href="index.html">Início</a><a class="active" href="sobre.html">Sobre</a></nav></header>
  <main><section class="hero"><div class="hero-tag">SEGUNDA PÁGINA</div><h1>As páginas do seu site <em>estão conectadas.</em></h1><p>O mesmo arquivo CSS funciona nas duas páginas. Clique em Início para voltar ou abra os arquivos em abas para editar tudo em conjunto.</p><div class="hero-actions"><a class="primary" href="index.html">← Voltar ao início</a></div></section></main>
  <footer>StudioWeb — pronto para criar.</footer>
</body>
</html>`},
      'styles/style.css': {type:'text',content:`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@500;600;700;800&display=swap');
:root { font-family: 'DM Sans', 'Segoe UI', sans-serif; color: #182139; background: #fcfcff; }
* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; }
a { text-decoration: none; color: inherit; }
button { font: inherit; cursor: pointer; }
.navbar { height: 79px; max-width: 1120px; margin: 0 auto; padding: 0 5%; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
.logo { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; letter-spacing: -1.6px; white-space: nowrap; }
.logo>span:last-child { color: #6958f6; }
.logo-ico { color: #6958f6; margin-right: 5px; }
nav { display: flex; gap: 26px; color: #758099; font-size: 13px; font-weight: 700; }
nav a.active, nav a:hover { color: #6958f6; }
.nav-cta { background: #f0edff; color: #6958f6; padding: 11px 15px; border-radius: 9px; font-size: 12px; font-weight: 800; }
.hero { text-align: center; max-width: 930px; margin: 0 auto; padding: 72px 24px 65px; }
.hero-tag { display: inline-flex; align-items: center; gap: 8px; background: #eeecff; color: #6755ed; border-radius: 25px; padding: 9px 15px; font-size: 10px; letter-spacing: 2px; font-weight: 800; }
.pulse { display: inline-block; width: 7px; height: 7px; background: #6958f6; border-radius: 50%; }
h1 { font-family: 'Outfit', sans-serif; font-weight: 800; letter-spacing: -3.2px; font-size: clamp(34px, 5.7vw, 65px); line-height: 1.14; margin: 29px 0 23px; }
h1 em { font-style: normal; background: linear-gradient(100deg, #6454ed, #a965e6); color: transparent; background-clip: text; }
.hero p { max-width: 590px; margin: auto; color: #7e8ba4; font-size: 15px; line-height: 1.85; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; margin-top: 30px; }
.primary { border: 0; background: #6958f6; color: white; padding: 14px 19px; display: inline-flex; align-items: center; gap: 27px; font-size: 12px; font-weight: 800; border-radius: 11px; box-shadow: 0 7px 20px #6958f62e; }
.primary:hover { background: #5544e4; transform: translateY(-1px); }
.secondary { padding: 13px; color: #394460; font-size: 12px; font-weight: 800; }
.feedback { color: #6554eb; min-height: 25px; font-size: 13px; font-weight: 700; margin-top: 12px; }
.features { background: #f6f6ff; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; padding: 38px max(5%, calc((100% - 1120px)/2)); }
.features article { background: white; border: 1px solid #f0effb; border-radius: 14px; padding: 25px 21px; }
.feature-ico { color: #6958f6; font-size: 25px; }
.features h3 { font-family: 'Outfit',sans-serif; font-size: 15px; margin: 15px 0 7px; }
.features p { color: #8992a8; font-size: 12px; line-height: 1.7; margin: 0; }
footer { text-align: center; padding: 28px; color: #9da4b7; font-size: 11px; }
footer span { color: #e56f95; }
@media (max-width: 700px) { .navbar { height: 66px; } .nav-cta { display: none; } .hero { padding-top: 52px; } h1 { letter-spacing: -1.2px; } .features { grid-template-columns: 1fr; } }`},
      'scripts/main.js': {type:'text',content:`// Este arquivo JavaScript é carregado pelo index.html.
// Experimente editar a mensagem ou criar novas interações!
const button = document.querySelector('#helloBtn');
const feedback = document.querySelector('#feedback');
if (button && feedback) {
  button.addEventListener('click', () => {
    feedback.textContent = '✨ Muito bem! Seu JavaScript está funcionando.';
    console.log('Botão clicado. Tudo conectado!');
  });
}
console.info('StudioWeb: projeto inicial carregado com sucesso.');`},
      'assets/orbit.svg': {type:'text',content:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect width="100" height="100" rx="24" fill="#6958f6"/><g fill="none" stroke="#fff" stroke-width="7"><circle cx="50" cy="50" r="29"/><path d="M14 51h72M50 14v72"/></g></svg>'}
    },
    folders:['styles','scripts','assets'],tabs:['index.html','styles/style.css','scripts/main.js'],active:'index.html',previewEntry:'index.html',theme:'dark',mode:'split',device:'desktop',dock:'console',expanded:['styles','scripts','assets'],selectedFolder:''
  });
  let state = demo();
  const editors = new Map();
  let cm, db = null, saveTimer = 0, previewTimer = 0, problemsTimer = 0, toastTimer = 0;
  let switching = false, menuOpen = false, modalResolver = null, resizedWidth = null;
  const els = {tree:$('#fileTree'),tabs:$('#tabsBar'),frame:$('#previewFrame'),save:$('#saveIndicator'),status:$('#statusMessage'),modal:$('#modalOverlay'),dropdown:$('#dropdownMenu'),quick:$('#quickOverlay')};

  async function dbOpen() {
    try {
      db = await new Promise((resolve,reject) => {
        const request = indexedDB.open('studioweb-projects', 1);
        request.onupgradeneeded = () => request.result.createObjectStore('projects');
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (err) { db = null; }
  }
  async function persist() {
    const snapshot = {...state, console:undefined, selectedNode:undefined};
    try {
      if (db) await new Promise((resolve,reject) => {
        const tx=db.transaction('projects','readwrite');
        tx.objectStore('projects').put(snapshot,'current');
        tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
      });
      else localStorage.setItem('studioweb-backup',JSON.stringify(snapshot));
      els.save.textContent='Salvo localmente';$('#autosaveStatus').textContent='Salvamento automático ativo';
    } catch (err) { els.save.textContent='Erro ao salvar';$('#autosaveStatus').textContent='Armazenamento indisponível';toast('Não foi possível gravar localmente. Exporte um ZIP para preservar os arquivos.','error'); }
  }
  async function restore() {
    try {
      let data;
      if (db) data=await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readonly');const request=tx.objectStore('projects').get('current');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error)});
      else data=JSON.parse(localStorage.getItem('studioweb-backup')||'null');
      if (data?.files && typeof data.files==='object') state={...demo(),...data,files:data.files};
    } catch(err){console.warn('Não foi possível recuperar o trabalho anterior.',err)}
    state.tabs=(state.tabs||[]).filter(p=>state.files[p]);
    if(!state.files[state.active]) state.active=state.tabs[0]||Object.keys(state.files)[0]||null;
    if(state.active&&!state.tabs.includes(state.active))state.tabs.unshift(state.active);
    if(!state.files[state.previewEntry] || !/\.html?$/i.test(state.previewEntry)) state.previewEntry=Object.keys(state.files).find(p=>/\.html?$/i.test(p))||null;
  }
  function changed(needsPreview = true) {
    els.save.textContent='Salvando...';$('#autosaveStatus').textContent='Alterações pendentes';
    clearTimeout(saveTimer);saveTimer=setTimeout(persist,650);
    if (needsPreview) {clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,380)}
    clearTimeout(problemsTimer);problemsTimer=setTimeout(renderProblems,600);
    updateCounts();
  }
  function toast(message,kind='good') {
    const node=document.createElement('div');node.className='toast '+kind;node.textContent=message;$('#toastArea').append(node);setTimeout(()=>node.remove(),3600);
  }
  function setStatus(msg){els.status.textContent=msg}
  function modeFor(path) {
    const ext=extension(path||'');
    return ['html','htm'].includes(ext)?'htmlmixed':ext==='css'?'css':['js','mjs','cjs','json'].includes(ext)?'javascript':['xml','svg'].includes(ext)?'xml':'text/plain';
  }
  function badgeFor(path) {
    const ext=extension(path);
    const type=['html','htm'].includes(ext)?'html':ext==='css'?'css':['js','mjs'].includes(ext)?'js':ext==='json'?'json':['png','jpg','jpeg','gif','webp','svg','ico','avif'].includes(ext)?'image':'other';
    return `<span class="file-badge ${type}">${escapeHTML(({html:'H',css:'C',js:'JS',json:'{}',image:'◈'})[type]||'·')}</span>`;
  }
  function languageFor(path) {return ({html:'HTML',htm:'HTML',css:'CSS',js:'JavaScript',mjs:'JavaScript',json:'JSON',svg:'SVG',xml:'XML',md:'Markdown'})[extension(path)]||'Texto';}
  function updateCounts(){$('#fileCount').textContent=Object.keys(state.files).length+' arquivos';$('#projectName').textContent=state.projectName;$('#projectTreeTitle').textContent=state.projectName.toUpperCase();}
  function allFolders(){const folders=new Set(state.folders||[]);Object.keys(state.files).forEach(p=>{let d=dirname(p);while(d){folders.add(d);d=dirname(d)}});return [...folders].sort((a,b)=>a.localeCompare(b,'pt-BR'))}
  function renderTree() {
    let html='';const paths=Object.keys(state.files).sort((a,b)=>a.localeCompare(b,'pt-BR'));
    const folders=allFolders();
    const walk=(parent,depth)=>{
      const children=folders.filter(f=>dirname(f)===parent);
      for(const f of children){const open=state.expanded.includes(f);html+=`<div class="tree-row folder ${state.selectedFolder===f?'selected':''}" data-kind="folder" data-path="${escapeHTML(f)}" draggable="true" style="padding-left:${depth*15+5}px" title="Pasta: ${escapeHTML(f)}">${icon('chevron').replace('<svg','<svg class="arrow '+(open?'open':'')+'"')}${icon('folder').replace('<svg','<svg class="tree-icon folder-icon"')}<span class="tree-label">${escapeHTML(basename(f))}</span></div>`;if(open) walk(f,depth+1)}
      for(const p of paths.filter(p=>dirname(p)===parent))html+=`<div class="tree-row file ${state.active===p?'selected':''}" data-kind="file" data-path="${escapeHTML(p)}" draggable="true" style="padding-left:${depth*15+5}px" title="${escapeHTML(p)}"><span class="arrow"></span>${badgeFor(p)}<span class="tree-label">${escapeHTML(basename(p))}</span></div>`;
    };walk('',0);els.tree.innerHTML=html||'<p class="subtle" style="padding:10px">Crie seu primeiro arquivo.</p>';
  }
  function renderTabs() {
    els.tabs.innerHTML=state.tabs.filter(p=>state.files[p]).map(p=>`<div class="file-tab ${state.active===p?'active':''}" data-path="${escapeHTML(p)}" role="tab" tabindex="0" title="${escapeHTML(p)}">${badgeFor(p)}<span class="file-tab-name">${escapeHTML(basename(p))}</span><button class="tab-close" data-close="${escapeHTML(p)}" title="Fechar aba">${icon('close')}</button></div>`).join('');
    $('#activeFileLabel').textContent=state.active?basename(state.active):'Nenhum arquivo';
  }
  function openFile(path) {
    if(!state.files[path])return;
    state.active=path;
    if(!state.tabs.includes(path))state.tabs.push(path);
    const file=state.files[path];
    switching=true;
    const text=file.type==='text';
    $('#binaryView').classList.toggle('hidden',text);
    $('#emptyEditor').classList.add('hidden');
    cm.getWrapperElement().classList.toggle('hidden',!text);
    if(text){
      if(!editors.has(path)) editors.set(path,new CodeMirror.Doc(file.content,modeFor(path)));
      cm.swapDoc(editors.get(path));cm.setOption('mode',modeFor(path));cm.setOption('autoCloseTags',['html','htm'].includes(extension(path)));cm.setOption('autoCloseBrackets',['js','mjs','css','json'].includes(extension(path)));
      requestAnimationFrame(()=>{cm.refresh();cm.focus()});
    }else{
      const isImg=/^(png|jpg|jpeg|gif|webp|svg|ico|avif)$/i.test(extension(path));
      $('#binaryView').innerHTML=`${isImg?`<img alt="Prévia de ${escapeHTML(basename(path))}" src="${escapeHTML(file.content)}">`:icon('file')}<div class="binary-info"><b>${escapeHTML(path)}</b><p>Arquivo binário. Use seu caminho no HTML/CSS ou exporte o projeto.</p></div>`;
    }
    switching=false;
    $('#pathDisplay').textContent='/'+path;
    $('#languageLabel').textContent=text?languageFor(path):'Recurso';
    updateCursor();renderTabs();renderTree();changed(false);
  }
  function updateCursor(){const cur=cm.getCursor();$('#lineColumn').textContent=`Ln ${cur.line+1}, Col ${cur.ch+1}`}
  function closeTab(path){const i=state.tabs.indexOf(path);if(i<0)return;state.tabs.splice(i,1);if(state.active===path){const next=state.tabs[Math.max(0,i-1)]||null;state.active=null;if(next)openFile(next);else showEmpty();}renderTabs();renderTree();changed(false)}
  function showEmpty(){state.active=null;cm.getWrapperElement().classList.add('hidden');$('#binaryView').classList.add('hidden');$('#emptyEditor').classList.remove('hidden');$('#pathDisplay').textContent='Sem arquivo aberto';$('#activeFileLabel').textContent='Nenhum arquivo';renderTabs();}
  function setActivity(name){$$('.activity-item[data-activity]').forEach(el=>el.classList.toggle('active',el.dataset.activity===name));$$('.sidebar-pane').forEach(el=>el.classList.add('hidden'));$('#'+(name==='search'?'searchPane':name==='assets'?'assetsPane':'explorerPane')).classList.remove('hidden');if(window.innerWidth<=760)$('#sidebar').classList.remove('hidden');if(name==='assets')renderAssets();if(name==='search')$('#globalSearch').focus()}
  function renderAssets() {
    const assets=Object.keys(state.files).filter(p=>/\.(png|jpe?g|gif|webp|svg|ico|avif)$/i.test(p));
    $('#assetGrid').innerHTML=assets.map(p=>`<button class="asset-item" data-asset="${escapeHTML(p)}" title="Clique para copiar: ${escapeHTML(p)}"><img alt="${escapeHTML(basename(p))}" src="${escapeHTML(StudioPreview.getAssetUrl(state.files,p)||'')}"><span>${escapeHTML(basename(p))}</span></button>`).join('')||'<p class="subtle">Nenhuma imagem. Importe arquivos PNG, JPG, SVG, WEBP e outros.</p>';
  }
  function setMode(mode){state.mode=mode;$('#contentArea').className='content-area mode-'+mode;$$('.mode-btn').forEach(el=>el.classList.toggle('active',el.dataset.mode===mode));if(mode==='design')setDock('inspector');clearTimeout(previewTimer);renderPreview();requestAnimationFrame(()=>cm.refresh());changed(false)}
  function setDevice(device){state.device=device;$('#previewDevice').className='preview-device '+device;$$('.device-btn').forEach(el=>el.classList.toggle('active',el.dataset.device===device));changed(false)}
  function setTheme(theme){state.theme=theme;document.body.dataset.theme=theme;cm.setOption('theme',theme==='dark'?'material-darker':'eclipse');$('#statusTheme').textContent=theme==='dark'?'Escuro':'Claro';$('#themeToggle').innerHTML=icon(theme==='dark'?'sun':'moon');changed(false)}
  function setDock(dock){state.dock=dock;$$('.dock-tab').forEach(el=>el.classList.toggle('active',el.dataset.dock===dock));$$('.dock-body').forEach(el=>el.classList.add('hidden'));$('#'+dock+'Panel').classList.remove('hidden');$('#clearConsoleBtn').style.visibility=dock==='console'?'visible':'hidden';$('#bottomDock').classList.remove('collapsed');changed(false)}
  function renderPreview() {
    const entry=state.previewEntry;
    if(!entry || !state.files[entry]){$('#previewBlank').classList.remove('hidden');els.frame.classList.add('hidden');$('#previewUrl').textContent='preview.local';return}
    $('#previewBlank').classList.add('hidden');els.frame.classList.remove('hidden');$('#previewUrl').textContent='preview.local/'+entry;
    const html=StudioPreview.build(state.files,entry,state.mode==='design');
    state.selectedNode=null;
    if(state.mode==='design')$('#inspectorPanel').innerHTML='<div class="inspector-empty">Clique em qualquer elemento para editar suas propriedades. Clique duas vezes para alterar o texto diretamente.</div>';
    $('#consolePanel').innerHTML='<div class="console-empty">Prévia atualizada. As mensagens do JavaScript aparecerão aqui.</div>';
    $('#consoleCount').textContent='0';
    els.frame.srcdoc=html||'';
  }
  function renderConsole(level,text) {
    const panel=$('#consolePanel');
    if(panel.querySelector('.console-empty'))panel.innerHTML='';
    const line=document.createElement('div');line.className='console-line '+(level||'log');
    const time=new Date().toLocaleTimeString('pt-BR',{hour12:false});
    const glyph=level==='error'?'×':level==='warn'?'!':level==='info'?'i':'›';
    line.innerHTML=`<span class="console-type">${glyph}</span><span class="console-text">${escapeHTML(String(text).slice(0,3000))}</span><span class="console-time">${time}</span>`;
    panel.append(line);
    while(panel.children.length>150)panel.firstChild.remove();
    $('#consoleCount').textContent=panel.children.length;
    panel.scrollTop=panel.scrollHeight;
  }
  function getOriginalNode(id) {
    const html=state.files[state.previewEntry]?.content||'';
    const doc=new DOMParser().parseFromString(html,'text/html');
    return [...doc.body.querySelectorAll('*')][Number(id)]||null;
  }
  function showInspector(id) {
    const node=getOriginalNode(id);if(!node)return;
    state.selectedNode=String(id);
    const attr=name=>node.getAttribute(name)||'';
    const isLeaf=node.children.length===0;
    const text=isLeaf?node.textContent||'':'';
    $('#inspectorPanel').innerHTML=`<form class="inspector-form" id="inspectorForm"><div class="span-2"><span class="inspector-tag">&lt;${escapeHTML(node.tagName.toLowerCase())}&gt;</span> <span class="inspector-hint">Elemento selecionado · #${escapeHTML(id)}</span></div>
      <div><label for="inspect-id">ID</label><input id="inspect-id" name="id" value="${escapeHTML(attr('id'))}" /></div><div><label for="inspect-class">Classes CSS</label><input id="inspect-class" name="class" value="${escapeHTML(attr('class'))}" /></div>
      <div><label for="inspect-href">href (links)</label><input id="inspect-href" name="href" value="${escapeHTML(attr('href'))}" /></div><div><label for="inspect-src">src (imagem)</label><input id="inspect-src" name="src" value="${escapeHTML(attr('src'))}" /></div>
      <div class="span-2"><label for="inspect-style">Estilo inline (CSS)</label><input id="inspect-style" name="style" value="${escapeHTML(attr('style'))}" placeholder="color: red; font-size: 18px;" /></div>
      ${isLeaf?`<div class="span-2"><label for="inspect-text">Texto do elemento</label><textarea id="inspect-text" name="text">${escapeHTML(text)}</textarea></div>`:'<div class="span-2 inspector-hint">Este elemento possui filhos. Clique duas vezes no texto na prévia para editá-lo.</div>'}
      <div class="span-2"><button type="submit">Aplicar alterações</button></div></form>`;
    if(state.dock!=='inspector')setDock('inspector');
    els.frame.contentWindow?.postMessage({studioWebControl:true,type:'highlight',id},'*');
  }
  function applyInspectorChanges(fields) {
    if(state.selectedNode===null)return;
    const updated=StudioPreview.applyElementChange(state.files,state.previewEntry,state.selectedNode,fields);
    if(!updated)return toast('Elemento não encontrado. Atualize a prévia.','error');
    state.files[state.previewEntry].content=updated;
    editors.get(state.previewEntry)?.setValue(updated);
    changed();renderPreview();toast('Elemento atualizado no HTML.','good');
  }
  function onFrameMessage(ev) {
    if(ev.source!==els.frame.contentWindow||!ev.data?.studioWeb)return;
    const {type,data}=ev.data;
    if(type==='console'){renderConsole(data?.level,data?.text);return}
    if(type==='select' && state.mode==='design'){showInspector(data.id);return}
    if(type==='inlineEdit' && state.mode==='design'){
      const updated=StudioPreview.applyElementChange(state.files,state.previewEntry,data.id,{html:data.html});
      if(updated){state.files[state.previewEntry].content=updated;editors.get(state.previewEntry)?.setValue(updated);changed();renderPreview();toast('Texto atualizado diretamente no HTML.')}return;
    }
    if(type==='navigate'){
      const href=data?.href||'';const target=StudioPreview.resolvePath(state.previewEntry,href);
      if(target && state.files[target] && /\.html?$/i.test(target)) {state.previewEntry=target;openFile(target);renderPreview()}
      else if(target)renderConsole('warn','Página não encontrada no projeto: '+target);
    }
  }
  function renderProblems() {
    const problems=[];
    for (const [p,file] of Object.entries(state.files)) {
      if(file.type!=='text')continue;
      if(['js','cjs'].includes(extension(p))) {
        try {new Function(file.content)} catch(err){problems.push({path:p,level:'error',text:'Erro de sintaxe JavaScript: '+err.message})}
      }
      if(['html','htm'].includes(extension(p))){
        const doc=new DOMParser().parseFromString(file.content,'text/html');
        for(const el of doc.querySelectorAll('script[src],link[rel="stylesheet"][href],img[src]')) {
          const raw=el.getAttribute('src')||el.getAttribute('href');const target=StudioPreview.resolvePath(p,raw);
          if(target && !state.files[target]) problems.push({path:p,level:'warn',text:'Arquivo referenciado não encontrado: '+target});
        }
      }
    }
    const panel=$('#problemsPanel');panel.innerHTML=problems.map((x,i)=>`<button class="problem-line" data-problem="${i}"><span class="problem-type ${x.level==='error'?'error':''}">${x.level==='error'?'✕':'⚠'}</span><span>${escapeHTML(x.text)}<br><span class="problem-path">${escapeHTML(x.path)}</span></span></button>`).join('')||'<div class="console-empty">✓ Nenhum problema detectado na verificação básica de JavaScript e referências de arquivo.</div>';
    panel._problems=problems;$('#problemCount').textContent=problems.length;
  }
  function validatePath(path) {
    const normalized=String(path||'').trim().replace(/\\/g,'/').replace(/^\/+|\/+$/g,'');
    if(!normalized || normalized.length>230 || /[<>:"|?*\x00-\x1f]/.test(normalized) || normalized.split('/').some(p=>p==='.'||p==='..'||!p.trim()))return null;
    return normalized;
  }
  function uniquePath(path){if(!state.files[path]&&!allFolders().includes(path))return path;const ext=extension(path);const base=ext?path.slice(0,-ext.length-1):path;let n=2;while(state.files[`${base} (${n})${ext?'.'+ext:''}`]||allFolders().includes(`${base} (${n})${ext?'.'+ext:''}`))n++;return `${base} (${n})${ext?'.'+ext:''}`}
  function folderForNew(){return state.selectedFolder&&allFolders().includes(state.selectedFolder)?state.selectedFolder:''}
  async function askModal({eyebrow='PROJETO',title='Novo arquivo',label='Nome',value='',placeholder='',help='',confirm='Criar',danger=false}) {
    $('#modalEyebrow').textContent=eyebrow;$('#modalTitle').textContent=title;
    $('#modalBody').innerHTML=`<label for="modalValue">${escapeHTML(label)}</label><input class="modal-input" id="modalValue" placeholder="${escapeHTML(placeholder)}" value="${escapeHTML(value)}" autocomplete="off" />${help?`<p class="modal-help">${escapeHTML(help)}</p>`:''}`;
    $('#modalConfirm').textContent=confirm;$('#modalConfirm').style.background=danger?'var(--danger)':'';
    els.modal.classList.remove('hidden');setTimeout(()=>{$('#modalValue').focus();$('#modalValue').select()},10);
    return new Promise(resolve=>{modalResolver=resolve});
  }
  async function closeModal(ok) {if(!modalResolver)return;const finish=modalResolver;modalResolver=null;const value=$('#modalValue')?.value||'';els.modal.classList.add('hidden');finish(ok?value:null)}
  async function newFile() {
    const current=folderForNew(),name=await askModal({title:'Novo arquivo',label:'Nome e extensão',placeholder:'pagina.html',help:'Exemplos: index.html, styles/estilo.css, scripts/main.js. A pasta selecionada será usada como destino.'});
    if(name===null)return;
    const path=validatePath(current?current+'/'+name:name);if(!path)return toast('Nome de arquivo inválido.','error');if(state.files[path]||allFolders().includes(path))return toast('Esse nome já existe no projeto.','error');
    const contents=extension(path)==='html'?'<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Nova página</title>\n</head>\n<body>\n  <h1>Olá, mundo!</h1>\n</body>\n</html>\n':extension(path)==='css'?'/* Seu CSS */\n':extension(path)==='js'?'// Seu JavaScript\n':'';
    state.files[path]={type:'text',content:contents};if(dirname(path))ensureParentFolders(path);if(/\.html?$/i.test(path) && !state.previewEntry)state.previewEntry=path;
    openFile(path);renderTree();changed();toast('Arquivo criado: '+path);
  }
  async function newFolder() {
    const parent=folderForNew(),name=await askModal({title:'Nova pasta',label:'Nome da pasta',placeholder:'assets',help:'É possível criar subpastas, por exemplo: images/icons.'});
    if(name===null)return;
    const path=validatePath(parent?parent+'/'+name:name);if(!path)return toast('Nome de pasta inválido.','error');if(state.files[path]||allFolders().includes(path))return toast('Essa pasta já existe.','error');
    state.folders.push(path);ensureParentFolders(path+'/placeholder');state.expanded.push(path);state.selectedFolder=path;renderTree();changed(false);toast('Pasta criada: '+path);
  }
  function ensureParentFolders(path){let d=dirname(path);while(d){if(!state.folders.includes(d))state.folders.push(d);if(!state.expanded.includes(d))state.expanded.push(d);d=dirname(d)}}
  function renamePath(oldPath,newPath,folder=false){
    if(oldPath===newPath)return true;
    if(!validatePath(newPath)||state.files[newPath]||allFolders().includes(newPath)){toast('Destino inválido ou já existente.','error');return false}
    if(folder && newPath.startsWith(oldPath+'/')){toast('Não é possível mover uma pasta para dentro dela mesma.','error');return false}
    const renameItem=p=>p===oldPath?newPath:folder&&p.startsWith(oldPath+'/')?newPath+p.slice(oldPath.length):p;
    const changedFiles={};for(const [p,v] of Object.entries(state.files)){const newP=renameItem(p);if(newP!==p && state.files[newP] && newP!==oldPath){toast('Há arquivos no destino.','error');return false}changedFiles[newP]=v}
    state.files=changedFiles;state.folders=[...new Set(state.folders.map(renameItem))];state.expanded=[...new Set(state.expanded.map(renameItem))];state.tabs=state.tabs.map(renameItem);state.active=state.active&&renameItem(state.active);state.previewEntry=state.previewEntry&&renameItem(state.previewEntry);state.selectedFolder=state.selectedFolder&&renameItem(state.selectedFolder);
    const oldDocs=[...editors.entries()];editors.clear();oldDocs.forEach(([p,d])=>editors.set(renameItem(p),d));ensureParentFolders(newPath);
    if(state.active)openFile(state.active);else showEmpty();renderTree();renderTabs();changed();return true;
  }
  async function renameSelected(path,folder){const name=await askModal({title:'Renomear '+(folder?'pasta':'arquivo'),label:'Novo nome',value:basename(path),confirm:'Renomear'});if(name===null)return;const target=validatePath(dirname(path)?dirname(path)+'/'+name:name);if(target&&renamePath(path,target,folder))toast('Item renomeado.');else if(!target)toast('Nome inválido.','error')}
  async function deleteSelected(path,folder){
    const n=await askModal({eyebrow:'EXCLUSÃO',title:'Excluir '+(folder?'pasta':'arquivo')+'?',label:'Digite EXCLUIR para confirmar',placeholder:'EXCLUIR',help:folder?'A pasta e todos os seus arquivos internos serão removidos.':'O arquivo será removido do projeto. Esta ação não pode ser desfeita.',confirm:'Excluir',danger:true});
    if(n===null)return;if(n.trim()!=='EXCLUIR')return toast('Confirmação incorreta.','error');
    const affected=Object.keys(state.files).filter(p=>p===path||(folder&&p.startsWith(path+'/')));
    for(const p of affected){delete state.files[p];editors.delete(p);state.tabs=state.tabs.filter(t=>t!==p)}
    if(folder){state.folders=state.folders.filter(p=>p!==path&&!p.startsWith(path+'/'));state.expanded=state.expanded.filter(p=>p!==path&&!p.startsWith(path+'/'))}
    if(affected.includes(state.previewEntry))state.previewEntry=Object.keys(state.files).find(p=>/\.html?$/i.test(p))||null;
    if(!state.files[state.active]){const next=state.tabs[state.tabs.length-1];if(next)openFile(next);else showEmpty()}
    if(state.selectedFolder===path || state.selectedFolder.startsWith(path+'/'))state.selectedFolder='';
    renderTree();renderTabs();changed();toast('Item excluído.');
  }
  function downloadBlob(blob,name){const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
  function downloadFile(path){const file=state.files[path];if(!file)return;if(file.type==='text')downloadBlob(new Blob([file.content],{type:'text/plain;charset=utf-8'}),basename(path));else{const a=document.createElement('a');a.href=file.content;a.download=basename(path);document.body.append(a);a.click();a.remove()}}
  async function exportProject(){
    try {
      setStatus('Compactando projeto...');const zip=new JSZip();
      for(const folder of allFolders())zip.folder(folder);
      for(const [path,file] of Object.entries(state.files)){
        if(file.type==='text')zip.file(path,file.content);
        else zip.file(path,file.content.split(',')[1]||'',{base64:true});
      }
      const blob=await zip.generateAsync({type:'blob',compression:'DEFLATE',compressionOptions:{level:5}});
      downloadBlob(blob,(state.projectName||'meu-projeto').replace(/[^a-z\d_-]+/gi,'-')+'.zip');
      setStatus('Projeto exportado');toast('ZIP exportado com '+Object.keys(state.files).length+' arquivos.');
    }catch(err){toast('Não foi possível exportar: '+err.message,'error')}
  }
  function readDataUrl(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(file)})}
  function readText(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsText(file,'UTF-8')})}
  async function importFiles(fileList,folderMode=false){
    const items=[...fileList];if(!items.length)return;
    const total=items.reduce((sum,x)=>sum+x.size,0);if(items.length>500||total>65*1024*1024)return toast('Limite: 500 arquivos ou 65 MB por importação.','error');
    let imported=0,skipped=0;const parent=folderForNew();
    for(const file of items){
      const rel=folderMode?(file.webkitRelativePath||file.name):file.name;
      const path=validatePath((parent?parent+'/':'')+rel);
      if(!path||file.size>12*1024*1024){skipped++;continue}
      const ext=extension(path);
      if(!textExt.has(ext)&&!binaryExt.has(ext)){skipped++;continue}
      const safePath=uniquePath(path);
      try {state.files[safePath]={type:textExt.has(ext)?'text':'binary',content:textExt.has(ext)?await readText(file):await readDataUrl(file)};ensureParentFolders(safePath);imported++;}
      catch(err){skipped++}
    }
    if(!state.previewEntry)state.previewEntry=Object.keys(state.files).find(p=>/\.html?$/i.test(p))||null;
    renderTree();renderAssets();changed();toast(`${imported} arquivo(s) importado(s)${skipped?', '+skipped+' ignorado(s)':''}.`,imported?'good':'error');
  }
  async function importZip(file){
    if(!file)return;if(file.size>35*1024*1024)return toast('ZIP excede 35 MB.','error');
    const answer=await askModal({eyebrow:'IMPORTAÇÃO',title:'Abrir projeto ZIP',label:'Nome do novo projeto',value:file.name.replace(/\.zip$/i,''),help:'O projeto atual será substituído. Exporte o projeto atual antes de continuar, caso precise guardá-lo.',confirm:'Importar projeto'});
    if(answer===null)return;
    try {
      setStatus('Lendo projeto ZIP...');
      const zip=await JSZip.loadAsync(file);const nodes=Object.values(zip.files).filter(x=>!x.dir&&!x.name.startsWith('__MACOSX/')&&!basename(x.name).startsWith('.'));
      if(nodes.length>500)throw Error('Limite de 500 arquivos por projeto.');
      let prefix='';
      const topDirs=[...new Set(nodes.map(n=>n.name.split('/')[0]))];
      if(topDirs.length===1 && nodes.every(n=>n.name.includes('/')))prefix=topDirs[0]+'/';
      const files={},folders=[];let totalBytes=0;
      for(const node of nodes){
        const path=validatePath(node.name.slice(prefix.length));if(!path)continue;
        const ext=extension(path);if(!textExt.has(ext)&&!binaryExt.has(ext))continue;
        const data=await node.async('uint8array');totalBytes+=data.length;
        if(totalBytes>70*1024*1024||data.length>12*1024*1024)throw Error('Limite de 70 MB descompactados / 12 MB por arquivo.');
        if(textExt.has(ext)) files[path]={type:'text',content:new TextDecoder('utf-8').decode(data)};
        else {const base64=await node.async('base64');files[path]={type:'binary',content:'data:'+(StudioPreview.assetMime[ext]||'application/octet-stream')+';base64,'+base64}}
      }
      if(!Object.keys(files).length)throw Error('O ZIP não contém arquivos compatíveis.');
      for(const node of Object.values(zip.files).filter(n=>n.dir)){
        const path=validatePath(node.name.slice(prefix.length).replace(/\/$/,''));if(path)folders.push(path);
      }
      const first=Object.keys(files).find(p=>p.toLowerCase()==='index.html')||Object.keys(files).find(p=>/\.html?$/i.test(p))||Object.keys(files)[0];
      state={...demo(),projectName:answer.trim()||'Projeto importado',files,folders,tabs:[first],active:first,previewEntry:/\.html?$/i.test(first)?first:null,expanded:allFoldersFromData(files,folders),selectedFolder:''};
      editors.clear();openFile(first);renderTree();renderTabs();renderAssets();renderPreview();changed();toast('Projeto ZIP importado: '+Object.keys(files).length+' arquivos.');
    }catch(err){toast('Não foi possível importar o ZIP: '+err.message,'error')}finally{setStatus('Pronto')}
  }
  function allFoldersFromData(files,folders){const set=new Set(folders);Object.keys(files).forEach(p=>{let x=dirname(p);while(x){set.add(x);x=dirname(x)}});return [...set]}
  function newProject(){askModal({title:'Criar novo projeto',label:'Nome do projeto',value:'Novo Projeto',help:'Cria um projeto em branco. Exporte o projeto atual antes de substituí-lo.',confirm:'Criar projeto'}).then(name=>{if(name===null)return;state={...demo(),projectName:name.trim()||'Novo Projeto',files:{'index.html':{type:'text',content:'<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Meu site</title>\n</head>\n<body>\n  <h1>Olá, mundo!</h1>\n</body>\n</html>\n'}},folders:[],tabs:['index.html'],active:'index.html',previewEntry:'index.html',expanded:[],selectedFolder:''};editors.clear();openFile('index.html');renderTree();renderPreview();changed();toast('Novo projeto iniciado.')})}
  function showMenu(items,anchor,x,y) {
    const markup=items.map(item=>item==='separator'?'<div class="dropdown-separator"></div>':`<button class="dropdown-item" data-menu-action="${escapeHTML(item.id)}">${icon(item.icon||'file')}<span>${escapeHTML(item.label)}</span>${item.key?`<kbd>${escapeHTML(item.key)}</kbd>`:''}</button>`).join('');
    els.dropdown.innerHTML=markup;els.dropdown.classList.remove('hidden');menuOpen=true;
    const rect=anchor?.getBoundingClientRect();const left=x??rect?.left??20;const top=y??rect?.bottom??60;
    els.dropdown.style.left=Math.min(left,innerWidth-240)+'px';els.dropdown.style.top=Math.min(top,innerHeight-els.dropdown.offsetHeight-12)+'px';
    els.dropdown._actions=Object.fromEntries(items.filter(i=>i!=='separator').map(i=>[i.id,i.action]));
  }
  function hideMenu(){els.dropdown.classList.add('hidden');menuOpen=false;$$('.menu-button').forEach(b=>b.classList.remove('selected'))}
  function menuFor(name,anchor) {
    const file=state.active;
    const menus={
      arquivo:[{id:'newProject',label:'Novo projeto',icon:'plus',action:newProject},{id:'newFile',label:'Novo arquivo',key:'Ctrl+N',icon:'file',action:newFile},{id:'newFolder',label:'Nova pasta',icon:'folder',action:newFolder},'separator',{id:'files',label:'Importar arquivos...',icon:'upload',action:()=>$('#inputFiles').click()},{id:'folder',label:'Importar pasta...',icon:'folder',action:()=>$('#inputFolder').click()},{id:'zip',label:'Abrir projeto ZIP...',icon:'upload',action:()=>$('#inputZip').click()},'separator',{id:'save',label:'Salvar localmente',key:'Ctrl+S',icon:'check',action:persist},{id:'export',label:'Exportar projeto ZIP',key:'Ctrl+Shift+S',icon:'download',action:exportProject},{id:'one',label:'Baixar arquivo atual',icon:'file',action:()=>file&&downloadFile(file)}],
      editar:[{id:'undo',label:'Desfazer',key:'Ctrl+Z',icon:'refresh',action:()=>cm.undo()},{id:'redo',label:'Refazer',key:'Ctrl+Y',icon:'refresh',action:()=>cm.redo()},'separator',{id:'find',label:'Buscar no arquivo',key:'Ctrl+F',icon:'search',action:()=>cm.execCommand('find')},{id:'replace',label:'Substituir',key:'Ctrl+H',icon:'search',action:()=>cm.execCommand('replace')},{id:'global',label:'Buscar no projeto',key:'Ctrl+Shift+F',icon:'search',action:()=>setActivity('search')},{id:'quick',label:'Abrir arquivo...',key:'Ctrl+P',icon:'file',action:openQuick},'separator',{id:'indent',label:'Formatar indentação',icon:'code',action:formatCurrent},{id:'comment',label:'Comentar seleção',key:'Ctrl+/',icon:'code',action:()=>cm.toggleComment()}],
      visualizar:[{id:'code',label:'Somente código',icon:'code',action:()=>setMode('code')},{id:'split',label:'Código e prévia',icon:'columns',action:()=>setMode('split')},{id:'design',label:'Editor visual',icon:'mouse',action:()=>setMode('design')},'separator',{id:'desktop',label:'Prévia desktop',icon:'monitor',action:()=>setDevice('desktop')},{id:'mobile',label:'Prévia mobile',icon:'phone',action:()=>setDevice('mobile')},{id:'refresh',label:'Atualizar prévia',icon:'refresh',action:renderPreview},{id:'theme',label:'Alternar tema',icon:'sun',action:()=>setTheme(state.theme==='dark'?'light':'dark')}],
      ajuda:[{id:'shortcuts',label:'Atalhos do teclado',icon:'code',action:showShortcuts},{id:'readme',label:'Abrir README do projeto',icon:'file',action:()=>toast('Consulte o README.md que acompanha o ZIP da ferramenta.')},{id:'about',label:'Sobre o StudioWeb',icon:'layout',action:showAbout}]
    };
    showMenu(menus[name]||menus.arquivo,anchor);
  }
  function contextMenu(path,kind,x,y){
    const folder=kind==='folder';state.selectedFolder=folder?path:dirname(path);renderTree();
    showMenu([{id:'open',label:folder?'Expandir / recolher':'Abrir arquivo',icon:folder?'folder':'file',action:()=>folder?toggleFolder(path):openFile(path)},'separator',{id:'newFile',label:'Novo arquivo aqui',icon:'plus',action:newFile},{id:'newFolder',label:'Nova pasta aqui',icon:'folder',action:newFolder},'separator',...(folder?[]:[{id:'download',label:'Baixar arquivo',icon:'download',action:()=>downloadFile(path)}]),{id:'rename',label:'Renomear',icon:'code',action:()=>renameSelected(path,folder)},{id:'delete',label:'Excluir',icon:'trash',action:()=>deleteSelected(path,folder)}],null,x,y);
  }
  function toggleFolder(path){if(state.expanded.includes(path))state.expanded=state.expanded.filter(f=>f!==path);else state.expanded.push(path);state.selectedFolder=path;renderTree();changed(false)}
  function formatCurrent() {
    if(!state.active||state.files[state.active]?.type!=='text')return;
    if(extension(state.active)==='json'){
      try{cm.setValue(JSON.stringify(JSON.parse(cm.getValue()),null,2));toast('JSON formatado.');return}catch(err){toast('JSON inválido: '+err.message,'error');return}
    }
    const first=cm.getCursor('from').line,last=cm.somethingSelected()?cm.getCursor('to').line:cm.lineCount()-1;
    cm.operation(()=>{for(let i=first;i<=last;i++)cm.indentLine(i,'smart')});toast('Indentação aplicada.');
  }
  function runGlobalSearch(){const q=$('#globalSearch').value.trim().toLowerCase();const results=[];if(q){for(const [p,f] of Object.entries(state.files)){if(f.type!=='text')continue;f.content.split('\n').forEach((line,i)=>{if(results.length>=120)return;if(line.toLowerCase().includes(q))results.push({path:p,line:i+1,text:line.trim().slice(0,160)})})}}$('#searchResults').innerHTML=results.map((r,i)=>`<button class="search-hit" data-hit="${i}"><strong>${escapeHTML(r.path)} : ${r.line}</strong><em>${escapeHTML(r.text)}</em></button>`).join('')||`<p class="subtle" style="padding:9px">${q?'Nenhum resultado encontrado.':'Digite um termo para pesquisar.'}</p>`;$('#searchResults')._matches=results}
  let quickIndex=0;
  function openQuick(){els.quick.classList.remove('hidden');$('#quickInput').value='';quickIndex=0;renderQuick();setTimeout(()=>$('#quickInput').focus(),10)}
  function renderQuick(){const q=$('#quickInput').value.toLowerCase();const matches=Object.keys(state.files).filter(p=>p.toLowerCase().includes(q)).slice(0,60);quickIndex=Math.max(0,Math.min(quickIndex,matches.length-1));$('#quickResults')._matches=matches;$('#quickResults').innerHTML=matches.map((p,i)=>`<button class="quick-item ${i===quickIndex?'selected':''}" data-quick="${i}">${badgeFor(p)}<span>${escapeHTML(basename(p))}</span><span class="quick-path">${escapeHTML(dirname(p))}</span></button>`).join('')||'<div class="subtle" style="padding:15px">Nenhum arquivo encontrado.</div>'}
  function closeQuick(){els.quick.classList.add('hidden')}
  function showShortcuts(){askModal({eyebrow:'REFERÊNCIA',title:'Atalhos essenciais',label:'Atalhos do StudioWeb',value:'Ctrl+S salvar · Ctrl+Shift+S exportar ZIP · Ctrl+P abrir arquivo · Ctrl+F buscar · Ctrl+H substituir · Ctrl+Shift+F busca global · Ctrl+Espaço autocompletar · Ctrl+/ comentar · Alt+G ir à linha · Ctrl+N novo arquivo',confirm:'Fechar'}).then(()=>{})}
  function showAbout(){askModal({eyebrow:'STUDIOWEB',title:'Editor Web Profissional',label:'Sobre esta ferramenta',value:'Editor local de HTML, CSS e JavaScript, com CodeMirror, JSZip, inspetor visual e armazenamento automático IndexedDB. Sem backend nem dependências online.',confirm:'Fechar'}).then(()=>{})}
  function openStandalonePreview(){
    const html=StudioPreview.build(state.files,state.previewEntry,false);if(!html)return toast('Crie uma página HTML para visualizar.','error');
    const safe=escapeHTML(html);const wrapper=`<!doctype html><html><head><meta charset="UTF-8"><title>Prévia — ${escapeHTML(state.projectName)}</title><style>*{box-sizing:border-box}body{margin:0}iframe{position:fixed;inset:0;width:100%;height:100%;border:0}</style></head><body><iframe sandbox="allow-scripts allow-forms allow-modals" srcdoc="${safe}"></iframe></body></html>`;
    const url=URL.createObjectURL(new Blob([wrapper],{type:'text/html'}));
    window.open(url,'_blank','noopener');setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  function initEvents() {
    window.addEventListener('message',onFrameMessage);
    $$('.mode-btn').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode)));
    $$('.device-btn').forEach(b=>b.addEventListener('click',()=>setDevice(b.dataset.device)));
    $$('.dock-tab').forEach(b=>b.addEventListener('click',()=>setDock(b.dataset.dock)));
    $$('.activity-item[data-activity]').forEach(b=>b.addEventListener('click',()=>setActivity(b.dataset.activity)));
    $('#themeToggle').addEventListener('click',()=>setTheme(state.theme==='dark'?'light':'dark'));
    $('#settingsButton').addEventListener('click',showShortcuts);
    $('#exportTop').addEventListener('click',exportProject);
    $('#addFileBtn').addEventListener('click',newFile);$('#emptyNewFile').addEventListener('click',newFile);
    $('#addFolderBtn').addEventListener('click',newFolder);
    $('#uploadFileBtn').addEventListener('click',()=>$('#inputFiles').click());$('#assetsUploadBtn').addEventListener('click',()=>$('#inputFiles').click());
    $('#importFolderBtn').addEventListener('click',()=>$('#inputFolder').click());$('#importZipBtn').addEventListener('click',()=>$('#inputZip').click());
    $('#explorerMoreBtn').addEventListener('click',e=>menuFor('arquivo',e.currentTarget));
    $('#inputFiles').addEventListener('change',async e=>{await importFiles(e.target.files);e.target.value=''});
    $('#inputFolder').addEventListener('change',async e=>{await importFiles(e.target.files,true);e.target.value=''});
    $('#inputZip').addEventListener('change',async e=>{await importZip(e.target.files[0]);e.target.value=''});
    els.tree.addEventListener('click',e=>{const row=e.target.closest('.tree-row');if(!row)return;if(row.dataset.kind==='folder')toggleFolder(row.dataset.path);else openFile(row.dataset.path)});
    els.tree.addEventListener('contextmenu',e=>{const row=e.target.closest('.tree-row');if(!row)return;e.preventDefault();contextMenu(row.dataset.path,row.dataset.kind,e.clientX,e.clientY)});
    els.tree.addEventListener('dragstart',e=>{const row=e.target.closest('.tree-row');if(!row)return;e.dataTransfer.setData('text/studio-path',row.dataset.path);e.dataTransfer.effectAllowed='move'});
    els.tree.addEventListener('dragover',e=>{const row=e.target.closest('.tree-row.folder');if(row){e.preventDefault();row.classList.add('drop-target')}});
    els.tree.addEventListener('dragleave',e=>{const row=e.target.closest('.tree-row.folder');row?.classList.remove('drop-target')});
    els.tree.addEventListener('drop',e=>{e.preventDefault();const row=e.target.closest('.tree-row.folder');$$('.drop-target').forEach(el=>el.classList.remove('drop-target'));if(!row)return;const source=e.dataTransfer.getData('text/studio-path');if(!source)return;const folder=allFolders().includes(source);const target=row.dataset.path+'/'+basename(source);if(renamePath(source,target,folder))toast('Item movido para '+row.dataset.path)});
    $('#projectTreeTitle').addEventListener('dblclick',()=>{state.selectedFolder='';renderTree();toast('Destino selecionado: raiz do projeto.')} );
    $('.project-header').addEventListener('dragover',e=>e.preventDefault());
    $('.project-header').addEventListener('drop',e=>{e.preventDefault();const source=e.dataTransfer.getData('text/studio-path');if(source&&renamePath(source,basename(source),allFolders().includes(source)))toast('Movido para a raiz do projeto.')});
    els.tabs.addEventListener('click',e=>{const close=e.target.closest('[data-close]');if(close){closeTab(close.dataset.close);return}const tab=e.target.closest('.file-tab');if(tab)openFile(tab.dataset.path)});
    els.tabs.addEventListener('auxclick',e=>{const tab=e.target.closest('.file-tab');if(tab&&e.button===1)closeTab(tab.dataset.path)});
    els.tabs.addEventListener('keydown',e=>{if(e.key==='Enter'){const tab=e.target.closest('.file-tab');if(tab)openFile(tab.dataset.path)}});
    $('#undoBtn').addEventListener('click',()=>cm.undo());$('#redoBtn').addEventListener('click',()=>cm.redo());
    $('#formatBtn').addEventListener('click',formatCurrent);$('#commandBtn').addEventListener('click',openQuick);$('#refreshBtn').addEventListener('click',renderPreview);
    $('#openPreviewBtn').addEventListener('click',openStandalonePreview);
    $('#clearConsoleBtn').addEventListener('click',()=>{$('#consolePanel').innerHTML='<div class="console-empty">Console limpo.</div>';$('#consoleCount').textContent='0'});
    $('#dockCollapseBtn').addEventListener('click',()=>{$('#bottomDock').classList.toggle('collapsed');$('#dockCollapseBtn').textContent=$('#bottomDock').classList.contains('collapsed')?'⌃':'⌄'});
    $('#problemsPanel').addEventListener('click',e=>{const item=e.target.closest('[data-problem]');const p=$('#problemsPanel')._problems?.[Number(item?.dataset.problem)];if(p){setMode('split');openFile(p.path)}});
    $('#inspectorPanel').addEventListener('submit',e=>{if(e.target.id!=='inspectorForm')return;e.preventDefault();const form=new FormData(e.target);const fields={};for(const [name,value] of form.entries())fields[name]=value;applyInspectorChanges(fields)});
    $('#assetGrid').addEventListener('click',e=>{const item=e.target.closest('[data-asset]');if(!item)return;const p=item.dataset.asset;navigator.clipboard?.writeText(p).then(()=>toast('Caminho copiado: '+p)).catch(()=>toast('Caminho da imagem: '+p));if(!navigator.clipboard)toast('Caminho: '+p)});
    $('#globalSearch').addEventListener('input',runGlobalSearch);
    $('#searchResults').addEventListener('click',e=>{const item=e.target.closest('[data-hit]');if(!item)return;const hit=$('#searchResults')._matches?.[Number(item.dataset.hit)];if(!hit)return;openFile(hit.path);cm.setCursor({line:hit.line-1,ch:0});cm.scrollIntoView({line:hit.line-1,ch:0},70);cm.focus()});
    $$('.menu-button').forEach(btn=>btn.addEventListener('click',e=>{e.stopPropagation();if(menuOpen&&btn.classList.contains('selected')){hideMenu();return}$$('.menu-button').forEach(x=>x.classList.remove('selected'));btn.classList.add('selected');menuFor(btn.dataset.menu,btn)}));
    els.dropdown.addEventListener('click',e=>{const b=e.target.closest('[data-menu-action]');if(!b)return;const fn=els.dropdown._actions[b.dataset.menuAction];hideMenu();fn?.()});
    document.addEventListener('pointerdown',e=>{if(menuOpen&&!els.dropdown.contains(e.target)&&!e.target.closest('[data-menu]'))hideMenu()});
    $('#modalCancel').addEventListener('click',()=>closeModal(false));$('#modalClose').addEventListener('click',()=>closeModal(false));$('#modalConfirm').addEventListener('click',()=>closeModal(true));
    $('#modalBody').addEventListener('keydown',e=>{if(e.target.id==='modalValue'&&e.key==='Enter'){e.preventDefault();closeModal(true)}});
    els.modal.addEventListener('mousedown',e=>{if(e.target===els.modal)closeModal(false)});
    $('#quickInput').addEventListener('input',()=>{quickIndex=0;renderQuick()});
    $('#quickInput').addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();quickIndex++;renderQuick()}else if(e.key==='ArrowUp'){e.preventDefault();quickIndex--;renderQuick()}else if(e.key==='Enter'){const path=$('#quickResults')._matches?.[quickIndex];if(path){closeQuick();openFile(path)}}});
    $('#quickResults').addEventListener('click',e=>{const b=e.target.closest('[data-quick]');if(!b)return;const path=$('#quickResults')._matches[Number(b.dataset.quick)];closeQuick();openFile(path)});
    els.quick.addEventListener('mousedown',e=>{if(e.target===els.quick)closeQuick()});
    document.addEventListener('keydown',e=>{
      if(e.key==='Escape'){if(!els.quick.classList.contains('hidden'))closeQuick();else if(!els.modal.classList.contains('hidden'))closeModal(false);else hideMenu();return}
      if(!(e.ctrlKey||e.metaKey))return;
      const key=e.key.toLowerCase();
      if(key==='s'){e.preventDefault();if(e.shiftKey)exportProject();else {clearTimeout(saveTimer);persist();toast('Projeto salvo no navegador.')}}
      else if(key==='p'){e.preventDefault();openQuick()}
      else if(key==='n'){e.preventDefault();newFile()}
      else if(key==='o'){e.preventDefault();$('#inputFiles').click()}
      else if(key==='f'&&e.shiftKey){e.preventDefault();setActivity('search')}
      else if(key==='/'&&!els.modal.classList.contains('hidden')){}else if(key==='/'&&state.active){e.preventDefault();cm.toggleComment()}
    });
    const divider=$('#paneDivider');divider.addEventListener('pointerdown',e=>{if(window.innerWidth<=760)return;divider.setPointerCapture(e.pointerId);divider.classList.add('dragging');document.body.style.cursor='col-resize'});
    divider.addEventListener('pointermove',e=>{if(!divider.hasPointerCapture(e.pointerId))return;const rect=$('#contentArea').getBoundingClientRect();const pct=(e.clientX-rect.left)/rect.width*100;if(pct<21||pct>79)return;$('#editorPane').style.flex=`0 0 ${pct}%`;$('#previewPane').style.flex='1';cm.refresh()});
    divider.addEventListener('pointerup',e=>{divider.releasePointerCapture(e.pointerId);divider.classList.remove('dragging');document.body.style.cursor='';changed(false)});
    // OS file drop: import images and lightweight development files from any desktop location.
    document.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault()});
    document.addEventListener('drop',e=>{if(e.dataTransfer?.files?.length){e.preventDefault();importFiles(e.dataTransfer.files)}});
  }
  async function initialize() {
    cm=CodeMirror.fromTextArea($('#codeArea'),{
      lineNumbers:true,mode:'htmlmixed',theme:'material-darker',lineWrapping:false,indentUnit:2,tabSize:2,indentWithTabs:false,
      autoCloseBrackets:true,autoCloseTags:true,matchBrackets:true,matchTags:{bothTags:true},styleActiveLine:true,
      foldGutter:true,gutters:['CodeMirror-linenumbers','CodeMirror-foldgutter'],extraKeys:{
        'Ctrl-Space':editor=>editor.showHint({completeSingle:false}),
        'Alt-G':editor=>editor.execCommand('jumpToLine'),
        'Ctrl-/':editor=>editor.toggleComment(),
        'Cmd-/':editor=>editor.toggleComment(),
        'Ctrl-D':editor=>{const text=editor.getSelection()||editor.getLine(editor.getCursor().line);editor.replaceSelection(text+'\n'+text)},
        'Tab':editor=>{if(editor.somethingSelected())editor.indentSelection('add');else editor.replaceSelection('  ','end')}
      }
    });
    cm.on('change',editor=>{if(switching||!state.active||state.files[state.active]?.type!=='text')return;state.files[state.active].content=editor.getValue();changed()});
    cm.on('cursorActivity',updateCursor);
    await dbOpen();await restore();initEvents();renderTree();renderTabs();updateCounts();setMode(state.mode||'split');setDevice(state.device||'desktop');setTheme(state.theme||'dark');setDock(state.dock||'console');
    if(state.active)openFile(state.active);else showEmpty();renderPreview();renderProblems();setStatus('Pronto para criar');
    if(!db){toast('IndexedDB indisponível. O salvamento usará armazenamento alternativo.','error')}
  }
  initialize().catch(err=>{console.error(err);toast('Erro ao iniciar: '+err.message,'error')});
})();
