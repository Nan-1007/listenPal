import type { Issue, StageId } from './types';

export const stageCopy: Record<StageId, { name: string; short: string; result: string; description: string; inputs: string[]; criteria: string; decision: string }> = {
  strategy: { name: '内容策略', short: '确定方向', result: '内容策略 Brief', description: '把目标用户的内容偏好，转化为明确的人物关系、核心冲突和情绪节奏。', inputs: ['目标用户与题材', '创作需求', '示例内容偏好'], criteria: '受众明确，冲突有吸引力，情绪有递进。', decision: '先确定内容方向，再投入章节创作，减少无效生成。' },
  planning: { name: '故事规划', short: '搭建故事', result: '人物设定与章节大纲', description: '建立故事设定集（Story Bible），记录人物事实、关系和动机，再规划每一集的推进与悬念。', inputs: ['内容策略 Brief', '剧集长度', '已确认的人物事实'], criteria: '人物不漂移，情节有因果，每集都有推进。', decision: '用共享故事设定约束后续生成，避免长篇内容失控。' },
  generation: { name: '章节生成', short: '撰写章节', result: '英文剧本示例', description: '按照设定和大纲生成章节，用自然对白推动剧情，为有声剧的表演与收听体验做准备。', inputs: ['故事设定集', '章节大纲', '当前版本的生成指令'], criteria: '对白自然，节奏紧凑，章末有继续收听的理由。', decision: '把“不要有 AI 味”转为可执行的对白和表达规则。' },
  evaluation: { name: '质量评测', short: '检查质量', result: '内容质量报告', description: '从剧情、人物、章节吸引力和 AI 表达风险四个维度检查内容，并将问题定位到负责的 Agent。', inputs: ['生成的章节', '故事设定集', '四维质量评测规则'], criteria: '剧情、人物、吸引力 ≥ 8.5 分；AI 表达风险低。', decision: '评测结果回流到规划与生成，让质量问题可以被修正。' },
  audio: { name: '音频制作', short: '准备配音', result: '音频制作计划', description: '为英文有声剧安排角色声音、语速和停顿，并检查是否具备进入配音制作的条件。', inputs: ['审核后的剧本', '角色声音设定', '语速与停顿参数'], criteria: '角色可区分，语速约 150 词/分钟，发布前人工确认。', decision: '文字通过评测后再进入制作，避免把内容问题带入音频。' },
  analytics: { name: '数据分析', short: '复盘效果', result: '内容实验与反馈', description: '观察点击、收听留存和付费转化，围绕剧集长度、演播形式和付费卡点提出下一轮实验。', inputs: ['示例收听数据', '实验分组', '付费卡点位置'], criteria: '指标对应产品目标，建议可实验验证，区分观察与因果。', decision: '把数据反馈送回内容策略，让生产和用户消费形成闭环。' },
};
const titles: Record<string, string> = { 'The Last Promise': '最后的承诺', 'Velvet Lies': '丝绒谎言', 'A Second Chance': '再爱一次', 'Crown of Ashes': '灰烬王冠', 'After Midnight': '午夜之后', 'Wild Hearts': '炽热的心' };
export const displayTitle = (title: string) => titles[title] ?? title;
export const genres: Record<string, string> = { 'Romance Revenge': '爱情与复仇', 'Billionaire Romance': '豪门爱情', 'Second Chance Romance': '破镜重圆', 'Mystery Romance': '悬疑爱情' };
export const displayGenre = (genre: string) => genres[genre] ?? genre;
export const displayAudience = (audience: string) => audience.replace('Women ', '女性 ').replace(' · US & Europe', ' 岁 · 欧美市场');
export const projectStatus: Record<string, string> = { 'All statuses': '全部状态', Draft: '待生成', 'Needs review': '待优化', 'Ready for audio': '可进入制作' };
export const issueStatus: Record<string, string> = { 'All findings': '全部问题', Open: '待处理', Optimized: '待验证', Resolved: '已验证' };
export const issueCategory: Record<string, string> = { 'Character drift': '人物设定不一致', 'Plot gap': '剧情衔接断裂', 'AI pattern': 'AI 表达异常', 'Audio pacing': '音频节奏不佳' };
export const severity: Record<string, string> = { High: '优先处理', Medium: '建议优化', Low: '体验优化' };
export const displayStage = (name: string) => ({ 'Story Planning': '故事规划', 'Story Generation': '章节生成', 'Audio Production': '音频制作' }[name] ?? name);
export const displayMetric = (name: string) => ({ 'Character consistency': '人物一致性', 'Plot quality': '剧情质量', 'Natural dialogue': '对白自然度', 'Audio readiness': '音频适配度' }[name] ?? name);
export const briefs: Record<string, string> = {
  'The Last Promise': '未婚夫夺走了她一手创办的公司。她与他的商业对手达成一场协议婚姻，却发现一段录音可能改变所有人的命运。',
  'Velvet Lies': '酒店钢琴师认出了那位神秘的贵宾——他正是多年前从她生活中消失的人。而他的新身份，隐藏着一个危险的家族秘密。',
  'A Second Chance': '曾经相爱的两人共同继承了一家濒临倒闭的海边书店。他们只有三十天拯救书店，也必须面对那封让彼此错过的信。',
  'Crown of Ashes': '被家族忽视的继承人回来夺回出版帝国。唯一愿意帮助她的人，却是她从小被告诫绝不能信任的人。',
  'After Midnight': '深夜电台主持人收到陌生人的留言。对方知道她姐姐失踪的真相，也知道一些只有她自己才知道的秘密。',
  'Wild Hearts': '城市建筑师返乡修复一座老剧院，却发现反对修复的行动由她的初恋发起。两人的选择将决定小镇和这段关系的未来。',
};
export const displayBrief = (title: string, brief: string) => briefs[title] ?? brief;
const causes: Record<string, string> = {
  'promise-character': '第 3 集中 Clara 已主持过收购会议，第 7 集却说从未进入会议室。生成时遗漏了故事设定中的既有事实。',
  'promise-hook': '章节直接跳到拿到录音，缺少获取过程的因果交代；结尾提前解决了悬念，削弱继续收听的动机。',
  'promise-ai': '出现模型自我介绍、中英混杂和空泛情绪描写，打断了纯英文有声剧的收听体验。',
  'promise-audio': '长句缺少说话人标记和停顿，听众难以区分角色，也难以感知最后的反转。',
  'chance-character': 'Nora 喜爱书店是已确认的人物事实，生成章节却否认了这一点。需要把故事设定带入章节上下文。',
};
export const displayCause = (issue: Issue) => causes[issue.id] ?? issue.cause;
export const issueAdvice: Record<string, string> = { 'Character drift': '将已确认的人物事实写入故事设定，并要求生成前逐项核对。', 'Plot gap': '补充场景间的因果链，让章末悬念引出下一次选择。', 'AI pattern': '用自然英文对白和具体动作推进剧情，只输出剧本内容。', 'Audio pacing': '增加角色标记、短对白及停顿，让反转在收听时可感知。' };
