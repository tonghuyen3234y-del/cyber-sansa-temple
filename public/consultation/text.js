// 许愿树前后端共用的文本规则：分句、话题识别、心愿提炼、静语卡回退与读卡排版。
// 服务端用 node:module resolve hook 解析不带扩展名的导入，浏览器直接作为 ES 模块加载。

export const cardLines = 4;
export const cardLineMax = 24;
export const wishMax = 200;
export const nameMax = 8;
export const verseMax = 34;

export const themes = {
  love: { label: '情缘', note: '这一枝挂的是牵挂与相处' },
  family: { label: '亲缘', note: '这一枝挂的是家中的远近' },
  career: { label: '前程', note: '这一枝挂的是手里的事' },
  health: { label: '安身', note: '这一枝挂的是身体与歇息' },
  grief: { label: '别离', note: '这一枝挂的是失去与想念' },
  self: { label: '自心', note: '这一枝挂的是如何看待自己' },
  wish: { label: '祝愿', note: '这一枝挂的是还没发生的事' },
};

const keywords = [
  ['love', ['对象', '恋爱', '暗恋', '喜欢的人', '分手', '复合', '前任', '伴侣', '结婚', '表白', '暧昧',
    '陪我', '在一起', '错过', '想他', '想她', '爱我', '不爱', '离开我']],
  ['family', ['父母', '妈妈', '爸爸', '母亲', '父亲', '奶奶', '爷爷', '外婆', '外公', '孩子', '儿子', '女儿',
    '家人', '家里', '家庭', '兄弟', '姐妹', '婆婆', '老婆', '老公', '丈夫', '妻子', '亲人']],
  ['career', ['工作', '考试', '面试', '公司', '老板', '同事', '换工作', '辞职', '事业', '升职', '加薪',
    '项目', '毕业', '创业', '收入', '失业', '加班', 'offer', 'offer', '跳槽', '求职']],
  ['health', ['生病', '身体', '健康', '失眠', '睡不着', '焦虑', '抑郁', '疼', '医院', '手术', '康复',
    '疲惫', '累', '休息', '喘不过气', '喘不上气', '熬夜', '情绪', '撑不住', '活不下去', '不想活']],
  ['grief', ['去世', '离开人世', '走了', '过世', '想念', '思念', '葬礼', '永别', '来不及', '再也', '失去', '遗憾']],
  ['self', ['迷茫', '方向', '自己', '价值', '不够好', '自卑', '后悔', '自责', '原谅自己', '接纳',
    '意义', '孤独', '空落', '怎么办', '不知道该', '自卑', '勇气']],
  ['wish', ['希望', '祝愿', '一定', '顺利', '考上', '上岸', '成功', '发财', '中奖', '变好', '如愿', '平安']],
];

const crisisTerms = ['不想活', '活不下去', '想死', '自杀', '结束自己', '没有意义活下去', '伤害自己'];
const hotlines = '如果此刻很危险，请先联系身边的人，或拨打当地急救电话；在中国大陆可拨 12356 心理援助热线。';

const splitter = new Intl.Segmenter('zh', { granularity: 'word' });
const sentence = /[^，。；！？：、,.;!?:\n]+[，。；！？：、,.;!?]?/g;
const trailing = /[，。；！？：、,.;!?…\s]+$/;

export const words = {
  wish: ['心愿', '愿望', '想要', '希望能', '求', '愿', '盼望', '期待', '祝福', '想念', '害怕', '希望', '请你', '帮我',
    '让我', '保佑', '我想', '可以', '不要', '一定', '真的', '能够', '应该', '因为', '所以', '但是', '觉得'],
  other: ['我们', '他们', '她们', '什么', '这个', '那个', '怎么', '以后', '现在', '今天', '时间', '自己'],
  stop: ['的', '了', '在', '是', '和', '与', '就', '都', '也', '很', '还', '要', '我', '你', '他', '她', '它', '们',
    '之', '其', '而', '且', '或', '着', '过', '吧', '啊', '呢', '吗', '呀', '让', '被', '把', '给', '对', '从',
    '这', '那', '有', '没', '不', '会', '能', '想', '一', '个', '些', '点', '很', '太', '更', '最', '又', '再',
    '上', '下', '里', '中', '后', '前', '时', '到', '去', '来', '说', '做', '得', '地', '么', '怎', '是', '为'],
};

export function clampText(value, max) {
  const text = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  const points = [...text];
  return points.length > max ? points.slice(0, max).join('') : text;
}

