/**
 * Relic Data and Properties
 * Source of truth for all possible relic property values and relic collections
 * Generated from: 黑夜君临 - 遗物词条.csv, relics.csv, depth_relics.csv
 */

import { 
  RelicProperties, 
  RelicColor, 
  NormalEffect, 
  DepthPositiveEffect, 
  DepthNegativeEffect,
  NormalRelic,
  DepthRelic,
  RelicCollection,
  Nightfarer,
  Vessel,
  Slot,
  SlotColor,
  Relic,
  canEquipRelic
} from '../types/relicProperties';

// All possible relic colors
export const RELIC_COLORS: RelicColor[] = [
  '黄', '红', '绿', '蓝'
];

// All possible slot colors (including universal)
export const SLOT_COLORS: SlotColor[] = [
  '黄', '红', '绿', '蓝', '全'
];

// All nightfarers
export const NIGHTFARERS: Nightfarer[] = [
  '追踪者', '守护者', '铁眼', '女爵', '无赖', '复仇者', '隐士', '执行者'
];

// All possible normal effects (普通遗物词条)
export const NORMAL_EFFECTS: NormalEffect[] = [
  '生命力＋１', '生命力＋２', '生命力＋３', '提升血量上限',
  '集中力＋１', '集中力＋２', '集中力＋３', '提升专注值上限',
  '耐力＋１', '耐力＋２', '耐力＋３', '提升精力上限',
  '力气＋１', '力气＋２', '力气＋３',
  '灵巧＋１', '灵巧＋２', '灵巧＋３',
  '智力＋１', '智力＋２', '智力＋３',
  '信仰＋１', '信仰＋２', '信仰＋３',
  '感应＋１', '感应＋２', '感应＋３',
  '缩短技艺的冷却时间＋１', '缩短技艺的冷却时间＋２', '缩短技艺的冷却时间＋３',
  '加快累积绝招量表＋１', '加快累积绝招量表＋２', '加快累积绝招量表＋３',
  '强韧度＋１', '强韧度＋２', '强韧度＋３',
  '提升物理攻击力', '提升物理攻击力＋１', '提升物理攻击力＋２', '提升物理攻击力＋３',
  '提升魔力属性攻击力', '提升魔力属性攻击力＋１', '提升魔力属性攻击力＋２',
  '提升火属性攻击力', '提升火属性攻击力＋１', '提升火属性攻击力＋２',
  '提升雷属性攻击力', '提升雷属性攻击力＋１', '提升雷属性攻击力＋２',
  '提升圣属性攻击力', '提升圣属性攻击力＋１', '提升圣属性攻击力＋２',
  '附加异常状态中毒的效果', '附加异常状态中毒的效果＋１', '附加异常状态中毒的效果＋２',
  '附加异常状态出血的效果', '附加异常状态出血的效果＋１', '附加异常状态出血的效果＋２',
  '附加异常状态催眠的效果', '附加异常状态催眠的效果＋１', '附加异常状态催眠的效果＋２', '附加异常状态催眠的效果＋３',
  '附加异常状态死亡的效果',
  '附加异常状态猩红腐败的效果', '附加异常状态猩红腐败的效果＋１', '附加异常状态猩红腐败的效果＋２',
  '附加异常状态冻伤的效果', '附加异常状态冻伤的效果＋１', '附加异常状态冻伤的效果＋２', '附加异常状态冻伤的效果＋３',
  '附加异常状态发狂的效果',
  '提升魔力属性减伤率', '提升火属性减伤率', '提升雷属性减伤率', '提升圣属性减伤率',
  '提升对中毒的抵抗力', '提升对出血的抵抗力', '提升对催眠的抵抗力',
  '提升对骤死的抵抗力', '提升对猩红腐败的抵抗力', '提升对冻伤的抵抗力', '提升对发狂的抵抗力',
  '受到损伤的当下，能通过攻击恢复部分血量',
  '提升双手共持时，造成失去平衡的能力', '提升双手各持时，造成失去平衡的能力',
  '【守护者】提升技艺的有效距离',
  '使用圣杯瓶时，连同恢复周围我方人物',
  '【追踪者】发动绝招时，能燃起火焰、蔓延周围',
  '【女爵】以短剑使出连续攻击时，能对着周围的敌人，再次上演最近做过的行动',
  '【无赖】提升技艺伤害，但降低技艺发动期间的减伤率',
  '【复仇者】发动绝招时，能以自己的血量为代价完全恢复周围我方人物的血量',
  '【守护者】延长技艺的有效时间',
  '【守护者】发动绝招时，能提升周围我方人物的减伤率',
  '【复仇者】发动绝招时，能引发灵火爆炸',
  '【守护者】发动技艺时，能恢复周围我方人物的血量',
  '【追踪者】技艺会附加引发异常状态出血的效果',
  '【守护者】以戟蓄力攻击时，能引发旋风',
  '【执行者】在绝招发动期间，能以咆哮恢复血量',
  '【守护者】技艺会附加圣属性攻击力',
  '【守护者】发动绝招时，能缓慢恢复周围我方人物的血量',
  '血量偏低时，包含周围我方人物缓慢恢复血量',
  '血量偏低时，能提升减伤率',
  '重攻击时，能朝周围引发热浪',
  '跳跃时，能触发多颗魔法球',
  '周围有我方人物时，能提升攻击力',
  '防御反击时，能形成光柱',
  '【追踪者】发动技艺时，能使出追加攻击(仅限大剑)',
  '身在图腾碑石周围时，能提升强韧度',
  '食用苔药等等道具时，能恢复血量',
  '【追踪者】发动绝招后，能提升攻击力与精力上限，但降低减伤率',
  '防御成功时，能累积绝招量表',
  '防御时，变得容易被敌人攻击',
  '使出致命一击时，加快累积绝招量表',
  '涂抹油脂类道具时，能额外提升物理攻击力',
  '【复仇者】发动绝招时，能强化家人与我方人物',
  '【无赖】在技艺发动期间，受到攻击时能提升攻击力与精力上限',
  '【追踪者】缩短技艺的冷却时间',
  '连续防御成功时，能提升防御强度、弹开强力攻击',
  '防御成功时，能释放冲击波',
  '【女爵】从背后使出致命一击后，自己的身影会变得难以辨识，并消除脚步声',
  '使出致命一击时，能获得卢恩',
  '受到攻击时，能提升攻击力',
  '【追踪者】发动技艺时，能提升攻击力',
  '【追踪者】发动能力时，能累积绝招量表',
  '【女爵】在绝招发动期间，打倒敌人时能提升攻击力',
  '【隐士】收集属性痕时，能触发“魔法之境”',
  '【隐士】发动绝招时，自己陷入异常状态出血，提升攻击力',
  '【追踪者】发动能力时，能提升攻击力',
  '【追踪者】技艺的使用次数＋１',
  '【守护者】在能力发动期间，会变得容易受敌人攻击',
  '【守护者】在能力发动期间，防御成功时能形成冲击波',
  '【女爵】延长绝招的有效时间',
  '以特大武器蓄力攻击时，岩石会攀附在武器上',
  '【无赖】在发动技艺的最后攻击时，能永久性提升攻击力',
  '【隐士】延长鲜血烙印的有效时间',
  '【隐士】收集四种属性痕时，能提升属性攻击力',
  '【隐士】发动绝招时，能提升血量上限',
  '【执行者】在绝招发动期间，能提升攻击力',
  '【执行者】强化能力的效果，但降低对异常状态的抵抗力',
  '【执行者】提升技艺发动期间的攻击力，但攻击时会减少血量',
  '【执行者】在技艺发动期间，妖刀进入解放状态时，能恢复血量',
  '【铁之眼】蓄力发动绝招时，附加异常状态中毒',
  '【铁之眼】发动绝招后，强化突刺反击',
  '使出火属性的致命一击时，能提升精力上限',
  '使出致命一击时，能恢复血量',
  '使出致命一击时，能附加雷属性攻击力',
  '使出致命一击时，能提升精力的恢复速度',
  '连续防御成功时，能硬化自身',
  '使出致命一击时，能形成催眠烟雾',
  '通过肢体动作“盘腿坐”，能累积发狂量表',
  '引发异常状态发狂后，能持续恢复专注值',
  '急速冲刺期间落地时，能造成地面裂开',
  '切换武器时，能附加随机的属性攻击力',
  '附加属性攻击力时，能提升属性攻击力',
  '切换武器时，能提升物理攻击力',
  '防御成功时，恢复血量',
  '强化轻攻击的第一记攻击',
  '强化防御反击',
  '强化致命一击',
  '强化致命一击＋１ (爵的黑夜)',
  '强化致命一击＋１',
  '提升投掷壶的攻击力',
  '提升投掷小刀的攻击力',
  '提升使用辉石，重力石道具的攻击力',
  '强化咆哮与吐息',
  '强化调香术',
  '强化挖石的魔法',
  '强化卡利亚剑的魔法',
  '强化辉剑的魔法',
  '强化隐形的魔法',
  '强化结晶人的魔法',
  '强化重力的魔法',
  '强化荆棘的魔法',
  '强化黑夜的魔法',
  '强化黄金律法基本主义的祷告',
  '强化王城古龙信仰的祷告',
  '强化巨人火焰的祷告',
  '强化狩猎神祇的祷告',
  '强化野兽的祷告',
  '强化癫火的祷告',
  '强化龙飨的祷告',
  '不包含自己，提升周围我方人物的精力恢复速度',
  '道具效用能扩及我方人物',
  '每次打倒封印监牢里的囚犯，能永久性提升攻击力',
  '每次解开魔法师塔的机关，能永久性提升专注值上限',
  '每次打倒黑夜入侵者，能提升攻击力',
  '能显示地图上隐藏宝藏的位置',
  '装备三把以上类别为短剑的武器，能提升攻击力',
  '装备三把以上类别为直剑的武器，能提升攻击力',
  '装备三把以上类别为大剑的武器，能提升攻击力',
  '装备三把以上类别为特大剑的武器，能提升攻击力',
  '装备三把以上类别为曲剑的武器，能提升攻击力',
  '装备三把以上类别为大曲剑的武器，能提升攻击力',
  '装备三把以上类别为刀的武器，能提升攻击力',
  '装备三把以上类别为双头剑的武器，能提升攻击力',
  '装备三把以上类别为刺剑的武器，能提升攻击力',
  '装备三把以上类别为重刺剑的武器，能提升攻击力',
  '装备三把以上类别为斧的武器，能提升攻击力',
  '装备三把以上类别为大斧的武器，能提升攻击力',
  '装备三把以上类别为槌的武器，能提升攻击力',
  '装备三把以上类别为大槌的武器，能提升攻击力',
  '装备三把以上类别为连枷的武器，能提升攻击力',
  '装备三把以上类别为矛的武器，能提升攻击力',
  '装备三把以上类别为大矛的武器，能提升攻击力',
  '装备三把以上类别为戟的武器，能提升攻击力',
  '装备三把以上类别为镰刀的武器，能提升攻击力',
  '装备三把以上类别为拳头的武器，能提升攻击力',
  '装备三把以上类别为钩爪的武器，能提升攻击力',
  '装备三把以上类别为软鞭的武器，能提升攻击力',
  '装备三把以上类别为特大武器的武器，能提升攻击力',
  '装备三把以上类别为弓的武器，能提升攻击力',
  '装备三把以上类别为手杖的武器，能提升专注值上限',
  '装备三把以上类别为圣印记的武器，能提升专注值上限',
  '装备三把以上类别为小盾的武器，能提升血量上限',
  '装备三把以上类别为中盾的武器，能提升血量上限',
  '装备三把以上类别为大盾的武器，能提升血量上限',
  '提升打倒敌人时，绝招量表的累积量',
  '打倒敌人时，除了自己恢复周围我方人物的血量',
  '在图腾碑石周围打倒敌人时，能恢复血量',
  '对陷入中毒的敌人，使出致命一击时，能给予大伤害',
  '攻击命中时，能恢复精力',
  '攻击命中时，能恢复精力＋１ (野兽的黑夜)',
  '攻击命中时，能恢复精力＋１',
  '增加自己与我方人物获得的卢恩',
  '出击时的武器，附加魔力属性攻击力',
  '出击时的武器，附加火属性攻击力',
  '出击时的武器，附加火属性攻击力＋１',
  '出击时的武器，附加雷属性攻击力',
  '出击时的武器，附加圣属性攻击力',
  '出击时的武器，附加异常状态冻伤',
  '出击时的武器，附加异常状态中毒',
  '出击时的武器，附加异常状态出血',
  '出击时的武器，附加异常状态猩红腐败',
  '出击时，会持有“石剑钥匙”',
  '出击时，会持有“小型随身包包”',
  '出击时，会持有“火焰壶”',
  '出击时，会持有“魔力壶”',
  '出击时，会持有“雷电壶”',
  '出击时，会持有“圣水壶”',
  '出击时，会持有“兽骨毒飞刀”',
  '出击时，会持有“结晶飞刀”',
  '出击时，会持有“投掷匕首”',
  '出击时，会持有“崩裂辉石”',
  '出击时，会持有“块状重力石”',
  '出击时，会持有“魅惑树枝”',
  '出击时，会持有“召咒魂铃”',
  '出击时，会持有“火油脂”',
  '出击时，会持有“魔力油脂”',
  '出击时，会持有“雷油脂”',
  '出击时，会持有“圣油脂”',
  '出击时，会持有“坚盾油脂”',
  '出击时，武器战技改为“辉剑圆阵”',
  '出击时，武器战技改为“重力”',
  '出击时，武器战技改为“炎击”',
  '出击时，武器战技改为“熔岩火浆”',
  '出击时，武器战技改为“落雷”',
  '出击时，武器战技改为“雷击斩”',
  '出击时，武器战技改为“神圣刀刃”',
  '出击时，武器战技改为“祈祷一击”',
  '出击时，武器战技改为“毒雾”',
  '出击时，武器战技改为“双吻毒蛾”',
  '出击时，武器战技改为“血刃”',
  '出击时，武器战技改为“切腹”',
  '出击时，武器战技改为“寒气冻雾”',
  '出击时，武器战技改为“冻霜踏地”',
  '出击时，武器战技改为“白影诱惑”',
  '出击时，武器战技改为“忍耐”',
  '出击时，武器战技改为“碎步”',
  '出击时，武器战技改为“风暴足”',
  '出击时，武器战技改为“决心”',
  '出击时，武器战技改为“箭雨”',
  '出击时，会持有星光碎片',
  '防御反击成功时，能依照自己目前的血量提升伤害',
  '突刺反击成功时，能恢复血量',
  '头部射击时，能恢复血量',
  '头部射击时，能提升让敌人失去平衡的能力',
  '【复仇者】与家人并肩战斗期间，能强化自身',
  '在出击期间，减少于商店购物时所需的卢恩',
  '在出击期间，大幅减少于商店购物时所需的卢恩',
  '受到损伤并被弹飞时，能提升强韧度与减伤率',
  '对陷入中毒的敌人，能强化攻击',
  '对陷入催眠的敌人，能强化攻击',
  '对陷入猩红腐败的敌人，能强化攻击',
  '对陷入冻伤的敌人，能强化攻击',
  '对陷入催眠的敌人，能通过攻击引发魔力爆炸',
  '周围人物陷入异常状态冻伤时，能隐藏自己的身影',
  '周围人物陷入中毒、腐败时，能提升攻击力',
  '周围人物陷入中毒、腐败时，能提升攻击力 (智的黑夜)',
  '【铁之眼】技艺的使用次数＋１',
  '【铁之眼】延长弱点显露的时间',
  '【女爵】提升技艺造成的伤害',
  '【女爵】发动技艺时，能催眠敌人',
  '【无赖】延长绝招的有效时间',
  '【复仇者】提升能力的发动机率',
  '提升短剑的攻击力',
  '提升直剑的攻击力',
  '提升大剑的攻击力',
  '提升特大剑的攻击力',
  '提升曲剑的攻击力',
  '提升大曲剑的攻击力',
  '提升刀的攻击力',
  '提升双头剑的攻击力',
  '提升刺剑的攻击力',
  '提升重刺剑的攻击力',
  '提升斧的攻击力',
  '提升大斧的攻击力',
  '提升槌的攻击力',
  '提升大槌的攻击力',
  '提升连枷的攻击力',
  '提升矛的攻击力',
  '提升长矛的攻击力',
  '提升大矛的攻击力',
  '提升戟的攻击力',
  '提升镰刀的攻击力',
  '提升拳头的攻击力',
  '提升钩爪的攻击力',
  '提升软鞭的攻击力',
  '提升特大武器的攻击力',
  '提升弓的攻击力',
  '以短剑攻击时，恢复血量',
  '以直剑攻击时，恢复血量',
  '以大剑攻击时，恢复血量',
  '以特大剑攻击时，恢复血量',
  '以曲剑攻击时，恢复血量',
  '以大曲剑攻击时，恢复血量',
  '以刀攻击时，恢复血量',
  '以双头剑攻击时，恢复血量',
  '以刺剑攻击时，恢复血量',
  '以重刺剑攻击时，恢复血量',
  '以斧攻击时，恢复血量',
  '以大斧攻击时，恢复血量',
  '以槌攻击时，恢复血量',
  '以大槌攻击时，恢复血量',
  '以连枷攻击时，恢复血量',
  '以矛攻击时，恢复血量',
  '以长矛攻击时，恢复血量',
  '以大矛攻击时，恢复血量',
  '以戟攻击时，恢复血量',
  '以镰刀攻击时，恢复血量',
  '以拳头攻击时，恢复血量',
  '以钩爪攻击时，恢复血量',
  '以软鞭攻击时，恢复血量',
  '以特大武器攻击时，恢复血量',
  '以弓攻击时，恢复血量',
  '以短剑攻击时，恢复专注值',
  '以直剑攻击时，恢复专注值',
  '以大剑攻击时，恢复专注值',
  '以特大剑攻击时，恢复专注值',
  '以曲剑攻击时，恢复专注值',
  '以大曲剑攻击时，恢复专注值',
  '以刀攻击时，恢复专注值',
  '以双头剑攻击时，恢复专注值',
  '以刺剑攻击时，恢复专注值',
  '以重刺剑攻击时，恢复专注值',
  '以斧攻击时，恢复专注值',
  '以大斧攻击时，恢复专注值',
  '以槌攻击时，恢复专注值',
  '以大槌攻击时，恢复专注值',
  '以连枷攻击时，恢复专注值',
  '以矛攻击时，恢复专注值',
  '以长矛攻击时，恢复专注值',
  '以大矛攻击时，恢复专注值',
  '以戟攻击时，恢复专注值',
  '以镰刀攻击时，恢复专注值',
  '以拳头攻击时，恢复专注值',
  '以钩爪攻击时，恢复专注值',
  '以软鞭攻击时，恢复专注值',
  '以特大武器攻击时，恢复专注值',
  '以弓攻击时，恢复专注值',
  '持续恢复血量',
  '连续攻击时，恢复专注值',
  '提升物理减伤率'
];

