/* ==========================================================================
   发补智能体 · 可交互原型 v4  cascade.js
   两个筛选控件（不引任何第三方库）：
     CASCADE.create(el, {tree, value, onChange})  四级联动 + 模糊搜索
     CASCADE.multi(el, {options, value, onChange}) 多选下拉（一次展开、连续多选）
   ========================================================================== */
(function (w, d) {
  'use strict';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ==================== 四级联动品类选择器 ==================== */
  function flatten(tree, path, out) {
    tree.forEach(function (n) {
      var p = path.concat([n.t]);
      if (!n.c || !n.c.length) { out.push(p); return; }
      if (typeof n.c[0] === 'string') {
        n.c.forEach(function (leaf) { out.push(p.concat([leaf])); });
      } else {
        flatten(n.c, p, out);
      }
    });
    return out;
  }

  function create(el, cfg) {
    cfg = cfg || {};
    var tree = cfg.tree || [];
    var LEVELS = cfg.levels || 3;            // 需要选到第几级（四级目录传 4）
    var val = (cfg.value || []).slice();
    var open = false;
    var query = '';

    el.classList.add('casc');
    el.innerHTML =
      '<div class="casc-box">' +
        '<input class="casc-inp" autocomplete="off" placeholder="' + esc(cfg.placeholder || '请选择或输入关键字搜索') + '">' +
        '<span class="casc-clear" title="清空">×</span>' +
        '<span class="casc-arrow">▾</span>' +
      '</div>' +
      '<div class="casc-pop">' +
        '<div class="casc-cols"></div>' +
        '<div class="casc-flat"></div>' +
        '<div class="casc-ft"><span class="casc-cnt"></span><button type="button" class="cc-done">完成</button></div>' +
      '</div>';

    var box = el.querySelector('.casc-box');
    var inp = el.querySelector('.casc-inp');
    var pop = el.querySelector('.casc-pop');
    var cols = el.querySelector('.casc-cols');
    var flat = el.querySelector('.casc-flat');
    var cnt = el.querySelector('.casc-cnt');

    var ALL = flatten(tree, [], []);

    function levelNodes(level) {
      // 返回第 level 层（0 起）在当前选择前缀下的节点
      var nodes = tree;
      for (var i = 0; i < level; i++) {
        var hit = null;
        for (var j = 0; j < nodes.length; j++) {
          // 该层可能是对象数组（有 .t）或末级字符串数组
          var k = (nodes[j] && typeof nodes[j] === 'object') ? nodes[j].t : nodes[j];
          if (k === val[i]) { hit = nodes[j]; break; }
        }
        if (hit == null) return null;
        if (typeof hit === 'string') return null;      // 已是末级，没有更深层
        if (!hit.c || !hit.c.length) return null;
        nodes = hit.c;
      }
      return nodes;
    }

    function renderCols() {
      var html = '';
      for (var lv = 0; lv < LEVELS; lv++) {
        var nodes = levelNodes(lv);
        html += '<div class="casc-col" data-lv="' + lv + '">';
        if (!nodes || !nodes.length) {
          html += '<div class="casc-empty">' + (lv === 0 ? '' : '请先选择上一级') + '</div>';
        } else {
          nodes.forEach(function (n) {
            var t = n.t || n;
            var isLeafLevel = (lv === LEVELS - 1) || (typeof n === 'string');
            var on = val[lv] === t;
            html += '<div class="casc-opt' + (on ? ' on' : '') + (isLeafLevel ? ' leaf' : '') +
              '" data-lv="' + lv + '" data-t="' + esc(t) + '" title="' + esc(t) + '">' + esc(t) + '</div>';
          });
        }
        html += '</div>';
      }
      cols.innerHTML = html;
    }
    function lvlIsLeaf(n) {
      if (typeof n === 'string') return true;
      if (!n.c || !n.c.length) return true;
      return typeof n.c[0] === 'string';
    }

    function renderFlat() {
      var q = query.trim().toLowerCase();
      var toks = q.split(/\s+/).filter(Boolean);
      var hits = ALL.filter(function (p) {
        var hay = p.join(' ').toLowerCase();
        return toks.every(function (t) { return hay.indexOf(t) >= 0; });
      });
      var html = hits.length
        ? hits.slice(0, 60).map(function (p) {
            return '<div class="casc-hit" data-path="' + esc(p.join('|')) + '">' +
              p.map(function (s, i) {
                return '<span class="hs hs' + i + '">' + esc(s) + '</span>';
              }).join('<span class="sep">›</span>') + '</div>';
          }).join('')
        : '<div class="casc-empty">没有匹配的品类</div>';
      flat.innerHTML = html;
      cols.style.display = 'none';
      flat.style.display = 'block';
      var hitN = hits.length;
      cnt.textContent = hitN ? ('匹配 ' + hitN + ' 条') : '';
    }

    function showCols() {
      flat.style.display = 'none';
      cols.style.display = '';
      cnt.textContent = val.length ? ('已选：' + val.filter(Boolean).join(' › ')) : '未选择（可逐级下钻）';
    }

    function syncInput() {
      inp.value = val.filter(Boolean).join(' › ');
      el.classList.toggle('has-val', !!val.filter(Boolean).length);
    }

    function commit() {
      syncInput();
      if (cfg.onChange) cfg.onChange(val.slice());
    }

    function setPath(path, close) {
      val = path.slice();
      renderCols();
      commit();
      if (close) closePop();
    }

    function openPop() {
      if (open) return;
      open = true;
      el.classList.add('open');
      query = '';
      inp.value = '';
      inp.placeholder = '输入关键字搜索，或逐级选择';
      showCols();
      renderCols();
      setTimeout(function () { inp.focus(); }, 0);
    }
    function closePop() {
      if (!open) return;
      open = false;
      el.classList.remove('open');
      query = '';
      syncInput();
    }

    box.addEventListener('click', function (e) {
      if (e.target.closest('.casc-clear')) {
        e.stopPropagation();
        val = []; commit(); closePop(); renderCols();
        return;
      }
      open ? closePop() : openPop();
    });

    inp.addEventListener('input', function () {
      query = inp.value;
      if (!open) openPop();
      if (query.trim()) renderFlat(); else showCols();
    });
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closePop(); }
      if (e.key === 'Enter') {
        var first = flat.querySelector('.casc-hit');
        if (first && flat.style.display !== 'none') first.click();
      }
    });

    pop.addEventListener('click', function (e) {
      e.stopPropagation();
      var opt = e.target.closest('.casc-opt');
      if (opt) {
        var lv = parseInt(opt.dataset.lv, 10);
        var t = opt.dataset.t;
        var next = val.slice(0, lv);
        next[lv] = t;
        // 判断该节点是否还有下级
        var hasChild = opt.classList.contains('leaf') === false && lv < LEVELS - 1;
        if (hasChild) {
          val = next;
          renderCols();
          commit();
        } else {
          setPath(next, true);
        }
        return;
      }
      var hit = e.target.closest('.casc-hit');
      if (hit) {
        setPath(hit.dataset.path.split('|'), true);
        return;
      }
      if (e.target.closest('.cc-done')) closePop();
    });

    d.addEventListener('click', function (e) {
      if (open && !e.target.closest('.casc')) closePop();
    }, true);

    renderCols();
    syncInput();

    return {
      get: function () { return val.slice(); },
      set: function (path) { val = (path || []).slice(); syncInput(); renderCols(); },
      clear: function () { val = []; commit(); }
    };
  }

  /* ==================== 多选下拉 ==================== */
  function multi(el, cfg) {
    cfg = cfg || {};
    var opts = cfg.options || [];
    var val = (cfg.value || []).slice();
    var open = false;

    el.classList.add('msel');
    el.innerHTML =
      '<div class="msel-box">' +
        '<span class="msel-txt">全部</span>' +
        '<span class="msel-arrow">▾</span>' +
      '</div>' +
      '<div class="msel-pop">' +
        '<div class="msel-hd"><span>可多选（勾选后不关闭）</span>' +
          '<span class="sp"></span>' +
          '<button type="button" data-all="1">全选</button>' +
          '<button type="button" data-none="1">清空</button>' +
        '</div>' +
        '<div class="msel-list"></div>' +
        '<div class="msel-ft"><span class="msel-cnt"></span>' +
          '<button type="button" class="ms-done">完成</button></div>' +
      '</div>';

    var txt = el.querySelector('.msel-txt');
    var list = el.querySelector('.msel-list');
    var cnt = el.querySelector('.msel-cnt');

    function render() {
      list.innerHTML = opts.map(function (o) {
        var on = val.indexOf(o) >= 0;
        return '<div class="msel-opt' + (on ? ' on' : '') + '" data-v="' + esc(o) + '">' +
          '<span class="cb">' + (on ? '✓' : '') + '</span><span>' + esc(o) + '</span></div>';
      }).join('');
      txt.textContent = val.length ? (val.length > 2 ? ('已选 ' + val.length + ' 项') : val.join('、')) : '全部';
      el.classList.toggle('has-val', val.length > 0);
      cnt.textContent = '已选 ' + val.length + ' / ' + opts.length + ' 项';
    }
    function commit() { render(); if (cfg.onChange) cfg.onChange(val.slice()); }

    el.querySelector('.msel-box').addEventListener('click', function () {
      open = !open;
      el.classList.toggle('open', open);
    });
    el.querySelector('.msel-pop').addEventListener('click', function (e) {
      e.stopPropagation();
      var o = e.target.closest('.msel-opt');
      if (o) {
        var v = o.dataset.v;
        var i = val.indexOf(v);
        if (i >= 0) val.splice(i, 1); else val.push(v);
        commit();
        return;
      }
      if (e.target.closest('[data-all]')) { val = opts.slice(); commit(); return; }
      if (e.target.closest('[data-none]')) { val = []; commit(); return; }
      if (e.target.closest('.ms-done')) { open = false; el.classList.remove('open'); }
    });
    d.addEventListener('click', function (e) {
      if (open && !e.target.closest('.msel')) { open = false; el.classList.remove('open'); }
    }, true);

    render();
    return {
      get: function () { return val.slice(); },
      set: function (v) { val = (v || []).slice(); render(); },
      clear: function () { val = []; commit(); }
    };
  }

  w.CASCADE = { create: create, multi: multi, flatten: flatten };
})(window, document);
