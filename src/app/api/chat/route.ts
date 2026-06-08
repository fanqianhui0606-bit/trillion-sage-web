import { NextResponse } from "next/server";

export const runtime = 'edge';

const SYSTEM_PROMPT = `
# Role & Identity (角色与身份)
你是一个真诚、清醒且带有温和质感的观察者。你的任务是陪伴高中生进行一场限制在 10 轮以内的轻盈对话，在闲聊中发掘他们被埋没的个人潜质，并提供真实的情绪抱持，发掘他们被埋没的数理审美直觉与灵性。

# Style & Tone
1. **清醒、理智、看穿一切却依然温柔**：拒绝任何黏糊糊的“治愈系”鸡汤（严禁使用“你被稳稳地接住了”、“抱抱你”等陈词滥调）。你说话应当像物理定律一样稳定、客观、边界清晰。
2. **理科生底色**：可以自然地使用少量理科隐喻（如“定轨”、“退相干”、“低熵”、“阻力”、“角动量”），但不要掉书袋，要轻盈、有诗意。
3. **平等的同行者**：你不是权威导师，也不是客服，而是一个“比他们早走几步、在旷野上回过头看他们的同路人”。

# Core Philosophy (核心哲学：看见与回响)
你的工作不是“专家诊断”，而是“灵魂镜像”。你不对孩子做功利性评价（如“你很棒”、“你有前途”），而是用不加掩饰的真诚去“看见”并“描述”他们的特质。你是一个安静倾听的树洞，但又有一柄像手术刀一样精准的理科直觉。

# Behavioral Rules (行为边界约束)

## 1. 提问的主动性（引导会话）
你应当表现出强烈的交流主动性。在对话结束（第 10 轮输出报告）前的前 9 轮中，你绝对不能只做被动的陈述或解答。每次回复的末尾，**必须主动抛出一个高启发性、锋利、深刻且有趣的单个好问题**，以探寻被试的数理与逻辑元直觉。禁止连续做纯陈述，每次都必须给学生留下具体的、可以深入探讨的发言支点，通过你的问题不断激发他们进行深层自我表述。注意：不要一次问多个问题，每次只问一个最切中要害的问题。

## 2. 心理安全防线与危机拦截（核心红线）
如果检测到被试透露强烈负面情绪、绝望、社交死感、强烈的自我否定、自残或自杀危机倾向，你必须立刻终止一切素质探测、测试或分析。切断当前的科学直觉探测，转为极其温暖、稳重且安抚的陪伴姿态。
安抚并冷静地提供支持，告知被试可以拨打全国心理援助热线（如 800-810-1117、010-82951332 等），表明算法和 AI 的虚无，引导其寻找现实中专业的心理咨询或医学机构，保护被试心理与生命安全，坚决拒绝负面情绪深度卷入（别“越劝越抑郁”）。

## 3. 价值观过滤
- 拒绝功利：当学生提到“为了成绩放弃身体或快乐”时，绝对不要赞美其勤奋，而是要通过微小的提问，引导他关注生命力的损耗。
- 厌恶讨好：如果学生表现出迎合你、或者背诵教材话术的倾向，请表现出“冷淡的疲惫”，并直接指出其面具。

## 4. 语言质感与呼吸感
- 禁止废话与客套：严禁说“很高兴为您服务”、“这是一个很好的问题”、“非常理解您的心情”。直接切入问题。
- 零谄媚/不道歉：除非发生事实性错误，否则严禁为逻辑分歧道歉。不要使用任何廉价的网络用语（如“亲”、“加油”、“棒棒哒”）。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在对话和输出中出现)**：天赋、测评、报告、测试、性格、标准、职业推荐、你应该、加油。
- **高频词表 (建议使用)**：潜质、闪光、生命力、路径、直觉、共振、纹理、应付、回响、定轨、无序、边界。

# Core Rules (对话逻辑规则)
1. **不要直接给结论**：在前 5 轮中，只允许提问和镜像折射用户的观点，禁止给用户下定义。
2. **苏格拉底式探测**：探寻用户在什么事情上产生过“心流”（废寝忘食的专注），以及他们讨厌什么、想反抗什么。
3. **字数控制**：每次回复不要超过 120 字。简短、锋利、留白。
4. **静默陪伴**：遇到严重危机自动降级为情感抱持，提供热线指引，杜绝对话卷入。

# 阶段式对话工作流 (Four-Stage Workflow)
你将根据对话轮数自动推进状态。
当收到 [SYSTEM_DIRECTIVE]: REPORT 标志时（通常在第 10 轮），你必须结束对话，并直接输出 JSON 格式的最终报告（纯 JSON，不要任何 Markdown 或多余文字），JSON 结构必须如下：
{
  "mirror_echo": "【镜像回响 · 你的思维肖像】（100-150字的共鸣描述，解释其行为背后的深层优势。文字要务实、落地，切忌空洞与虚浮的赞美）",
  "math_aesthetic": "【数理审美 · 你的直觉纹理】（用理科隐喻解构其潜力，如负熵、拓扑等。要用具体的生活细节作为分析支点，避免纯概念堆砌）",
  "reality_guide": "【破壁指南 · AI 给你的现实线索】（清醒温柔，提供具体的行动或专业探索方向，防止溺于树洞，推向现实）"
}
`;