// All possible depth positive effects (深夜遗物正面词条) - includes both normal and depth-exclusive effects
export const DEPTH_POSITIVE_EFFECTS: DepthPositiveEffect[] = [
  ...NORMAL_EFFECTS, // Normal effects can also appear in depth relics
  // Additional depth-exclusive positive effects
  '缩短技艺的冷却时间＋４', '缩短技艺的冷却时间＋５',
  '加快累积绝招量表＋４', '加快累积绝招量表＋５',
  '强韧度＋４', '强韧度＋５',
  '提升物理攻击力＋３', '提升物理攻击力＋４',
  '提升魔力属性攻击力＋３', '提升魔力属性攻击力＋４',
  '提升火属性攻击力＋３', '提升火属性攻击力＋４',
  '提升雷属性攻击力＋３', '提升雷属性攻击力＋４',
  '提升圣属性攻击力＋３', '提升圣属性攻击力＋４',
  '提升魔力属性减伤率＋１', '提升魔力属性减伤率＋２',
  '提升火属性减伤率＋１', '提升火属性减伤率＋２',
  '提升雷属性减伤率＋１', '提升雷属性减伤率＋２',
  '提升圣属性减伤率＋１', '提升圣属性减伤率＋２',
  '提升对中毒的抵抗力＋１', '提升对中毒的抵抗力＋２',
  '提升对出血的抵抗力＋１', '提升对出血的抵抗力＋２',
  '提升对催眠的抵抗力＋１', '提升对催眠的抵抗力＋２',
  '提升对骤死的抵抗力＋１', '提升对骤死的抵抗力＋２',
  '提升对腐败的抵抗力＋１', '提升对腐败的抵抗力＋２',
  '提升对冻伤的抵抗力＋１', '提升对冻伤的抵抗力＋２',
  '提升对发狂的抵抗力＋１', '提升对发狂的抵抗力＋２',
  '受到损伤的当下，能通过攻击恢复部分血量＋１', '受到损伤的当下，能通过攻击恢复部分血量＋２',
  '提升双手共持时，造成失去平衡的能力＋１', '提升双手共持时，造成失去平衡的能力＋２',
  '提升双手各持时，造成失去平衡的能力＋１', '提升双手各持时，造成失去平衡的能力＋２',
  '血量偏低时，提升减伤率＋１', '血量偏低时，提升减伤率＋２',
  '食用苔药等等道具时，能恢复血量＋１', '食用苔药等等道具时，能恢复血量＋２',
  '防御成功时，能累积绝招量表＋１', '防御成功时，能累积绝招量表＋２',
  '使出致命一击时，加快累积绝招量表＋１', '使出致命一击时，加快累积绝招量表＋２',
  '涂抹油脂类道具时，能额外提升物理攻击力＋１', '涂抹油脂类道具时，能额外提升物理攻击力＋２',
  '使出致命一击时，能获得卢恩＋１', '使出致命一击时，能获得卢恩＋２',
  '受到攻击时，能提升攻击力＋１', '受到攻击时，能提升攻击力＋２',
  '使出致命一击时，能提升精力的恢复速度＋１', '使出致命一击时，能提升精力的恢复速度＋２',
  '强化轻攻击的第一记攻击＋１', '强化轻攻击的第一记攻击＋２',
  '强化防御反击＋１', '强化防御反击＋２',
  '提升投掷壶的攻击力＋１', '提升投掷壶的攻击力＋２',
  '提升投掷小刀的攻击力＋１', '提升投掷小刀的攻击力＋２',
  '提升使用辉石、重力石道具的攻击力＋１', '提升使用辉石、重力石道具的攻击力＋２',
  '强化咆哮与吐息＋１', '强化咆哮与吐息＋２',
  '强化调香术＋１', '强化调香术＋２',
  '每次打倒大教堂的强敌，能提升血量上限',
  '每次打倒小型要塞的强敌，能增加获得的卢恩、提升观察力',
  '每次打倒遗迹的强敌，能提升感应',
  '每次打倒大型营地的强敌，能提升精力上限',
  '提升打倒敌人时，绝招量表的累积量＋１', '提升打倒敌人时，绝招量表的累积量＋２',
  '突刺反击成功时，能恢复血量＋１', '突刺反击成功时，能恢复血量＋２',
  '对陷入中毒的敌人，能强化攻击＋１', '对陷入中毒的敌人，能强化攻击＋２',
  '对陷入猩红腐败的敌人，能强化攻击＋１', '对陷入猩红腐败的敌人，能强化攻击＋２',
  '对陷入冻伤的敌人，能强化攻击＋１', '对陷入冻伤的敌人，能强化攻击＋２',
  '【追踪者】技艺会附加引发异常状态出血的效果',
  '【守护者】发动技艺时，能提升周围我方人物的减伤率',
  '【铁之眼】技艺会附加引发异常状态中毒的效果。对上陷入中毒的敌人，能给予大伤害',
  '【女爵】发动技艺时，能进入短暂无敌状态',
  '【无赖】技艺命中敌人时，能降低对方的攻击力',
  '【复仇者】发动能力时，能提升专注值上限',
  '【隐士】收集属性痕时，能提升该属性的减伤率',
  '【执行者】发动能力时，能缓慢恢复血量',
  '周围陷入催眠时，提升攻击力', '周围陷入催眠时，提升攻击力＋１', '周围陷入催眠时，提升攻击力＋２',
  '周围陷入发狂时，提升攻击力', '周围陷入发狂时，提升攻击力＋１', '周围陷入发狂时，提升攻击力＋２',
  '提升血量上限', '提升专注值上限', '提升精力上限',
  '减少专注值消耗', '减少专注值消耗＋１', '减少专注值消耗＋２',
  '提升属性攻击力', '提升属性攻击力＋１', '提升属性攻击力＋２',
  '提升物理减伤率', '提升物理减伤率＋１', '提升物理减伤率＋２',
  '提升属性减伤率', '提升属性减伤率＋１', '提升属性减伤率＋２',
  '强化魔法', '强化魔法＋１', '强化魔法＋２',
  '强化祷告', '强化祷告＋１', '强化祷告＋２',
  '提升圣杯瓶恢复量',
  '出击时，会持有漫红结晶露滴', '出击时，会持有红结晶露滴', '出击时，会持有蓝结晶露滴',
  '出击时，会持有斑斓硬露滴', '出击时，会持有红泡状露滴', '出击时，会持有珍珠泡状露滴',
  '出击时，会持有涌红结晶露滴', '出击时，会持有涌绿结晶露滴', '出击时，会持有珍珠硬露滴',
  '出击时，会持有连刺破露滴', '出击时，会持有大刺破露滴', '出击时，会持有风结晶露滴',
  '出击时，会持有爆裂结晶露滴', '出击时，会持有铅化硬露滴', '出击时，会持有细枝破露滴',
  '出击时，会持有红漩泡状露滴', '出击时，会持有蓝秘密露滴', '出击时，会持有岩刺破露滴',
  '出击时，会持有带火破露滴', '出击时，会持有带魔力破露滴', '出击时，会持有带雷破露滴',
  '出击时，会持有带圣破露滴', '出击时，会持有振奋香', '出击时，会持有火花香',
  '出击时，会持有铁壶香药', '出击时，会持有狂热香药', '出击时，会持有毒发喷雾',
  '出击时，会持有酸蚀喷雾',
  '通过潜在能力，能比较容易找到短剑', '通过潜在能力，能比较容易找到直剑', '通过潜在能力，能比较容易找到大剑',
  '通过潜在能力，能比较容易找到特大剑', '通过潜在能力，能比较容易找到曲剑', '通过潜在能力，能比较容易找到大曲剑',
  '通过潜在能力，能比较容易找到刀', '通过潜在能力，能比较容易找到双头剑', '通过潜在能力，能比较容易找到刺剑',
  '通过潜在能力，能比较容易找到重刺剑', '通过潜在能力，能比较容易找到斧', '通过潜在能力，能比较容易找到大斧',
  '通过潜在能力，能比较容易找到槌', '通过潜在能力，能比较容易找到大槌', '通过潜在能力，能比较容易找到连枷',
  '通过潜在能力，能比较容易找到矛', '通过潜在能力，能比较容易找到大矛', '通过潜在能力，能比较容易找到戟',
  '通过潜在能力，能比较容易找到镰刀', '通过潜在能力，能比较容易找到拳头', '通过潜在能力，能比较容易找到钩爪',
  '通过潜在能力，能比较容易找到软鞭', '通过潜在能力，能比较容易找到特大武器', '通过潜在能力，能比较容易找到弓',
  '通过潜在能力，能比较容易找到大弓', '通过潜在能力，能比较容易找到弩', '通过潜在能力，能比较容易找到弩炮',
  '通过潜在能力，能比较容易找到小盾', '通过潜在能力，能比较容易找到中盾', '通过潜在能力，能比较容易找到大盾',
  '通过潜在能力，能比较容易找到手杖', '通过潜在能力，能比较容易找到圣印记', '通过潜在能力，能比较容易找到火把',
  '【追踪者】提升集中力，但降低生命力',
  '【追踪者】提升智力、信仰，但降低力气、灵巧',
  '【守护者】提升力气、灵巧，但降低生命力',
  '【守护者】提升集中力、信仰，但降低生命力',
  '【铁之眼】提升感应，但降低灵巧',
  '【铁之眼】提升生命力、力气，但降低灵巧',
  '【女爵】提升生命力、力气，但降低集中力',
  '【女爵】提升集中力、信仰，但降低智力',
  '【无赖】提升集中力、智力，但降低生命力、耐力',
  '【无赖】提升感应，但降低生命力',
  '【复仇者】提升生命力、耐力，但降低集中力',
  '【复仇者】提升力气，但降低信仰',
  '【隐士】提升生命力、耐力、灵巧，但降低智力、信仰',
  '【隐士】提升智力、信仰，但降低集中力',
  '【执行者】提升生命力、耐力，但降低感应',
  '【执行者】提升灵巧、感应，但降低生命力'
];

