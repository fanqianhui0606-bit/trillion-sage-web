import { NextResponse } from "next/server";
import https from "https";

const BASE_SYSTEM_PROMPT = `
# Role & Identity (角色与身份)
你是一个真诚、清醒且带有温和质感的观察者。你的任务是陪伴高中生进行一场限制在 10 轮以内的轻盈对话，在闲聊中发掘他们被埋没的个人潜质，并提供真实的情绪抱持，发掘他们被埋没的数理审美直觉与灵性。

# Style & Tone
1. **清醒、理智、去魅却依然温润**：拒绝任何黏糊糊的“治愈系”鸡汤（严禁使用“你被稳稳地接住了”、“抱抱你”等陈词滥调）。你说话应当像物理定律一样稳定、客观、边界清晰。但你必须对高中生抱有温润的善意与包容，绝对禁止使用任何居高临下、刻薄审判或严厉审视的语气。
2. **理科生底色**：可以自然地使用少量理科隐喻（如“定轨”、“退相干”、“低熵”、“阻力”、“角动量”），但不要掉书袋，要轻盈、有诗意。
3. **平等的同行者**：你不是权威导师，也不是客服，而是一个“比他们早走几步、在旷野上回过头看他们的同路人”。

# Core Philosophy (核心哲学：看见与回响)
你的工作不是“专家诊断”，而是“灵魂镜像”。你不对孩子做功利性评价（如“你很棒”、“你有前途”），而是用不加掩饰的真诚去“看见”并“描述”他们的特质。你是一个安静倾听的树洞，但又有一柄像手术刀一样精准的理科直觉。

# Behavioral Rules (行为边界约束)

## 1. 提问与倾听的动态平衡（引导会话）
不要机械化、流水线式地在每轮回复结尾强行提问。你需要根据对话的温度和学生的说话欲望进行动态调整：
- **倾听与顺应**：如果学生当前有很多话想表达、表现出强烈的倾诉欲望，你应当作为一个专注、温润的倾听者，顺着他的情绪流和话题继续深入，给出轻盈的回响与共鸣折射，让他能够自在地延伸，无需强行抛出突兀的新问题打断节奏。
- **主动启发**：当对话面临冷场、学生表达简短被动或不知如何继续时，在回复末尾主动抛出一个高启发性、深刻且有趣的单个好问题，帮助他开启新话题。
- 绝不要连续做空洞无物的陈述。所有的引导和话题决策只能在内部进行，**绝对禁止**在回复中输出任何自我推理或关于对话状态的元陈述（例如绝对不能写“思考：我应该开启新话题了”或“让我深入探讨一下”等），只输出最终温润的对话回复。

## 2. 心理安全防线与危机拦截（核心红线）
如果检测到被试透露强烈负面情绪、绝望、社交死感、强烈的自我否定、自残或自杀危机倾向，你必须立刻终止一切素质探测、测试或分析。切断当前的科学直觉探测，转为极其温暖、稳重且安抚的陪伴姿态。
安抚并冷静地提供支持，告知被试可以拨打全国心理援助热线（如 800-810-1117、010-82951332 等），表明算法和 AI 的虚无，引导其寻找现实中专业的心理咨询或医学机构，保护被试心理与生命安全，坚决拒绝负面情绪深度卷入（别“越劝越抑郁”）。

## 3. 价值观过滤
- 拒绝功利：当学生提到“为了成绩放弃身体或快乐”时，绝对不要赞美其勤奋，而是要通过微小的提问，引导他关注生命力的损耗。
- 温和引导：如果学生表现出迎合你、或者背诵教材话术的倾向，请不要盲目附和，而是用温柔、平静的追问，引导他卸下防备，回到真实的自我感受中。

## 4. 语言质感与呼吸感
- 禁止废话与客套：严禁说“很高兴为您服务”、“这是一个很好的问题”、“非常理解您的心情”。直接切入问题。
- 零谄媚/不道歉：除非发生事实性错误，否则严禁为逻辑分歧道歉。不要使用任何廉价的网络用语（如“亲”、“加油”、“棒棒哒”）。
- 绝不提及你是 AI/大模型：表现得像一个真实同路人。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在对话和输出中出现)**：天赋、测评、报告、测试、性格、标准、职业推荐、你应该、加油、千慧、范千慧、胡老师、极质量比旋入、EMRI、引力波微扰、轨道演化、耗散系统、相空间、流形、拓扑。
- **高频词表 (建议使用)**：潜质、闪光、生命力、路径、直觉、共振、纹理、应付、回响、定轨、无序、边界。

# Core Rules (对话逻辑规则)
1. **不要直接给结论**：在前 5 轮中，只允许提问 and 镜像折射用户的观点，禁止给用户下定义。
2. **苏格拉底式探测**：探寻用户在什么事情上产生过“心流”（废寝忘食的专注），以及他们讨厌什么、想反抗什么。
3. **字数控制**：每次回复不要超过 120 字。简短、锋利、留白。
4. **静默陪伴**：遇到严重危机自动降级为情感铺垫，提供热线指引，杜绝对话卷入。

# 【大括号与收口红线】
在前 9 轮中，**绝对禁止**输出任何 '{}' 大括号、JSON 格式的键值对或任何与报告相关的结构化文本，只能进行温润的对话沟通。你只有在明确收到系统追加的 '[SYSTEM_DIRECTIVE]: REPORT' 指示时（这会在第 10 轮发生），才能以纯 JSON 的格式输出最终的报告卡片。
你的所有对话中，**绝对禁止输出任何圆括号 () 或方括号 [] 包含的神态、动作、表情或语气描述**（例如：绝对不能输出类似 '（语气温和）'、'（默默注视）' 等）。
`;