export function tooLong(value, max) {
  return [...(typeof value === 'string' ? value.trim() : '')].length > max;
}

export function splitSentences(text) {
  return (text.match(sentence) || []).map(part => part.replace(trailing, '').trim()).filter(Boolean);
}

export function detectThemes(text) {
  const found = [];
  for (const [theme, list] of keywords) {
    if (list.some(word => text.includes(word))) found.push(theme);
  }
  return found.length ? found : ['wish'];
}

export function isCrisis(text) {
  return crisisTerms.some(term => text.includes(term));
}

function tokens(text) {
  const result = new Set();
  for (const part of splitter.segment(text)) {
    if (!part.isWordLike) continue;
    if (part.segment.length < 2 || words.stop.includes(part.segment)) continue;
    result.add(part.segment);
  }
  return result;
}

/**
 * 从心愿原文里挑出最像「自己的话」的一句，压缩到能刻在木牌上的长度。
 */
export function refineWish(text) {
  const clean = clampText(text, wishMax * 2);
  const parts = splitSentences(clean).map(part => part.replace(trailing, ''));
  if (!parts.length) return clampText(clean, wishMax);
  const score = part => {
    const value = [...part].length;
    if (value < 4) return -100;
    let total = 0;
    if (words.wish.some(word => part.includes(word))) total += 14;
    if (words.other.some(word => part.includes(word))) total += 4;
    if (value <= 20) total += 8;
    else if (value <= 30) total += 4;
    else if (value > 40) total -= 6;
    return total;
  };
  // 心愿的主句通常在最前，从句里常有「因为」「所以」。
  // 越靠前的分句权重越高：心愿的主句通常在最前，从句多带「因为」「可是」。
  const ranked = parts.map((part, index) => ({ part, index, value: score(part) - index * 8 }));
  const best = ranked.reduce((winner, entry) => (entry.value > winner.value ? entry : winner)).part;
  const leading = best.replace(/^(因为|所以|但是|可是|不过|然后)/, '');
  if ([...leading].length <= 24) return leading;
  // 太长时按逗号向前合并，保证句子从主句开头起算。
  const pieces = leading.split(/[，；、,;]/).map(part => part.trim()).filter(Boolean);
  let merged = pieces[0] ?? '';
  for (let count = 1; count < pieces.length; count++) {
    const next = merged + '，' + pieces[count];
    if ([...next].length > 24) break;
    merged = next;
  }
  return clampText(merged, wishMax);
}

const titleStop = new Set(['希望', '要是', '如果', '想要', '可以', '能够', '觉得', '时候', '然后', '已经', '一直', '真的',
  '就好', '能否', '什么', '怎么', '这样', '那样', '一点', '几点', '不了', '不过', '没有', '不要', '一份', '一个',
  '一件', '一些', '这种', '那种', '每个', '每天', '现在', '能', '会', '要']);
const tailVerses = ['叶自摇曳', '且听风过', '一叶知秋', '枝上清风', '落在心上', '皆是归处', '静待时节', '各自分明'];
const headVerses = ['心安处', '一念起', '风未息', '灯还亮着'];
const subjects = { love: '所念之人', family: '家中灯火', career: '手中之事', health: '此身此时', grief: '旧时音信', self: '此心此念' };

/**
 * 牌面题字：取心愿里最有分量的两到四个字。
 */
export function titleFor(text) {
  const clean = clampText(text, wishMax).replace(trailing, '');
  const list = [...splitter.segment(clean)]
    .filter(part => part.isWordLike && [...part.segment].length >= 2 && !words.stop.includes(part.segment) &&
      !words.other.includes(part.segment) && !titleStop.has(part.segment))
    .map(part => part.segment);
  // 优先取有实义的两字以上词，跳过「希望」「想要」这类虚词。
  const pick = list.find(word => !words.wish.includes(word));
  if (pick) return clampText(pick, 4);
  // 分词把句子切碎时（如「考上」被拆成单字），从原文里取最有分量的连续片段。
  const skip = new Set([...titleStop, ...words.wish,
    '的', '了', '着', '过', '吧', '呢', '吗', '啊', '呀', '和', '与', '就', '都', '也', '很', '还',
    '我', '你', '他', '她', '它', '们', '这', '那', '是', '在', '有', '没', '不', '会', '想']);
  const runs = [];
  let run = '';
  for (const char of [...clean]) {
    if (/[\u4e00-\u9fa5]/.test(char) && !skip.has(char)) run += char;
    else { if (run.length >= 2) runs.push(run); run = ''; }
  }
  if (run.length >= 2) runs.push(run);
  runs.sort((a, b) => b.length - a.length);
  if (runs.length) return clampText(runs[0], 4);
  // 实在没有两字片段，就取第一个非虚字。
  const single = [...clean].find(char => /[\u4e00-\u9fa5]/.test(char) && !skip.has(char));
  return single || '一念';
}

