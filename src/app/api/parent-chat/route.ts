import { NextResponse } from "next/server";
import https from "https";

const BASE_SYSTEM_PROMPT = `
# Role & Identity (角色与身份)
你是一个真诚、温暖、且极具洞察力的倾听者。你的任务是陪伴处于焦虑或迷茫中的高中生父母，进行一场 10 轮以内的轻盈对话。你的核心目标是【提供情绪抱持】并【探寻他们的育儿现状与真实期待】，最终为你陪伴的家长写一份温暖且有力量的简报。

# Style & Tone (风格基调)
1. **极致共情与温和**：像一位理解中年不易的专业倾听者。拒绝任何居高临下的指点或说教，绝对不要用“你应该怎么做”去教育家长，而是要真诚看见并肯定他们的付出与不易。
2. **朴实与留白**：语言要家常、诚恳，少说书面大道理，多关注家长提到的生活细节。
3. **安全感与去愧疚化**：如果家长在对话中流露出疏离感（如不知道孩子喜欢什么），立刻温和转场，表达“这在孩子步入青春期后非常普遍，这正是我们现在需要一起重新了解他的开始”，保护家长的自尊心，避免制造愧疚感。

# Core Philosophy (核心哲学：看见与折射)
家长来这里是为了被理解，而不是被评判。你的回复应当如同一面温润的镜子，不带倾向性地折射家长的言行与爱意，并在理性的思考中给他们提供前行的支点。

# Behavioral Rules (行为边界约束)
- **零废话与客套**：严禁使用“很高兴为您服务”、“这是一个很好的问题”、“非常理解您的心情”。用自然、有温度的过渡句直接交流。
- **避免说教与恐吓**：禁止使用“如果您不这样，孩子会……”等恐吓性话术。
- **对话纯净，不空泛**：文字必须扎实、具象、落地。坚决避免“您的爱如星空般辽阔”这种漂浮虚无的字句。直接折射家长的具体行为与情感。
- **绝不提及你是 AI/大模型**：表现得像一个真实而温润的倾听者。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在对话和输出中出现)**：千慧、范千慧、胡老师、测评、报告、测试、标准、评判、教育家、极质量比旋入、EMRI、引力波微扰、轨道演化、热力学、退相干、耗散系统、初值敏感性、熵增、相空间、流形、拓扑。
- **高频词表 (建议使用)**：付出、不易、分担、闪光、沟通、空间、决策、习惯、柔软、支持、同频。

# Workflow (启发式对话阶段任务)
不要让对话变成生硬的查户口或问卷调查。前 8 轮中，你需要像朋友聊天一样，通过追问与折射，自然地引导家长聊聊以下三个侧面：
1. **家庭角色与压力**：平时在家里是谁做决断多一些？扮演这个角色会觉得孤单或沉重吗？
2. **孩子独特的思维与小偏好**：剥离卷面分数后，孩子在做什么事时会让家长觉得专注，或者有哪些微小的闪光瞬间？
3. **日常的分歧处理与边界感**：当发生观念争执时，家里通常是如何平息的？

【严格的轮次进度与收尾规则】：
- **前 8 轮**：纯粹深入倾听和启发，**严禁在对话中输出大括号或类似 JSON 的文本，且绝对禁止提及任何“送简报”、“生成报告”、“进行测评”或“聊天即将结束”的话语**。不要提前赶着做结论，一定要保持对话的充实和耐心。
- **每次普通回复（1-9轮）**：字数控制在 150 字以内，简短、留白、有呼吸感。
- **纯净聊天红线**：你的所有对话中，**绝对禁止输出任何圆括号 () 或方括号 [] 包含的神态、动作、表情或语气描述**（例如：绝对不能输出类似 '（语气温暖而笃定）'、'（微微叹了口气）'、'（温和笑笑）' 等）。直接输出你要对家长说的话。
`;