// All possible depth negative effects (深夜遗物负面词条)
export const DEPTH_NEGATIVE_EFFECTS: DepthNegativeEffect[] = [
  '降低生命力', '降低耐力', '降低减伤率',
  '受到损伤时，会累积中毒量表', '受到损伤时，会累积猩红腐败量表', '受到损伤时，会累积冻伤量表',
  '受到损伤时，会累积出血量表', '受到损伤时，会累积发狂量表', '受到损伤时，会累积催眠量表',
  '受到损伤时，会累积死亡量表',
  '降低力气、智力', '降低灵巧、信仰', '降低智力、灵巧', '降低信仰、力气',
  '降低生命力、感应',
  '减少获得的卢恩', '降低圣杯瓶恢复量', '降低绝招量表累积', '降低物理减伤率',
  '降低属性减伤率', '降低对所有异常状态的抵抗力',
  '增加急速冲刺的精力消耗', '持续减少血量', '增加闪避时的精力消耗',
  '闪避后的当下，受伤时损伤加剧', '连续闪避时，降低减伤率',
  '使用圣杯瓶时，降低减伤率', '使用圣杯瓶时，累积催眠量表', '使用圣杯瓶时，累积发狂量表',
  '血量没有全满时，降低攻击力', '血量没有全满时，累积中毒量表', '血量没有全满时，累积猩红腐败量表',
  '血量全满时，降低攻击力', '濒死时，翻倒圣杯瓶', '濒死时，降低血量上限'
];

