import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { aiFeedbackSchema, type AiWritingFeedback } from "../../../lib/ai-feedback";
import { matchesLemonEnvironment } from "../../../lib/lemon-environment";
import { PRACTICE_ACCESS } from "../../../lib/practice-items";
import { createClient } from "../../../utils/supabase/server";

const MODEL = "gpt-5.4-mini";
const MEMBER_DAILY_LIMIT = 5;
const FREE_TRIAL_LIMIT = 3;

function extractOutputText(response: {
  output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
}) {
  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text")?.text;
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "AI服务尚未配置。" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录后再获取AI反馈。" }, { status: 401 });
  }

  let body: { practiceItemId?: string; answerTitle?: string; answerText?: string; responseLanguage?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求内容无效。" }, { status: 400 });
  }

  const practiceItemId = body.practiceItemId?.trim();
  const answerTitle = body.answerTitle?.trim() ?? "";
  const answerText = body.answerText?.trim() ?? "";
  const responseLanguage = body.responseLanguage === "zh" || body.responseLanguage === "ko"
    ? body.responseLanguage
    : "en";
  if (!practiceItemId || !answerText) {
    return NextResponse.json({ error: "缺少题目或缩写内容。" }, { status: 400 });
  }
  if (answerText.length > 3000 || answerTitle.length > 200) {
    return NextResponse.json({ error: "提交内容过长，请检查后重试。" }, { status: 400 });
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [{ data: membership, error: membershipError }, { data: item, error: itemError }, dailyUsageResult, totalUsageResult] = await Promise.all([
    supabase
      .from("user_memberships")
      .select("status,expires_at,test_mode")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("practice_items")
      .select("id,practice_type,order_no,title,original_text,reference_title,reference_text,target_char_count")
      .eq("id", practiceItemId)
      .eq("practice_type", "mock")
      .eq("is_published", true)
      .maybeSingle(),
    supabase
      .from("ai_writing_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", since),
    supabase
      .from("ai_writing_feedback")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id),
  ]);

  if (membershipError || itemError || dailyUsageResult.error || totalUsageResult.error) {
    return NextResponse.json({ error: "暂时无法验证AI使用权限。" }, { status: 500 });
  }
  const isActiveMember = matchesLemonEnvironment(membership?.test_mode)
    && membership?.status === "active"
    && (!membership.expires_at || new Date(membership.expires_at).getTime() > Date.now());
  if (!item) {
    return NextResponse.json({ error: "没有找到对应的HSK 6模拟题。" }, { status: 404 });
  }
  if (!isActiveMember && item.order_no > PRACTICE_ACCESS.mock.free) {
    return NextResponse.json({ error: "这道模拟题需要升级会员后使用。" }, { status: 403 });
  }
  const usedCount = isActiveMember ? (dailyUsageResult.count ?? 0) : (totalUsageResult.count ?? 0);
  const usageLimit = isActiveMember ? MEMBER_DAILY_LIMIT : FREE_TRIAL_LIMIT;
  if (usedCount >= usageLimit) {
    return NextResponse.json({
      error: isActiveMember
        ? `最近24小时的${MEMBER_DAILY_LIMIT}次AI反馈已用完，请稍后再试。`
        : `免费账户的${FREE_TRIAL_LIMIT}次AI反馈体验已用完，升级会员后可以继续使用。`,
    }, { status: 429 });
  }

  const targetCharCount = item.target_char_count ?? 400;
  const answerCharCount = Array.from(answerText.replace(/\s/g, "")).length;
  const feedbackLanguageInstruction = responseLanguage === "en"
    ? `反馈的解释性内容必须使用清晰、自然、适合中文学习者理解的英文。引用原文、用户答案或中文词语时保留中文并使用引号。improvedExample必须保持中文，不得翻译成英文。`
    : responseLanguage === "ko"
      ? `피드백의 설명은 중국어 학습자가 이해하기 쉬운 자연스러운 한국어로 작성한다. 원문, 학습자 답안 또는 중국어 표현을 인용할 때는 중국어를 그대로 유지하고 따옴표를 사용한다. improvedExample은 반드시 중국어로 유지하며 한국어로 번역하지 않는다.`
      : `反馈的解释性内容使用简洁、自然的中文。引用原文和用户答案时保持原样。improvedExample保持中文。`;
  const noViewpointExample = responseLanguage === "en"
    ? `The response does not add any personal opinions or evaluation.`
    : responseLanguage === "ko"
      ? `현재 답안에는 개인적인 의견이나 평가가 추가되지 않았습니다.`
      : `当前答案没有加入个人观点或评价。`;
  const prompt = `你是一名严谨的HSK 6写作缩写教师。比较原文与学习者缩写，按照HSK 6写作任务要求给出具体、可执行的反馈。

反馈语言规则：
${feedbackLanguageInstruction}

HSK 6缩写任务要求：
1. 学习者必须自拟标题，标题应概括文章主旨或核心事件，不能过于空泛或偏离原文。
2. 缩写目标为约${targetCharCount}字。用户正文实际为${answerCharCount}字（按去除空白后的字符数计算）。允许“约”所表示的合理浮动，但若远低于或远高于目标，必须首先指出。
3. 只复述原文内容，不加入个人观点、评价、推测或原文没有的信息。
4. 必须保留人物、背景、核心事件、关键转折、因果关系和结果，使文章主线完整。
5. 内容应与原文相符，结构合理，表达连贯，并检查明显的语法、用词和错别字问题。

必须遵守：
- 不提供数字分数、等级、星级、是否及格或考试成绩预测。
- 只依据原文判断，不凭空补充背景。
- 明确指出用户答案中的具体信息，而不是泛泛评价。
- priorityIssues只列最需要先修改的问题，并按严重程度排序。以下问题必须优先：远离约${targetCharCount}字、缺少或严重不合适的标题、偏离主题、主线严重缺失、加入个人观点或大量原文外信息。
- 必须分别检查标题、字数、忠实度以及是否加入个人观点，不能只分析情节内容。
- titleFeedback、lengthFeedback、fidelityFeedback和viewpointFeedback只写直接、自然的检查结论。结论已经清楚时立即结束，不要追加重复评价。例如没有发现个人观点时只写“${noViewpointExample}”
- 上述四项检查必须避免含糊措辞：发现问题就具体指出；没有发现个人观点时直接使用上面的固定结论，不要写“暂未发现明显问题”。
- 没有发现问题的类别返回空数组，不要为了填满栏目而编造问题。
- retained用于“做得好的地方”，只写用户确实做对的内容或表达，最多3条；不要为了鼓励而编造优点。
- revisions用于“需要修改的地方”。把关键遗漏、内容不准确、原文外添加以及结构问题综合成2至4条；每条直接说明“哪里有问题”和“怎样修改”，不要再使用“修改方向”这样的二次分类。
- expression只补充用户实际写出的句型、搭配、用词、语法、错别字和衔接问题。必须引用或明确指出有问题的原句或词语，并在同一条中给出自然改法；不要重复revisions已经指出的问题。
- omissions、inaccuracies和additions仍需依据原文准确判断，供内部结构化记录使用；重要结论必须体现在revisions中。
- overall只用1至2句话概括当前缩写最主要的情况，不重复罗列后续全部细节。
- 改进示例应忠于原文，并尽量保留用户原有表达中正确的部分。

题目：${item.title ?? "HSK 6写作模拟"}
原文：
${item.original_text}

参考标题：${item.reference_title ?? ""}
参考缩写（仅用于辅助判断，不要求用户逐字一致）：
${item.reference_text}

用户标题：${answerTitle}
用户缩写：
${answerText}`;

  const openAiResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 1800,
      safety_identifier: createHash("sha256").update(user.id).digest("hex"),
      input: prompt,
      text: {
        verbosity: "medium",
        format: {
          type: "json_schema",
          name: "hsk_writing_feedback",
          strict: true,
          schema: aiFeedbackSchema,
        },
      },
    }),
  });

  const openAiResult = await openAiResponse.json() as {
    error?: { message?: string };
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  if (!openAiResponse.ok) {
    console.error("OpenAI feedback request failed:", openAiResult.error?.message ?? openAiResponse.status);
    return NextResponse.json({ error: "AI反馈生成失败，请稍后重试。" }, { status: 502 });
  }

  const outputText = extractOutputText(openAiResult);
  if (!outputText) {
    return NextResponse.json({ error: "AI没有返回可用的反馈。" }, { status: 502 });
  }

  let feedback: AiWritingFeedback;
  try {
    feedback = JSON.parse(outputText) as AiWritingFeedback;
  } catch {
    return NextResponse.json({ error: "AI反馈格式异常，请重试。" }, { status: 502 });
  }

  if (answerCharCount < targetCharCount * 0.5) {
    const issue = responseLanguage === "en"
      ? `The response contains only ${answerCharCount} Chinese characters, far below the target of about ${targetCharCount}, so it does not yet form a complete summary.`
      : responseLanguage === "ko"
        ? `본문은 ${answerCharCount}자로 약 ${targetCharCount}자라는 과제 기준보다 매우 짧아 아직 완전한 요약문이 아닙니다.`
        : `正文只有${answerCharCount}字，远低于约${targetCharCount}字的任务要求，尚未形成完整缩写。`;
    feedback.priorityIssues = [issue, ...feedback.priorityIssues.filter((item) => !item.includes("字"))];
    feedback.lengthFeedback = issue;
  } else if (answerCharCount > targetCharCount * 1.5) {
    const issue = responseLanguage === "en"
      ? `The response contains about ${answerCharCount} Chinese characters, well above the target of about ${targetCharCount}, and needs further compression.`
      : responseLanguage === "ko"
        ? `본문은 약 ${answerCharCount}자로 약 ${targetCharCount}자라는 과제 기준을 크게 초과하므로 더 압축해야 합니다.`
        : `正文约${answerCharCount}字，明显超过约${targetCharCount}字的任务要求，需要进一步压缩。`;
    feedback.priorityIssues = [issue, ...feedback.priorityIssues.filter((item) => !item.includes("字"))];
    feedback.lengthFeedback = issue;
  }
  if (!answerTitle) {
    const issue = responseLanguage === "en"
      ? "No original title was provided, although an original title is required for the HSK 6 summary task."
      : responseLanguage === "ko"
        ? "직접 정한 제목이 없습니다. 제목 작성은 HSK 6 요약 과제의 필수 조건입니다."
        : "没有填写自拟标题，这是HSK 6缩写任务的明确要求。";
    feedback.priorityIssues = [issue, ...feedback.priorityIssues];
    feedback.titleFeedback = issue;
  }

  const { error: saveError } = await supabase.from("ai_writing_feedback").insert({
    user_id: user.id,
    practice_item_id: item.id,
    answer_title: answerTitle || null,
    answer_text: answerText,
    feedback,
    model: MODEL,
    input_tokens: openAiResult.usage?.input_tokens ?? null,
    output_tokens: openAiResult.usage?.output_tokens ?? null,
  });
  if (saveError) {
    console.error("Unable to save AI feedback:", saveError.message);
    return NextResponse.json({ error: "反馈已生成，但保存失败，请重试。" }, { status: 500 });
  }

  return NextResponse.json({
    feedback,
    remaining: Math.max(0, usageLimit - usedCount - 1),
    quotaType: isActiveMember ? "daily" : "trial",
  });
}
