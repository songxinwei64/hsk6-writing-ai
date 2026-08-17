"use client";

import { useEffect, useState } from "react";

type Locale = "en" | "zh";

const zhTranslations: Record<string, string> = {
  "Home": "首页",
  "Writing Practice": "缩写练习",
  "Sentence Summarization": "句子缩写",
  "Passage Summarization": "短文缩写",
  "HSK 6 Mock Tests": "HSK 6 写作模拟题库",
  "HSK 6 Mock Test": "HSK 6 写作模拟",
  "My Practice": "我的题库",
  "Community": "学习社区",
  "Membership": "会员权益",
  "Motivation Wall": "激励文字墙",
  "Exercise Discussion": "题目讨论",
  "Exercise Discussions": "题目讨论区",
  "Discussions": "题目讨论区",
  "Privacy Policy": "隐私政策",
  "Terms of Service": "服务条款",
  "Refunds & Cancellation": "退款与取消",
  "Contact": "联系我们",
  "Practice": "练习",
  "Practice Overview": "练习首页",
  "← Back to Home": "← 返回首页",
  "HSK 6 Writing · Summarization Practice": "HSK 6 写作 · 缩写练习",
  "Identify Key Ideas and Write Concisely": "练会提取重点与压缩表达",
  "Begin with sentences, continue with passages, and then move on to complete HSK 6 mock writing tests.": "先从句子开始，再练习短文缩写。准备好以后，可以进入HSK写作模拟题库完成整篇训练。",
  "Remove unnecessary details and combine ideas without changing the original meaning.": "从一个长句开始，删除多余细节、合并表达，在不改变原意的情况下把句子写得更简洁。",
  "Identify the people, events, and outcome, then rewrite the passage clearly and concisely.": "阅读一篇短文，提取人物、事件和结果，删除次要内容，写成更精炼、连贯的短文。",
  "Foundation": "基础训练",
  "Intermediate": "进阶训练",
  "Start Practice": "开始练习",
  "Coming Soon": "即将开放",
  "Open": "进入",
  "Main features": "主要功能",
  "HSK 6 · AI Writing Practice": "HSK 6 · AI 写作练习",
  "HSK 6 Writing Practice": "HSK 6级写作练习",
  "Build summarization skills step by step, then practice with the complete HSK 6 writing format.": "先用句子和短文练习提取重点，再按照HSK 6考试流程完成整篇缩写。",
  "Start with sentences and short passages. Learn to identify key information and write accurate, concise summaries.": "先从句子和短文开始，练习提取重点、删除次要信息，把内容写得准确、简洁。",
  "Follow the HSK 6 exam format: read the passage, continue after it is hidden, and write a summary of about 400 Chinese characters.": "完成基础练习后，按照HSK 6考试流程阅读原文、隐藏原文并完成约400字的缩写。",
  "Review completed exercises, saved answers, and revision history in one place.": "收藏过、做过的题，还有每次作文的修改记录，都放在这里。",
  "Compare approaches to the same prompt and exchange writing and exam-preparation ideas.": "看看别人怎样缩写同一篇文章，也可以交流写作和备考经验。",
  "10-Minute Reading": "阅读10分钟",
  "35-Minute Writing": "写作35分钟",
  "Full Writing · AI Feedback": "完整写作 · AI反馈",
  "About 1,000 Chinese characters": "原文约1000字",
  "My Summary · About 400 characters": "我的缩写 · 约400字",
  "Content Accuracy": "内容准确性",
  "Identify Missing Ideas": "发现原意偏差",
  "Get Revision Guidance": "给出修改方向",
  "Sentence Summaries": "句子缩写",
  "Passage Summaries": "短文缩写",
  "Saved Exercises": "我的收藏",
  "Practice History": "练习记录",
  "Writing Discussions": "作文交流",
  "Study Discussions": "备考讨论",
  "Writing History": "写作记录",
  "Recently Completed": "最近完成的练习",
  "Overall Progress": "总体进度",
  "Unique exercises completed": "已完成的不同题目",
  "Completed": "已全部完成",
  "Continue": "继续练习",
  "View Details": "查看详情",
  "No Practice History Yet": "还没有写作记录",
  "Start Your First Exercise": "开始第一次练习",
  "Original Prompt": "原题",
  "My Answer": "我的答案",
  "Suggested Answer": "参考答案",
  "Key Point": "简要解析",
  "Continue Practicing": "继续练习",
  "View All Records": "查看全部记录",
  "Key Skill": "本题技巧",
  "Original Sentence": "原句",
  "Your Summary": "我的缩写",
  "Submit and View Suggested Answer": "提交并查看参考答案",
  "Edit My Answer": "修改我的答案",
  "Discuss This Exercise": "讨论这道题",
  "Previous": "上一页",
  "Next": "下一页",
  "Exercise Flow": "本题流程",
  "Start Reading": "开始阅读",
  "Reading Time Remaining": "阅读剩余时间",
  "Writing Time Remaining": "写作剩余时间",
  "Writing Time Ended": "写作时间已到",
  "Submitted": "本题已提交",
  "Reading Passage": "阅读材料",
  "Original Passage Review": "原文回顾",
  "Reading Phase": "阅读阶段",
  "Finish Reading and Start Writing": "提前结束阅读，开始缩写",
  "Retell the Main Content Coherently": "用连贯的短文保留主要内容",
  "Start Mock Test": "开始模拟",
  "Phase One": "第一阶段",
  "Phase Two": "第二阶段",
  "Test Finished": "模拟结束",
  "Read the Passage": "阅读原文",
  "Write Your Summary": "完成缩写",
  "Title": "标题",
  "Submit Mock Response": "提交模拟作文",
  "Suggested Title": "参考标题",
  "Suggested Summary": "参考缩写",
  "Summary Approach": "缩写思路",
  "Write HSK AI Tutor": "Write HSK AI助教",
  "Personalized Feedback on Your Summary": "针对你的缩写进行具体反馈",
  "Get AI Feedback": "获取AI反馈",
  "Reviewing your summary…": "正在阅读你的缩写…",
  "Top Priority": "优先修改的问题",
  "Task Requirements": "任务要求检查",
  "Length": "字数",
  "Fidelity": "忠于原文",
  "Personal Opinion": "个人观点",
  "What You Did Well": "做得好的地方",
  "What Needs Improvement": "需要修改的地方",
  "Suggested Revision": "改进示例",
  "Complete Question Bank": "完整题库",
  "Write HSK · Membership": "Write HSK · 会员权益",
  "Start Free, Then Unlock the Complete Question Bank": "免费开始练习，需要时再解锁完整题库",
  "Sign in to save progress, join the community, and try AI feedback. Members receive all writing exercises, every HSK 6 mock test, and more AI feedback.": "登录后可以保存进度、参与社区并体验AI反馈；付费会员可以使用全部缩写练习、HSK 6模拟题和更多AI反馈。",
  "Try part of each exercise set. Sign in to save your history and join the community.": "每类练习开放部分题目。登录后还可以保存记录并参与社区。",
  "For learners who want every summarization exercise, all HSK 6 mock tests, and continued AI feedback.": "适合需要完成全部缩写训练、HSK 6模拟训练并持续获得AI反馈的学习者。",
  "Save practice progress": "保存做题进度",
  "Join the community": "参与学习社区",
  "Personalized AI feedback": "AI个性化反馈",
  "3 free sessions after sign-in": "登录后免费体验3次",
  "5 sessions per 24 hours": "最近24小时5次",
  "Monthly subscription · Renews automatically": "月度订阅，每月自动续费",
  "Cancel anytime. Access remains active until the end of the current billing period.": "可随时取消；取消后仍可使用到当前付费周期结束。",
  "This is a recurring monthly subscription, not a one-time purchase. Payment authorizes automatic monthly billing until cancellation.": "这是月度自动续费订阅，不是单次购买。付款即表示同意每月自动扣款，直至取消。",
  "Sign In to Continue": "登录后继续",
  "Sign In and Save Progress": "登录并保存进度",
  "Current Plan: Free": "当前为免费账户",
  "Free": "免费版",
  "Full Access": "全部开放",
  "Available": "可使用",
  "Membership Status": "当前会员状态",
  "Active": "已生效",
  "Test Membership": "测试会员",
  "Started": "开通日期",
  "Access Until": "会员有效期至",
  "Next Renewal": "下次续费日期",
  "Manage or Cancel Subscription": "管理或取消订阅",
  "Sign In to Subscribe": "登录后订阅会员",
  "Subscribe — Renews Monthly": "订阅会员（每月自动续费）",
  "Opening checkout…": "正在打开结账页面…",
  "Join the Community": "参与学习社区",
  "Learning Community": "学习社区",
  "All Exercises": "全部题目",
  "All Exercises Discussions": "全部题目讨论",
  "Open Discussion": "进入讨论",
  "Locked": "已锁定",
  "Members Only": "会员题目",
  "Sign In Required": "需要登录",
  "Be the First to Share": "等待第一个想法",
  "Join the Discussion": "参与讨论",
  "How Would You Approach This Exercise?": "你怎样理解这道题？",
  "Post Idea": "发表想法",
  "Publishing…": "发布中…",
  "Discussion": "这道题的讨论",
  "Be the First": "第一个位置留给你",
  "No One Has Discussed This Exercise Yet": "还没有人讨论这道题",
  "This Week's Community Message": "本期共同写成",
  "Share Some Encouragement": "写一句鼓励的话",
  "Post anonymously": "匿名显示",
  "Add to the Wall": "加入文字墙",
  "Sign In to Post": "登录并发布",
  "Live Messages": "实时短句",
  "Community posts": "真实留言",
  "Study examples": "官方示例",
  "What Should We Create Next?": "下一期写什么？",
  "Currently on the wall": "正在组成文字墙",
  "Vote for this theme": "为这个字投票",
  "Sign in to vote": "登录后投票",
  "Contact Us": "联系我们",
  "Support Email": "联系邮箱",
  "Help Us Resolve Your Request Faster": "为了更快解决问题",
  "Legal & Privacy": "法律与隐私",
  "Information We Collect": "我们收集的信息",
  "How We Use Information": "信息的使用目的",
  "AI Feedback and Content Processing": "AI反馈与内容处理",
  "Service Providers and International Processing": "服务提供商与跨境处理",
  "Retention and Security": "保存期限与安全",
  "Your Rights": "你的权利",
  "Cookies and Sign-In Sessions": "Cookie与登录状态",
  "Minors": "未成年人",
  "Policy Updates": "政策更新",
  "Service Rules": "使用规则",
  "Service": "服务内容",
  "Independent Platform": "非官方说明",
  "Account Responsibilities": "账号责任",
  "Membership and Payment": "会员订阅与付款",
  "AI Feedback": "AI反馈",
  "User Content and Community Rules": "用户内容与社区规则",
  "Website Content and Intellectual Property": "网站内容与知识产权",
  "Service Availability": "服务可用性",
  "Suspension and Termination": "暂停与终止",
  "Governing Rules": "适用规则",
  "Refunds & Cancellation Policy": "退款与取消政策",
  "Automatic Renewal": "自动续订",
  "How to Cancel": "如何取消",
  "Refund Requests": "退款申请",
  "Processing and Timing": "处理方式与时间",
  "Information to Include": "申请时请提供",
  "Effective date: August 14, 2026": "生效日期：2026年8月14日",
  "Questions about this page?": "对本页面有疑问？",
  "Contact us": "联系我们",
};