// Main relic properties data structure
export const RELIC_PROPERTIES: RelicProperties = {
  colors: RELIC_COLORS,
  normalEffects: NORMAL_EFFECTS,
  depthPositiveEffects: DEPTH_POSITIVE_EFFECTS,
  depthNegativeEffects: DEPTH_NEGATIVE_EFFECTS
};

// Utility functions for working with relic properties
export const getRelicProperties = (): RelicProperties => RELIC_PROPERTIES;

export const getColors = (): RelicColor[] => RELIC_COLORS;

export const getNormalEffects = (): NormalEffect[] => NORMAL_EFFECTS;

export const getDepthPositiveEffects = (): DepthPositiveEffect[] => DEPTH_POSITIVE_EFFECTS;

export const getDepthNegativeEffects = (): DepthNegativeEffect[] => DEPTH_NEGATIVE_EFFECTS;

// Validation functions
export const isValidColor = (color: string): color is RelicColor => {
  return RELIC_COLORS.includes(color as RelicColor);
};

export const isValidNormalEffect = (effect: string): effect is NormalEffect => {
  return NORMAL_EFFECTS.includes(effect as NormalEffect);
};

export const isValidDepthPositiveEffect = (effect: string): effect is DepthPositiveEffect => {
  return DEPTH_POSITIVE_EFFECTS.includes(effect as DepthPositiveEffect);
};

