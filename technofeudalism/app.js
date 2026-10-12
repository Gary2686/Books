/* 雲端封建時代 Technofeudalism — interactive study guide */
(function () {
  'use strict';
  const B = window.BOOK;
  const CH = B.chapters;
  const byId = Object.fromEntries(CH.map(c => [c.id, c]));
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const main = $('#main');

  /* ---------- storage (safe) ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('tf:' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('tf:' + k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- parts & colors ---------- */
  const PARTS = [
    { key: 'p0', zh: '開場', en: 'Opening', ids: ['pre'] },
    { key: 'p1', zh: '一　資本主義怎麼了', en: 'What Happened', ids: ['ch1', 'ch2'] },
    { key: 'p2', zh: '二　雲端資本崛起', en: 'Cloud Capital', ids: ['ch3', 'ch4', 'ch5'] },
    { key: 'p3', zh: '三　世界與出路', en: 'World & Exit', ids: ['ch6', 'ch7'] },
    { key: 'p0', zh: '附錄', en: 'Appendices', ids: ['appx'] }
  ];
  const partOf = id => PARTS.find(p => p.ids.includes(id)) || PARTS[0];
  const pc = id => { const k = partOf(id).key; return `--pc:var(--${k});--pcs:var(--${k}-soft)`; };
  const shortNum = c => c.id === 'pre' ? '序' : c.id === 'appx' ? '附' : c.id.replace('ch', '');
  const PART_HEX = { p0: '#64748b', p1: '#b45309', p2: '#0891b2', p3: '#be123c' };

  /* ---------- text helpers ---------- */
  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  function rich(s) {
    let h = esc(s);
    h = h.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, zh, en) => `<span class="term" title="${en}">${zh}<span class="en">${en}</span></span>`);
    h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    return h;
  }
  const plain = s => String(s ?? '').replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$1 $2').replace(/\*\*/g, '');
  const arr = a => Array.isArray(a) ? a : [];
  function initials(name) { const s = String(name || '?').replace(/[（(].*$/, '').trim(); return s.split(/[．·・\s]/).pop().slice(0, 1) || '?'; }
  function hue(str) { let h = 0; for (const ch of String(str)) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => t.hidden = true, 1800); }

  /* ---------- sidebar ---------- */
  function renderSidebar(route) {
    const done = store.get('done', {});
    const top = [
      ['#/', '⌂', '總覽 Overview'], ['#/contrasts', '⇄', '對照表 Contrasts'], ['#/timeline', '⟿', '總時間軸 Timeline'],
      ['#/people', '☺', '人物誌 People'], ['#/glossary', '≡', '雙語詞彙 Glossary'], ['#/quotes', '❝', '金句庫 Quotes'],
      ['#/future', '⚡', '資管前沿激盪 Futures'], ['#/review', '⟲', '記憶複習 Review'], ['#/notes', '✎', '我的筆記 Notes']
    ];
    let h = '<div class="nav-group nav-top">' + top.map(([href, ic, t]) =>
      `<a href="${href}" class="${route.path === href.slice(1) ? 'active' : ''}"><span>${ic}</span>${t}</a>`).join('') + '</div>';
    for (const p of PARTS) {
      h += `<div class="nav-group"><div class="nav-part"><i style="background:var(--${p.key})"></i>${p.zh} <span style="font-weight:500;font-size:11px">${p.en}</span></div>`;
      for (const id of p.ids) {
        const c = byId[id]; if (!c) continue;
        const active = route.ch === id;
        h += `<div class="nav-ch"><a href="#/ch/${id}" class="${active ? 'active' : ''}"><span class="num">${shortNum(c)}</span><span>${esc(c.title_zh)}</span>${done[id] ? '<span class="done">✓</span>' : ''}</a>`;
        if (active) h += '<div class="nav-sub">' + arr(c.sections).map((s, i) => `<a href="#" data-jump="sec-${i}">${i + 1}. ${esc(s.heading)}</a>`).join('') + '</div>';
        h += '</div>';
      }
      h += '</div>';
    }
    $('#sidebar').innerHTML = h;
  }

  /* ---------- home ---------- */
  function cloudSVG() {
    return `<svg class="cracks" viewBox="0 0 400 400" fill="none" stroke="#67e8f9" stroke-width="1.2"><path d="M60 170c0-30 26-52 56-48 10-34 44-54 80-46 26 6 44 26 50 50 34-4 62 22 62 54 0 30-24 52-54 52H112c-30 0-52-28-52-62z"/><g stroke-dasharray="3 6"><path d="M120 230v120"/><path d="M200 230v150"/><path d="M280 230v110"/></g><circle cx="120" cy="352" r="6" fill="#67e8f9"/><circle cx="200" cy="382" r="6" fill="#67e8f9"/><circle cx="280" cy="342" r="6" fill="#67e8f9"/><path d="M90 352h60M170 382h60M250 342h60" stroke-width="1"/></svg>`;
  }
  function renderHome() {
    const done = store.get('done', {});
    const nDone = CH.filter(c => done[c.id]).length;
    let h = `<section class="hero">${cloudSVG()}
      <div class="eyebrow" style="color:#a5f3fc">Yanis Varoufakis · 2023 · 中譯《雲端封建時代》許瑞宋 譯</div>
      <h1>雲端封建時代</h1>
      <div class="sub">Technofeudalism: What Killed Capitalism</div>
      <p style="margin-top:16px">${rich(B.meta.pitch)}</p>
      <div class="meta"><span>作者 雅尼斯．瓦魯法克斯 Yanis Varoufakis</span><span>序言 + 7 章 + 附錄</span><span>閱讀進度 ${nDone} / ${CH.length}</span></div>
    </section>`;

    h += `<section class="block"><h2>一句話看懂這本書 <span class="en">THE BIG IDEA</span></h2>
      <div class="card"><p class="lead" style="margin:0">${rich(B.meta.bigidea)}</p></div></section>`;

    h += `<section class="block"><h2>新的階級地圖 <span class="en">WHO EXTRACTS FROM WHOM</span></h2>
      <p class="muted" style="margin-top:-6px">${rich(B.meta.classIntro)}</p>
      <div class="ladder">` + B.meta.classes.map((k, i) => `<div class="rung" style="--pc:${k.c}"><div class="rung-tag">${i + 1}</div><div><b>${esc(k.zh)}</b> <span class="en-inline">${esc(k.en)}</span><div class="muted" style="font-size:14px;line-height:1.65">${rich(k.explain)}</div><div class="rung-ex">${esc(k.ex)}</div></div></div>`).join('') +
      `</div><div class="flow-note">${rich(B.meta.flow)}</div></section>`;

    h += `<section class="block"><h2>核心詞彙六把鑰匙 <span class="en">SIX KEYS</span></h2><div class="grid g3">` +
      B.meta.keys.map(k => `<div class="card concept" style="${pc('ch3')}"><h4>${esc(k.zh)}</h4><span class="en-line">${esc(k.en)}</span><p>${rich(k.explain)}</p></div>`).join('') +
      `</div></section>`;

    h += `<section class="block"><h2>資本主義 vs. 科技封建主義 <span class="en">THE CORE CONTRAST</span></h2><div class="ctable"><table><thead><tr><th>面向</th><th>資本主義 Capitalism</th><th>科技封建主義 Technofeudalism</th></tr></thead><tbody>` +
      B.meta.contrast.map(r => `<tr><th>${esc(r[0])}</th><td>${rich(r[1])}</td><td>${rich(r[2])}</td></tr>`).join('') + `</tbody></table></div></section>`;

    h += `<section class="block"><h2>全書架構 <span class="en">STRUCTURE</span></h2><div class="grid g3">`;
    for (const p of PARTS.filter(p => p.key !== 'p0')) {
      h += `<div class="card part-card" style="--pc:var(--${p.key})"><h3>${esc(p.zh.replace(/^[一二三]　/, ''))}</h3><span class="en-line">${p.en.toUpperCase()}</span>
        <p style="font-size:14.5px;color:var(--ink2);margin:0">${rich(B.meta.parts[p.key === 'p1' ? 0 : p.key === 'p2' ? 1 : 2])}</p><ol>` +
        p.ids.map(id => byId[id] ? `<li><a href="#/ch/${id}"><span class="n">${shortNum(byId[id])}</span><span>${esc(byId[id].title_zh)}<small>${esc(byId[id].title_en)}</small></span></a></li>` : '').join('') + `</ol></div>`;
    }
    h += `</div><div class="grid g2" style="margin-top:16px">` +
      ['pre', 'appx'].filter(id => byId[id]).map(id => `<a class="card" href="#/ch/${id}" style="color:var(--ink);${pc(id)}"><div class="eyebrow">${esc(byId[id].num || '')}</div><h3 style="margin:4px 0">${esc(byId[id].title_zh)} <span class="en-inline">${esc(byId[id].title_en)}</span></h3><div class="muted" style="font-size:14.5px">${rich(byId[id].hook)}</div></a>`).join('') + `</div></section>`;

    h += `<section class="block"><h2>怎麼用這個網站 <span class="en">HOW TO STUDY</span></h2><div class="grid g3">
      <div class="card"><b>① 先看鉤子與「給父親」</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">全書是寫給父親的信。每章開頭標出本章在回答父親哪個問題。</p></div>
      <div class="card"><b>② 展開詳細敘事</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">依原書推進順序分段，術語虛線處附英文原文，右上角「EN 原文」可開關。</p></div>
      <div class="card"><b>③ 對照表 + 機制圖</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">每章一張「舊 vs 新」對照表，加上因果鏈與論證地圖。</p></div>
      <div class="card"><b>④ 記憶卡與測驗</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">翻卡自評，「記憶複習」頁會優先出你不熟的卡。</p></div>
      <div class="card"><b>⑤ 資管前沿激盪</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">把雲端資本投射到 2045–2055 的 AI、平台、資料與貨幣議題，直接寫下想法。</p></div>
      <div class="card"><b>⑥ 匯出筆記</b><p class="muted" style="margin:6px 0 0;font-size:14.5px">「我的筆記」頁可匯出 Markdown，帶走你內化後的版本。</p></div>
    </div><p class="muted" style="font-size:13.5px;margin-top:14px">說明：內容依中譯本（許瑞宋譯，衛城出版）逐章整理，術語英文以書末〈專有名詞快速對照表〉為準。英文章名標「（暫譯）」者未與原書目錄核對；金句英文標「原文」者為原書英文用語，標「英譯」者為依中譯回譯，僅供對照。</p></section>`;
    main.innerHTML = h;
  }

  /* ---------- contrast table ---------- */
  function contrastHTML(ct) {
    if (!ct || !arr(ct.rows).length) return '';
    return `<div class="ctable"><table><thead><tr><th>${esc(ct.title || '面向')}</th><th>${esc(ct.a)}</th><th>${esc(ct.b)}</th></tr></thead><tbody>` +
      arr(ct.rows).map(r => `<tr><th>${rich(r.dim)}</th><td>${rich(r.a)}</td><td>${rich(r.b)}</td></tr>`).join('') + `</tbody></table></div>`;
  }
  function renderContrasts() {
    main.innerHTML = pageHead('對照表總覽', 'CONTRASTS', '每章最核心的「舊世界 vs 新世界」對比，集中在一頁。把它當成全書的骨架。') +
      `<section class="block"><h2>全書總對照 <span class="en">THE CORE CONTRAST</span></h2><div class="ctable"><table><thead><tr><th>面向</th><th>資本主義 Capitalism</th><th>科技封建主義 Technofeudalism</th></tr></thead><tbody>` +
      B.meta.contrast.map(r => `<tr><th>${esc(r[0])}</th><td>${rich(r[1])}</td><td>${rich(r[2])}</td></tr>`).join('') + `</tbody></table></div></section>` +
      CH.filter(c => c.contrast).map(c => `<section class="block" style="${pc(c.id)}"><h2><a href="#/ch/${c.id}" style="color:inherit">${shortNum(c)}｜${esc(c.title_zh)}</a> <span class="en">${esc(c.title_en)}</span></h2>${contrastHTML(c.contrast)}</section>`).join('');
  }

  /* ---------- chapter ---------- */
  const SUBS = [
    ['s-tldr', '重點'], ['s-narr', '詳細敘事'], ['s-mech', '機制圖'], ['s-arg', '論證圖'], ['s-ct', '對照表'], ['s-tl', '時間軸'],
    ['s-people', '人物'], ['s-concepts', '概念'], ['s-quotes', '金句'], ['s-nums', '數字'], ['s-future', '資管前沿'],
    ['s-refl', '反思'], ['s-fc', '記憶卡'], ['s-quiz', '測驗']
  ];
  function renderChapter(id) {
    const c = byId[id];
    if (!c) { main.innerHTML = '<p>找不到這一章。</p>'; return; }
    const i = CH.indexOf(c), prev = CH[i - 1], next = CH[i + 1];
    const notes = store.get('notes', {});
    const done = store.get('done', {});
    let h = `<div style="${pc(id)}">`;
    h += `<header class="ch-hero"><div class="big-num">${shortNum(c)}</div>
      <div class="eyebrow">${esc(partOf(id).zh.replace('　', ' '))} · ${esc(c.num || '')}</div>
      <h1>${esc(c.title_zh)}</h1><div class="title-en en-line">${esc(c.title_en)}</div>
      ${c.dad ? `<div class="dad"><span class="dad-tag">給父親的信 Dear Dad</span>${rich(c.dad)}</div>` : ''}
      <div class="hook">${rich(c.hook)}</div></header>`;
    h += `<nav class="subnav">${SUBS.map(([a, t]) => `<a href="#" data-jump="${a}">${t}</a>`).join('')}</nav>`;

    h += `<section class="block" id="s-tldr"><h2>核心論點與重點 <span class="en">THESIS · TL;DR</span></h2>
      <div class="card" style="margin-bottom:14px"><p class="lead" style="margin:0">${rich(c.thesis)}</p></div>
      <ol class="tldr">${arr(c.tldr).map(t => `<li><span>${rich(t)}</span></li>`).join('')}</ol></section>`;

    h += `<section class="block narr" id="s-narr"><h2>詳細敘事 <span class="en">THE STORY, STEP BY STEP</span></h2>
      <div class="narr tools"><button class="btn" data-act="openall">全部展開</button><button class="btn" data-act="closeall">全部收合</button></div>` +
      arr(c.sections).map((s, k) => `<details id="sec-${k}" ${k < 2 ? 'open' : ''}><summary><span class="idx">${String(k + 1).padStart(2, '0')}</span><h3>${esc(s.heading)}<span class="en-line">${esc(s.heading_en || '')}</span></h3></summary>
        <div class="body">${arr(s.body).map(p => `<p>${rich(p)}</p>`).join('')}</div></details>`).join('') + `</section>`;

    if (c.mechanism) h += `<section class="block" id="s-mech"><h2>${esc(c.mechanism.title || '核心機制')} <span class="en">MECHANISM</span></h2>
      <div class="mech">${arr(c.mechanism.steps).map(s => `<div class="step">${rich(String(s).replace(/[→➜]\s*$/, ''))}</div>`).join('')}</div></section>`;

    if (c.argument) h += `<section class="block" id="s-arg"><h2>論證地圖 <span class="en">ARGUMENT MAP</span></h2>
      <div class="argmap"><div class="ev"><h4 style="color:var(--good)">✔ 證據 Evidence</h4><ul>${arr(c.argument.evidence).map(e => `<li>${rich(e)}</li>`).join('')}</ul></div>
      <div class="claim"><small>作者主張 CLAIM</small>${rich(c.argument.claim)}</div>
      <div class="te"><h4 style="color:var(--bad)">⚡ 張力與弔詭 Tensions</h4><ul>${arr(c.argument.tension).map(e => `<li>${rich(e)}</li>`).join('')}</ul></div></div></section>`;

    if (c.contrast) h += `<section class="block" id="s-ct"><h2>${esc(c.contrast.title || '對照表')} <span class="en">CONTRAST</span></h2>${contrastHTML(c.contrast)}</section>`;
    h += `<section class="block" id="s-tl"><h2>時間軸 <span class="en">TIMELINE</span></h2><div class="timeline">` +
      arr(c.timeline).map(t => `<div class="tl-item"><span class="tl-year">${esc(t.year)}</span>${rich(t.event)}</div>`).join('') + `</div></section>`;


    h += `<section class="block" id="s-people"><h2>關鍵人物 <span class="en">PEOPLE</span></h2><div class="grid g2">` +
      arr(c.people).map(p => `<div class="card person"><div class="avatar" style="background:hsl(${hue(p.name_en || p.name)} 45% 42%)">${esc(initials(p.name))}</div><div><h4>${esc(p.name)}<span class="en-line">${esc(p.name_en || '')}</span></h4><p>${rich(p.role)}</p></div></div>`).join('') + `</div></section>`;

    h += `<section class="block" id="s-concepts"><h2>關鍵概念 <span class="en">CONCEPTS · 中英對照</span></h2><p class="muted" style="margin-top:-6px">點卡片可複製「中文 — English」。</p><div class="grid g3">` +
      arr(c.concepts).map(k => `<div class="card concept" data-copy="${esc(k.zh + ' — ' + k.en)}"><h4>${esc(k.zh)}</h4><span class="en-line">${esc(k.en)}</span><p>${rich(k.explain)}</p></div>`).join('') + `</div></section>`;

    const favs = store.get('favs', {});
    h += `<section class="block" id="s-quotes"><h2>金句與原文 <span class="en">KEY QUOTES</span></h2><div class="grid">` +
      arr(c.quotes).map((q, k) => { const key = id + ':' + k; return `<div class="card quote"><div class="qtools"><button data-fav="${key}" class="${favs[key] ? 'on' : ''}" title="收藏">${favs[key] ? '★' : '☆'}</button></div>
        <div class="zh">${rich(q.zh)}</div>${q.en ? `<span class="en-line">“${esc(q.en)}”<span class="badge ${q.en_verbatim ? 'ok' : 'tr'}">${q.en_verbatim ? '原文' : '英譯，非逐字原文'}</span></span>` : ''}
        <div class="who">— ${esc(q.who || '')}</div>${q.context ? `<div class="ctx">${rich(q.context)}</div>` : ''}</div>`; }).join('') + `</div></section>`;

    if (arr(c.numbers).length) h += `<section class="block" id="s-nums"><h2>關鍵數字 <span class="en">BY THE NUMBERS</span></h2><div class="grid g3">` +
      arr(c.numbers).map(n => `<div class="card num-card"><div class="v">${esc(n.value)}</div><div class="l">${rich(n.label)}</div></div>`).join('') + `</div></section>`;

    h += `<section class="block" id="s-future"><h2>連結未來 20–30 年資管前沿 <span class="en">IM FRONTIERS 2045–2055</span></h2><div class="grid">` +
      arr(c.future_im).map((f, k) => { const nk = `${id}:f${k}`; return `<div class="card future"><h4>⚡ ${rich(f.topic)}</h4>
        <div class="row"><b>對照本章</b><div>${rich(f.link)}</div></div>
        <div class="row"><b>2045 情境</b><div class="scn">${rich(f.scenario)}</div></div>
        <div class="row"><b>激盪問題</b><div class="q">${rich(f.question)}</div></div>
        <textarea data-note="${nk}" placeholder="寫下你的想法（自動存在這台裝置的瀏覽器）…">${esc(notes[nk] || '')}</textarea><span class="saved" data-saved="${nk}">已儲存</span></div>`; }).join('') + `</div></section>`;

    h += `<section class="block refl" id="s-refl"><h2>反思與內化 <span class="en">REFLECT</span></h2><div class="card">` +
      arr(c.reflection).map((r, k) => { const nk = `${id}:r${k}`; return `<div class="item"><label>Q${k + 1}. ${rich(r)}</label><textarea data-note="${nk}" placeholder="用自己的話回答…">${esc(notes[nk] || '')}</textarea><span class="saved" data-saved="${nk}">已儲存</span></div>`; }).join('') + `</div></section>`;

    h += `<section class="block" id="s-fc"><h2>記憶卡 <span class="en">FLASHCARDS</span></h2><div id="fcBox"></div></section>`;
    h += `<section class="block quiz" id="s-quiz"><h2>小測驗 <span class="en">QUIZ</span></h2><div id="quizBox"></div></section>`;

    h += `<div class="done-btn"><button class="btn primary" id="doneBtn">${done[id] ? '✓ 已讀完（點擊取消）' : '標記本章已讀完'}</button></div>`;
    h += `<div class="pager">${prev ? `<a href="#/ch/${prev.id}"><small>← 上一章</small>${esc(prev.title_zh)}</a>` : '<span></span>'}${next ? `<a class="r" href="#/ch/${next.id}"><small>下一章 →</small>${esc(next.title_zh)}</a>` : '<span></span>'}</div>`;
    h += `</div>`;
    main.innerHTML = h;

    mountFlashcards($('#fcBox'), arr(c.flashcards).map((f, k) => ({ ...f, key: id + ':' + k, src: c })));
    mountQuiz($('#quizBox'), arr(c.quiz), id);
    const mech = $('.mech');
    if (mech && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { mech.classList.add('go'); io.disconnect(); } }), { threshold: .2 });
      io.observe(mech);
    } else if (mech) mech.classList.add('go');
    $('#doneBtn').onclick = () => { const d = store.get('done', {}); d[id] = !d[id]; store.set('done', d); toast(d[id] ? '已標記讀完 ✓' : '已取消'); route(); };
    setupScrollSpy();
  }

  /* ---------- flashcards ---------- */
  function mountFlashcards(box, cards, opts = {}) {
    if (!cards.length) { box.innerHTML = '<p class="muted">沒有卡片。</p>'; return; }
    const srs = store.get('srs', {});
    let order = cards.slice();
    if (opts.prioritize) order.sort((a, b) => (srs[b.key] || 0) - (srs[a.key] || 0) || Math.random() - .5);
    let i = 0;
    function draw() {
      const c = order[i]; const lvl = srs[c.key] || 0;
      box.innerHTML = `<div class="fc-wrap"><div class="fc" id="fc"><div class="fc-inner">
        <div class="fc-face fc-front"><small>${i + 1} / ${order.length}${opts.showSrc ? ' · ' + esc(c.src.title_zh) : ''}</small>${rich(c.q)}<div class="muted" style="font-size:13px;font-family:var(--sans);font-weight:500;margin-top:16px">點擊翻面 · 空白鍵</div></div>
        <div class="fc-face fc-back" style="${pc(c.src.id)}">${rich(c.a)}</div></div></div>
        <div class="fc-ctrl"><button class="btn" data-k="prev">← 上一張</button><button class="btn bad" data-k="again">✗ 再看一次</button><button class="btn good" data-k="know">✓ 記得了</button><button class="btn" data-k="next">下一張 →</button><button class="btn" data-k="shuffle">⤮ 洗牌</button></div>
        <div class="fc-stat">${lvl > 0 ? `這張你標記過 ${lvl} 次「再看」` : lvl < 0 ? '這張你已熟記' : '尚未自評'} · 本組熟記 ${order.filter(x => (srs[x.key] || 0) < 0).length}/${order.length}</div></div>`;
      const fc = $('#fc', box);
      fc.onclick = () => fc.classList.toggle('flip');
      $$('[data-k]', box).forEach(b => b.onclick = () => {
        const k = b.dataset.k;
        if (k === 'prev') i = (i - 1 + order.length) % order.length;
        if (k === 'next') i = (i + 1) % order.length;
        if (k === 'shuffle') { order.sort(() => Math.random() - .5); i = 0; }
        if (k === 'again') { srs[c.key] = Math.max(0, srs[c.key] || 0) + 1; store.set('srs', srs); i = (i + 1) % order.length; }
        if (k === 'know') { srs[c.key] = -1; store.set('srs', srs); i = (i + 1) % order.length; }
        draw();
      });
    }
    box._fcKey = e => { if (e.key === ' ' && document.activeElement.tagName !== 'TEXTAREA' && document.activeElement.tagName !== 'INPUT') { const fc = $('#fc', box); if (fc && fc.getBoundingClientRect().top < innerHeight && fc.getBoundingClientRect().bottom > 0) { e.preventDefault(); fc.classList.toggle('flip'); } } };
    document.addEventListener('keydown', box._fcKey);
    activeKeyHandlers.push(box._fcKey);
    draw();
  }
  let activeKeyHandlers = [];

  /* ---------- quiz ---------- */
  function mountQuiz(box, qs, id) {
    if (!qs.length) { box.innerHTML = '<p class="muted">沒有題目。</p>'; return; }
    let answered = 0, right = 0;
    box.innerHTML = qs.map((q, k) => `<div class="q card" data-q="${k}"><h4>${k + 1}. ${rich(q.q)}</h4><div class="opts">${arr(q.options).map((o, j) => `<button class="opt" data-o="${j}">${String.fromCharCode(65 + j)}. ${rich(o)}</button>`).join('')}</div></div>`).join('') +
      `<div class="card" style="text-align:center"><span class="score" id="score">0 / ${qs.length}</span><div class="muted" style="font-size:13px">答完顯示解析</div><button class="btn" id="qReset" style="margin-top:8px">重新作答</button></div>`;
    $$('.q', box).forEach(qe => {
      const q = qs[+qe.dataset.q];
      $$('.opt', qe).forEach(b => b.onclick = () => {
        if (qe.dataset.done) return; qe.dataset.done = 1; answered++;
        const j = +b.dataset.o;
        $$('.opt', qe)[q.answer]?.classList.add('right');
        if (j !== q.answer) b.classList.add('wrong'); else right++;
        qe.insertAdjacentHTML('beforeend', `<div class="exp">${j === q.answer ? '✔ 答對！' : '✗ 正解是 ' + String.fromCharCode(65 + q.answer)}　${rich(q.explain)}</div>`);
        $('#score', box).textContent = `${right} / ${qs.length}`;
        if (answered === qs.length) { const best = store.get('quiz', {}); best[id] = Math.max(best[id] || 0, right); store.set('quiz', best); }
      });
    });
    $('#qReset', box).onclick = () => mountQuiz(box, qs, id);
  }

  /* ---------- global pages ---------- */
  function pageHead(zh, en, desc) { return `<header style="margin-bottom:18px"><div class="eyebrow">${en}</div><h1 style="font-size:36px;margin:4px 0">${zh}</h1>${desc ? `<p class="muted" style="margin:0">${desc}</p>` : ''}</header>`; }
  function chFilter(name) {
    return `<button class="chip on" data-f="all">全部</button>` + CH.map(c => `<button class="chip" data-f="${c.id}" style="${pc(c.id)}">${shortNum(c)} ${esc(c.title_zh)}</button>`).join('');
  }
  function wireFilter(container, renderList) {
    let f = 'all', qtext = '';
    const go = () => renderList(f, qtext);
    $$('[data-f]', container).forEach(b => b.onclick = () => { $$('[data-f]', container).forEach(x => x.classList.remove('on')); b.classList.add('on'); f = b.dataset.f; go(); });
    const inp = $('input', container); if (inp) inp.oninput = () => { qtext = inp.value.trim().toLowerCase(); go(); };
    go();
  }

  function yearKey(y) { const m = String(y).match(/(\d{3,4})/); return m ? +m[1] : 9999; }
  function renderTimeline() {
    main.innerHTML = pageHead('總時間軸', 'MASTER TIMELINE', '從封建莊園、蒸汽機、布列敦森林、尼克森震撼、2008 金融海嘯到雲端資本，把全書事件放上同一條時間線。') +
      `<div class="filters" id="flt"><input placeholder="篩選關鍵字…">${chFilter()}</div><div id="list"></div>`;
    const all = CH.flatMap(c => arr(c.timeline).map(t => ({ ...t, c })));
    all.sort((a, b) => yearKey(a.year) - yearKey(b.year));
    wireFilter($('#flt'), (f, q) => {
      const rows = all.filter(t => (f === 'all' || t.c.id === f) && (!q || plain(t.event + t.year).toLowerCase().includes(q)));
      let dec = null, h = '<div class="timeline" style="--pc:var(--accent)">';
      for (const t of rows) {
        const d = Math.floor(yearKey(t.year) / 10) * 10;
        if (d !== dec && d < 9000) { dec = d; h += `<h3 style="margin:22px 0 10px -26px;font-family:var(--sans);font-size:15px;color:var(--muted)">${d}s</h3>`; }
        h += `<div class="tl-item" style="${pc(t.c.id)}"><span class="tl-year">${esc(t.year)}</span>${rich(t.event)} <a class="pill tl-chip" href="#/ch/${t.c.id}">${shortNum(t.c)} ${esc(t.c.title_zh)}</a></div>`;
      }
      $('#list').innerHTML = h + '</div>' + (rows.length ? '' : '<p class="muted">沒有符合的事件。</p>');
    });
  }

  function renderPeople() {
    main.innerHTML = pageHead('人物誌', 'DRAMATIS PERSONAE', '書中登場的經濟學家、創業家、政治人物與思想家。同一人出現在多章時會合併。') +
      `<div class="filters" id="flt"><input placeholder="搜尋人名（中/英）…">${chFilter()}</div><div id="list" class="grid g2"></div>`;
    const map = new Map();
    for (const c of CH) for (const p of arr(c.people)) {
      const k = (p.name_en || p.name).toLowerCase().replace(/[^a-z一-鿿]/g, '');
      if (!map.has(k)) map.set(k, { name: p.name, name_en: p.name_en, items: [] });
      map.get(k).items.push({ c, role: p.role });
    }
    const people = [...map.values()].sort((a, b) => b.items.length - a.items.length);
    wireFilter($('#flt'), (f, q) => {
      const rows = people.filter(p => (f === 'all' || p.items.some(i => i.c.id === f)) && (!q || (p.name + ' ' + (p.name_en || '')).toLowerCase().includes(q)));
      $('#list').innerHTML = rows.map(p => `<div class="card person"><div class="avatar" style="background:hsl(${hue(p.name_en || p.name)} 45% 42%)">${esc(initials(p.name))}</div><div style="flex:1"><h4>${esc(p.name)}<span class="en-line">${esc(p.name_en || '')}${p.items.length > 1 ? ` · 出現於 ${p.items.length} 章` : ''}</span></h4>` +
        p.items.map(i => `<p><a class="pill" style="${pc(i.c.id)}" href="#/ch/${i.c.id}">${shortNum(i.c)}</a>${rich(i.role)}</p>`).join('') + `</div></div>`).join('') || '<p class="muted">沒有符合的人物。</p>';
    });
  }

  function renderGlossary() {
    main.innerHTML = pageHead('雙語詞彙表', 'BILINGUAL GLOSSARY', '全書關鍵概念的中英對照與在書中的意義。可以用來做自己的雙語筆記。') +
      `<div class="filters" id="flt"><input placeholder="搜尋詞彙…">${chFilter()}</div><div style="margin-bottom:10px"><button class="btn" id="csv">⬇ 下載詞彙 CSV</button></div><div id="list" class="card" style="padding:4px 22px"></div>`;
    const all = CH.flatMap(c => arr(c.concepts).map(k => ({ ...k, c })));
    wireFilter($('#flt'), (f, q) => {
      const rows = all.filter(k => (f === 'all' || k.c.id === f) && (!q || (k.zh + k.en + plain(k.explain)).toLowerCase().includes(q)));
      $('#list').innerHTML = rows.map(k => `<div class="gl-item" style="${pc(k.c.id)}"><div><h4 style="color:var(--pc)">${esc(k.zh)}</h4><span class="en-line">${esc(k.en)}</span></div><div><p>${rich(k.explain)}</p><div class="src"><a href="#/ch/${k.c.id}">${shortNum(k.c)}｜${esc(k.c.title_zh)}</a></div></div></div>`).join('') || '<p class="muted">沒有符合的詞彙。</p>';
    });
    $('#csv').onclick = () => {
      const lines = [['中文', 'English', '說明', '章節']].concat(all.map(k => [k.zh, k.en, plain(k.explain), k.c.title_zh]));
      download('technofeudalism-glossary.csv', '﻿' + lines.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n'), 'text/csv');
    };
  }

  function renderQuotes() {
    main.innerHTML = pageHead('金句庫', 'QUOTES · 中英對照', '「原文」標籤代表英文為原書或講者的原始用語；「英譯」代表依中譯本回譯，供對照理解。☆ 可收藏。') +
      `<div class="filters" id="flt"><input placeholder="搜尋金句…"><button class="chip" data-f="fav">★ 我的收藏</button>${chFilter()}</div><div id="list" class="grid"></div>`;
    const all = CH.flatMap(c => arr(c.quotes).map((q, k) => ({ ...q, c, key: c.id + ':' + k })));
    const draw = (f, q) => {
      const favs = store.get('favs', {});
      const rows = all.filter(x => (f === 'all' || (f === 'fav' ? favs[x.key] : x.c.id === f)) && (!q || plain(x.zh + x.en + x.who).toLowerCase().includes(q)));
      $('#list').innerHTML = rows.map(x => `<div class="card quote" style="${pc(x.c.id)}"><div class="qtools"><button data-fav="${x.key}" class="${favs[x.key] ? 'on' : ''}">${favs[x.key] ? '★' : '☆'}</button></div><div class="zh">${rich(x.zh)}</div>${x.en ? `<span class="en-line">“${esc(x.en)}”<span class="badge ${x.en_verbatim ? 'ok' : 'tr'}">${x.en_verbatim ? '原文' : '英譯，非逐字原文'}</span></span>` : ''}<div class="who">— ${esc(x.who || '')}　<a href="#/ch/${x.c.id}">${shortNum(x.c)}｜${esc(x.c.title_zh)}</a></div></div>`).join('') || '<p class="muted">沒有符合的金句。</p>';
    };
    wireFilter($('#flt'), draw);
  }

  function renderFuture() {
    const all = CH.flatMap(c => arr(c.future_im).map((f, k) => ({ ...f, c, key: `${c.id}:f${k}` })));
    const notes = store.get('notes', {});
    main.innerHTML = pageHead('資管前沿激盪室', 'IM FRONTIERS 2045–2055', '把書中的「裂縫」投射到未來 20–30 年的資訊管理議題。先抽一題暖身，再看主題矩陣，最後逐章深挖。') +
      `<section class="storm"><div class="eyebrow">隨機激盪題 BRAINSTORM</div><div class="sq" id="sq"></div><div class="src" id="ssrc"></div><button class="btn primary" id="spin" style="margin-top:12px">🎲 換一題</button></section>
      <section class="block"><h2>主題 × 章節 矩陣 <span class="en">THEME MATRIX</span></h2><p class="muted" style="margin-top:-6px">色塊表示該章觸及此主題，點擊跳到該章的資管前沿段落。</p><div class="matrix card" id="mx"></div></section>
      <section class="block"><h2>全部議題 <span class="en">ALL TOPICS</span></h2><div class="grid">` +
      all.map(f => `<div class="card future" style="${pc(f.c.id)}"><div class="eyebrow"><a href="#/ch/${f.c.id}">${shortNum(f.c)}｜${esc(f.c.title_zh)}</a></div><h4>⚡ ${rich(f.topic)}</h4>
        <div class="row"><b>對照本章</b><div>${rich(f.link)}</div></div><div class="row"><b>2045 情境</b><div class="scn">${rich(f.scenario)}</div></div><div class="row"><b>激盪問題</b><div class="q">${rich(f.question)}</div></div>
        <textarea data-note="${f.key}" placeholder="寫下你的想法…">${esc(notes[f.key] || '')}</textarea><span class="saved" data-saved="${f.key}">已儲存</span></div>`).join('') + `</div></section>`;
    const spin = () => { const f = all[Math.floor(Math.random() * all.length)]; if (!f) return; $('#sq').innerHTML = rich(f.question); $('#ssrc').innerHTML = `${rich(f.topic)} · <a href="#/ch/${f.c.id}">${esc(f.c.title_zh)}</a>`; };
    $('#spin').onclick = spin; spin();
    // theme matrix
    const THEMES = B.meta.themes;
    let t = '<table><tr><th></th>' + CH.map(c => `<th class="rot">${shortNum(c)} ${esc(c.title_zh)}</th>`).join('') + '</tr>';
    for (const th of THEMES) {
      t += `<tr><th>${esc(th.zh)} <span class="en-inline">${esc(th.en)}</span></th>`;
      for (const c of CH) {
        const txt = arr(c.future_im).map(f => plain(f.topic)).join(' ').toLowerCase();
        const hit = th.kw.some(k => txt.includes(k.toLowerCase()));
        t += `<td class="${hit ? 'on' : ''}" style="${pc(c.id)}" title="${esc(th.zh)} × ${esc(c.title_zh)}" data-go="${c.id}"></td>`;
      }
      t += '</tr>';
    }
    $('#mx').innerHTML = t + '</table>';
    $$('#mx td[data-go]').forEach(td => td.onclick = () => { location.hash = '#/ch/' + td.dataset.go; setTimeout(() => jump('s-future'), 250); });
  }

  function renderReview() {
    const cards = CH.flatMap(c => arr(c.flashcards).map((f, k) => ({ ...f, key: c.id + ':' + k, src: c })));
    const srs = store.get('srs', {});
    const known = cards.filter(c => (srs[c.key] || 0) < 0).length, again = cards.filter(c => (srs[c.key] || 0) > 0).length;
    const quiz = store.get('quiz', {});
    main.innerHTML = pageHead('記憶複習', 'SPACED REVIEW', '全書記憶卡集中在這裡，「再看一次」次數越多的卡越先出現。') +
      `<div class="grid g3" style="margin-bottom:22px"><div class="card num-card" style="--pc:var(--good)"><div class="v">${known}</div><div class="l">已熟記</div></div><div class="card num-card" style="--pc:var(--bad)"><div class="v">${again}</div><div class="l">需要再看</div></div><div class="card num-card"><div class="v">${cards.length}</div><div class="l">全部卡片</div></div></div>
      <div class="filters" id="flt"><button class="chip on" data-f="all">全部</button><button class="chip" data-f="weak">只看不熟</button>${CH.map(c => `<button class="chip" data-f="${c.id}">${shortNum(c)}</button>`).join('')}</div><div id="box"></div>
      <section class="block"><h2>測驗成績 <span class="en">QUIZ SCORES</span></h2><div class="grid g3">${CH.map(c => `<a class="card" href="#/ch/${c.id}" style="color:var(--ink);${pc(c.id)}"><b>${shortNum(c)}｜${esc(c.title_zh)}</b><div class="muted">最佳 ${quiz[c.id] ?? '—'} / ${arr(c.quiz).length}</div></a>`).join('')}</div></section>
      <div style="margin-top:20px"><button class="btn" id="resetSrs">重設記憶卡紀錄</button></div>`;
    wireFilter($('#flt'), f => {
      const s = store.get('srs', {});
      const list = cards.filter(c => f === 'all' || (f === 'weak' ? (s[c.key] || 0) >= 0 : c.src.id === f));
      clearKeys(); mountFlashcards($('#box'), list, { prioritize: true, showSrc: true });
    });
    $('#resetSrs').onclick = () => { if (confirm('確定清除所有記憶卡自評紀錄？')) { store.set('srs', {}); renderReview(); } };
  }

  function renderNotes() {
    const notes = store.get('notes', {});
    const favs = store.get('favs', {});
    let md = `# 《雲端封建時代 Technofeudalism》我的筆記\n\n`;
    let h = pageHead('我的筆記', 'MY NOTES', '你在各章反思區與資管前沿區寫下的內容，都存在這台裝置的瀏覽器裡（不會上傳）。可以匯出成 Markdown 保存。') +
      `<div style="display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap"><button class="btn primary" id="exp">⬇ 匯出 Markdown</button><button class="btn" id="imp">⬆ 匯入備份 JSON</button><button class="btn" id="bak">⬇ 下載備份 JSON</button></div>`;
    let any = false;
    for (const c of CH) {
      const items = [];
      arr(c.reflection).forEach((r, k) => { const v = notes[`${c.id}:r${k}`]; if (v) items.push(['反思：' + plain(r), v]); });
      arr(c.future_im).forEach((f, k) => { const v = notes[`${c.id}:f${k}`]; if (v) items.push(['前沿：' + plain(f.question), v]); });
      const fq = arr(c.quotes).filter((q, k) => favs[c.id + ':' + k]);
      if (!items.length && !fq.length) continue;
      any = true;
      md += `## ${c.title_zh} (${c.title_en})\n\n`;
      h += `<section class="card" style="margin-bottom:14px;${pc(c.id)};border-left:5px solid var(--pc)"><h3><a href="#/ch/${c.id}">${shortNum(c)}｜${esc(c.title_zh)}</a></h3>`;
      for (const [q, v] of items) { md += `**${q}**\n\n${v}\n\n`; h += `<p style="margin:10px 0 2px;font-weight:700">${esc(q)}</p><p style="white-space:pre-wrap;margin:0;color:var(--ink2)">${esc(v)}</p>`; }
      for (const q of fq) { md += `> ${plain(q.zh)}\n> ${q.en || ''}\n> — ${q.who || ''}\n\n`; h += `<blockquote style="margin:10px 0;border-left:3px solid var(--pc);padding-left:10px">★ ${rich(q.zh)}<br><i class="en-line">${esc(q.en || '')}</i></blockquote>`; }
      h += `</section>`;
    }
    if (!any) h += '<div class="card"><p class="muted" style="margin:0">還沒有筆記。到任一章的「反思」或「資管前沿」區塊寫下想法，或在金句上按 ☆ 收藏。</p></div>';
    main.innerHTML = h;
    $('#exp').onclick = () => download('technofeudalism-notes.md', md, 'text/markdown');
    $('#bak').onclick = () => download('technofeudalism-backup.json', JSON.stringify({ notes: store.get('notes', {}), favs: store.get('favs', {}), srs: store.get('srs', {}), done: store.get('done', {}), quiz: store.get('quiz', {}) }, null, 2), 'application/json');
    $('#imp').onclick = () => {
      const inp = document.createElement('input'); inp.type = 'file'; inp.accept = '.json';
      inp.onchange = () => { const r = new FileReader(); r.onload = () => { try { const d = JSON.parse(r.result); for (const k of ['notes', 'favs', 'srs', 'done', 'quiz']) if (d[k]) store.set(k, d[k]); toast('已匯入'); renderNotes(); } catch (e) { toast('檔案格式錯誤'); } }; r.readAsText(inp.files[0]); };
      inp.click();
    };
  }

  function download(name, text, type) {
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- search ---------- */
  const INDEX = [];
  for (const c of CH) {
    INDEX.push({ t: c.title_zh + ' ' + c.title_en, d: '章節', h: `#/ch/${c.id}`, c });
    arr(c.sections).forEach((s, k) => INDEX.push({ t: s.heading + ' ' + (s.heading_en || ''), d: plain(arr(s.body).join(' ')), h: `#/ch/${c.id}`, c, jump: 'sec-' + k }));
    arr(c.people).forEach(p => INDEX.push({ t: p.name + ' ' + (p.name_en || ''), d: plain(p.role), h: `#/ch/${c.id}`, c, jump: 's-people' }));
    arr(c.concepts).forEach(k => INDEX.push({ t: k.zh + ' ' + k.en, d: plain(k.explain), h: `#/ch/${c.id}`, c, jump: 's-concepts' }));
    arr(c.quotes).forEach(q => INDEX.push({ t: plain(q.zh), d: (q.en || '') + ' — ' + (q.who || ''), h: `#/ch/${c.id}`, c, jump: 's-quotes' }));
    arr(c.timeline).forEach(t => INDEX.push({ t: t.year + ' ' + plain(t.event), d: '', h: `#/ch/${c.id}`, c, jump: 's-tl' }));
  }
  let pendingJump = null;
  function doSearch(q) {
    const box = $('#searchResults');
    q = q.trim().toLowerCase();
    if (q.length < 1) { box.hidden = true; return; }
    const hits = [];
    for (const it of INDEX) {
      const inT = it.t.toLowerCase().indexOf(q), inD = it.d.toLowerCase().indexOf(q);
      if (inT >= 0 || inD >= 0) hits.push({ it, score: inT >= 0 ? 0 : 1, pos: inD });
      if (hits.length > 200) break;
    }
    hits.sort((a, b) => a.score - b.score);
    const hl = s => esc(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'ig'), m => `<mark>${m}</mark>`);
    box.innerHTML = hits.slice(0, 40).map(({ it, pos }) => {
      const snip = pos >= 0 ? it.d.slice(Math.max(0, pos - 30), pos + 60) : it.d.slice(0, 80);
      return `<a href="${it.h}" data-j="${it.jump || ''}">${hl(it.t.slice(0, 90))}<small>${shortNum(it.c)}｜${esc(it.c.title_zh)}${snip ? ' · ' + hl(snip) : ''}</small></a>`;
    }).join('') || '<div class="muted" style="padding:10px">沒有結果</div>';
    box.hidden = false;
    $$('a', box).forEach(a => a.onclick = () => { pendingJump = a.dataset.j || null; box.hidden = true; $('#search').value = ''; if (location.hash === a.getAttribute('href')) { route(); } });
  }

  /* ---------- scroll helpers ---------- */
  function jump(id) {
    const el = document.getElementById(id); if (!el) return;
    if (el.tagName === 'DETAILS') el.open = true;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  let spy = null;
  function setupScrollSpy() {
    if (spy) spy.disconnect();
    if (!('IntersectionObserver' in window)) return;
    spy = new IntersectionObserver(es => {
      for (const e of es) if (e.isIntersecting) {
        const id = e.target.id;
        $$('.subnav a').forEach(a => a.classList.toggle('on', a.dataset.jump === id));
        $$('.nav-sub a').forEach(a => a.classList.toggle('on', a.dataset.jump === id));
        const on = $('.subnav a.on'); if (on) on.scrollIntoView({ block: 'nearest', inline: 'center' });
      }
    }, { rootMargin: '-130px 0px -60% 0px' });
    $$('section.block[id], .narr details[id]').forEach(s => spy.observe(s));
  }
  function clearKeys() { activeKeyHandlers.forEach(h => document.removeEventListener('keydown', h)); activeKeyHandlers = []; }

  /* ---------- router ---------- */
  function parse() {
    const h = location.hash.replace(/^#/, '') || '/';
    const m = h.match(/^\/ch\/([\w-]+)/);
    return { path: h, ch: m ? m[1] : null };
  }
  function route() {
    clearKeys();
    const r = parse();
    renderSidebar(r);
    if (r.ch) renderChapter(r.ch);
    else if (r.path === '/timeline') renderTimeline();
    else if (r.path === '/contrasts') renderContrasts();
    else if (r.path === '/people') renderPeople();
    else if (r.path === '/glossary') renderGlossary();
    else if (r.path === '/quotes') renderQuotes();
    else if (r.path === '/future') renderFuture();
    else if (r.path === '/review') renderReview();
    else if (r.path === '/notes') renderNotes();
    else renderHome();
    closeMenu();
    if (pendingJump) { const j = pendingJump; pendingJump = null; setTimeout(() => jump(j), 120); }
    else window.scrollTo(0, 0);
    document.title = (r.ch && byId[r.ch] ? byId[r.ch].title_zh + '｜' : '') + '雲端封建時代 Technofeudalism｜互動精讀';
  }

  /* ---------- global events ---------- */
  document.addEventListener('click', e => {
    const j = e.target.closest('[data-jump]');
    if (j) { e.preventDefault(); jump(j.dataset.jump); return; }
    const act = e.target.closest('[data-act]');
    if (act) { $$('.narr details').forEach(d => d.open = act.dataset.act === 'openall'); return; }
    const fav = e.target.closest('[data-fav]');
    if (fav) { const f = store.get('favs', {}); f[fav.dataset.fav] = !f[fav.dataset.fav]; store.set('favs', f); fav.textContent = f[fav.dataset.fav] ? '★' : '☆'; fav.classList.toggle('on', !!f[fav.dataset.fav]); toast(f[fav.dataset.fav] ? '已收藏到金句庫' : '已取消收藏'); return; }
    const cp = e.target.closest('[data-copy]');
    if (cp && navigator.clipboard) { navigator.clipboard.writeText(cp.dataset.copy).then(() => toast('已複製：' + cp.dataset.copy)).catch(() => {}); return; }
    if (!e.target.closest('.search-wrap')) $('#searchResults').hidden = true;
  });
  let saveT = {};
  document.addEventListener('input', e => {
    const ta = e.target.closest('textarea[data-note]'); if (!ta) return;
    const k = ta.dataset.note;
    clearTimeout(saveT[k]);
    saveT[k] = setTimeout(() => {
      const n = store.get('notes', {}); if (ta.value.trim()) n[k] = ta.value; else delete n[k]; store.set('notes', n);
      $$(`[data-saved="${k}"]`).forEach(s => { s.classList.add('on'); setTimeout(() => s.classList.remove('on'), 1200); });
    }, 400);
  });
  $('#search').addEventListener('input', e => doSearch(e.target.value));
  $('#search').addEventListener('keydown', e => {
    if (e.key === 'Enter') { const a = $('#searchResults a'); if (a) a.click(), location.hash = a.getAttribute('href'); }
    if (e.key === 'Escape') { e.target.value = ''; $('#searchResults').hidden = true; }
  });
  document.addEventListener('keydown', e => { if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); $('#search').focus(); } });

  function closeMenu() { $('#sidebar').classList.remove('open'); $('#scrim').hidden = true; }
  $('#menuBtn').onclick = () => { const s = $('#sidebar'); s.classList.toggle('open'); $('#scrim').hidden = !s.classList.contains('open'); };
  $('#scrim').onclick = closeMenu;

  // theme
  const savedTheme = store.get('theme', null);
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;
  $('#themeBtn').onclick = () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nxt = cur === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = nxt; store.set('theme', nxt);
  };
  // english toggle
  const applyEn = on => { document.body.classList.toggle('no-en', !on); $('#enToggle').classList.toggle('off', !on); $('#enToggle').textContent = on ? 'EN 原文 ✓' : 'EN 原文'; };
  let enOn = store.get('en', true); applyEn(enOn);
  $('#enToggle').onclick = () => { enOn = !enOn; store.set('en', enOn); applyEn(enOn); };
  // reading progress
  addEventListener('scroll', () => { const d = document.documentElement; const p = d.scrollTop / Math.max(1, d.scrollHeight - d.clientHeight); $('#readProgress').style.width = (p * 100).toFixed(1) + '%'; }, { passive: true });

  addEventListener('hashchange', route);
  route();
})();