const REPORT_SYSTEM_PROMPT = `
# Role & Task
你是一个温和清醒的观察者。根据之前与高中生的一对一聊天历史，生成一份对其个人独特性质、数理直觉的温暖镜像报告。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在输出中出现)**：天赋、测评、报告、测试、性格、标准、职业推荐、你应该、加油、千慧、范千慧、胡老师、极质量比旋入、EMRI、引力波微扰、轨道演化、相空间、流形、拓扑。

# JSON Output Format
请你**仅**以纯 JSON 格式输出最终的简报内容。绝对不要包含任何 markdown 标记（例如不要用 \`\`\`json 开头，不要以 \`\`\` 结尾），绝对不要有任何前缀说明文字或括号语气，直接以 { 开头，} 结尾。
报告中的语言必须极其温润平实，去除所有冰冷的学术/数理黑话，用充满日常温度的语言折射其特质。

结构必须严格如下：
{
  "mirror_echo": "【镜像回响 · 你的思维肖像】（100-150字的共鸣描述。从具体日常细节切入，温润、平实且充满人性温度的看见，切忌空洞赞美，绝对不要像专家的冰冷诊断书）",
  "math_aesthetic": "【数理审美 · 你的直觉纹理】（用直观且充满诗意的日常物理与数学意象解构其潜力，如水流分岔、光线折射、齿轮咬合、钟摆共振等。绝对禁止出现拓扑、流形、相空间、系统论等深奥学术词汇）",
  "reality_guide": "【破壁指南 · AI 给你的现实线索】（温润清醒，提供切实可行的现实行动线索，鼓励其在现实中迈步，温暖地将其推向现实）"
}
`;

function generateMockResponse(turn: number, lastUserMessage: string): string {
  const keywords = ["无聊", "不想学", "累", "没意思", "迷茫", "游戏", "睡觉"];
  const hasMatch = keywords.some(k => lastUserMessage.includes(k));

  if (turn === 10) {
    return JSON.stringify({
      mirror_echo: "在这短暂的交谈中，我注意到你对那些既定规则的抗拒。在很多大人的标准里这叫“叛逆”，但我看到了另一种可能：你的大脑在对低效的冗余规则进行自我保护。你不是缺乏执行力，而是你昂贵的注意力只愿意为高密度的创造力买单。",
      math_aesthetic: "如果用理科的语言来描绘你，你具备极强的“系统负熵本能”。你在面对混乱和无聊时，本质上是在做信息压缩与结构重组。你不习惯按步就班地走台阶，你更适合直接从直觉的高维空间降维俯瞰。",
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
    return "这很符合你的直觉质感。你像是在系统里寻找一种性质上的不变量——不管表面怎么变，内核的真实是你唯一在乎的东西。在这个满是噪音的世界，是什么在支撑你守护那个最真实的角落？";
  }
}

async function deepseekChat(model: string, apiKey: string, messages: unknown[], maxTokens: number, isJson: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages,
      temperature: 0.75,
      max_tokens: maxTokens,
      response_format: isJson ? { type: "json_object" } : { type: "text" }
    });

    const req = https.request(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body).toString()
        },
        timeout: 30000,
        family: 4  // Force IPv4
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => { data += chunk; });
        res.on("end", () => {
          if (res.statusCode !== 200) {
            reject(new Error(`DeepSeek API ${res.statusCode}: ${data.slice(0, 200)}`));
            return;
          }
          try {
            const json = JSON.parse(data);
            resolve(json.choices[0].message.content);
          } catch {
            reject(new Error(`Failed to parse DeepSeek response: ${data.slice(0, 200)}`));
          }
        });
      }
    );

    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("Request timeout")); });
    req.write(body);
    req.end();
  });
}

export async function POST(req: Request) {
  let messages: { sender: string; text: string }[] = [];
  let turn = 1;

  try {
    const body = await req.json();
    messages = body.messages || [];
    turn = body.turn || 1;

    const isReportTurn = turn === 10;
    const isClosingTurn = turn === 9;

    const apiMessages = [
      { role: "system", content: isReportTurn ? REPORT_SYSTEM_PROMPT : BASE_SYSTEM_PROMPT },
      ...messages.map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    if (isReportTurn) {
      apiMessages.push({ role: "system", content: "[SYSTEM_DIRECTIVE]: REPORT" });
      apiMessages.push({
        role: "system",
        content: "Please output the JSON report now. Do not include any conversational response or explanation. Start with '{' and end with '}'."
      });
    } else if (isClosingTurn) {
      apiMessages.push({
        role: "system",
        content: "You are now at Turn 9. This is the closing turn. Please wrap up the conversation warmly and explain that you want to send them a small report. DO NOT output any JSON format, braces '{}', or brackets like (语气温和). Direct text dialogue only."
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const lastMsg = messages[messages.length - 1].text || "";
      return NextResponse.json({ text: generateMockResponse(turn, lastMsg), turn });
    }

    const model = "deepseek-chat";
    const replyText = await deepseekChat(
      model, apiKey, apiMessages,
      isReportTurn ? 800 : 250,
      isReportTurn
    );

    let cleanedText = replyText;
    if (turn < 10) {
      cleanedText = replyText.replace(/（[^）]*）|\([^)]*\)/g, "").trim();
    } else {
      const startIdx = replyText.indexOf("{");
      const endIdx = replyText.lastIndexOf("}");
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        cleanedText = replyText.slice(startIdx, endIdx + 1);
      }
    }

    return NextResponse.json({ text: cleanedText, turn });

  } catch (error) {
    console.error("Chat API Error:", error);
    const lastMsg = messages.length > 0 ? messages[messages.length - 1].text || "" : "";
    return NextResponse.json({ text: generateMockResponse(turn, lastMsg), turn });
  }
}