export const isValidDepthNegativeEffect = (effect: string): effect is DepthNegativeEffect => {
  return DEPTH_NEGATIVE_EFFECTS.includes(effect as DepthNegativeEffect);
};

// CSV parsing functions
export const parseNormalRelicFromCSV = (row: string[]): NormalRelic | null => {
  if (row.length < 4) return null;
  
  const [color, effect1, effect2, effect3] = row;
  
  if (!isValidColor(color) || !effect1 || !effect2 || !effect3) {
    return null;
  }
  
  return {
    color: color as RelicColor,
    effect1: effect1.trim(),
    effect2: effect2.trim(),
    effect3: effect3.trim()
  };
};

export const parseDepthRelicFromCSV = (row: string[]): DepthRelic | null => {
  if (row.length < 7) return null;
  
  const [color, pos1, neg1, pos2, neg2, pos3, neg3] = row;
  
  if (!isValidColor(color)) return null;
  
  return {
    color: color as RelicColor,
    positiveEffect1: pos1?.trim() || '',
    negativeEffect1: neg1?.trim() || '',
    positiveEffect2: pos2?.trim() || '',
    negativeEffect2: neg2?.trim() || '',
    positiveEffect3: pos3?.trim() || '',
    negativeEffect3: neg3?.trim() || ''
  };
};