const zhPatterns: Array<[RegExp, (...matches: string[]) => string]> = [
  [/^Exercise (\d+) \/ (\d+)$/, (_all, a, b) => `练习 ${a} / ${b}`],
  [/^Mock Test (\d+) \/ (\d+)$/, (_all, a, b) => `模拟题 ${a} / ${b}`],
  [/^Completed (\d+) \/ (\d+)$/, (_all, a, b) => `已完成 ${a} / ${b}`],
  [/^Page (\d+) of (\d+)$/, (_all, a, b) => `第 ${a} / ${b} 页`],
  [/^Exercise (\d+)$/, (_all, a) => `第 ${a} 题`],
  [/^Practiced (\d+) time(?:s)?$/, (_all, a) => `已练习 ${a} 次`],
  [/^(\d+) exercises$/, (_all, a) => `共 ${a} 道题`],
  [/^(\d+) posts$/, (_all, a) => `${a} 条`],
  [/^(\d+) discussions$/, (_all, a) => `${a} 条讨论`],
  [/^(\d+) votes$/, (_all, a) => `${a} 票`],
  [/^(\d+) characters$/, (_all, a) => `${a} 字`],
];

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function translateText(value: string) {
  const trimmed = value.trim();
  const direct = zhTranslations[trimmed];
  if (direct) return value.replace(trimmed, direct);
  for (const [pattern, replacer] of zhPatterns) {
    const match = trimmed.match(pattern);
    if (match) return value.replace(trimmed, replacer(...match));
  }
  return value;
}

