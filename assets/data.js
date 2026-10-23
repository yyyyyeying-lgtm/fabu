/* ==========================================================================
   发补智能体 · 可交互原型 v4  data.js —— 枚举字典 + 演示数据
   ⚠️ 全部为演示构造数据，正式上线需以真实业务数据与埋点复核
   v4 变更：① 历史发补页改版：AI 分析置顶 / 筛选条件居中 / 案卷清单置底
            ② 筛选字段换成 9 项真实业务口径（申请人、产品名称、器械品类四级、
               申请类型、申请事项、产品类别、地域、当前状态、发补时间到秒）
            ③ 补充器械品类四级目录树 DEVICE_CAT 与历史案卷的业务属性
   ========================================================================== */
(function (w) {
  'use strict';

  var STATUS = {
    '待处理': { tone: 'b-gray', dot: 'd-gray', next: '进入草稿工作台，启动规则引擎分析与比对智能体数据同步' },
    '待复核': { tone: 'b-amber', dot: 'd-amber', next: '在草稿工作台复核 AI 建议，采纳后形成发补意见草稿' },
    '待同步': { tone: 'b-blue', dot: 'd-blue', next: '草稿已确认，可一键同步至审评系统' },
    '已同步': { tone: 'b-green', dot: 'd-green', next: '已推送至审评系统，可在审评系统中继续办理' }
  };

  var SRC = {
    rule: { t: '规则引擎 · AI', cls: 'src-rule' },
    cmp: { t: '比对智能体', cls: 'src-cmp' },
    hist: { t: '历史发补参考', cls: 'src-hist' },
    manual: { t: '人工新增', cls: 'src-manual' },
    mixed: { t: '多来源合并', cls: 'src-mixed' }
  };

  /* ---------------- 器械品类四级目录（演示用裁剪版） ---------------- */
  var DEVICE_CAT = [
    {
      t: '14 注输、护理和防护器械', k: '14', c: [
        {
          t: '14-01 输液器具', k: '14-01', c: [
            { t: '14-01-01 一次性使用输液器', k: '14-01-01', c: ['重力输液式', '压力输液式', '带针型', '不带针型'] },
            { t: '14-01-02 一次性使用静脉留置针', k: '14-01-02', c: ['外周静脉留置针', '经外周中心静脉导管'] }
          ]
        },
        {
          t: '14-02 注射穿刺器械', k: '14-02', c: [
            { t: '14-02-01 一次性使用无菌注射器', k: '14-02-01', c: ['带针', '不带针'] },
            { t: '14-02-02 一次性使用注射针', k: '14-02-02', c: ['普通注射针', '防刺伤注射针'] }
          ]
        },
        {
          t: '14-05 防护用品', k: '14-05', c: [
            { t: '14-05-01 医用防护服', k: '14-05-01', c: ['一次性使用', '可重复使用'] },
            { t: '14-05-02 医用外科口罩', k: '14-05-02', c: ['平面型', '折叠型'] }
          ]
        }
      ]
    },
    {
      t: '06 医用成像器械', k: '06', c: [
        {
          t: '06-01 超声诊断设备', k: '06-01', c: [
            { t: '06-01-01 便携式超声诊断仪', k: '06-01-01', c: ['黑白', '彩色'] }
          ]
        }
      ]
    },
    {
      t: '07 医用诊察和监护器械', k: '07', c: [
        {
          t: '07-03 生理参数测量设备', k: '07-03', c: [
            { t: '07-03-01 电子体温计', k: '07-03-01', c: ['接触式', '非接触式'] },
            { t: '07-03-02 电子血压计', k: '07-03-02', c: ['上臂式', '腕式'] }
          ]
        }
      ]
    },
    {
      t: '22 临床检验器械', k: '22', c: [
        {
          t: '22-01 临床检验分析设备', k: '22-01', c: [
            { t: '22-01-01 全自动生化分析仪', k: '22-01-01', c: ['台式', '落地式'] }
          ]
        }
      ]
    }
  ];

  var ENUM = {
    cat: ['无源医疗器械', '有源医疗器械', '体外诊断试剂'],
    regType: ['首次注册', '变更注册', '延续注册'],
    reviewer: ['叶颖', '李审', '王审', '赵审'],
    /* 发补意见草稿的章节引用（02 页 datalist 用） */
    chapter: [
      'ch1.1 产品说明书', 'ch1.3 标签样稿', 'ch2.1 概述', 'ch3.2 非临床资料',
      'ch4.1 临床评价资料', 'ch5.1 产品技术要求', 'ch6.1 技术要求', 'ch6.3 稳定性研究'
    ],
    /* v4 新增：筛选字段枚举 */
    applyType: ['注册', '延续', '变更'],
    applyItem: [
      '境内医疗器械注册申请',
      '进口医疗器械注册申请',
      '境内体外诊断试剂注册申请',
      '进口体外诊断试剂注册申请',
      '港澳台医疗器械注册申请'
    ],
    productClass: ['二类', '三类'],
    region: ['境内', '境外'],
    reviewStatus: ['已完结', '待企业补充材料', '技术审评中', '已发补待回复', '终止审查']
  };

  /* ---------------- 案卷 / 任务列表（唯一标识 = 受理号） ---------------- */
  var CASES = [
    {
      acceptNo: 'CQX2600312', product: '一次性使用输液器', ent: '华东医疗器械有限公司',
      cat: '无源医疗器械', devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '重力输液式'],
      applyType: '注册', applyItem: '境内医疗器械注册申请', productClass: '三类', region: '境内',
      regType: '首次注册', reviewer: '叶颖',
      created: '2026-10-08 09:12', updated: '2026-10-14 10:20',
      status: '待复核', problems: 4, pending: 4, rule: 4, cmp: 2, hist: 12,
      covered: ['PT1', 'PT2', 'PT3', 'PT4', 'PT5'], isDemo: true
    },
    {
      acceptNo: 'CQX2600308', product: '医用电子体温计', ent: '南方医疗科技有限公司',
      cat: '有源医疗器械', devCat: ['07 医用诊察和监护器械', '07-03 生理参数测量设备', '07-03-01 电子体温计', '接触式'],
      applyType: '注册', applyItem: '境内医疗器械注册申请', productClass: '二类', region: '境内',
      regType: '首次注册', reviewer: '李审',
      created: '2026-10-08 08:40', updated: '2026-10-13 17:02',
      status: '待复核', problems: 3, pending: 2, rule: 3, cmp: 1, hist: 8,
      covered: ['PT1', 'PT3']
    },
    {
      acceptNo: 'CQX2600301', product: '一次性使用无菌注射器', ent: '华北医疗器材股份有限公司',
      cat: '无源医疗器械', devCat: ['14 注输、护理和防护器械', '14-02 注射穿刺器械', '14-02-01 一次性使用无菌注射器', '带针'],
      applyType: '变更', applyItem: '境内医疗器械注册申请', productClass: '三类', region: '境内',
      regType: '变更注册', reviewer: '叶颖',
      created: '2026-10-07 15:22', updated: '2026-10-07 15:22',
      status: '待处理', problems: 0, pending: 0, rule: 0, cmp: 0, hist: 0,
      covered: []
    },
    {
      acceptNo: 'CQX2600298', product: '便携式彩色超声诊断仪', ent: '康宁影像设备有限公司',
      cat: '有源医疗器械', devCat: ['06 医用成像器械', '06-01 超声诊断设备', '06-01-01 便携式超声诊断仪', '彩色'],
      applyType: '注册', applyItem: '境内医疗器械注册申请', productClass: '三类', region: '境内',
      regType: '首次注册', reviewer: '王审',
      created: '2026-10-06 11:05', updated: '2026-10-06 11:05',
      status: '待处理', problems: 0, pending: 0, rule: 0, cmp: 0, hist: 0,
      covered: []
    },
    {
      acceptNo: 'CQX2600290', product: '医用外科口罩', ent: '华中防护用品有限公司',
      cat: '无源医疗器械', devCat: ['14 注输、护理和防护器械', '14-05 防护用品', '14-05-02 医用外科口罩', '平面型'],
      applyType: '延续', applyItem: '境内医疗器械注册申请', productClass: '二类', region: '境内',
      regType: '延续注册', reviewer: '赵审',
      created: '2026-10-05 14:31', updated: '2026-10-12 16:40',
      status: '待同步', problems: 5, pending: 0, rule: 5, cmp: 2, hist: 6,
      covered: ['PT1', 'PT2', 'PT4', 'PT9']
    },
    {
      acceptNo: 'CQX2600281', product: '一次性使用静脉留置针', ent: '华东医疗器械有限公司',
      cat: '无源医疗器械', devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-02 一次性使用静脉留置针', '外周静脉留置针'],
      applyType: '注册', applyItem: '境内医疗器械注册申请', productClass: '三类', region: '境内',
      regType: '首次注册', reviewer: '叶颖',
      created: '2026-10-03 10:18', updated: '2026-10-10 09:05',
      status: '已同步', problems: 6, pending: 0, rule: 4, cmp: 3, hist: 9,
      covered: ['PT1', 'PT2', 'PT4', 'PT6', 'PT9']
    },
    {
      acceptNo: 'CQX2600275', product: '全自动生化分析仪', ent: '精仪生物科技有限公司',
      cat: '有源医疗器械', devCat: ['22 临床检验器械', '22-01 临床检验分析设备', '22-01-01 全自动生化分析仪', '落地式'],
      applyType: '注册', applyItem: '境内医疗器械注册申请', productClass: '三类', region: '境内',
      regType: '首次注册', reviewer: '李审',
      created: '2026-10-02 09:44', updated: '2026-10-09 15:26',
      status: '已同步', problems: 4, pending: 0, rule: 3, cmp: 2, hist: 7,
      covered: ['PT1', 'PT3', 'PT4']
    },
    {
      acceptNo: 'CQX2600260', product: '医用一次性防护服', ent: '华中防护用品有限公司',
      cat: '无源医疗器械', devCat: ['14 注输、护理和防护器械', '14-05 防护用品', '14-05-01 医用防护服', '一次性使用'],
      applyType: '变更', applyItem: '境内医疗器械注册申请', productClass: '二类', region: '境内',
      regType: '变更注册', reviewer: '赵审',
      created: '2026-09-30 13:50', updated: '2026-10-08 11:12',
      status: '已同步', problems: 3, pending: 0, rule: 2, cmp: 1, hist: 5,
      covered: ['PT1', 'PT10']
    },
    {
      acceptNo: 'CQX2600251', product: '电子血压计', ent: '康宁影像设备有限公司',
      cat: '有源医疗器械', devCat: ['07 医用诊察和监护器械', '07-03 生理参数测量设备', '07-03-02 电子血压计', '上臂式'],
      applyType: '延续', applyItem: '境内医疗器械注册申请', productClass: '二类', region: '境内',
      regType: '延续注册', reviewer: '王审',
      created: '2026-09-29 16:07', updated: '2026-10-04 10:33',
      status: '已同步', problems: 2, pending: 0, rule: 2, cmp: 0, hist: 4,
      covered: ['PT1']
    }
  ];

  /* ---------------- 申报原文（溯源基准） ---------------- */
  var READER = [
    {
      sec: 'ch1.1 产品说明书', title: 'ch1.1 产品说明书',
      paras: [
        { n: 'P01', text: '产品名称：一次性使用输液器。' },
        { n: 'P08', text: '规格型号：本产品按滴管滴数分为 20 滴/mL、60 滴/mL 两种规格，按是否带针分为带针型与不带针型，共 8 个规格型号。' },
        { n: 'P12', text: '预期用途：本产品适用于静脉输液治疗。' },
        { n: 'P13', text: '产品由瓶塞穿刺器、进气器件、滴斗、软管、流量调节器、注射件、药液过滤器、外圆锥接头、保护套组成，带针型另配静脉输液针。' },
        { n: 'P19', text: '灭菌方式：环氧乙烷灭菌，有效期 3 年。' }
      ]
    },
    {
      sec: 'ch6.1 技术要求', title: 'ch6.1 技术要求',
      paras: [
        { n: 'P02', text: '1 结构组成：由瓶塞穿刺器、进气器件、滴斗、软管、流量调节器、注射件、药液过滤器、外圆锥接头、保护套组成，带针型另配静脉输液针。' },
        { n: 'P03', text: '3.1 规格型号：本产品按滴管滴数及是否带针分为 10 个规格型号（含带针型 6 个、不带针型 4 个）。' },
        { n: 'P21', text: '3.4 微粒污染：应符合产品技术要求的规定。' },
        { n: 'P28', text: '3.7 稳定性：产品经加速老化试验后，应仍符合本技术要求中 3.2～3.6 的规定。' },
        { n: 'P31', text: '3.9 连接牢固度、泄漏、无菌、环氧乙烷残留量等项目的检验方法详见附录 A。' },
        { n: 'P35', text: '3.11 特异性：本产品无特异性要求。' }
      ]
    },
    {
      sec: 'ch3.2 非临床资料', title: 'ch3.2 非临床资料',
      paras: [
        { n: 'P02', text: '产品名称：一次性使用输液器（带针）。' },
        { n: 'P14', text: '生物学评价：已按 GB/T 16886 系列标准完成细胞毒性、致敏、刺激等试验，结果符合要求。' },
        { n: 'P26', text: '货架有效期：通过加速老化试验（60℃、7 天）推算，产品货架有效期为 2 年。' }
      ]
    },
    {
      sec: 'ch5.1 产品技术要求', title: 'ch5.1 产品技术要求',
      paras: [
        { n: 'P01', text: '1 范围：本技术要求适用于一次性使用输液器（含带针型与不带针型）。' },
        { n: 'P07', text: '2.3 有效期：产品自灭菌之日起有效期 2 年。' }
      ]
    },
    {
      sec: 'ch1.2 注册申请表', title: 'ch1.2 注册申请表',
      paras: [
        { n: 'P01', text: '产品名称：一次性使用输液器（带针）。' },
        { n: 'P02', text: '注册地址：南京市江宁区科学园路 18 号；生产地址：南京市江宁区科学园路 18 号。' },
        { n: 'P03', text: '生产企业名称：华东医疗器械有限公司。' }
      ]
    },
    {
      sec: 'ch3.1 质量管理体系资料', title: 'ch3.1 质量管理体系资料',
      paras: [
        { n: 'P01', text: '生产企业名称：华东医疗器械有限公司。' },
        { n: 'P05', text: '生产地址：南京市江宁区科学园路 18 号 2 号厂房（与注册地址同址，为同一生产场所）。' }
      ]
    }
  ];

  /* ---------------- 发补意见草稿（主演示案卷 CQX2600312） ---------------- */
  var DRAFT = {
    caseNo: 'CQX2600312',
    /* 三个来源（规则校验 / 比对智能体 / 历史发补）各自推过来的原始条目。
       进入「发补意见草稿」时按 ch 文件名称自动归并：
       同 ch 的多条 → 合并成一个问题；子项按推送时间顺延，重新编号（一）（二）（三）… */
    problems: [
      {
        id: 'p1', src: 'rule', chapter: 'ch1.1 产品说明书', from: 'A1 / A2', at: '2026-10-21 09:12',
        subs: [
          { id: 'p1s1', t: '预期用途', from: 'A1', at: '2026-10-21 09:12', v: '产品说明书中预期用途仅表述为“适用于静脉输液治疗”，未明确适用人群、使用环境，亦未说明是否可由非专业人员操作。请参照《医疗器械说明书和标签管理规定》及同类产品审评要点，补充完善预期用途表述。' },
          { id: 'p1s2', t: '规格型号', from: 'A2', at: '2026-10-21 09:12', v: '产品说明书列示规格型号共 8 个，与产品技术要求中 10 个规格型号不一致（差 2 个带针型规格）。请核实并统一，确保说明书、产品技术要求、注册申请表三处表述一致。' }
        ]
      },
      {
        id: 'p2', src: 'rule', chapter: 'ch6.1 技术要求', from: 'A3 / A4', at: '2026-10-21 09:12',
        subs: [
          { id: 'p2s1', t: '稳定性', from: 'A3', at: '2026-10-21 09:12', v: '产品技术要求中未明确规定加速老化试验后的性能指标要求。请参照 YY/T 0681 系列标准及《无源医疗器械产品稳定性研究指导原则》，补充加速老化试验条件、推算方法及老化后应满足的性能指标。' },
          { id: 'p2s2', t: '特异性', from: 'A4', at: '2026-10-21 09:12', v: '产品技术要求中“微粒污染”检验项目仅规定“应符合产品技术要求的规定”，未给出具体检验方法来源及可接受限值。请补充检验方法（引用标准条款）及判定标准。' }
        ]
      },
      {
        id: 'p3', src: 'cmp', chapter: 'ch3.2 非临床资料', from: 'B1', at: '2026-10-21 10:05',
        subs: [
          { id: 'p3s1', t: '产品名称一致性', from: 'B1', at: '2026-10-21 10:05', v: '注册申请表中产品名称为“一次性使用输液器”，非临床资料及说明书中为“一次性使用输液器（带针）”，两者不一致。请确认本次申报是否包含带针型规格，并统一全申报资料中的产品名称。' }
        ]
      },
      {
        id: 'p4', src: 'hist', chapter: 'ch5.1 产品技术要求', from: 'PT3', at: '2026-10-21 08:40',
        subs: [
          { id: 'p4s1', t: '货架有效期', from: 'PT3', at: '2026-10-21 08:40', v: '产品技术要求中载明有效期为 2 年，而说明书中标注为 3 年，稳定性研究资料按加速老化推算为 2 年。请核实并以验证资料结论为准统一有效期表述。（自查提示：近 3 年同产品名称案卷中，该问题出现 3 次）' }
        ]
      },
      {
        id: 'p5', src: 'hist', chapter: 'ch1.1 产品说明书', from: 'PT1', at: '2026-10-21 08:55',
        subs: [
          { id: 'p5s1', t: '适用人群与使用环境', from: 'PT1', at: '2026-10-21 08:55', v: '（历史发补 · 同产品案卷共性）近三年同产品名称案卷中，说明书未明确适用人群、使用环境及操作人员资质被反复提出。请补充：适用人群（成人 / 儿童）、使用场所（医疗机构 / 家庭护理）、操作人员资质要求，并与预期用途表述保持一致。' }
        ]
      },
      {
        id: 'p6', src: 'cmp', chapter: 'ch5.1 产品技术要求', from: 'B4', at: '2026-10-21 10:05',
        subs: [
          { id: 'p6s1', t: '有效期表述', from: 'B4', at: '2026-10-21 10:05', v: '（比对智能体 B4）产品技术要求载明货架有效期为 2 年，说明书标注 3 年，两处不一致。请以稳定性验证资料结论为准统一有效期，并确保技术要求、说明书、注册申请表三处一致。' }
        ]
      }
    ]
  };

  var AI_RULES = [
    {
      id: 'A1', level: '高', status: '已采纳', inDraft: '问题一（一）',
      title: '预期用途未明确适用人群与使用环境',
      conclusion: '产品说明书预期用途表述过于宽泛，未明确适用人群、使用环境及操作人员资质要求，不符合说明书编写的基本要求。',
      rule: 'REG-说明书-004 · 《医疗器械说明书和标签管理规定》第九条 / 《医疗器械说明书编写指导原则》4.2',
      evidence: [{ sec: 'ch1.1 产品说明书', para: 'P12', quote: '适用于静脉输液治疗' }]
    },
    {
      id: 'A2', level: '高', status: '已采纳', inDraft: '问题一（二）',
      title: '说明书与技术要求规格型号数量不一致',
      conclusion: '说明书列示 8 个规格型号，产品技术要求列示 10 个规格型号，数量不一致，需统一。',
      rule: 'REG-技术要求-017 · 《医疗器械产品技术要求编写指导原则》二（二）',
      evidence: [
        { sec: 'ch1.1 产品说明书', para: 'P08', quote: '共 8 个规格型号' },
        { sec: 'ch6.1 技术要求', para: 'P03', quote: '分为 10 个规格型号' }
      ]
    },
    {
      id: 'A3', level: '中', status: '已采纳', inDraft: '问题二（一）',
      title: '未规定加速老化试验后的性能指标',
      conclusion: '技术要求 3.7 条仅表述“应仍符合 3.2～3.6 的规定”，未明确加速老化条件与判定指标，稳定性研究支撑不足。',
      rule: 'REG-技术要求-021 · YY/T 0681 系列 / 《无源医疗器械产品稳定性研究指导原则》三',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P28', quote: '经加速老化试验后，应仍符合本技术要求中 3.2～3.6 的规定' }]
    },
    {
      id: 'A4', level: '高', status: '已采纳', inDraft: '问题二（二）',
      title: '微粒污染项目缺检验方法与限值',
      conclusion: '技术要求 3.4 条“微粒污染”仅写“应符合产品技术要求的规定”，无检验方法来源与限值，属自证条款。',
      rule: 'REG-技术要求-009 · 《医疗器械产品技术要求编写指导原则》三（四）',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P21', quote: '应符合产品技术要求的规定' }]
    },
    {
      id: 'A5', level: '中', status: '待复核',
      title: '临床评价资料缺可比器械选择依据',
      conclusion: '临床评价报告中列出 3 个可比器械，但未说明选择依据及可比性分析过程。',
      rule: 'REG-临床-006 · 《医疗器械临床评价技术指导原则》四（二）',
      ch: 'ch4.1 临床评价资料', sub: '（一）可比器械选择依据',
      evidence: [{ sec: 'ch3.2 非临床资料', para: 'P14', quote: '已按 GB/T 16886 系列标准完成' }]
    },
    {
      id: 'A6', level: '低', status: '待复核',
      title: '标签样稿缺生产日期与失效日期标注位置',
      conclusion: '标签样稿中未见生产日期、失效日期（或有效期）的标注位置说明，建议补充。',
      rule: 'REG-标签-003 · 《医疗器械说明书和标签管理规定》第十条',
      ch: 'ch1.3 标签样稿', sub: '（一）生产日期与失效日期标注位置',
      evidence: [{ sec: 'ch1.1 产品说明书', para: 'P19', quote: '有效期 3 年' }]
    }
  ];

  var AI_COMPARE = [
    {
      id: 'B1', status: '已采纳', inDraft: '问题三（一）', same: false,
      item: '产品名称一致性', aLabel: '注册申请表', aVal: '一次性使用输液器（带针）',
      bLabel: '说明书 / 非临床资料', bVal: '一次性使用输液器',
      conclusion: '两处产品名称不一致，需确认申报范围并统一。',
      evA: { sec: 'ch1.2 注册申请表', para: 'P01', quote: '一次性使用输液器（带针）' },
      evB: { sec: 'ch1.1 产品说明书', para: 'P01', quote: '一次性使用输液器' }
    },
    {
      id: 'B2', status: '已采纳', inDraft: '问题一（二）', same: false,
      item: '规格型号数量', aLabel: '产品技术要求', aVal: '10 个（含带针 6 个）',
      bLabel: '产品说明书', bVal: '8 个（含带针 4 个）',
      conclusion: '规格型号数量不一致，相差 2 个带针型规格。',
      evA: { sec: 'ch6.1 技术要求', para: 'P03', quote: '10 个规格型号' },
      evB: { sec: 'ch1.1 产品说明书', para: 'P08', quote: '8 个规格型号' }
    },
    {
      id: 'B3', status: '待采纳', same: false,
      item: '注册地址 / 生产地址', aLabel: '注册申请表', aVal: '南京市江宁区科学园路 18 号',
      bLabel: '质量管理体系资料', bVal: '南京市江宁区科学园路 18 号 2 号厂房',
      conclusion: '注册地址与生产地址表述不一致，需核实是否同一场所。',
      evA: { sec: 'ch1.2 注册申请表', para: 'P02', quote: '南京市江宁区科学园路 18 号' },
      evB: { sec: 'ch3.1 质量管理体系资料', para: 'P05', quote: '南京市江宁区科学园路 18 号 2 号厂房' }
    },
    {
      id: 'B4', status: '待采纳', same: false,
      item: '货架有效期', aLabel: '产品技术要求', aVal: '2 年',
      bLabel: '产品说明书', bVal: '3 年',
      conclusion: '两处有效期不一致，需以稳定性验证资料结论为准统一。',
      evA: { sec: 'ch5.1 产品技术要求', para: 'P07', quote: '有效期 2 年' },
      evB: { sec: 'ch1.1 产品说明书', para: 'P19', quote: '有效期 3 年' }
    },
    {
      id: 'B5', status: '一致', same: true,
      item: '生产企业名称', aLabel: '注册申请表', aVal: '华东医疗器械有限公司',
      bLabel: '质量管理体系资料', bVal: '华东医疗器械有限公司', conclusion: '一致，无需处理。',
      evA: { sec: 'ch1.2 注册申请表', para: 'P03', quote: '华东医疗器械有限公司' },
      evB: { sec: 'ch3.1 质量管理体系资料', para: 'P01', quote: '华东医疗器械有限公司' }
    },
    {
      id: 'B6', status: '一致', same: true,
      item: '结构组成表述', aLabel: '产品说明书', aVal: '由瓶塞穿刺器等 9 部分组成',
      bLabel: '产品技术要求', bVal: '由瓶塞穿刺器等 9 部分组成', conclusion: '一致，无需处理。',
      evA: { sec: 'ch1.1 产品说明书', para: 'P13', quote: '由瓶塞穿刺器' },
      evB: { sec: 'ch6.1 技术要求', para: 'P02', quote: '由瓶塞穿刺器' }
    }
  ];

  /* ---------------- 历史发补意见库 ----------------
     新增字段：applyType 申请类型 / applyItem 申请事项 / productClass 产品类别
              region 地域 / reviewStatus 当前状态 / issueAt 发补时间(年月日时分秒)
              devCat 器械品类四级路径
  ------------------------------------------------- */
  var HISTORY = [
    {
      acceptNo: 'CQX2500852', ent: '华东医疗器械有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '重力输液式'],
      date: '2025-04-18', issueAt: '2025-04-18 10:23:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT3', 'PT4', 'PT9'],
      sum: '预期用途未明确适用人群与使用环境；规格型号在说明书与技术要求中不一致；稳定性验证资料不完整；微粒污染检验方法缺失；标签样稿缺有效期标注。'
    },
    {
      acceptNo: 'CQX2400617', ent: '华东医疗器械有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '压力输液式'],
      date: '2024-06-25', issueAt: '2024-06-25 14:05:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT4', 'PT7'],
      sum: '预期用途表述宽泛；规格型号数量不一致；产品技术要求中检验方法引用错误；未提供环氧乙烷残留量验证资料。'
    },
    {
      acceptNo: 'CQX2501204', ent: '华东医疗器械有限公司', product: '一次性使用输液器（带针）',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '带针型'],
      date: '2025-07-08', issueAt: '2025-07-08 09:41:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '待企业补充材料', cat: '无源医疗器械',
      points: ['PT6', 'PT1', 'PT4', 'PT3'],
      sum: '针尖锋利度与针座连接牢固度检验方法缺失；预期用途未明确使用环境；微粒污染限值未给出；说明书有效期与技术要求不一致。'
    },
    {
      acceptNo: 'CQX2501523', ent: '江北医疗科技有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '重力输液式'],
      date: '2025-09-12', issueAt: '2025-09-12 16:12:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT3', 'PT4', 'PT8'],
      sum: '预期用途未包含适用人群；规格型号不一致；稳定性研究未做加速老化；微粒污染无检验方法；输液流速准确性未验证；货架有效期标注矛盾。'
    },
    {
      acceptNo: 'CQX2400338', ent: '江南医疗器械有限公司', product: '一次性使用输液器（带针）',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '带针型'],
      date: '2024-02-20', issueAt: '2024-02-20 11:30:00',
      regType: '首次注册', applyType: '注册', applyItem: '进口医疗器械注册申请',
      productClass: '三类', region: '境外', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT6', 'PT7', 'PT1', 'PT2', 'PT9'],
      sum: '针尖锋利度要求缺失；环氧乙烷残留量限值依据不足；预期用途表述不完整；规格型号在申报资料间不一致；标签内容不完整。'
    },
    {
      acceptNo: 'CQX2310947', ent: '华东医疗器械有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '重力输液式'],
      date: '2023-11-03', issueAt: '2023-11-03 15:48:00',
      regType: '变更注册', applyType: '变更', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT10', 'PT1', 'PT9'],
      sum: '变更前后规格型号对应关系不清；预期用途未同步更新；说明书未随变更同步修订。'
    },
    {
      acceptNo: 'CQX2502311', ent: '华东医疗器械有限公司', product: '一次性使用静脉留置针',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-02 一次性使用静脉留置针', '外周静脉留置针'],
      date: '2025-02-14', issueAt: '2025-02-14 10:02:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT9', 'PT4'],
      sum: '预期用途未明确适用人群；规格型号与技术要求不一致；标签样稿内容不完整；微粒污染检验方法缺失。'
    },
    {
      acceptNo: 'CQX2502777', ent: '华东医疗器械有限公司', product: '一次性使用无菌注射器',
      devCat: ['14 注输、护理和防护器械', '14-02 注射穿刺器械', '14-02-01 一次性使用无菌注射器', '带针'],
      date: '2024-10-09', issueAt: '2024-10-09 09:15:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT3', 'PT4', 'PT2'],
      sum: '预期用途表述不完整；稳定性研究资料不完整；微粒污染限值缺失；规格型号在申报资料间不一致。'
    },
    {
      acceptNo: 'CQX2503388', ent: '南方医疗科技有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '重力输液式'],
      date: '2025-06-21', issueAt: '2025-06-21 13:27:00',
      regType: '延续注册', applyType: '延续', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '技术审评中', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT4', 'PT8'],
      sum: '预期用途未明确使用环境；规格型号不一致；微粒污染无检验方法；输液流速准确性未验证。'
    },
    {
      acceptNo: 'CQX2404192', ent: '江北医疗科技有限公司', product: '一次性使用静脉留置针',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-02 一次性使用静脉留置针', '经外周中心静脉导管'],
      date: '2024-08-15', issueAt: '2024-08-15 14:56:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT6', 'PT1', 'PT9', 'PT4'],
      sum: '针尖锋利度与针座连接牢固度要求缺失；预期用途未包含适用人群；标签内容不完整；微粒污染检验方法缺失。'
    },
    {
      acceptNo: 'CQX2504026', ent: '华北医疗器材股份有限公司', product: '一次性使用输液器',
      devCat: ['14 注输、护理和防护器械', '14-01 输液器具', '14-01-01 一次性使用输液器', '带针型'],
      date: '2025-11-02', issueAt: '2025-11-02 09:30:00',
      regType: '首次注册', applyType: '注册', applyItem: '境内医疗器械注册申请',
      productClass: '三类', region: '境内', reviewStatus: '已完结', cat: '无源医疗器械',
      points: ['PT1', 'PT2', 'PT3', 'PT4', 'PT9'],
      sum: '预期用途表述宽泛；规格型号不一致；稳定性验证资料不完整；微粒污染检验方法缺失；标签样稿缺有效期标注。'
    },
    {
      acceptNo: 'CQX2405087', ent: '华中防护用品有限公司', product: '一次性使用无菌注射器',
      devCat: ['14 注输、护理和防护器械', '14-02 注射穿刺器械', '14-02-01 一次性使用无菌注射器', '不带针'],
      date: '2024-04-27', issueAt: '2024-04-27 16:20:00',
      regType: '变更注册', applyType: '变更', applyItem: '境内医疗器械注册申请',
      productClass: '二类', region: '境内', reviewStatus: '待企业补充材料', cat: '无源医疗器械',
      points: ['PT1', 'PT10', 'PT9'],
      sum: '预期用途未同步更新；变更前后规格型号对应关系不清；说明书未随变更同步修订。'
    }
  ];

  /* ======================================================================
     v5 新增：申报资料处理流水线
     上传 → 目录扫描 → 归类（ch 文件 → rps 目录）→ PDF 解析 → 跑规则
     设计要点：创建任务不依赖这些节点完成，节点可后续逐个推进，进度全程可视。
     ====================================================================== */
  var FLOW_STEPS = [
    { k: 'upload',   t: '上传资料', short: '上传', d: '企业申报资料文件夹' },
    { k: 'unzip',    t: '目录扫描', short: '扫描', d: '读取文件夹内全部文件' },
    { k: 'classify', t: '资料归类', short: '归类', d: 'ch 文件 → rps 目录' },
    { k: 'parse',    t: 'PDF 解析', short: '解析', d: 'PDF 提取为文本' },
    { k: 'rule',     t: '规则运行', short: '规则', d: '规则引擎 / 比对 / 历史检索' }
  ];

  /* rps 目录（注册申报资料目录，演示裁剪版） */
  var RPS_DIRS = [
    { k: 'rps1',  t: 'rps1 申请表' },
    { k: 'rps2',  t: 'rps2 证明性文件' },
    { k: 'rps3',  t: 'rps3 安全有效基本要求清单' },
    { k: 'rps4',  t: 'rps4 综述资料' },
    { k: 'rps5',  t: 'rps5 研究资料' },
    { k: 'rps6',  t: 'rps6 产品技术要求' },
    { k: 'rps7',  t: 'rps7 注册检验报告' },
    { k: 'rps8',  t: 'rps8 临床评价资料' },
    { k: 'rps9',  t: 'rps9 说明书和标签样稿' },
    { k: 'rps10', t: 'rps10 生产制造信息' },
    { k: 'rps11', t: 'rps11 质量管理体系文件' },
    { k: 'rps12', t: 'rps12 其他资料' }
  ];

  /* 章节 → 目标 rps 目录 的后台规则（演示版）；low 标记置信度低、需人工确认的文件序号 */
  var CH_MAP = [
    { ch: 'ch1.1 产品说明书', n: 3, dir: 'rps9' },
    { ch: 'ch1.2 标签样稿', n: 2, dir: 'rps9' },
    { ch: 'ch2.1 注册申请表', n: 2, dir: 'rps1' },
    { ch: 'ch2.2 证明性文件', n: 4, dir: 'rps2' },
    { ch: 'ch2.3 安全有效基本要求清单', n: 1, dir: 'rps3' },
    { ch: 'ch2.4 代理文件', n: 4, dir: 'rps2' },
    { ch: 'ch3.1 风险管理资料', n: 3, dir: 'rps5' },
    { ch: 'ch3.2 非临床资料', n: 14, dir: 'rps5' },
    { ch: 'ch3.3 灭菌确认报告', n: 6, dir: 'rps5' },
    { ch: 'ch3.4 包装验证报告', n: 3, dir: 'rps5' },
    { ch: 'ch3.5 稳定性研究', n: 9, dir: 'rps5' },
    { ch: 'ch3.6 生物学评价', n: 12, dir: 'rps5' },
    { ch: 'ch3.7 软件资料', n: 8, dir: 'rps5', low: [2], lowNote: '规则同时命中 rps5 / rps11，需确认是否随体系资料提交' },
    { ch: 'ch4.1 临床评价资料', n: 12, dir: 'rps8' },
    { ch: 'ch4.2 临床文献', n: 7, dir: 'rps8' },
    { ch: 'ch5.1 产品技术要求', n: 3, dir: 'rps6' },
    { ch: 'ch5.2 注册检验报告', n: 6, dir: 'rps7' },
    { ch: 'ch5.3 说明书核对表', n: 4, dir: 'rps9' },
    { ch: 'ch6.1 技术要求', n: 2, dir: 'rps6' },
    { ch: 'ch6.2 生产制造信息', n: 8, dir: 'rps10', low: [3], lowNote: '该文件含生产工艺流程图，规则在 rps10 / rps11 之间置信度接近' },
    { ch: 'ch6.3 质量管理体系', n: 10, dir: 'rps11' },
    { ch: 'ch6.4 其他资料', n: 5, dir: 'rps12', low: [1], lowNote: '文件名不含章节号，规则依据内容识别，建议人工确认' }
  ];

  var FAIL_REASONS = [
    '扫描件无文本层（OCR 未启用）',
    '文件已加密，无法提取文本',
    'PDF 结构损坏（文件尾缺失）',
    '字体嵌入异常，抽取结果为空',
    '页数超限（>500 页），解析超时'
  ];

  function p2(n) { return n < 10 ? '0' + n : '' + n; }

  var DOCS = (function () {
    var out = [], idx = 0;
    CH_MAP.forEach(function (m) {
      var code = m.ch.split(' ')[0];
      var title = m.ch.slice(code.length + 1);
      for (var i = 1; i <= m.n; i++) {
        idx++;
        var d = {
          id: 'F' + (1000 + idx),
          name: code + '-' + p2(i) + ' ' + title + '.pdf',
          ch: m.ch,
          page: 4 + (idx * 7) % 46,
          dir: m.dir,
          conf: 96 + (idx * 3) % 5,
          mode: 'auto',
          state: 'ok'
        };
        if (m.low && m.low.indexOf(i) >= 0) {
          d.conf = 62 + (i * 3) % 9;
          d.state = 'low';
          d.note = m.lowNote;
        }
        out.push(d);
      }
    });
    ['ch3.2-07', 'ch3.6-03', 'ch5.2-04', 'ch4.1-09', 'ch6.3-05'].forEach(function (nm, i) {
      var d = out.filter(function (x) { return x.name.indexOf(nm) === 0; })[0];
      if (d && d.state !== 'low') {
        d.state = 'fail';
        d.fail = FAIL_REASONS[i % FAIL_REASONS.length];
      }
    });
    return out;
  })();

  function dirText(k) {
    for (var i = 0; i < RPS_DIRS.length; i++) if (RPS_DIRS[i].k === k) return RPS_DIRS[i].t;
    return k || '—';
  }

  function mkFlow(stage, opt) {
    opt = opt || {};
    var f = {};
    FLOW_STEPS.forEach(function (s, i) {
      var n = i + 1;
      if (n <= stage) f[s.k] = { st: 'done', pct: 100 };
      else if (n === stage + 1 && opt.pct != null) f[s.k] = { st: 'running', pct: opt.pct };
      else f[s.k] = { st: 'pending', pct: 0 };
    });
    return f;
  }

  function timeAt(base, addMin) {
    var m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/.exec(base || '');
    if (!m) return '';
    var d = new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5] + addMin);
    return p2(d.getHours()) + ':' + p2(d.getMinutes());
  }

  /* 演示案卷的节点进度：覆盖 完成 / 处理中 / 失败 / 未开始 四种状态 */
  var FLOW_PLAN = {
    'CQX2600312': { stage: 5, failN: 5, unzipFailN: 2, parseFail: true },  // 2 个文件读取失败、5 个文件解析失败（红色），规则仍基于成功文件跑完
    'CQX2600308': { stage: 5, failN: 0 },
    'CQX2600301': { stage: 1, hardFail: 'unzip' },           // 目录扫描失败（红色），后续节点置灰
    'CQX2600298': { stage: 0, pct: 45 },                     // 正在上传（闪烁）
    'CQX2600290': { stage: 5, failN: 0 },
    'CQX2600281': { stage: 5, failN: 0 },
    'CQX2600275': { stage: 5, failN: 0 },
    'CQX2600260': { stage: 5, failN: 0 },
    'CQX2600251': { stage: 5, failN: 0 }
  };

  CASES.forEach(function (c) {
    var plan = FLOW_PLAN[c.acceptNo] || { stage: 5, failN: 0 };
    var at = function (m) { return timeAt(c.created, m); };
    c.flow = mkFlow(plan.stage, { pct: plan.pct });

    if (plan.stage >= 1) c.flow.upload = {
      st: 'done', pct: 100, at: at(12),
      file: { name: '企业申报资料_' + c.acceptNo, size: '42.8 MB', count: 128, dirs: 6 }
    };
    if (plan.stage >= 2) {
      c.flow.unzip = { st: 'done', pct: 100, at: at(15), files: 128, dirs: 6, cost: '3.2s' };
      if (plan.unzipFailN) {
        c.flow.unzip.files = 128 - plan.unzipFailN;
        c.flow.unzip.failN = plan.unzipFailN;
        c.flow.unzip.st = 'warn';
        c.flow.unzip.err = plan.unzipFailN + ' 个文件读取失败：文件损坏或无读取权限';
      }
    }
    if (plan.stage >= 3) c.flow.classify = { st: 'done', pct: 100, at: at(22), auto: 125, low: 3, manual: 0 };
    if (plan.stage >= 4) c.flow.parse = { st: 'done', pct: 100, at: at(34), ok: 128, failN: 0 };
    if (plan.stage >= 5) c.flow.rule = { st: 'done', pct: 100, at: at(41), hits: 12, cmp: 4, hist: 12 };

    if (plan.parseFail) {
      var _fn = plan.failN || 5;
      var _extracted = 128 - (plan.unzipFailN || 0);
      c.flow.parse = {
        st: 'fail', pct: 100, at: at(34), ok: _extracted - _fn, failN: _fn,
        err: _fn + ' 个文件解析失败：扫描件无文本层 / 文件加密',
        errMore: '扫描得到 ' + _extracted + ' 个文件，成功解析 ' + (_extracted - _fn) + ' 个（含 3 个归类待确认）；规则已基于成功文件运行，失败文件未纳入校验'
      };
    }
    if (plan.hardFail === 'unzip') {
      c.flow.unzip = {
        st: 'fail', pct: 100, at: at(15),
        err: '文件夹读取失败：3 个文件损坏或无读取权限',
        errMore: '后续节点未执行，需重新选择文件夹上传后再继续'
      };
      c.flow.classify = { st: 'pending', pct: 0 };
      c.flow.parse = { st: 'pending', pct: 0 };
      c.flow.rule = { st: 'pending', pct: 0 };
    }
  });

  /* ---------------- 本机持久化（file:// 下也能记住新建任务与节点进度） ---------------- */
  var LS_NEW = 'fb_v12_new_cases';
  var LS_FLOW = 'fb_v12_flow';
  function lsGet(k, def) {
    try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch (e) { return def; }
  }
  function lsSet(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {}
  }
  var NEW_CASES = lsGet(LS_NEW, []);
  if (NEW_CASES && NEW_CASES.length) {
    CASES = NEW_CASES.concat(CASES.filter(function (c) {
      return !NEW_CASES.some(function (n) { return n.acceptNo === c.acceptNo; });
    }));
  }
  var SAVED_FLOW = lsGet(LS_FLOW, {});
  CASES.forEach(function (c) {
    if (SAVED_FLOW[c.acceptNo]) {
      FLOW_STEPS.forEach(function (s) {
        if (SAVED_FLOW[c.acceptNo][s.k]) c.flow[s.k] = SAVED_FLOW[c.acceptNo][s.k];
      });
    }
  });

  function saveCase(c) {
    var i = -1;
    for (var j = 0; j < CASES.length; j++) if (CASES[j].acceptNo === c.acceptNo) { i = j; break; }
    if (i >= 0) CASES[i] = c; else CASES.unshift(c);
    var arr = lsGet(LS_NEW, []);
    arr = arr.filter(function (x) { return x.acceptNo !== c.acceptNo; });
    arr.unshift(JSON.parse(JSON.stringify(c)));
    lsSet(LS_NEW, arr);
    saveFlow(c.acceptNo, c.flow);
  }
  function removeCase(no) {
    for (var j = 0; j < CASES.length; j++) if (CASES[j].acceptNo === no) { CASES.splice(j, 1); break; }
    lsSet(LS_NEW, lsGet(LS_NEW, []).filter(function (x) { return x.acceptNo !== no; }));
    var f = lsGet(LS_FLOW, {}); delete f[no]; lsSet(LS_FLOW, f);
  }
  function saveFlow(no, flow) {
    var f = lsGet(LS_FLOW, {});
    f[no] = flow;
    lsSet(LS_FLOW, f);
    for (var j = 0; j < CASES.length; j++) if (CASES[j].acceptNo === no) CASES[j].flow = flow;
  }
  function clearDemo() {
    try { localStorage.removeItem(LS_NEW); localStorage.removeItem(LS_FLOW); } catch (e) {}
  }
  function nextAcceptNo() {
    var n = 2600400;
    CASES.forEach(function (c) {
      var m = /^CQX(\d{7})$/.exec(c.acceptNo);
      if (m) n = Math.max(n, parseInt(m[1], 10) + 1);
    });
    return 'CQX' + n;
  }

  /* 进度汇总：整体百分比 / 当前节点 / 是否全完成 / 是否有异常 */
  function flowOf(c) {
    var f = (c && c.flow) || {};
    var sum = 0, cur = null, done = true, warn = false, fail = null;
    FLOW_STEPS.forEach(function (s, i) {
      var x = f[s.k] || { st: 'pending', pct: 0 };
      var finished = (x.st === 'done' || x.st === 'warn' || x.st === 'fail');
      sum += finished ? 100 : (x.pct || 0);
      if (x.st === 'warn') warn = true;
      if (x.st === 'fail' && !fail) fail = { i: i + 1, k: s.k, t: s.t, err: x.err || '' };
      if (!finished) {
        done = false;
        if (!cur) cur = { i: i + 1, k: s.k, t: s.t, st: x.st, pct: x.pct || 0 };
      }
    });
    return { pct: Math.round(sum / FLOW_STEPS.length), cur: cur, done: done, warn: warn, fail: fail };
  }
  function stepDone(c, k) {
    var x = (c.flow || {})[k];
    return !!x && (x.st === 'done' || x.st === 'warn');
  }


  /* ======================================================================
     v7 新增：发补规则校验（系统配置规则 + AI 结论 + 原文溯源）
     每条规则挂在 rps 目录 / ch 文件上，evidence 指向 READER 的段落
     ====================================================================== */
  var RULES = [
    {
      id: 'REG-说明书-004', name: '预期用途完整性', level: '高', status: '待复核',
      rps: 'rps9', ch: 'ch1.1 产品说明书', conf: 92,
      check: '说明书中「预期用途」是否明确适用人群、使用环境及操作人员资质',
      ai: '产品说明书预期用途仅表述为“适用于静脉输液治疗”，未明确适用人群、使用环境，亦未说明是否可由非专业人员操作，表述过于宽泛。',
      basis: '《医疗器械说明书和标签管理规定》第九条 / 《医疗器械说明书编写指导原则》4.2',
      evidence: [{ sec: 'ch1.1 产品说明书', para: 'P12', page: 3, quote: '适用于静脉输液治疗' }]
    },
    {
      id: 'REG-说明书-006', name: '规格型号跨文件一致性', level: '高', status: '待复核',
      rps: 'rps9', ch: 'ch1.1 产品说明书', conf: 96,
      check: '说明书列示的规格型号数量，与产品技术要求是否一致',
      ai: '说明书列示 8 个规格型号，产品技术要求列示 10 个（含带针型 6 个），相差 2 个带针型规格，需核实并以申报范围为准统一。',
      basis: '《医疗器械产品技术要求编写指导原则》二（二）',
      evidence: [
        { sec: 'ch1.1 产品说明书', para: 'P08', page: 6, quote: '共 8 个规格型号' },
        { sec: 'ch6.1 技术要求', para: 'P03', page: 9, quote: '分为 10 个规格型号' }
      ]
    },
    {
      id: 'REG-标签-003', name: '标签标注位置完整性', level: '中', status: '待复核',
      rps: 'rps9', ch: 'ch1.1 产品说明书', conf: 84,
      check: '标签样稿是否标注生产日期、失效日期（或有效期）的标注位置',
      ai: '标签样稿中未见生产日期、失效日期的标注位置说明，仅在说明书中出现“有效期 3 年”，不满足标签标注要求。',
      basis: '《医疗器械说明书和标签管理规定》第十条',
      evidence: [{ sec: 'ch1.1 产品说明书', para: 'P19', page: 19, quote: '有效期 3 年' }]
    },
    {
      id: 'REG-技术要求-009', name: '微粒污染检验方法与限值', level: '高', status: '已采纳',
      rps: 'rps6', ch: 'ch6.1 技术要求', conf: 95,
      check: '产品技术要求中的性能指标，是否给出可执行的检验方法与可接受限值',
      ai: '3.4 条“微粒污染”仅写“应符合产品技术要求的规定”，未给出检验方法来源及限值，属于自证条款，无法据以检验。',
      basis: '《医疗器械产品技术要求编写指导原则》三（四）',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P21', page: 21, quote: '应符合产品技术要求的规定' }]
    },
    {
      id: 'REG-技术要求-021', name: '加速老化后性能指标', level: '中', status: '待复核',
      rps: 'rps6', ch: 'ch6.1 技术要求', conf: 78,
      check: '稳定性要求是否明确加速老化条件、推算方法及老化后应满足的性能指标',
      ai: '技术要求 3.7 条仅表述“应仍符合 3.2～3.6 的规定”，未明确加速老化条件与判定指标，稳定性研究支撑不足。',
      basis: 'YY/T 0681 系列 / 《无源医疗器械产品稳定性研究指导原则》三',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P28', page: 28, quote: '应仍符合本技术要求中 3.2～3.6 的规定' }]
    },
    {
      id: 'REG-技术要求-017', name: '规格型号数量一致性', level: '高', status: '已采纳',
      rps: 'rps6', ch: 'ch6.1 技术要求', conf: 94,
      check: '产品技术要求中的规格型号数量，与注册申请表、说明书是否一致',
      ai: '产品技术要求列示 10 个规格型号（带针 6 个、不带针 4 个），与说明书 8 个不一致，需统一。',
      basis: '《医疗器械产品技术要求编写指导原则》二（二）',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P03', page: 9, quote: '分为 10 个规格型号' }]
    },
    {
      id: 'REG-一致性-002', name: '货架有效期一致性', level: '高', status: '待复核',
      rps: 'rps9', ch: 'ch1.1 产品说明书', conf: 97,
      check: '说明书、产品技术要求、稳定性研究中的货架有效期是否一致',
      ai: '说明书标注有效期 3 年，产品技术要求为 2 年，稳定性研究按加速老化推算为 2 年，三处不一致，应以验证资料结论为准统一。',
      basis: '《医疗器械注册申报资料要求》/ 稳定性研究指导原则',
      evidence: [
        { sec: 'ch1.1 产品说明书', para: 'P19', page: 19, quote: '有效期 3 年' },
        { sec: 'ch5.1 产品技术要求', para: 'P07', page: 7, quote: '有效期 2 年' }
      ]
    },
    {
      id: 'REG-临床-006', name: '可比器械选择依据', level: '中', status: '待复核',
      rps: 'rps8', ch: 'ch3.2 非临床资料', conf: 66,
      check: '临床评价中选择的可比器械，是否说明选择依据及可比性分析过程',
      ai: '临床评价报告列出 3 个可比器械，但未说明选择依据及可比性分析过程；现有资料仅能证明生物学评价完成，不足以支撑可比性结论。',
      basis: '《医疗器械临床评价技术指导原则》四（二）',
      evidence: [{ sec: 'ch3.2 非临床资料', para: 'P14', page: 14, quote: '已按 GB/T 16886 系列标准完成' }]
    },
    {
      id: 'REG-非临床-018', name: '货架有效期推算依据', level: '中', status: '待复核',
      rps: 'rps5', ch: 'ch3.2 非临床资料', conf: 81,
      check: '货架有效期的加速老化条件、推算过程是否在资料中说明',
      ai: '资料给出货架有效期为 2 年，但未说明加速老化试验条件与推算过程，结论缺少过程支撑，建议补充试验方案与数据。',
      basis: '《无源医疗器械产品稳定性研究指导原则》二',
      evidence: [{ sec: 'ch3.2 非临床资料', para: 'P26', page: 26, quote: '货架有效期为 2 年' }]
    },
    {
      id: 'REG-技术要求-031', name: '特异性要求', level: '低', status: '待复核',
      rps: 'rps6', ch: 'ch6.1 技术要求', conf: 58,
      check: '技术要求中“特异性”条款的声明是否有对应依据',
      ai: '技术要求 3.11 条声明“本产品无特异性要求”，但产品含药物涂层，该声明缺少依据，建议补充说明或提供支持性资料。',
      basis: '《医疗器械产品技术要求编写指导原则》三（二）',
      evidence: [{ sec: 'ch6.1 技术要求', para: 'P35', page: 35, quote: '本产品无特异性要求' }]
    },
    {
      id: 'REG-申请表-001', name: '注册申请表信息完整性', level: '中', status: '待复核',
      rps: 'rps1', ch: 'ch1.2 注册申请表', conf: 90,
      check: '注册申请表是否完整填写产品名称、注册地址、生产地址及生产企业信息，并与证明性文件保持一致',
      ai: '注册申请表所列注册地址为“南京市江宁区科学园路 18 号”，未写明该地址是否同时为生产场地，也未标注对应的生产许可或备案信息，建议补充说明二者关系。',
      basis: '《医疗器械注册申报资料要求》三（一）',
      evidence: [{ sec: 'ch1.2 注册申请表', para: 'P02', page: 2, quote: '南京市江宁区科学园路 18 号' }]
    },
    {
      id: 'REG-说明书-011', name: '结构组成完整性', level: '低', status: '待复核',
      rps: 'rps9', ch: 'ch1.1 产品说明书', conf: 99,
      check: '说明书中的结构组成，与产品技术要求附录是否一致',
      ai: '说明书结构组成列示 9 个部件，与产品技术要求附录一致，未发现缺项或表述冲突。',
      basis: '《医疗器械说明书和标签管理规定》第十一条',
      evidence: [{ sec: 'ch1.1 产品说明书', para: 'P13', page: 13, quote: '由瓶塞穿刺器、进气器件、滴斗' }]
    },
    {
      id: 'REG-非临床-012', name: '生物学评价项目完整性', level: '低', status: '待复核',
      rps: 'rps5', ch: 'ch3.2 非临床资料', conf: 98,
      check: '生物学评价是否覆盖 GB/T 16886.1 要求的评价项目',
      ai: '已按 GB/T 16886 系列标准完成细胞毒性、致敏、刺激试验，评价项目完整，结果符合要求。',
      basis: 'GB/T 16886.1 / 医疗器械生物学评价指导原则',
      evidence: [{ sec: 'ch3.2 非临床资料', para: 'P14', page: 14, quote: '已按 GB/T 16886 系列标准完成' }]
    }
  ];


  /* ======================================================================
     v8 新增：法规/指导原则库（供规则「依据」跳转）
     条款正文为演示节选，正式环境应接入法规知识库全文
     ====================================================================== */
  var LAWS = [
    {
      id: 'ifu', title: '医疗器械说明书和标签管理规定', type: '部门规章', code: '总局令第 6 号',
      issuer: '国家食品药品监督管理总局', effective: '2014-10-01',
      summary: '规定医疗器械说明书、标签的编写内容、标注方式与一致性要求。',
      articles: [
        { no: '第九条', text: '医疗器械说明书应当包含产品名称、型号规格、注册人或者备案人信息、预期用途、禁忌症、注意事项、使用方法、维护保养等内容，并与注册或者备案的资料保持一致。' },
        { no: '第十条', text: '医疗器械标签应当标注产品名称、型号规格、注册人或者备案人信息、生产日期、失效日期或者有效期、生产批号等内容；因尺寸限制无法全部标注的，应当在说明书中载明。' },
        { no: '第十一条', text: '医疗器械说明书和标签中的文字内容应当科学、真实、准确，与注册或者备案的内容相一致，不得含有虚假、夸大或者误导性内容。' }
      ]
    },
    {
      id: 'tech', title: '医疗器械产品技术要求编写指导原则', type: '指导原则', code: '2022 年第 8 号',
      issuer: '国家药品监督管理局', effective: '2022-03-01',
      summary: '规范产品技术要求的格式、性能指标设置与检验方法编写要求。',
      articles: [
        { no: '二（二）', text: '产品技术要求中应当列明全部规格型号，并与注册申请表、说明书保持一致；规格型号的划分依据应当明确、可追溯。' },
        { no: '三（二）', text: '性能指标应当根据产品预期用途和风险确定，指标要求应当可测量、可判定；无依据的声明不得作为性能指标。' },
        { no: '三（四）', text: '每一项性能指标均应当规定相应的检验方法，检验方法应当具有可操作性，并优先采用国家标准、行业标准规定的方法。' }
      ]
    },
    {
      id: 'stab', title: '无源医疗器械产品稳定性研究指导原则', type: '指导原则', code: '2021 年第 12 号',
      issuer: '国家药品监督管理局', effective: '2021-06-01',
      summary: '规范货架有效期、包装完整性等稳定性研究的内容与推算方法。',
      articles: [
        { no: '二', text: '稳定性研究应当包括货架有效期和包装完整性研究，明确研究项目、试验条件、检验方法与判定标准，并保留原始记录。' },
        { no: '三', text: '采用加速老化试验推算货架有效期的，应当说明加速老化条件、推算模型及依据，并对老化后样品进行性能验证。' }
      ]
    },
    {
      id: 'clin', title: '医疗器械临床评价技术指导原则', type: '指导原则', code: '2021 年第 28 号',
      issuer: '国家药品监督管理局', effective: '2021-09-01',
      summary: '规范临床评价路径、同品种比对与可比器械选择的要求。',
      articles: [
        { no: '四（二）', text: '通过同品种医疗器械临床数据进行分析评价的，应当说明可比器械的选择依据，并从结构组成、性能要求、适用范围等方面进行可比性分析。' }
      ]
    },
    {
      id: 'reg', title: '医疗器械注册申报资料要求', type: '规范性文件', code: '2021 年第 121 号',
      issuer: '国家药品监督管理局', effective: '2021-10-01',
      summary: '规定注册申报资料的目录结构及同一信息在不同资料间的一致性要求。',
      articles: [
        { no: '三（一）', text: '注册申报资料应当按照申报资料目录组织，同一信息在申请表、产品技术要求、说明书等资料中应当保持一致。' }
      ]
    },
    {
      id: 'bio', title: 'GB/T 16886.1 医疗器械生物学评价 第 1 部分：风险管理过程中的评价与试验',
      type: '国家标准', code: 'GB/T 16886.1-2022', issuer: '国家标准化管理委员会', effective: '2023-05-01',
      summary: '规定生物学评价的基本原则、评价项目与试验选择。',
      articles: [
        { no: '4', text: '医疗器械生物学评价应当根据产品与人体接触的性质和时限，确定评价项目，必要时开展细胞毒性、致敏、刺激等试验。' }
      ]
    },
    {
      id: 'yy', title: 'YY/T 0681.1 无菌医疗器械包装试验方法 第 1 部分：加速老化试验指南',
      type: '行业标准', code: 'YY/T 0681.1-2018', issuer: '国家药品监督管理局', effective: '2019-07-01',
      summary: '规定无菌屏障系统加速老化的试验条件与推算方法。',
      articles: [
        { no: '5.5', text: '无菌屏障系统加速老化试验应当规定老化温度、时间及推算方法，并在老化后验证包装完整性与无菌屏障性能。' }
      ]
    }
  ];

  /* 规则 → 依据条款（v8：依据要做成可跳转链接，不再只给一个名称） */
  var RULE_CITES = {
    'REG-说明书-004': [['ifu', '第九条'], ['tech', '三（二）'], ['reg', '三（一）']],
    'REG-说明书-006': [['tech', '二（二）'], ['reg', '三（一）'], ['ifu', '第九条']],
    'REG-标签-003': [['ifu', '第十条'], ['ifu', '第十一条']],
    'REG-技术要求-009': [['tech', '三（四）'], ['tech', '三（二）']],
    'REG-技术要求-021': [['stab', '三'], ['yy', '5.5'], ['tech', '三（四）']],
    'REG-技术要求-017': [['tech', '二（二）'], ['reg', '三（一）'], ['ifu', '第九条']],
    'REG-一致性-002': [['reg', '三（一）'], ['stab', '二'], ['tech', '二（二）']],
    'REG-临床-006': [['clin', '四（二）'], ['reg', '三（一）']],
    'REG-非临床-018': [['stab', '二'], ['stab', '三'], ['yy', '5.5']],
    'REG-技术要求-031': [['tech', '三（二）'], ['tech', '三（四）']],
    'REG-说明书-011': [['ifu', '第十一条'], ['ifu', '第九条']],
    'REG-申请表-001': [['reg', '三（一）'], ['tech', '二（二）']],
    'REG-非临床-012': [['bio', '4'], ['reg', '三（一）']]
  };
  /* 每条规则的历史采纳率：近 N 次命中中有 M 次被审评员采纳 */
  var RULE_ADOPT = {
    'REG-说明书-004': [9, 12], 'REG-说明书-006': [7, 11], 'REG-标签-003': [6, 12],
    'REG-技术要求-009': [10, 12], 'REG-技术要求-021': [5, 9], 'REG-技术要求-017': [8, 11],
    'REG-一致性-002': [11, 12], 'REG-临床-006': [4, 10], 'REG-非临床-018': [6, 9],
    'REG-技术要求-031': [3, 8], 'REG-申请表-001': [9, 12], 'REG-说明书-011': [2, 6],
    'REG-非临床-012': [7, 10]
  };
  RULES.forEach(function (r) {
    r.citations = RULE_CITES[r.id] || [];
    delete r.conf;           /* v8：删除置信度 */
    var hr = RULE_ADOPT[r.id] || [0, 0];
    r.hr = { a: hr[0], n: hr[1] };   /* v14：单条规则的历史采纳率 */
  });

  w.DATA = {
    STATUS: STATUS, SRC: SRC, ENUM: ENUM, DEVICE_CAT: DEVICE_CAT,
    CASES: CASES, READER: READER, DRAFT: DRAFT,
    AI_RULES: AI_RULES, AI_COMPARE: AI_COMPARE,
    HISTORY: HISTORY, RULES: RULES, LAWS: LAWS,
    /* v5 */
    FLOW_STEPS: FLOW_STEPS, RPS_DIRS: RPS_DIRS, DOCS: DOCS,
    dirText: dirText, mkFlow: mkFlow, flowOf: flowOf, stepDone: stepDone,
    saveCase: saveCase, removeCase: removeCase, saveFlow: saveFlow,
    clearDemo: clearDemo, nextAcceptNo: nextAcceptNo
  };
})(window);