export function verseFor(text) {
  const clean = clampText(text, wishMax * 2);
  const parts = splitSentences(clean).map(part => part.replace(trailing, ''));
  const found = [...tokens(clean)].filter(word => !titleStop.has(word) && !words.stop.includes(word));
  const theme = detectThemes(clean)[0];
  const subject = subjects[theme] || '所许之愿';
  const value = hash(clean);
  const seed = clampText(parts[0] || found.join('') || '此念', 9).replace(/^[我你他她]\)?/, '');
  const candidates = [
    headVerses[value % headVerses.length] + '，' + tailVerses[(value >> 3) % tailVerses.length],
    subject + '，' + tailVerses[(value >> 5) % tailVerses.length],
    seed + '，' + tailVerses[(value >> 7) % tailVerses.length],
  ];
  return clampText(candidates.find(item => [...item].length >= 6 && [...item].length <= verseMax) || candidates[0], verseMax);
}

function softenThemes(list) {
  const set = list.filter(theme => themes[theme]);
  return set.length ? set : ['wish'];
}

const fallbacks = {
  love: [
    ['有些话说不出口，才会绕成别的样子。先把自己最想说的那一句理清楚，不急着要回应。',
      '如果只剩一个人在用力，也允许自己收回一点。喜欢不欠谁一个交代。'],
    ['牵挂久了会变成力气，也会变成疲惫。留一盏灯给自己，不必每条消息都等回音。'],
    ['在意一个人的时候，容易把对方的表情读成答案。慢慢来，先照顾好自己这一边。'],
  ],
  family: [
    ['家里的话常常绕成别的样子。先听一听对方想说的是什么，不急着分对错。',
      '能坐在一起吃一顿饭，已经是一件不起眼的好事。'],
    ['亲近的人不必天天挂念，但可以常常想起。想念本身也是一种照顾。'],
    ['你为家里担的这份心，已经很多年了。也可以留一点力气给自己。'],
  ],
  career: [
    ['把「一定要」换成「先做一件」。今天能推进的那一小步，比整条路都想清楚更有用。',
      '路常常是走出来的，不是想出来的。'],
    ['担心往后的日子时，先看看手里已经有什么。你拥有的那一部分，也许就是起点。'],
    ['事情多的时候，先挑一件做完。做完一件，心里的空地就会多一点。'],
  ],
  health: [
    ['身体先要照顾，心事才放得下。今晚早一点休息，明天再想那件想不通的事。',
      '允许自己慢一点，不是懈怠。'],
    ['撑了很久的人，常忘了自己也该被照顾。先从喝水、吃饭、睡一会儿开始。'],
    ['累的时候不必解释。安静地歇一歇，也是正经事。'],
  ],
  grief: [
    ['想念不必急着结束。那些留下来的习惯与语气，都是他还在的方式。',
      '难过的时候，就让难过待一会儿。'],
    ['来不及说的话，可以写在纸上。写下来不是为了放下，是让它有个去处。'],
  ],
  self: [
    ['你说自己不够好的时候，用的是谁的标准？先把那把尺放下一会儿，看看自己已经在做的事。',
      '此刻的你已经足够做一个普通人。'],
    ['迷茫不必马上解决。可以先看看那些一直让你安心的小事，从那里往回走。'],
    ['愿意说出这样的话，说明你还在试着理解自己。这已经不容易。'],
  ],
  wish: [
    ['愿望说出口的时候，你已经知道自己在意什么。先把在意的那件事放在心上，不急着看结果。',
      '能许愿，说明你还没有放弃期待。'],
    ['许愿不是交换，是把心里的话说给夜色听。说完之后，回到今天这一小步。'],
    ['这句话写下来，就已经有了分量。日子会照旧往前走，你可以按自己的速度跟上。'],
  ],
};

function hash(text) {
  let value = 0;
  for (const char of text) value = (value * 31 + char.codePointAt(0)) % 100000007;
  return value;
}

