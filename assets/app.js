/* ==========================================================================
   发补智能体 · 可交互原型  app.js —— 外壳 / 导航 / 通用交互
   ========================================================================== */
(function (w, d) {
  'use strict';

  /* ---------------- 基础工具 ---------------- */
  function $(s, r) { return (r || d).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function txt(el) { return el ? (el.textContent || '').replace(/\s+/g, ' ').trim() : ''; }

  /* ---------------- 内联 SVG 图标（线性，不用 emoji） ---------------- */
  var ICONS = {
    list: '<path d="M4 6h16M4 11h16M4 16h16"/>',
    doc: '<path d="M14 3v5h5"/><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.3-4.3"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
    pin: '<path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z"/><circle cx="12" cy="10" r="2.6"/>',
    sync: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 4v4h-4"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h11v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h6M8 11h6"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
    check: '<path d="M20 6L9 17l-5-5"/>',
    warn: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    arrowDown: '<path d="M12 5v14M6 13l6 6 6-6"/>',
    arrowUp: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4-2v-4z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function ic(name, size, cls) {
    var p = ICONS[name] || ICONS.info;
    return '<svg class="ic ' + (cls || '') + '" width="' + (size || 15) + '" height="' + (size || 15) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
  }

  /* ---------------- 导航配置 ---------------- */
  var NAV = [
    {
      g: '审评工作台', icon: 'cpu', items: [
        { id: 'tasks', t: '任务列表', href: './01-任务列表.html' },
        { id: 'fb', t: '发补智能体', href: './08-发补智能体.html' }
      ]
    }
  ];
  /* 规则校验 / 发补意见草稿是「发补智能体」下的两个 Tab，归到同一菜单 */
  var NAV_ALIAS = {
    list: 'tasks', tasks: 'tasks', parse: 'tasks',
    rules: 'fb', draft: 'fb', fb: 'fb', hist: 'fb'
  };

  /* ---------------- 顶栏 ---------------- */
  function renderTop(opts) {
    opts = opts || {};
    var crumb = (opts.crumb || []).map(function (c, i, a) {
      return i === a.length - 1 ? '<b>' + esc(c) + '</b>'
        : '<span>' + esc(c) + '</span><span class="sep">/</span>';
    }).join('');
    var html =
      '<button class="rail-btn" id="railBtn" type="button" title="收起 / 展开侧栏">' +
        '<svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">' +
        '<path d="M2.6 4.4h10.8M2.6 8h10.8M2.6 11.6h10.8"/></svg>' +
      '</button>' +
      '<a class="brand" href="./01-任务列表.html">' +
        '<span class="logo">发补</span>发补智能体<em>· 原型 v18</em>' +
      '</a>' +
      '<div class="crumb">' + crumb + '</div>' +
      '<div class="topbar-right">' +
        '<div class="msearch">' + ic('search', 13, 'ic') +
          '<input id="menuSearch" placeholder="搜索菜单 / 功能（⌘K）" autocomplete="off">' +
        '</div>' +
        '<span class="demo-tag">交互原型 · 演示数据</span>' +
        '<div class="me"><span class="av">叶</span><span>叶颖 · 审评员</span></div>' +
      '</div>';
    var el = $('#topbar');
    if (el) el.innerHTML = html;
    var msi = $('#menuSearch');
    if (msi) {
      msi.addEventListener('input', function () { syncSearch(this.value); });
      msi.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { this.value = ''; syncSearch(''); this.blur(); }
      });
    }
    var rb = $('#railBtn');
    if (rb) rb.addEventListener('click', function () { toggleRail(); });
  }

  /* ---------------- 侧栏 ---------------- */
  function renderSide(active) {
    active = NAV_ALIAS[active] || active;
    var html = '<div class="side-hd"><div class="side-search">' + ic('search', 12, 'ic') +
      '<input id="sideSearch" placeholder="搜索菜单…" autocomplete="off"></div></div>' +
      '<nav class="menu" id="menu">';
    NAV.forEach(function (g, gi) {
      html += '<div class="mgroup on" data-g="g' + gi + '">' +
        '<button class="mgroup-h" type="button" title="' + esc(g.g) + '">' + ic(g.icon, 13, 'gi') +
          '<span class="gn">' + esc(g.g) + '</span>' +
          '<span class="gc">' + g.items.length + '</span>' +
          '<span class="chev">▾</span>' +
        '</button><div class="mkids">';
      g.items.forEach(function (it) {
        html += '<a class="mitem' + (it.id === active ? ' on' : '') + '" data-k="' + it.id + '" href="' + it.href + '">' +
          '<span>' + esc(it.t) + '</span>' + (it.note ? '<span class="mtag">' + esc(it.note) + '</span>' : '') + '</a>';
      });
      html += '</div></div>';
    });
    var navCount = NAV.reduce(function (n, g) { return n + g.items.length; }, 0);
    html += '</nav>' +
      '<div class="side-ft"><span class="sf">共 <b>' + navCount + '</b> 个功能页 · 演示数据仅存本机</span>' +
      '<button class="btn sm gh" id="railBtn2" type="button">收起</button></div>';
    var el = $('#side');
    if (el) el.innerHTML = html;

    var ss = $('#sideSearch');
    if (ss) {
      ss.addEventListener('input', function () { syncSearch(this.value); });
      ss.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { this.value = ''; syncSearch(''); this.blur(); }
      });
    }
    $$('#side .mgroup-h').forEach(function (b) {
      b.addEventListener('click', function () {
        var sh = $('.shell');
        if (sh && sh.classList.contains('rail')) { toggleRail(false); return; }
        b.parentNode.classList.toggle('closed');
      });
    });
    var rb2 = $('#railBtn2');
    if (rb2) rb2.addEventListener('click', function () { toggleRail(); });
    applyRail();
  }

  function syncSearch(v) {
    var a = $('#menuSearch'), b = $('#sideSearch');
    if (a && a.value !== v) a.value = v;
    if (b && b.value !== v) b.value = v;
    filterMenu(v);
  }

  function filterMenu(kw) {
    kw = (kw || '').trim().toLowerCase();
    $$('#side .mgroup').forEach(function (g) {
      var hit = 0;
      $$('.mitem', g).forEach(function (a) {
        var m = !kw || txt(a).toLowerCase().indexOf(kw) >= 0;
        a.style.display = m ? '' : 'none';
        if (m) hit++;
      });
      g.style.display = hit ? '' : 'none';
      if (kw && hit) g.classList.remove('closed');
    });
  }

  function toggleRail(force) {
    var sh = $('.shell');
    if (!sh) return;
    var on = typeof force === 'boolean' ? force : !sh.classList.contains('rail');
    sh.classList.toggle('rail', on);
    try { localStorage.setItem('fb_v9_rail', on ? '1' : '0'); } catch (e) {}
    var b = $('#railBtn2');
    if (b) b.textContent = on ? '展开' : '收起';
  }
  function applyRail() {
    var on = false;
    try { on = localStorage.getItem('fb_v9_rail') === '1'; } catch (e) {}
    toggleRail(on);
  }

  /* ---------------- 页内浮动面板（可拖动 / 可缩放 / 可分屏） ----------------
     用户要求「一键弹出」是区域浮出，而不是新开网页：
     把目标 DOM 移入浮窗，关闭时原位放回，页面布局用占位块保持。 */
  var FLOATS = [];
  /* 上下分屏：当前浮窗排最上，其余浮窗依次往下，全宽等分。
     只有一个浮窗时，在「上半屏 / 下半屏」之间来回切换。 */
  function verticalSplit(me) {
    var GAP = 8, TOP0 = 64;
    var others = FLOATS.map(function (f) { return f.panel; }).filter(function (p) { return p !== me; });
    var order = [me].concat(others);
    var n = order.length;
    var availW = Math.max(320, window.innerWidth - GAP * 2);

    if (n === 1) {
      var toTop = me.dataset.vpos !== 'top';
      var h1 = Math.max(180, Math.round((window.innerHeight - TOP0 - GAP * 3) / 2));
      me.dataset.vpos = toTop ? 'top' : 'bottom';
      me.style.minWidth = '0'; me.style.minHeight = '0';
      me.style.left = GAP + 'px'; me.style.right = 'auto'; me.style.bottom = 'auto';
      me.style.width = availW + 'px';
      me.style.height = h1 + 'px';
      me.style.top = (toTop ? TOP0 : (TOP0 + h1 + GAP)) + 'px';
      me.style.zIndex = ++zTop;
      return;
    }

    var h = Math.floor((window.innerHeight - TOP0 - GAP * (n + 1)) / n);
    if (h < 180) h = 180;
    order.forEach(function (p, i) {
      p.style.minWidth = '0'; p.style.minHeight = '0';
      p.style.left = GAP + 'px'; p.style.right = 'auto'; p.style.bottom = 'auto';
      p.style.width = availW + 'px';
      p.style.height = h + 'px';
      p.style.top = (TOP0 + GAP + i * (h + GAP)) + 'px';
      p.style.zIndex = ++zTop;
    });
  }

  function openFloat(opts) {
    opts = opts || {};
    var el = opts.el || null;
    var src = opts.src || '';
    if (!el && !src) return null;
    var key = el || src;
    var exist = FLOATS.filter(function (f) { return f.key === key; })[0];
    if (exist) { exist.panel.style.zIndex = ++zTop; exist.panel.classList.add('flash'); setTimeout(function(){ exist.panel.classList.remove('flash'); }, 600); return exist.panel; }

    var ph = null;
    if (el) {
      ph = d.createElement('div');
      ph.className = 'float-ph';
      ph.innerHTML = '<span>' + esc(opts.title || '模块') + ' 已弹出</span>' +
        '<button type="button" class="btn xs">收回</button>';
      el.parentNode.insertBefore(ph, el);
    }

    var panel = d.createElement('div');
    panel.className = 'floatpanel';
    var w = opts.width || 760, h = opts.height || 560;
    var left = Math.max(12, Math.round((window.innerWidth - w) / 2) + (FLOATS.length % 3) * 24);
    var top = 88 + (FLOATS.length % 3) * 20;
    panel.style.width = w + 'px';
    panel.style.height = h + 'px';
    panel.style.left = (opts.left != null ? opts.left : Math.min(left, window.innerWidth - w - 16)) + 'px';
    panel.style.top = (opts.top != null ? opts.top : top) + 'px';
    panel.style.zIndex = ++zTop;
    panel.innerHTML =
      '<div class="fp-hd" data-drag="1">' +
        '<span class="fp-tt">' + esc(opts.title || '模块') + '</span>' +
        '<span class="fp-sub">' + esc(opts.sub || '') + '</span>' +
        '<span class="sp"></span>' +
        '<button type="button" class="fp-btn" data-fp="left" title="贴左半屏">分屏左</button>' +
        '<button type="button" class="fp-btn" data-fp="right" title="贴右半屏">分屏右</button>' +
        '<button type="button" class="fp-btn" data-fp="vsplit" title="上下分屏：多个浮窗按上 / 下等分排列，单个浮窗在上半屏 / 下半屏之间切换">上下分屏</button>' +
        '<button type="button" class="fp-btn" data-fp="center" title="居中">居中</button>' +
        '<button type="button" class="fp-btn x" data-fp="close" title="收回模块">✕</button>' +
      '</div>' +
      '<div class="fp-bd"></div>';
    d.body.appendChild(panel);
    var body = panel.querySelector('.fp-bd');
    if (el) {
      body.appendChild(el);
      el.classList.add('in-float');
    } else {
      var f = d.createElement('iframe');
      f.className = 'fp-frame';
      f.src = src;
      body.appendChild(f);
    }

    var rec = { key: key, el: el, panel: panel, ph: ph };
    FLOATS.push(rec);

    function close() {
      if (el) {
        el.classList.remove('in-float');
        if (ph.parentNode) ph.parentNode.insertBefore(el, ph);
      }
      if (ph && ph.parentNode) ph.parentNode.removeChild(ph);
      if (panel.parentNode) panel.parentNode.removeChild(panel);
      FLOATS = FLOATS.filter(function (f) { return f !== rec; });
      if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) {} }
    }
    rec.close = close;
    if (ph) ph.querySelector('button').onclick = close;

    panel.addEventListener('click', function (e) {
      var b = e.target.closest('[data-fp]');
      if (!b) return;
      var act = b.dataset.fp;
      if (act === 'close') { close(); return; }
      if (act === 'left') {
        panel.style.left = '10px'; panel.style.top = '74px';
        panel.style.width = Math.round(window.innerWidth / 2 - 16) + 'px';
        panel.style.height = Math.round(window.innerHeight - 86) + 'px';
      } else if (act === 'right') {
        panel.style.left = Math.round(window.innerWidth / 2 + 6) + 'px'; panel.style.top = '74px';
        panel.style.width = Math.round(window.innerWidth / 2 - 16) + 'px';
        panel.style.height = Math.round(window.innerHeight - 86) + 'px';
      } else if (act === 'vsplit') {
        verticalSplit(panel);
      } else if (act === 'center') {
        panel.style.left = Math.round((window.innerWidth - panel.offsetWidth) / 2) + 'px';
        panel.style.top = Math.round((window.innerHeight - panel.offsetHeight) / 2) + 'px';
      }
      panel.style.zIndex = ++zTop;
    });

    var hd = panel.querySelector('.fp-hd');
    hd.addEventListener('pointerdown', function (e) {
      if (e.target.closest('button')) return;
      var r = panel.getBoundingClientRect();
      panel.style.left = r.left + 'px'; panel.style.top = r.top + 'px';
      panel.style.right = 'auto'; panel.style.bottom = 'auto';
      var sx = e.clientX, sy = e.clientY, ox = r.left, oy = r.top;
      panel.style.zIndex = ++zTop;
      hd.setPointerCapture(e.pointerId);
      function mv(ev) {
        var nx = Math.min(Math.max(-panel.offsetWidth + 80, ox + ev.clientX - sx), window.innerWidth - 60);
        var ny = Math.min(Math.max(0, oy + ev.clientY - sy), window.innerHeight - 44);
        panel.style.left = nx + 'px'; panel.style.top = ny + 'px';
      }
      function up() {
        hd.removeEventListener('pointermove', mv);
        hd.removeEventListener('pointerup', up);
      }
      hd.addEventListener('pointermove', mv);
      hd.addEventListener('pointerup', up);
    });
    return panel;
  }
  var zTop = 900;

  /* ---------------- toast（带「撤销」的版本） ----------------
     用于「删除整个模块」这类即时生效、但可能误操作的动作：
     立即执行 + 给 8 秒撤销窗口，比弹确认框更顺手（用户明确要求"自动删除"）。 */
  function toastUndo(msg, onUndo, ms) {
    var box = $('#toastBox');
    if (!box) { box = d.createElement('div'); box.id = 'toastBox'; d.body.appendChild(box); }
    var t = d.createElement('div');
    t.className = 'toast undoable';
    t.innerHTML = ic('check', 15) + '<span>' + esc(msg) + '</span>' +
      '<button class="tundo" type="button">撤销</button>';
    box.appendChild(t);
    var done = false;
    function kill() {
      t.style.transition = 'opacity .3s'; t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }
    var btn = t.querySelector('.tundo');
    if (btn) btn.onclick = function () { if (done) return; done = true; kill(); if (onUndo) onUndo(); };
    setTimeout(function () { if (!done) kill(); }, ms || 8000);
  }

  /* ---------------- toast ---------------- */
  function toast(msg, type, ms) {
    var box = $('#toastBox');
    if (!box) { box = d.createElement('div'); box.id = 'toastBox'; d.body.appendChild(box); }
    var t = d.createElement('div');
    t.className = 'toast ' + (type || '');
    var icn = type === 'err' ? 'warn' : type === 'warn' ? 'warn' : type === 'ok' ? 'check' : 'info';
    t.innerHTML = ic(icn, 15) + '<span>' + esc(msg) + '</span>';
    box.appendChild(t);
    setTimeout(function () {
      t.style.transition = 'opacity .3s'; t.style.opacity = '0';
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 320);
    }, ms || 2600);
  }

  /* ---------------- 通用弹窗 ---------------- */
  function openModal(o) {
    closeModal();
    var mask = d.createElement('div');
    mask.className = 'mask' + (o.top ? ' top' : '');
    mask.id = 'mMask';
    mask.innerHTML =
      '<div class="modal ' + (o.width || '') + '">' +
        '<div class="modal-hd"><h3>' + esc(o.title || '') + '</h3>' +
          '<button class="x" data-close="1">' + ic('x', 15) + '</button></div>' +
        '<div class="modal-bd' + (o.flush ? ' flush' : '') + '">' + (o.body || '') + '</div>' +
        (o.foot ? '<div class="modal-ft">' + o.foot + '</div>' : '') +
      '</div>';
    d.body.appendChild(mask);
    d.body.style.overflow = 'hidden';
    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.closest('[data-close]')) closeModal();
    });
    if (typeof o.after === 'function') o.after(mask);
    return mask;
  }
  function closeModal() {
    var m = $('#mMask');
    if (m) { m.parentNode.removeChild(m); d.body.style.overflow = ''; }
  }

  /* ---------------- 抽屉 ---------------- */
  function openDrawer(o) {
    closeDrawer();
    var mk = d.createElement('div'); mk.className = 'drawer-mask'; mk.id = 'dMask';
    var dr = d.createElement('div'); dr.className = 'drawer'; dr.id = 'dBox';
    dr.innerHTML =
      '<div class="drawer-hd"><h3>' + esc(o.title || '') + '</h3>' +
        '<button class="x" data-close="1">' + ic('x', 15) + '</button></div>' +
      '<div class="drawer-bd">' + (o.body || '') + '</div>' +
      (o.foot ? '<div class="drawer-ft">' + o.foot + '</div>' : '');
    d.body.appendChild(mk); d.body.appendChild(dr);
    mk.addEventListener('click', closeDrawer);
    dr.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeDrawer(); });
    if (typeof o.after === 'function') o.after(dr);
    return dr;
  }
  function closeDrawer() {
    ['dMask', 'dBox'].forEach(function (id) { var e = d.getElementById(id); if (e) e.parentNode.removeChild(e); });
  }

  /* ---------------- 二次确认 ---------------- */
  function confirmDialog(o, onOk) {
    openModal({
      title: o.title || '请确认',
      width: 'w520',
      body: '<div class="infobar i-' + (o.tone || 'amber') + '">' + ic('warn', 16, 'ib-ic') +
        '<div>' + o.body + '</div></div>',
      foot: '<span class="sp"></span>' +
        '<button class="btn" data-close="1">取消</button>' +
        '<button class="btn ' + (o.tone === 'amber' ? 'primary' : 'danger') + '" id="cfmOk">' + esc(o.okText || '确定') + '</button>',
      after: function (m) {
        var b = $('#cfmOk', m);
        if (b) b.addEventListener('click', function () { closeModal(); if (onOk) onOk(); });
      }
    });
  }

  /* ---------------- 全局键盘 ---------------- */
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeModal(); closeDrawer(); }
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      var msi = $('#menuSearch'); if (msi) { msi.focus(); msi.select(); }
    }
  });

  /* ---------------- 分页渲染 ---------------- */
  function renderPager(el, total, page, size, onGo) {
    if (!el) return;
    var pages = Math.max(1, Math.ceil(total / size));
    var h = '<span>共 ' + total + ' 条</span><span class="sp"></span>';
    h += '<button data-p="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>上一页</button>';
    var s = Math.max(1, page - 2), e = Math.min(pages, s + 4);
    s = Math.max(1, e - 4);
    for (var i = s; i <= e; i++) h += '<button data-p="' + i + '"' + (i === page ? ' class="on"' : '') + '>' + i + '</button>';
    h += '<button data-p="' + (page + 1) + '"' + (page >= pages ? ' disabled' : '') + '>下一页</button>';
    el.innerHTML = h;
    el.onclick = function (ev) {
      var b = ev.target.closest('button[data-p]');
      if (!b || b.disabled) return;
      var p = parseInt(b.dataset.p, 10);
      if (p >= 1 && p <= pages) onGo(p);
    };
  }

  /* ---------------- 导出 ---------------- */
  w.APP = {
    $: $, $$: $$, esc: esc, txt: txt, ic: ic,
    NAV: NAV, renderTop: renderTop, renderSide: renderSide, toggleRail: toggleRail, openFloat: openFloat,
    toast: toast, toastUndo: toastUndo, openModal: openModal, closeModal: closeModal,
    openDrawer: openDrawer, closeDrawer: closeDrawer,
    confirmDialog: confirmDialog, renderPager: renderPager
  };
})(window, document);