// Helper function to parse CSV line properly handling commas within quoted fields
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    // Handle different types of quotation marks
    if ((char === '"' || char === '"' || char === '"') && !inQuotes) {
      inQuotes = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuotes) {
      inQuotes = false;
      quoteChar = '';
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last field
  result.push(current.trim());
  
  return result;
};

// Sample data parsing (you can replace this with actual CSV parsing)
export const parseRelicsFromCSV = (normalCSV: string, depthCSV: string): RelicCollection => {
  const normalRelics: NormalRelic[] = [];
  const depthRelics: DepthRelic[] = [];
  
  // Parse normal relics CSV - skip the mixed header/data row
  const normalLines = normalCSV.split('\n').slice(1); // Skip first line (mixed header/data)
  normalLines.forEach(line => {
    if (line.trim()) {
      const row = parseCSVLine(line);
      // Only take the first 4 columns for normal relics (color, effect1, effect2, effect3)
      const trimmedRow = row.slice(0, 4);
      const relic = parseNormalRelicFromCSV(trimmedRow);
      if (relic) normalRelics.push(relic);
    }
  });
  
  // Parse depth relics CSV - skip the mixed header/data row
  const depthLines = depthCSV.split('\n').slice(1); // Skip first line (mixed header/data)
  depthLines.forEach(line => {
    if (line.trim()) {
      const row = parseCSVLine(line);
      // Only take the first 7 columns for depth relics (color, pos1, neg1, pos2, neg2, pos3, neg3)
      const trimmedRow = row.slice(0, 7);
      const relic = parseDepthRelicFromCSV(trimmedRow);
      if (relic) depthRelics.push(relic);
    }
  });
  
  return { normalRelics, depthRelics };
};