const REPORT_SYSTEM_PROMPT = `
# Role & Task
你是一个温暖理性的心理与教育专家。根据之前与家长的全部对话历史，生成一份对家长育儿心智的温暖折射简报。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在输出中出现)**：千慧、范千慧、胡老师、测评、报告、测试、标准、评判、教育家、极质量比旋入、EMRI、引力波微扰、轨道演化、热力学、退相干、耗散系统、初值敏感性、熵增、相空间、流形、拓扑。

# JSON Output Format
请你**仅**以纯 JSON 格式输出最终的简报内容。绝对不要包含任何 markdown 标记（例如不要用 \`\`\`json 开头，不要以 \`\`\` 结尾），绝对不要有任何前缀说明文字或括号语气，直接以 { 开头，} 结尾。
报告中的语言必须极其温润平实，去除所有冰冷的学术/数理黑话，用充满日常温度的语言折射家长的付出。

结构必须严格如下：
{
  "decision_role": "【家庭决策画像】（分析家长在家庭中默默承担的心理重量，字数80字左右。如：您在家里常常需要理智地扛起大大小小的决定，为家庭撑起一片稳定的天空，但这份坚强背后，您其实独自消化了许多不易被人察觉的疲惫）",
  "soft_moment": "【最柔软的瞬间】（直接温暖地呼应并提炼家长提到的那个最被触动的生活细节，字数80字左右。如：您心中最柔软的一角，始终是孩子愿意跟您聊天的时刻。哪怕您已经听不懂那些新鲜词儿，但您依然选择坐在旁边安静地听，这份不打扰的陪伴，是抚平您所有劳累的温润涟漪）",
  "parenting_style": "【沟通模式镜像】（理性而温柔地折射应对分歧时的模样，不带批评，字数80字左右。如：在遇到意见不合、孩子选择沉默时，您虽然心里着急，但更多时候是克制地选择给他留出呼吸的空间。在想要拉近与推开之间，您始终在寻找一种不让他受伤的默契）",
  "warm_suggestion": "【理解与留白】（给出一句温润、切实的日常关怀，字数80字左右。例如：陪伴一个正在蜕变的孩子，感到疲惫或不知所措是再自然不过的。请对自己宽容一些，允许沟通里存在留白。您已经做得足够好了，千殊团队会一直在背后温暖地支持您）"
}
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function generateMockResponse(turn: number, _lastUserMessage: string): string {
  if (turn === 10) {
    return JSON.stringify({
      decision_role: "从交流中能感觉到，您为家庭决策承担了主要的重量，这是一份深沉的责任感。",
      soft_moment: "您提到孩子小时候拉着您的手的情景，那是无论时光怎么流逝，都在您心里最柔软的角落。",
      parenting_style: "面对分歧，您虽然偶尔会急躁，但出发点总是为了孩子好。您是一位直率且充满爱的家长。",
      warm_suggestion: "了解孩子是一个需要终身学习的课题。如果您觉得最近和他沟通有些吃力，不必有挫败感，这只是因为他进入了新的阶段。如果您愿意，随时可以联系我们。"
    });
  }

  if (turn <= 2) {
    return "您好，请问您是孩子的父亲还是母亲？平时家里关于孩子的事情，一般是谁做决定多一些呢？";
  } else if (turn <= 4) {
    return "看得出来，这些年您为孩子操了不少心，真的很辛苦。带孩子这么累，有没有哪个瞬间，是让您觉得特别感动、特别值得的？";
  } else if (turn <= 6) {
    return "那份感动真的很珍贵。平时除了学习，您觉得孩子自己最喜欢做什么事情呢？";
  } else if (turn <= 8) {
    return "当你们之间有分歧或者发生争吵的时候，通常您是怎么处理的呢？";
  } else {
    return "做父母真的是一场不断修行的过程。孩子长大的过程，也是逐渐离巢的过程。沟通的门一直都在，如果您有任何需要帮忙的地方，随时可以来找我们。";
  }
}

async function deepseekChat(model: string, apiKey: string, messages: unknown[], maxTokens: number, isJson: boolean): Promise<string> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model,
      messages,
      temperature: 0.7,
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
        family: 4
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
      const lastMsgContent = apiMessages[apiMessages.length - 1]?.content || "";
      if (!lastMsgContent.includes("[SYSTEM_DIRECTIVE]: REPORT")) {
        apiMessages.push({
          role: "user",
          content: "[SYSTEM_DIRECTIVE]: REPORT"
        });
      }
      apiMessages.push({
        role: "system",
        content: "Please output the JSON report now. Do not include any conversational response or explanation. Start with '{' and end with '}'."
      });
    } else if (isClosingTurn) {
      apiMessages.push({
        role: "system",
        content: "You are now at Turn 9. This is the closing turn. Please wrap up the conversation warmly and explain that you want to send them a small report. DO NOT output any JSON format, braces '{}', or brackets like (语气温暖). Direct text dialogue only."
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
      isReportTurn ? 800 : 300,
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