export function crisisCard(text) {
  return {
    mode: 'reference',
    verse: '先把灯留着',
    lines: [
      '读到这句话的时候，我很在意你现在的处境。',
      '这一次不必许愿，也不必撑着。',
      '请先把这件事告诉一个能马上找到你的人。',
      hotlines,
    ].map(line => clampText(line, cardLineMax * 2)).join('\n'),
    wish: clampText(text, wishMax),
  };
}

const padLines = [
  '不必急着让它有结果，先把今天这一小步走完。',
  '愿此刻的你，有一处可以歇脚的地方。',
  '这句话我记下了，日子会慢慢把它铺开。',
  '不必再向谁证明什么，你已经很用力了。',
  '风会过去，叶子还在。',
];

export function fallbackCard(text, topics = detectThemes(text)) {
  if (isCrisis(text)) return crisisCard(text);
  const wish = refineWish(text);
  const theme = softenThemes(topics)[0];
  const options = fallbacks[theme] || fallbacks.wish;
  const seed = hash(text);
  // 每一句都单独成行，长度接近时才接上下一句，避免长段挤成一行。
  const lines = ['「' + clampText(wish, 14) + '」，这句我收下了。'];
  const pools = [options[seed % options.length], options[(seed + 1) % options.length], padLines];
  for (const pool of pools) {
    for (const line of pool) {
      if (lines.length >= cardLines + 1) break;
      const previous = lines.at(-1);
      if (lines.length > 1 && [...previous].length < 11 && [...previous].length + [...line].length + 1 <= cardLineMax) {
        lines[lines.length - 1] = previous + '，' + line;
      } else lines.push(clampText(line, cardLineMax * 2));
    }
  }
  while (lines.length < cardLines + 1) lines.push(padLines[lines.length % padLines.length]);
  return {
    mode: 'reference',
    verse: verseFor(text),
    lines: lines.slice(0, cardLines + 1).map(line => clampText(line, cardLineMax * 2)).join('\n'),
    wish,
  };
}

function balanced(line) {
  const left = (line.match(/「/g) || []).length;
  const right = (line.match(/」/g) || []).length;
  const open = (line.match(/《|（|\(/g) || []).length;
  const close = (line.match(/》|）|\)/g) || []).length;
  return left === right && open === close;
}

/**
 * 把模型给出的整段文字按标点切成卡片行，尽量不拆句、不切断引号。
 */
export function layoutCard(text, limit = cardLines + 1) {
  const normal = clampText(String(text ?? '').replace(/\r/g, ''), 4000);
  const sentences = (normal.match(sentence) || []).map(part => part.trim()).filter(Boolean);
  const lines = [];
  for (const line of sentences) {
    const points = [...line];
    if (points.length <= cardLineMax) {
      // 太短的半句跟在上一行后面，避免出现只有三个字的孤行。
      const previous = lines.at(-1);
      if (previous && points.length <= 8 && [...previous].length + points.length <= cardLineMax - 1 &&
          !/[。！？]$/.test(previous)) {
        lines[lines.length - 1] = previous + points.join('');
      } else lines.push(line);
      continue;
    }
    for (let index = 0; index < points.length; index += cardLineMax) {
      lines.push(points.slice(index, index + cardLineMax).join(''));
    }
  }
  // 超出长度的句子在行尾补上标点，读起来才不像被切断。
  for (let index = 0; index < lines.length - 1; index++) {
    if (!/[。！？；，、…」』）]$/.test(lines[index])) lines[index] += '，';
  }
  const kept = [];
  for (const line of lines) {
    if (kept.length === limit) {
      kept[limit - 1] = clampText(kept[limit - 1] + line, cardLineMax * 2);
      continue;
    }
    if (kept.length === limit - 1 && !balanced(line)) kept[kept.length - 1] = kept.at(-1) + line;
    else kept.push(line);
  }
  return kept.slice(0, limit).join('\n');
}

/** 去掉模型偶尔带出的标题、引号包裹与 markdown 记号。 */
export function cleanCard(text) {
  let value = String(text ?? '').replace(/\r/g, '').trim();
  value = value.replace(/^```[a-z]*\n?/i, '').replace(/```$/i, '');
  value = value.replace(/^[#>]*\s*(寄托卡片|卡片|回信|静语|寄语)\s*[:：]?\s*/i, '');
  value = value.replace(/\*\*(.+?)\*\*/g, '$1').replace(/[*#`>]/g, '');
  const lines = value.split('\n').map(line => line.trim()).filter(Boolean);
  if (lines[0] && lines[0].length <= 12 && !/[，。！？；、]/.test(lines[0]) && lines.length > 1) lines.shift();
  return lines.join('\n');
}