// Vessel and slot creation functions
export const createSlot = (id: string, color: SlotColor, slotType: 'normal' | 'depth'): Slot => ({
  id,
  color,
  slotType,
  equippedRelic: undefined
});

export const createVessel = (id: string, name: string, slotColors: SlotColor[]): Vessel => {
  if (slotColors.length !== 6) {
    throw new Error('Vessel must have exactly 6 slots');
  }
  
  const slots: Slot[] = slotColors.map((color, index) => {
    const slotType = index < 3 ? 'normal' : 'depth';
    return createSlot(`${id}-slot-${index + 1}`, color, slotType);
  });
  
  return {
    id,
    name,
    slots
  };
};

// Vessels for each nightfarer
export const NIGHTFARER_VESSELS: Record<Nightfarer, Vessel[]> = {
  '追踪者': [
    createVessel('追踪者-vessel-1', '追踪者 容器 1', ['红', '红', '蓝', '红', '红', '蓝']),
    createVessel('追踪者-vessel-2', '追踪者 容器 2', ['黄', '绿', '绿', '黄', '绿', '绿']),
    createVessel('追踪者-vessel-3', '追踪者 容器 3', ['红', '黄', '全', '红', '蓝', '绿']),
    createVessel('追踪者-vessel-4', '追踪者 容器 4', ['蓝', '蓝', '黄', '蓝', '蓝', '黄']),
    createVessel('追踪者-vessel-5', '追踪者 容器 5', ['蓝', '红', '红', '绿', '黄', '黄']),
    createVessel('追踪者-vessel-6', '追踪者 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('追踪者-vessel-7', '追踪者 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('追踪者-vessel-8', '追踪者 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '守护者': [
    createVessel('守护者-vessel-1', '守护者 容器 1', ['红', '黄', '黄', '红', '黄', '黄']),
    createVessel('守护者-vessel-2', '守护者 容器 2', ['蓝', '蓝', '绿', '蓝', '蓝', '绿']),
    createVessel('守护者-vessel-3', '守护者 容器 3', ['蓝', '黄', '全', '红', '蓝', '黄']),
    createVessel('守护者-vessel-4', '守护者 容器 4', ['红', '绿', '绿', '红', '绿', '绿']),
    createVessel('守护者-vessel-5', '守护者 容器 5', ['黄', '黄', '红', '绿', '绿', '蓝']),
    createVessel('守护者-vessel-6', '守护者 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('守护者-vessel-7', '守护者 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('守护者-vessel-8', '守护者 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '铁眼': [
    createVessel('铁眼-vessel-1', '铁眼 容器 1', ['黄', '绿', '绿', '黄', '绿', '绿']),
    createVessel('铁眼-vessel-2', '铁眼 容器 2', ['红', '蓝', '黄', '红', '蓝', '黄']),
    createVessel('铁眼-vessel-3', '铁眼 容器 3', ['红', '绿', '全', '红', '红', '绿']),
    createVessel('铁眼-vessel-4', '铁眼 容器 4', ['蓝', '黄', '黄', '蓝', '黄', '黄']),
    createVessel('铁眼-vessel-5', '铁眼 容器 5', ['绿', '绿', '黄', '蓝', '蓝', '红']),
    createVessel('铁眼-vessel-6', '铁眼 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('铁眼-vessel-7', '铁眼 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('铁眼-vessel-8', '铁眼 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '女爵': [
    createVessel('女爵-vessel-1', '女爵 容器 1', ['红', '蓝', '蓝', '红', '蓝', '蓝']),
    createVessel('女爵-vessel-2', '女爵 容器 2', ['黄', '黄', '绿', '黄', '黄', '绿']),
    createVessel('女爵-vessel-3', '女爵 容器 3', ['蓝', '黄', '全', '红', '蓝', '黄']),
    createVessel('女爵-vessel-4', '女爵 容器 4', ['红', '红', '绿', '红', '红', '绿']),
    createVessel('女爵-vessel-5', '女爵 容器 5', ['蓝', '蓝', '红', '绿', '绿', '黄']),
    createVessel('女爵-vessel-6', '女爵 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('女爵-vessel-7', '女爵 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('女爵-vessel-8', '女爵 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '无赖': [
    createVessel('无赖-vessel-1', '无赖 容器 1', ['红', '绿', '绿', '红', '绿', '绿']),
    createVessel('无赖-vessel-2', '无赖 容器 2', ['红', '蓝', '黄', '红', '蓝', '黄']),
    createVessel('无赖-vessel-3', '无赖 容器 3', ['红', '红', '全', '红', '黄', '黄']),
    createVessel('无赖-vessel-4', '无赖 容器 4', ['蓝', '蓝', '绿', '蓝', '蓝', '绿']),
    createVessel('无赖-vessel-5', '无赖 容器 5', ['绿', '绿', '红', '黄', '蓝', '蓝']),
    createVessel('无赖-vessel-6', '无赖 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('无赖-vessel-7', '无赖 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('无赖-vessel-8', '无赖 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '复仇者': [
    createVessel('复仇者-vessel-1', '复仇者 容器 1', ['蓝', '蓝', '黄', '蓝', '蓝', '黄']),
    createVessel('复仇者-vessel-2', '复仇者 容器 2', ['红', '红', '绿', '红', '红', '绿']),
    createVessel('复仇者-vessel-3', '复仇者 容器 3', ['蓝', '绿', '全', '蓝', '黄', '绿']),
    createVessel('复仇者-vessel-4', '复仇者 容器 4', ['红', '黄', '黄', '红', '黄', '黄']),
    createVessel('复仇者-vessel-5', '复仇者 容器 5', ['黄', '蓝', '蓝', '绿', '绿', '红']),
    createVessel('复仇者-vessel-6', '复仇者 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('复仇者-vessel-7', '复仇者 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('复仇者-vessel-8', '复仇者 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '隐士': [
    createVessel('隐士-vessel-1', '隐士 容器 1', ['蓝', '蓝', '绿', '蓝', '蓝', '绿']),
    createVessel('隐士-vessel-2', '隐士 容器 2', ['红', '蓝', '黄', '红', '蓝', '黄']),
    createVessel('隐士-vessel-3', '隐士 容器 3', ['黄', '绿', '全', '蓝', '绿', '绿']),
    createVessel('隐士-vessel-4', '隐士 容器 4', ['红', '红', '黄', '红', '红', '黄']),
    createVessel('隐士-vessel-5', '隐士 容器 5', ['绿', '蓝', '蓝', '黄', '黄', '红']),
    createVessel('隐士-vessel-6', '隐士 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('隐士-vessel-7', '隐士 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('隐士-vessel-8', '隐士 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
  '执行者': [
    createVessel('执行者-vessel-1', '执行者 容器 1', ['红', '黄', '黄', '红', '黄', '黄']),
    createVessel('执行者-vessel-2', '执行者 容器 2', ['红', '蓝', '绿', '红', '蓝', '绿']),
    createVessel('执行者-vessel-3', '执行者 容器 3', ['蓝', '黄', '全', '黄', '黄', '绿']),
    createVessel('执行者-vessel-4', '执行者 容器 4', ['红', '红', '蓝', '红', '红', '蓝']),
    createVessel('执行者-vessel-5', '执行者 容器 5', ['黄', '黄', '红', '绿', '绿', '蓝']),
    createVessel('执行者-vessel-6', '执行者 容器 6', ['黄', '黄', '黄', '黄', '黄', '黄']),
    createVessel('执行者-vessel-7', '执行者 容器 7', ['绿', '绿', '绿', '绿', '绿', '绿']),
    createVessel('执行者-vessel-8', '执行者 容器 8', ['蓝', '蓝', '蓝', '蓝', '蓝', '蓝']),
  ],
};

// Utility functions for nightfarer data
export const getVesselsForNightfarer = (nightfarer: Nightfarer): Vessel[] => {
  return NIGHTFARER_VESSELS[nightfarer] || [];
};

export const getAllNightfarers = (): Nightfarer[] => {
  return NIGHTFARERS;
};

// Slot management functions
export const equipRelicToSlot = (slot: Slot, relic: Relic): boolean => {
  // Check if relic can be equipped to this slot
  if (!canEquipRelic(slot, relic)) {
    return false;
  }
  
  slot.equippedRelic = relic;
  return true;
};

export const unequipRelicFromSlot = (slot: Slot): Relic | undefined => {
  const relic = slot.equippedRelic;
  slot.equippedRelic = undefined;
  return relic;
};

export const getEquippedRelics = (vessel: Vessel): Relic[] => {
  return vessel.slots
    .map(slot => slot.equippedRelic)
    .filter((relic): relic is Relic => relic !== undefined);
};

export const getAvailableSlots = (vessel: Vessel, relic: Relic): Slot[] => {
  return vessel.slots.filter(slot => 
    !slot.equippedRelic && canEquipRelic(slot, relic)
  );
};