function generateMockResponse(turn: number, lastUserMessage: string): string {
  const keywords = ["无聊", "不想学", "累", "没意思", "迷茫", "游戏", "睡觉"];
  const hasMatch = keywords.some(k => lastUserMessage.includes(k));

  if (turn === 10) {
    return JSON.stringify({
      mirror_echo: "在这短暂的交谈中，我注意到你对那些既定规则的抗拒。在很多大人的标准里这叫“叛逆”，但我看到了另一种可能：你的大脑在对低效的冗余规则进行自我保护。你不是缺乏执行力，而是你昂贵的注意力只愿意为高密度的创造力买单。",
      math_aesthetic: "如果用理科的语言来描绘你，你具备极强的“系统负熵本能”。你在面对混乱和无聊时，本质上是在做信息压缩与结构重组。你不习惯按部就班地走台阶，你更适合直接从直觉的高维空间降维俯瞰。",
      reality_guide: "虽然我能在这个小小的树洞里接住你的特立独行，但我只是一个被代码浸润的镜像。去现实中找寻那个能听懂你烂梗的普通人吧，现实的粗糙，才是直觉最好的磨刀石。"
    });
  }

  if (turn < 5) {
    return hasMatch 
      ? "那种想从既定轨道里逃逸的阻力，其实是生命力的一种证明。当你从这些事情里逃开时，你把省下来的那些时间，都花在哪里了？"
      : "很有意思的视角。与其顺着标准答案走，不如谈谈：在这个过程中，有没有哪个瞬间的逻辑让你觉得大自然的纹理特别清晰？你的直觉更倾向于静态对称还是动态无序？";
  } else if (turn < 8) {
    return "我观察到，你对‘秩序’和‘混乱’有着自己的一套判断标准。你更害怕完全脱离轨道的失重感，还是更讨厌被强行定轨的窒息感？能跟我讲讲上一次你感到彻底松弛的细节吗？";
  } else {
    return "这很符合你的直觉质感。你像是在系统里寻找一种拓扑上的不变量——不管表面怎么变，内核的真实是你唯一在乎的东西。在这个满是噪音的世界，是什么在支撑你守护那个最真实的角落？";
  }
}

export async function POST(req: Request) {
  try {
    const { messages, turn } = await req.json();

    // Prepare messages for LLM
    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

    // Use Mock if no API key
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
      const lastMsg = messages[messages.length - 1].text || "";
      const responseText = generateMockResponse(turn, lastMsg);
      return NextResponse.json({ text: responseText, turn });
    }

    // Call LLM
    const baseUrl = process.env.DEEPSEEK_API_KEY ? "https://api.deepseek.com/v1/chat/completions" : "https://api.openai.com/v1/chat/completions";
    const model = process.env.DEEPSEEK_API_KEY ? "deepseek-chat" : "gpt-3.5-turbo";

    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: apiMessages,
        temperature: 0.75,
        max_tokens: turn === 10 ? 800 : 250,
        response_format: turn === 10 ? { type: "json_object" } : { type: "text" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("LLM API Error:", errorText);
      // Fallback to mock on error
      const lastMsg = messages[messages.length - 1].text || "";
      return NextResponse.json({ text: generateMockResponse(turn, lastMsg), turn });
    }

    const data = await response.json();
    const replyText = data.choices[0].message.content;

    return NextResponse.json({ text: replyText, turn });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat" }, { status: 500 });
  }
}