function localizeDocument(locale: Locale) {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest("[data-no-translate]") && !["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
      if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
      const source = originalText.get(node) || "";
      node.nodeValue = locale === "zh" ? translateText(source) : source;
    }
    node = walker.nextNode() as Text | null;
  }

  document.querySelectorAll("[placeholder], [title], [aria-label]").forEach((element) => {
    if (element.closest("[data-no-translate]")) return;
    let saved = originalAttributes.get(element);
    if (!saved) {
      saved = new Map();
      originalAttributes.set(element, saved);
    }
    ["placeholder", "title", "aria-label"].forEach((name) => {
      const current = element.getAttribute(name);
      if (current !== null && !saved!.has(name)) saved!.set(name, current);
      const source = saved!.get(name);
      if (source !== undefined) element.setAttribute(name, locale === "zh" ? translateText(source) : source);
    });
  });
}

export default function LanguageController() {
  const [locale, setLocale] = useState<Locale>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("write-hsk-language");
    const initial: Locale = saved === "zh" || saved === "en" ? saved : "en";
    setLocale(initial);
    localizeDocument(initial);
  }, []);

  useEffect(() => {
    localizeDocument(locale);
    const observer = new MutationObserver(() => localizeDocument(locale));
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  function switchLanguage() {
    const next: Locale = locale === "en" ? "zh" : "en";
    window.localStorage.setItem("write-hsk-language", next);
    setLocale(next);
  }

  return (
    <button className="language-switcher" type="button" onClick={switchLanguage} data-no-translate aria-label={locale === "en" ? "切换到中文" : "Switch to English"}>
      <span>{locale === "en" ? "中文" : "EN"}</span>
    </button>
  );
}
