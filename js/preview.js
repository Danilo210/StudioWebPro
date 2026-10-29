/* StudioWeb Preview Engine — isolated iframe source builder (no server required). */
(() => {
  'use strict';
  const isExternal = url => /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test((url || '').trim());
  const extOf = p => (p.split('.').pop() || '').toLowerCase();
  const assetMime = { svg:'image/svg+xml', png:'image/png', jpg:'image/jpeg', jpeg:'image/jpeg', gif:'image/gif', webp:'image/webp', ico:'image/x-icon', woff:'font/woff', woff2:'font/woff2', ttf:'font/ttf', pdf:'application/pdf', avif:'image/avif' };
  function resolvePath(from, ref) {
    if (!ref || isExternal(ref)) return null;
    const stripped = ref.split(/[?#]/)[0].replace(/\\/g, '/');
    const pieces = (stripped.startsWith('/') ? [] : from.split('/').slice(0, -1)).concat(stripped.split('/'));
    const stack = [];
    for (const p of pieces) {
      if (!p || p === '.') continue;
      if (p === '..') stack.pop(); else stack.push(p);
    }
    return stack.join('/');
  }
  function getAssetUrl(files, path) {
    const file = files[path];
    if (!file) return null;
    if (file.type === 'binary') return file.content;
    if (extOf(path) === 'svg') return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(file.content);
    return null;
  }
  function rewriteCSS(css, from, files, depth = 0) {
    if (depth > 5) return css;
    const withImports = css.replace(/@import\s+(?:url\()?['"]([^'"()]+\.css)['"]\)?\s*;/gi, (match, ref) => {
      const p = resolvePath(from, ref);
      return p && files[p]?.type === 'text' ? `\n/* ${p} */\n` + rewriteCSS(files[p].content, p, files, depth + 1) : match;
    });
    return withImports.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/gi, (match, quote, ref) => {
      const target = resolvePath(from, ref);
      const url = target && getAssetUrl(files, target);
      return url ? `url("${url}")` : match;
    });
  }
  function stripInjectedAttrs(doc) {
    doc.querySelectorAll('[data-studio-node]').forEach(el => el.removeAttribute('data-studio-node'));
    doc.body?.removeAttribute('data-studio-design');
    return doc;
  }
  function doctypeOf(original) {
    const match = /^\s*(<!doctype[^>]+>)/i.exec(original);
    return match ? match[1] + '\n' : '';
  }
  function build(files, entry, design = false) {
    const original = files[entry]?.content;
    if (typeof original !== 'string') return null;
    const doc = new DOMParser().parseFromString(original, 'text/html');
    doc.querySelectorAll('base').forEach(el => el.remove()); // project-local paths remain deterministic
    let nodeId = 0;
    doc.body.querySelectorAll('*').forEach(el => el.setAttribute('data-studio-node', String(nodeId++)));
    // Resolve linked stylesheets from virtual project files; keep external CDN links.
    [...doc.querySelectorAll('link[rel="stylesheet"][href]')].forEach(link => {
      const p = resolvePath(entry, link.getAttribute('href'));
      if (p && files[p]?.type === 'text') {
        const style = doc.createElement('style');
        style.textContent = rewriteCSS(files[p].content, p, files);
        style.setAttribute('data-studio-style', p);
        link.replaceWith(style);
      }
    });
    [...doc.querySelectorAll('style')].forEach(style => {
      if (!style.hasAttribute('data-studio-style')) style.textContent = rewriteCSS(style.textContent, entry, files);
    });
    [...doc.querySelectorAll('script[src]')].forEach(script => {
      const p = resolvePath(entry, script.getAttribute('src'));
      if (p && files[p]?.type === 'text') {
        const replacement = doc.createElement('script');
        for (const attr of script.attributes) if (attr.name !== 'src' && attr.name !== 'integrity' && attr.name !== 'crossorigin') replacement.setAttribute(attr.name, attr.value);
        // Avoid parsing inline closing script tags inside string literals.
        replacement.textContent = files[p].content.replace(/<\/script/gi, '<\\/script');
        replacement.setAttribute('data-studio-script', p);
        script.replaceWith(replacement);
      }
    });
    [...doc.querySelectorAll('[src], [poster]')].forEach(el => {
      for (const attr of ['src', 'poster']) {
        if (!el.hasAttribute(attr)) continue;
        const p = resolvePath(entry, el.getAttribute(attr));
        const url = p && getAssetUrl(files, p);
        if (url) el.setAttribute(attr, url);
      }
    });
    [...doc.querySelectorAll('[srcset]')].forEach(el => {
      el.setAttribute('srcset', el.getAttribute('srcset').split(',').map(piece => {
        const parts = piece.trim().split(/\s+/), p = resolvePath(entry, parts[0]);
        const asset = p && getAssetUrl(files, p);
        return [asset || parts[0], ...parts.slice(1)].join(' ');
      }).join(', '));
    });
    [...doc.querySelectorAll('[style]')].forEach(el => el.setAttribute('style', rewriteCSS(el.getAttribute('style'), entry, files)));
    doc.body.setAttribute('data-studio-design', String(Boolean(design)));
    const extraCss = doc.createElement('style');
    extraCss.textContent = `body[data-studio-design="true"] [data-studio-node]:hover{outline:1px dashed #4285ff!important;outline-offset:2px;cursor:default}body[data-studio-design="true"] [data-studio-node].__studio_selected{outline:2px solid #246aff!important;outline-offset:2px}body[data-studio-design="true"] [contenteditable="true"]{outline:2px solid #18b68b!important;cursor:text}`;
    doc.head.appendChild(extraCss);
    const script = doc.createElement('script');
    script.textContent = instrumentScript();
    doc.head.insertBefore(script, doc.head.firstChild);
    return doctypeOf(original) + doc.documentElement.outerHTML;
  }
  function instrumentScript() {
    return `(function(){
      'use strict';
      const send = (type,data) => { try { window.parent.postMessage({studioWeb:true,type,data},'*'); } catch(e){} };
      const stringify = (x) => { try { if (x instanceof Error) return x.stack || x.message; if (typeof x === 'object') return JSON.stringify(x); return String(x); }catch(e){return String(x)} };
      ['log','info','warn','error'].forEach(type => { const old=console[type].bind(console); console[type]=function(...args){send('console',{level:type,text:args.map(stringify).join(' ')});old(...args)}; });
      window.addEventListener('error',ev=>send('console',{level:'error',text:(ev.message||'Erro desconhecido')+' ('+(ev.filename||'inline')+':'+(ev.lineno||'?')+')'}));
      window.addEventListener('unhandledrejection',ev=>send('console',{level:'error',text:'Promise rejeitada: '+stringify(ev.reason)}));
      const info=el=>({id:el.getAttribute('data-studio-node'),tag:el.tagName.toLowerCase(),text:el.textContent||'',idAttr:el.id||'',classAttr:el.getAttribute('class')||'',href:el.getAttribute('href')||'',src:el.getAttribute('src')||'',style:el.getAttribute('style')||''});
      document.addEventListener('click',ev=>{
        const el=ev.target.closest('[data-studio-node]');
        if (document.body.dataset.studioDesign==='true'){
          ev.preventDefault();ev.stopPropagation();
          document.querySelectorAll('.__studio_selected').forEach(e=>e.classList.remove('__studio_selected'));
          if(el){const details=info(el);el.classList.add('__studio_selected');send('select',details)}
          return;
        }
        const link=ev.target.closest('a[href]');
        if(link){const href=link.getAttribute('href');if(href && !/^(?:[a-z][a-z\\d+.-]*:|\\/\\/|#)/i.test(href)){ev.preventDefault();send('navigate',{href})}}
      },true);
      document.addEventListener('dblclick',ev=>{
        if(document.body.dataset.studioDesign!=='true')return;
        const el=ev.target.closest('[data-studio-node]');
        if(!el || ['img','input','video','button','select','textarea','canvas'].includes(el.tagName.toLowerCase()))return;
        ev.preventDefault();ev.stopPropagation();
        el.setAttribute('contenteditable','true');el.focus();
        const finish=()=>{el.removeAttribute('contenteditable');send('inlineEdit',{id:el.getAttribute('data-studio-node'),html:el.innerHTML})};
        el.addEventListener('blur',finish,{once:true});
      },true);
      window.addEventListener('message',ev=>{
        if(!ev.data || !ev.data.studioWebControl)return;
        if(ev.data.type==='highlight'){
          document.querySelectorAll('.__studio_selected').forEach(e=>e.classList.remove('__studio_selected'));
          const el=document.querySelector('[data-studio-node="'+String(ev.data.id).replace(/[^0-9]/g,'')+'"]');
          if(el)el.classList.add('__studio_selected');
        }
      });
    })();`;
  }
  function applyElementChange(files, entry, id, fields) {
    const original = files[entry]?.content;
    if (typeof original !== 'string') return false;
    const doc = new DOMParser().parseFromString(original, 'text/html');
    const target = [...doc.body.querySelectorAll('*')][Number(id)];
    if (!target) return false;
    for (const [key, value] of Object.entries(fields)) {
      if (key === 'text') target.textContent = value;
      else if (key === 'html') target.innerHTML = value;
      else if (['id','class','href','src','style','title','alt'].includes(key)) {
        if (value) target.setAttribute(key, value); else target.removeAttribute(key);
      }
    }
    stripInjectedAttrs(doc);
    return doctypeOf(original) + doc.documentElement.outerHTML;
  }
  window.StudioPreview = {build,resolvePath,getAssetUrl,applyElementChange,assetMime};
})();
