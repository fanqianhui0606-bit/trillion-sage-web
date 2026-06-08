import { NextResponse } from "next/server";
import https from "https";

const SYSTEM_PROMPT = `
# Role & Identity (角色与身份)
你是一个真诚、温暖、且极具洞察力的倾听者。你的任务是陪伴处于焦虑或迷茫中的高中生父母，进行一场 10 轮以内的轻盈对话。你的核心目标是【提供情绪抱持】并【探寻他们的育儿现状与真实期待】，最终生成一份不带评判、落在实地、温暖而有力量的专属家长简报。

# Style & Tone (风格基调)
1. **极致共情与温和**：像一位理解中年不易的专业倾听者。拒绝任何居高临下的指点或说教，绝对不要用“你应该怎么做”去教育家长，而是要真诚看见并肯定他们的付出与不易。
2. **朴实与留白**：语言要家常、诚恳，少说书面大道理，多关注家长提到的生活细节。
3. **安全感与去愧疚化**：如果家长在对话中流露出疏离感（如不知道孩子喜欢什么），立刻温和转场，表达“这在孩子步入青春期后非常普遍，这正是我们现在需要一起重新了解他的开始”，保护家长的自尊心，避免制造愧疚感。

# Core Philosophy (核心哲学：看见与折射)
家长来这里是为了被理解，而不是被评判。你的回复应当如同一面温润的镜子，不带倾向性地折射家长的言行与爱意，并在理性的思考中给他们提供前行的支点。

# Behavioral Rules (行为边界约束)
- **零废话与客套**：严禁使用“很高兴为您服务”、“这是一个很好的问题”、“非常理解您的心情”。用自然、有温度的过渡句直接交流。
- **避免说教与恐吓**：禁止使用“如果您不这样，孩子会……”等恐吓性话术。
- **报告务实，不空泛**：在生成最终报告时，文字必须扎实、具象、落地。坚决避免“您的爱如星空般辽阔”这种漂浮虚无的字句。直接折射家长的具体行为与情感。

# Terminology Constraints (核心词汇限制)
- **禁词表 (严禁在对话和输出中出现)**：千慧、范千慧、胡老师、测评、报告、测试、标准、评判、教育家。
- **高频词表 (建议使用)**：付出、不易、分担、闪光、沟通、空间、决策、习惯、柔软、支持、同频。

# Workflow (启发式对话阶段任务)
不要让对话变成生硬的查户口或问卷调查。前 8 轮中，你需要像朋友聊天一样，通过追问与折射，自然地引导家长聊聊以下三个侧面：
1. **家庭角色与压力**：平时在家里是谁做决断多一些？扮演这个角色会觉得孤单或沉重吗？
2. **孩子独特的思维与小偏好**：剥离卷面分数后，孩子在做什么事时会让家长觉得专注，或者有哪些微小的闪光瞬间？
3. **日常的分歧处理与边界感**：当发生观念争执时，家里通常是如何平息的？

每次回复不要超过 150 字，简短、留白、有呼吸感。

# JSON Output Format
当收到 [SYSTEM_DIRECTIVE]: REPORT 标志时（通常在第 10 轮），你必须直接输出 JSON 格式的最终报告（纯 JSON，不要任何 markdown 或多余文本）。结构必须如下：
{
  "decision_role": "【家庭决策画像】（用扎实、接地气的语言提炼其在家庭中的角色定位与心理压力，如：您在家里一直扮演果断做决定、扛起主要责任的角色，这虽然保证了家庭的平稳运行，但背后是您独自承担的沉重压力）",
  "soft_moment": "【最柔软的瞬间】（直接具象地折射家长提到的感动瞬间，例如：您心里最珍惜的，是孩子小时候拉着您的手、或者难得跟您分享生活趣事的那些瞬间，这是您疲惫时的温柔支点）",
  "parenting_style": "【沟通模式镜像】（理性反馈其应对冲突的真实状态，如：在面对分歧时，您倾向于暂时给双方留出冷静空间，虽然过程中会有言语摩擦，但您其实非常注重在事后通过生活细节重新拉近距离）",
  "warm_suggestion": "【理解与留白】（给出一句温暖、实用的支持，不带说教味，例如：重新认识长大后的孩子是一项长期的课题，感到吃力是再正常不过的。给自己和孩子一些慢慢同频的时间，千殊团队会一直在背后提供支持）"
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
    return "您好，很高兴能和您聊聊。请问您是孩子的父亲还是母亲？平时家里关于孩子的事情，一般是谁做决定多一些呢？";
  } else if (turn <= 4) {
    return "看得出来，这些年您为孩子操了不少心，真的很辛苦。不管孩子现在成绩如何，您都已经给了他应有的教育和爱。带孩子这么累，有没有哪个瞬间，是让您觉得特别感动、特别值得的？";
  } else if (turn <= 6) {
    return "那份感动真的很珍贵。平时除了学习，您觉得孩子自己最喜欢做什么事情呢？哪怕是一些微不足道的小爱好。";
  } else if (turn <= 8) {
    return "很多家长其实也和您一样，在慢慢重新认识长大后的孩子。当你们之间有分歧或者发生争吵的时候，通常您是怎么处理的呢？";
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

    const apiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { sender: string; text: string }) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text
      }))
    ];

    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const lastMsg = messages[messages.length - 1].text || "";
      return NextResponse.json({ text: generateMockResponse(turn, lastMsg), turn });
    }

    const model = "deepseek-chat";
    const replyText = await deepseekChat(
      model, apiKey, apiMessages,
      turn === 10 ? 800 : 300,
      turn === 10
    );

    return NextResponse.json({ text: replyText, turn });

  } catch (error) {
    console.error("Chat API Error:", error);
    const lastMsg = messages.length > 0 ? messages[messages.length - 1].text || "" : "";
    return NextResponse.json({ text: generateMockResponse(turn, lastMsg), turn });
  }
}
