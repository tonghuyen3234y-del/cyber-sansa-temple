import { create, insertMultiple, search } from '@orama/orama';

export const knowledge = [
  { title: '四圣谛', keywords: ['四谛', '四圣谛', '苦谛', '集谛', '灭谛', '道谛'],
    text: '四圣谛依次是苦、集、灭、道。它们讨论不圆满的经验、经验生起的条件、这些条件止息的可能，以及通向止息的修习路径。',
    source: '《转法轮经》SN 56.11', url: 'https://suttacentral.net/sn56.11' },
  { title: '无常', keywords: ['无常', '变化', '生灭', '执著', '执着', '放下'],
    text: '无常指因缘和合的事物会变化。从日常经验理解，心情、处境与念头都在变动。留意变化有助于减少把某个片刻当成永久状态的冲动。',
    source: '《法句经》第277偈', url: 'https://suttacentral.net/dhp273-289' },
  { title: '慈心', keywords: ['慈悲', '慈心', '善意', '慈爱'],
    text: '慈心练习关心自己和他人的安稳。可以先从熟悉的人开始，再把这份愿望逐渐扩展到更广的范围。',
    source: '《慈经》Snp 1.8', url: 'https://suttacentral.net/snp1.8' },
  { title: '观察呼吸', keywords: ['禅修', '呼吸', '观息', '冥想', '打坐', '正念'],
    text: '可以坐稳、放松肩膀，觉察呼吸的自然进出。走神时轻轻回到呼吸，不必改变速度。寺内的短练习可从三次自然呼吸开始。',
    source: '《入出息念经》MN 118', url: 'https://suttacentral.net/mn118' },
  { title: '念珠与礼佛', keywords: ['念珠', '108', '木鱼', '礼佛', '合掌', '坐垫', '法堂'],
    text: '在本寺的数字体验里，念珠每拨一颗计一次，一圈为 108 次。合掌用于问候，礼佛从坐垫上开始。宗教仪轨会随传统而异。',
    source: '赛博山寺体验说明' },
  { title: '缘起', keywords: ['缘起', '因缘', '因果'],
    text: '缘起关注现象如何在多种条件下生起，也如何随着条件改变而变化。理解缘起可以从观察一件小事依赖了哪些条件入手。',
    source: '《缘起分别经》SN 12.2', url: 'https://suttacentral.net/sn12.2' },
  { title: '八正道', keywords: ['八正道', '正见', '正思惟', '正语', '正念', '正定'],
    text: '八正道包括正见、正思惟、正语、正业、正命、正精进、正念和正定。这八项一起涵盖理解、行为与修习。日常可以从留意说话是否真实、合宜开始。',
    source: '《道分别经》SN 45.8', url: 'https://suttacentral.net/sn45.8/en/sujato' },
  { title: '中道', keywords: ['中道', '两种极端', '苦行', '纵欲', '中间道路'],
    text: '《转法轮经》所说的中道避开纵情享乐与自我折磨两端，并以八正道说明修习方向。它不单指在任意两种选择之间折中。',
    source: '《转法轮经》SN 56.11', url: 'https://suttacentral.net/sn56.11/en/sujato' },
  { title: '无我', keywords: ['无我', '五蕴', '色受想行识', '自我', '非我'],
    text: '经典以色、受、想、行、识为观察对象，提醒人们这些经验会变化，也不能完全由自己支配，因此不适宜执取为固定不变的我。',
    source: '《无我相经》SN 22.59', url: 'https://suttacentral.net/sn22.59/en/sujato' },
  { title: '两支箭', keywords: ['两支箭', '第二支箭', '二箭', '反复责备', '自责', '痛苦'],
    text: '两箭譬喻区分直接遇到的不适与随之增加的心理苦受。痛苦真实存在。日常反思时，可以试着区分已经发生的事和随后不断加上的自责。',
    source: '《箭经》SN 36.6', url: 'https://suttacentral.net/sn36.6/en/sujato' },
  { title: '业与意图', keywords: ['业力', '业报', '业与意图', '善业', '造业', '意图', '宿命'],
    text: '佛典讨论业时强调有意图的行为。理解这一点有助于把注意力放回当下可以选择的行动，不能用来判定某人为什么遭遇不幸。',
    source: '《洞察经》AN 6.63', url: 'https://suttacentral.net/an6.63/en/sujato' },
  { title: '善友', keywords: ['善友', '善知识', '修行伙伴', '修习伙伴'],
    text: '善友在佛教修习中有重要作用。可靠的同行者能够提供提醒、互相支持，也让人看见自己容易忽略的地方。',
    source: '《半经》SN 45.2', url: 'https://suttacentral.net/sn45.2/en/sujato' },
];

const segmenter = new Intl.Segmenter('zh', { granularity: 'word' });
const generic = new Set(['什么', '怎么', '如何', '可以', '理解', '请问', '介绍', '区别', '一下', '佛教', '佛学', '修行', '日常', '时候']);
const phrases = [...new Set(knowledge.flatMap(entry => entry.keywords))];

function tokenize(raw) {
  const text = raw.normalize('NFKC').toLowerCase();
  const terms = [...segmenter.segment(text)]
    .filter(part => part.isWordLike && part.segment.length >= 2 && !generic.has(part.segment))
    .map(part => part.segment);
  return [...new Set([...terms, ...phrases.filter(phrase => text.includes(phrase))])];
}

const index = create({
  schema: { title: 'string', aliases: 'string', text: 'string' },
  components: { tokenizer: { language: 'chinese', normalizationCache: new Map(), tokenize } },
});
insertMultiple(index, knowledge.map((entry, id) => ({
  id: String(id), title: entry.title, aliases: entry.keywords.join(' '), text: entry.text,
})));

export async function retrieve(question, recent = []) {
  const followUp = /刚才|前面|这段|这句|这一点|继续|举例|具体一点|^为什么|^那/.test(question);
  const query = followUp && recent.length ? [question, recent[0]].join(' ') : question;
  if (!tokenize(query).length) return [];
  const result = await search(index, {
    term: query, limit: 3, threshold: 1, tolerance: 0,
    boost: { title: 4, aliases: 3, text: 0.45 },
  });
  return result.hits.map(hit => knowledge[Number(hit.id)]);
}
