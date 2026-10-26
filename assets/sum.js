/* ==========================================================================
   发补智能体 · 可交互原型 v3  sum.js
   历史发补意见「AI 总结分析」的唯一计算与渲染口径。
   ⚠️ 草稿页内嵌总结区（02）与独立总结页（03）必须调用同一套函数，
      否则两处结论、数字、采纳文案会不一致。
   ========================================================================== */
(function (w) {
  'use strict';

  function esc(s) {
    if (w.APP && w.APP.esc) return w.APP.esc(s);
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function ic(n, s) { return (w.APP && w.APP.ic) ? w.APP.ic(n, s) : ''; }

  /* ch 文件名称 → 当前申报材料里该 ch 文件的原文（新窗口打开，避免打断 iframe 内的分析） */
  function chKeyOf(ch) {
    var m = /ch\s*([0-9]+(?:\.[0-9]+)*)/i.exec(String(ch || ''));
    return m ? 'ch' + m[1] : String(ch || '').trim();
  }
  function chDocUrl(ch) {
    /* 不在闭包里取 S（渲染时机早于 S 初始化），直接用地址栏里的案卷号 */
    var m = /[?&]case=([^&]*)/.exec(w.location.search);
    var no = m ? decodeURIComponent(m[1]) : (w.__HIST_CASE || '');
    return './09-申报材料解析.html?case=' + encodeURIComponent(no) +
      '&stage=parse&file=' + encodeURIComponent(chKeyOf(ch));
  }

  /* ---------------- 问题点字典（码值化，跨案卷可统计） ----------------
     ch     写入发补意见草稿时的章节引用
     script 参照话术：可直接落进发补意见的标准表述（统一尺度用）
     watch  出现少、但与本产品直接相关 → 归入「差异但需关注」
     onlyFor 仅适用于特定注册类型（如「变更前后规格型号对应关系」只对变更注册有意义）
  -------------------------------------------------------------------- */
  var POINTS = [
    {
      id: 'PT1', t: '预期用途未明确适用人群与使用环境', ch: 'ch1.1 产品说明书', watch: false,
      script: '请明确本产品的预期用途、适用人群及使用环境，并说明是否可由非专业人员操作。'
    },
    {
      id: 'PT2', t: '说明书与产品技术要求的规格型号不一致', ch: 'ch1.1 产品说明书', watch: false,
      script: '请核实并统一产品说明书、产品技术要求及注册申请表中的规格型号表述，确保三者完全一致。'
    },
    {
      id: 'PT3', t: '稳定性 / 货架有效期验证资料不完整或表述矛盾', ch: 'ch6.3 稳定性研究', watch: false,
      script: '请补充货架有效期验证资料，明确加速老化（或实时老化）试验条件、推算方法及老化后应满足的性能指标，并统一说明书与产品技术要求中的有效期表述。'
    },
    {
      id: 'PT4', t: '微粒污染等检验项目未给出检验方法与限值', ch: 'ch6.1 技术要求', watch: false,
      script: '请补充“微粒污染”检验项目的检验方法来源（引用标准条款）及可接受限值。'
    },
    {
      id: 'PT5', t: '产品名称在申报资料间不一致', ch: 'ch3.2 非临床资料', watch: false,
      script: '请确认本次申报的产品名称与申报范围，并统一注册申请表、产品说明书、产品技术要求及非临床资料中的产品名称表述。'
    },
    {
      id: 'PT6', t: '针尖锋利度与针座连接牢固度要求', ch: 'ch6.1 技术要求', watch: true,
      script: '本产品含带针型规格，请补充静脉输液针针尖锋利度、针座连接牢固度的性能指标及检验方法。'
    },
    {
      id: 'PT7', t: '环氧乙烷残留量限值及依据', ch: 'ch6.1 技术要求', watch: true,
      script: '请补充环氧乙烷灭菌残留量的限值及其依据（如 GB/T 16886.7），并提供残留量验证资料。'
    },
    {
      id: 'PT8', t: '输液流速准确性验证', ch: 'ch6.1 技术要求', watch: true,
      script: '请补充输液流速准确性的验证资料及可接受标准。'
    },
    {
      id: 'PT9', t: '标签样稿缺生产日期 / 失效日期标注', ch: 'ch1.3 标签样稿', watch: false,
      script: '请在标签样稿中补充生产日期、失效日期（或有效期）的标注位置与形式，符合《医疗器械说明书和标签管理规定》第十条的要求。'
    },
    {
      id: 'PT10', t: '变更前后规格型号对应关系不清', ch: 'ch1.1 产品说明书', watch: false, onlyFor: ['变更注册'],
      script: '请补充本次变更前后的规格型号对应关系说明，并同步修订产品说明书、产品技术要求等相关内容。'
    }
  ];

  var WATCHNOTE = {
    PT6: '本产品本次申报含带针型规格，与本产品直接相关，建议一并核查。',
    PT7: '本产品采用环氧乙烷灭菌，建议核对残留量限值依据（GB/T 16886.7）。',
    PT8: '属性能指标类问题，可暂不作为本次主要发补点。'
  };

  /* 草稿来源锚点 → 问题点 ID（用于判断"当前草稿已覆盖哪些审评点"） */
  var RULE2PT = { A1: 'PT1', A2: 'PT2', A3: 'PT3', A4: 'PT4', A6: 'PT9' };
  var CMP2PT = { B1: 'PT5', B2: 'PT2', B4: 'PT3' };

  function pointById(id) {
    for (var i = 0; i < POINTS.length; i++) if (POINTS[i].id === id) return POINTS[i];
    return null;
  }
  function pointText(id) { var p = pointById(id); return p ? p.t : ''; }
  function pointsText(x) { return (x.points || []).map(pointText).join(' '); }
  function applicable(p, cur) {
    if (!p || !p.onlyFor) return true;
    if (!cur || !cur.regType) return true;
    return p.onlyFor.indexOf(cur.regType) >= 0;
  }

  /** 由草稿问题反推「已覆盖的问题点」 */
  function coveredFromDraft(problems) {
    var out = [];
    (problems || []).forEach(function (p) {
      String(p.from || '').split('/').forEach(function (raw) {
        var k = raw.trim();
        if (!k) return;
        var pt = k.indexOf('PT') === 0 ? k : (RULE2PT[k] || CMP2PT[k] || null);
        if (pt && out.indexOf(pt) < 0) out.push(pt);
      });
    });
    return out;
  }

  /* ---------------- 三组预设范围（从当前案卷属性推导） ---------------- */
  function scopePresets(cur) {
    if (!cur) return [];
    return [
      {
        key: 'ent', label: '同企业', sub: cur.ent || '—',
        desc: '该企业在系统内的全部历史案卷',
        match: function (x) { return x.ent === cur.ent; }
      },
      {
        key: 'product', label: '同产品名称完全一致', sub: cur.product || '—',
        desc: '产品名称与当前案卷完全一致的历史案卷',
        match: function (x) { return x.product === cur.product; }
      },
      {
        key: 'cat', label: '同分类目录 · 相似产品',
        sub: (cur.devCat || []).slice(0, 3).filter(Boolean).join(' › ') || '—',
        desc: '同一分类目录（前三级）下的全部历史案卷，范围最宽',
        match: function (x) {
          var a = (cur.devCat || []).slice(0, 3).join('|');
          var b = (x.devCat || []).slice(0, 3).join('|');
          return a.replace(/\|/g, '') !== '' && a === b;
        }
      }
    ];
  }

  /* ---------------- 单条 AI 结论 ---------------- */
  function buildConclusion(pid, n, tot, srcList) {
    var p = pointById(pid);
    if (!p) return null;
    var pct = tot ? Math.round(n / tot * 100) : 0;
    var reason = (n >= 2)
      ? ('在所选范围的 ' + tot + ' 份案卷中，有 ' + n + ' 份（' + pct + '%）因该问题被发补，属于同类产品的共性、可预期问题。')
      : ('在所选范围的 ' + tot + ' 份案卷中，仅 ' + n + ' 份（' + pct + '%）提及该问题，虽非高频，但与本产品直接相关。');
    return {
      id: p.id, t: p.t, ch: p.ch, script: p.script, watch: !!p.watch,
      n: n, tot: tot, pct: pct,
      ev: (srcList || []).map(function (x) { return x.acceptNo; }),
      evList: (srcList || []).map(function (x) {
        return { acceptNo: x.acceptNo, product: x.product, ent: x.ent, date: x.date };
      }),
      conclusion: reason + '建议本次一并核查，避免遗漏审评点。'
    };
  }

  /** 对一批案卷算出「高频 / 差异 / 易遗漏」三个模块 */
  function conclusionsFor(list, cur, coveredIds) {
    list = list || [];
    coveredIds = coveredIds || [];
    var map = {}, by = {};
    list.forEach(function (x) {
      (x.points || []).forEach(function (pid) {
        map[pid] = (map[pid] || 0) + 1;
        (by[pid] = by[pid] || []).push(x);
      });
    });

    var common = [], diff = [], missing = [];
    POINTS.forEach(function (p) {
      if (!applicable(p, cur)) return;
      var n = map[p.id] || 0;
      if (!n) return;
      var c = buildConclusion(p.id, n, list.length, by[p.id]);
      c.covered = coveredIds.indexOf(p.id) >= 0;
      if (n >= 2) common.push(c);
      else if (p.watch) diff.push(c);
    });
    common.sort(function (a, b) { return b.n - a.n || (a.t < b.t ? -1 : 1); });
    diff.sort(function (a, b) { return a.t < b.t ? -1 : 1; });

    /* 易遗漏审评点：范围内出现过、但当前草稿尚未覆盖 */
    var missIds = Object.keys(map).filter(function (id) {
      if (coveredIds.indexOf(id) >= 0) return false;
      return applicable(pointById(id), cur);
    });
    missIds.sort(function (a, b) { return (map[b] - map[a]) || (pointText(a) < pointText(b) ? -1 : 1); });
    missIds.forEach(function (id) { missing.push(buildConclusion(id, map[id], list.length, by[id])); });

    return {
      common: common, diff: diff, missing: missing,
      tot: list.length,
      cnt: list.reduce(function (s, x) { return s + (x.points || []).length; }, 0),
      ids: list.map(function (x) { return x.acceptNo; })
    };
  }

  /** 生成一条可直接写入草稿的载荷 */
  function adoptPayload(pid, n, tot, scopeLabel) {
    var p = pointById(pid);
    if (!p) return null;
    var c = buildConclusion(pid, n, tot, []);
    return {
      chapter: p.ch || 'ch1.1 产品说明书',
      sub: '（一）' + p.t,
      title: p.t,
      body: (p.script || p.t) + '\n\n—— 结论文据（' + (scopeLabel || 'AI 总结分析') + '）：' + c.conclusion
    };
  }

  /* ---------------- 渲染：一条结论 ---------------- */
  var CAP = 5;
  function concHtml(c, opts) {
    opts = opts || {};
    var extra = opts.extra || '';
    var ad = opts.adoptedMap && opts.adoptedMap[c.id];
    var h = '<div class="conc' + (opts.hidden ? ' more' : '') + (ad ? ' adopted' : '') +
      '" data-conc="' + c.id + '" data-focus="' + c.id + '">' +
      '<div class="conc-h">' +
        '<span class="frac">' + c.n + '/' + c.tot + '</span>' +
        '<span class="ct">' + esc(c.t) + '</span>' +
        '<a class="tag t-gray chlink" href="' + chDocUrl(c.ch) + '" target="_blank" rel="noopener"' +
          ' title="打开本申报材料中 ' + esc(c.ch) + ' 的原文">' + esc(c.ch) + '</a>' +
        (extra || '') +
        (ad ? '<span class="tag t-green">人工已认可</span>' : '') +
        (ad
          ? '<a class="btn xs" data-goto="' + esc(ad.id) + '">已采纳 ' + esc(ad.no) + ' ›</a>'
          : (opts.canAdopt === false ? '' :
            '<button class="btn xs primary" data-aiadopt="' + c.id + '" data-n="' + c.n + '" data-tot="' + c.tot + '"' +
            (opts.scope ? ' data-scope="' + esc(opts.scope) + '"' : '') + '>一键采纳</button>')) +
      '</div>' +
      '<div class="conc-b">' +
        '<div class="cf"><span class="cl">AI 结论</span><div class="cv ai">' + esc(c.conclusion) + '</div></div>' +
        (c.script ? '<div class="cf"><span class="cl">参照话术（可直接用于发补意见）</span><div class="cv script">' + esc(c.script) + '</div></div>' : '') +
        '<div class="cf"><span class="cl">来源案卷</span><div class="evchips">' +
          c.evList.map(function (e) {
            return '<span class="evchip" data-detail="' + esc(e.acceptNo) + '">' + esc(e.acceptNo) + '</span>';
          }).join('') +
        '</div></div>' +
      '</div>' +
      '<div class="conc-f"><div class="freqbar' + (c.n < 2 ? ' warn' : '') + '">' +
        '<i style="width:' + Math.max(4, c.pct) + '%"></i></div>' +
        '<span class="pct">占比 ' + c.pct + '%</span></div>' +
      '</div>';
    return h;
  }

  function moduleHtml(title, iconName, cntText, items, opts) {
    opts = opts || {};
    var h = '<div class="sumblk"><div class="sumblk-h">' + ic(iconName, 13) + ' ' + esc(title) +
      '<span class="cnt">' + esc(cntText) + '</span></div><div class="sumblk-b">';
    if (!items.length) {
      h += '<div class="sumblk-empty">' + esc(opts.empty || '当前范围内无此类问题') + '</div>';
    } else {
      items.forEach(function (c, i) {
        h += concHtml(c, {
          hidden: !opts.expandAll && i >= CAP,
          scope: opts.scope,
          canAdopt: opts.canAdopt,
          selfCheck: opts.selfCheck,
          adoptedMap: opts.adoptedMap,
          extra: opts.extra
        });
      });
      if (!opts.expandAll && items.length > CAP) {
        h += '<button class="btn xs" data-more="1" style="margin-top:8px">展开全部 ' + items.length + ' 项</button>';
      }
    }
    h += '</div></div>';
    return h;
  }

  function scaleNote(st) {
    return '<div class="scalenote">' + ic('info', 13) +
      '<div><b>统一尺度提示：</b>本范围共 <b>' + st.tot + '</b> 份案卷、<b>' + st.cnt +
      '</b> 条历史发补意见；上述结论按问题点归并统计，用于统一同类产品的发补尺度、避免同类问题各处尺度不一。' +
      '请结合本产品实际情况判断，<b>不宜直接照搬</b>。历史发补意见仅用于审评老师自查、查漏补缺，' +
      '<b>不构成规则，不作为强制发补依据</b>。</div></div>';
  }

  /** 渲染一个范围的结果卡 */
  function renderScopeCard(sc, opts) {
    opts = opts || {};
    var st = sc.stat;
    var h = '<div class="scopecard' + (opts.collapsed ? ' collapsed' : '') + '" data-scope="' + esc(sc.key) + '">';
    h += '<div class="scopecard-h">' +
      '<span class="sn">' + esc(sc.badge || '·') + '</span>' +
      '<div class="st"><b>' + esc(sc.label) + '</b><span class="ss">' + esc(sc.sub) + '</span></div>' +
      '<span class="tag t-blue">命中 ' + st.tot + ' 份案卷 · ' + st.cnt + ' 条发补意见</span>' +
      '<div class="right">' +
        (opts.batchAdopt
          ? '<button class="btn xs primary" data-batch-adopt="' + esc(sc.key) + '" title="把本范围的全部结论一次写入草稿">采纳本范围全部结论</button>'
          : '') +
        '<button class="btn xs" data-scope-toggle="1">' + (opts.collapsed ? '展开' : '收起') + '</button>' +
      '</div>' +
      '</div>';
    if (opts.collapsed) { h += '</div>'; return h; }
    h += '<div class="scopecard-b">';
    var mOpts = {
      scope: sc.key, expandAll: opts.expandAll, canAdopt: opts.canAdopt,
      selfCheck: opts.selfCheck, adoptedMap: opts.adoptedMap
    };
    h += moduleHtml('高频共性问题', 'chart', st.common.length + ' 项 · 出现 ≥ 2 份案卷',
      st.common, merge(mOpts, { empty: '当前范围内无重复出现的问题点' }));
    h += moduleHtml('差异需关注问题', 'info', st.diff.length + ' 项 · 仅 1 份案卷出现',
      st.diff, merge(mOpts, { expandAll: true, empty: '当前范围内无个别低频但需关注的问题点' }));
    h += moduleHtml('易遗漏审评点提醒', 'warn', st.missing.length + ' 项 · 范围出现过、当前草稿未覆盖',
      st.missing, merge(mOpts, {
        expandAll: true,
        empty: '当前草稿已覆盖该范围内出现过的全部问题点',
        extra: '<span class="tag t-amber">未见对应表述</span>'
      }));
    h += scaleNote(st);
    h += '</div></div>';
    return h;
  }
  function merge(a, b) {
    var o = {}, k;
    for (k in a) if (a.hasOwnProperty(k)) o[k] = a[k];
    for (k in b) if (b.hasOwnProperty(k)) o[k] = b[k];
    return o;
  }

  /* ---------------- 全宽紧凑「行式」渲染（历史发补页顶部 AI 分析用） ----------------

     一屏要看两条维度 × 三个模块，用卡片式会太长，改为：
     一行一条结论（占比 / 标题 / 章节 / 结论摘要 / 依据话术 / 一键采纳），
     需要看全文时点「依据/话术」就地展开。
  -------------------------------------------------------------------------- */
  function rowHtml(c, opts) {
    opts = opts || {};
    var ad = opts.adoptedMap && opts.adoptedMap[c.id];
    var h = '<div class="crow' + (ad ? ' adopted' : '') + (opts.open ? ' open' : '') +
      '" data-conc="' + c.id + '" data-focus="' + c.id + '">' +
      '<div class="crow-h">' +
        '<span class="frac">' + c.n + '/' + c.tot + '</span>' +
        '<span class="ct" title="' + esc(c.t) + '">' + esc(c.t) + '</span>' +
        '<a class="tag t-gray chlink" href="' + chDocUrl(c.ch) + '" target="_blank" rel="noopener"' +
          ' title="打开本申报材料中 ' + esc(c.ch) + ' 的原文">' + esc(c.ch) + '</a>' +
        (opts.showCoverage
          ? (c.covered ? '<span class="tag t-green">草稿已覆盖</span>'
                       : '<span class="tag t-amber">草稿未覆盖</span>')
          : '') +
        (ad ? '<span class="tag t-green">人工已认可</span>' : '') +
        '<span class="csum">' + esc(c.conclusion) + '</span>' +
        '<button class="btn xs crow-tg" type="button" data-crow="1">依据/话术</button>' +
        (ad
          ? '<a class="btn xs" data-goto="' + esc(ad.id) + '">已采纳 ' + esc(ad.no) + ' ›</a>'
          : (opts.canAdopt === false ? '' :
            '<button class="btn xs primary" type="button" data-aiadopt="' + c.id + '" data-n="' + c.n +
            '" data-tot="' + c.tot + '"' + (opts.scope ? ' data-scope="' + esc(opts.scope) + '"' : '') + '>一键采纳</button>')) +
      '</div>' +
      '<div class="crow-b">' +
        '<div class="cbrow"><span class="cl">AI 结论</span><div class="cv ai">' + esc(c.conclusion) + '</div></div>' +
        (c.script ? '<div class="cbrow"><span class="cl">参照话术</span><div class="cv script">' + esc(c.script) + '</div></div>' : '') +
        '<div class="cbrow"><span class="cl">来源案卷</span><div class="evchips">' +
          c.evList.map(function (e) {
            return '<span class="evchip" data-detail="' + esc(e.acceptNo) + '">' + esc(e.acceptNo) + '</span>';
          }).join('') +
        '</div></div>' +
      '</div></div>';
    return h;
  }

  function rowsModule(title, iconName, cntText, items, opts) {
    opts = opts || {};
    var h = '<div class="rblk"><div class="rblk-h">' + ic(iconName, 14) + ' ' + esc(title) +
      '<span class="cnt">' + esc(cntText) + '</span></div>';
    if (opts.note) h += '<div class="rblk-note">' + esc(opts.note) + '</div>';
    if (!items.length) {
      h += '<div class="rblk-empty">' + esc(opts.empty || '当前范围内无此类问题') + '</div>';
    } else {
      items.forEach(function (c, i) { h += rowHtml(c, merge(opts, { open: !!opts.openFirst && i === 0 })); });
    }
    h += '</div>';
    return h;
  }

  /** 全宽紧凑版范围块（历史发补页顶部） */
  function renderScopeRows(sc, opts) {
    opts = opts || {};
    var st = sc.stat;
    var h = '<div class="scopeblk" data-scope="' + esc(sc.key) + '">';
    h += '<div class="scopeblk-h">' +
      '<span class="sn">' + esc(sc.badge || '·') + '</span>' +
      '<div class="st"><b>' + esc(sc.label) + '</b><span class="ss">' + esc(sc.sub) + '</span></div>' +
      '<span class="tag t-blue">命中 ' + st.tot + ' 份案卷 · ' + st.cnt + ' 条发补意见</span>' +
      '<span class="tag t-gray">共 ' + (st.common.length + st.diff.length + st.missing.length) + ' 条结论</span>' +
      '<div class="right">' +
        (opts.batchAdopt
          ? '<button class="btn xs primary" type="button" data-batch-adopt="' + esc(sc.key) + '">采纳本范围全部结论</button>'
          : '') +
        (opts.collapsible
          ? '<button class="btn xs" type="button" data-scope-toggle="1">' + (opts.collapsed ? '展开全部' : '收起') + '</button>'
          : '') +
      '</div></div>';
    if (opts.collapsed) { h += '</div>'; return h; }

    var base = {
      scope: sc.key, canAdopt: opts.canAdopt, selfCheck: opts.selfCheck,
      adoptedMap: opts.adoptedMap, expandAll: true, showCoverage: true
    };
    h += '<div class="scopeblk-b">';
    h += rowsModule('高频共性问题', 'chart', st.common.length + ' 项 · 出现 ≥ 2 份案卷',
      st.common, merge(base, { openFirst: true, empty: '当前范围内无重复出现的问题点' }));
    h += rowsModule('差异需关注问题', 'info', st.diff.length + ' 项 · 仅 1 份案卷出现',
      st.diff, merge(base, { empty: '当前范围内无个别低频但需关注的问题点' }));
    h += rowsModule('易遗漏审评点提醒', 'warn', st.missing.length + ' 项 · 待补',
      st.missing, merge(base, {
        showCoverage: false,
        note: '此处按「尚未写入当前草稿」重新归集，与上方两个模块可能重复；它回答的是"我还差什么"，上方回答的是"别人都发了什么"。',
        empty: '当前草稿已覆盖该范围内出现过的全部问题点'
      }));
    h += scaleNote(st);
    h += '</div></div>';
    return h;
  }

  /* ---------------- 兼容旧接口：单一范围的总结（自由筛选用） ---------------- */
  function computeSum(list) { return conclusionsFor(list, null, []); }

  w.SUM = {
    POINTS: POINTS, WATCHNOTE: WATCHNOTE, RULE2PT: RULE2PT, CMP2PT: CMP2PT,
    pointById: pointById, pointText: pointText, pointsText: pointsText,
    coveredFromDraft: coveredFromDraft,
    scopePresets: scopePresets,
    buildConclusion: buildConclusion,
    conclusionsFor: conclusionsFor,
    adoptPayload: adoptPayload,
    renderScopeCard: renderScopeCard,
    renderScopeRows: renderScopeRows,
    computeSum: computeSum
  };
})(window);
