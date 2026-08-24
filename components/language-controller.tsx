"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SITE_LOCALE_EVENT, SITE_LOCALE_KEY } from "../lib/use-site-locale";

type Locale = "en" | "zh" | "ko";

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
  "Separate key ideas from minor details": "区分核心信息与次要细节",
  "Organize people, events, and outcomes": "梳理人物、事件与结果",
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
  "Write HSK · Practice History": "Write HSK · 写作记录",
  "Your progress and writing history are saved here.": "你的做题进度和写作记录会保存在这里。",
  "Each new submission is saved as a separate record": "每次重新提交都会保存为一条新记录",
  "Complete and submit an exercise to save your progress and answer here.": "完成并提交一道练习后，做题进度和答案会保存在这里。",
  "Overall Progress": "总体进度",
  "Unique exercises completed": "已完成的不同题目",
  "Completed": "已全部完成",
  "Continue": "继续练习",
  "Continue →": "继续练习 →",
  "View Details": "查看详情",
  "View Details →": "查看详情 →",
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
  "Discuss This Exercise →": "讨论这道题 →",
  "Please write your summary first.": "请先写下你的缩写。",
  "Please complete your summary first.": "请先完成你的缩写。",
  "Previous": "上一题",
  "Next": "下一题",
  "← Previous": "← 上一题",
  "Next →": "下一题 →",
  "← Back to Writing Practice": "← 返回缩写练习",
  "Sentence Summarization · 100 Exercises": "句子缩写 · 100 道练习",
  "Passage Summarization · 80 Exercises": "短文缩写 · 80 道练习",
  "Keep the Main Idea, Remove the Details": "保留主要意思，删除次要细节",
  "Write your summary, then compare it with the suggested answer and key point.": "写下你的缩写，再与参考答案和简要解析进行比较。",
  "Keep the Main Idea in Fewer Words": "用更少的字保留主要意思",
  "Write your Chinese summary here…": "在这里写下你的中文缩写……",
  "Follow the Main Thread": "抓住文章主线",
  "Read for 3 minutes, then write for 7 minutes. The original passage cannot be reopened during writing.": "阅读原文3分钟，然后用7分钟完成缩写。进入写作后不能再次查看原文。",
  "Read the original passage for 3 minutes, then write your summary in 7 minutes. The passage will be hidden during writing and cannot be reopened.": "先阅读原文3分钟，再用7分钟完成缩写。写作时原文会被隐藏，不能再次查看。",
  "Write your Chinese passage summary here…": "在这里写下你的中文短文缩写……",
  "Practice with the Official Exam Flow": "按照正式考试流程练习",
  "Read for 10 minutes and write for 35 minutes. Once hidden, the original passage cannot be viewed again.": "阅读原文10分钟，原文隐藏后在35分钟内完成缩写，不能再次查看原文。",
  "Read for 10 minutes. After the passage is hidden, add your own title and write a summary of about 400 Chinese characters within 35 minutes. Do not take notes or reopen the passage.": "阅读原文10分钟。原文隐藏后，自拟标题并在35分钟内完成约400字的中文缩写。不能记录或再次查看原文。",
  "Exercise Flow": "本题流程",
  "Start Reading": "开始阅读",
  "Reading Time Remaining": "阅读剩余时间",
  "Writing Time Remaining": "写作剩余时间",
  "Writing Time Ended": "写作时间已到",
  "Submitted": "本题已提交",
  "Reading Passage": "阅读材料",
  "Original Passage Review": "原文回顾",
  "Reading Phase": "阅读阶段",
  "Do not take notes. Remember the main people, events, reasons, and outcome. The passage will be hidden when time ends.": "不要做笔记。请记住主要人物、事件、原因和结果，阅读时间结束后原文会被隐藏。",
  "Once writing begins, you cannot view the original passage again. Start writing now?": "进入写作后不能再次查看原文，确定现在开始写作吗？",
  "Time is up and no answer was submitted.": "写作时间已结束，本题没有提交答案。",
  "Finish Reading and Start Writing": "提前结束阅读，开始缩写",
  "Retell the Main Content Coherently": "用连贯的短文保留主要内容",
  "Start Mock Test": "开始模拟",
  "HSK 6 · Writing Mock Test": "HSK 6 · 写作模拟",
  "Do not copy or take notes. Remember the people, sequence of events, and outcome.": "不要抄写或做笔记，请记住人物、事件顺序和结果。",
  "Add a Chinese title": "填写中文标题",
  "Write your Chinese summary from memory without adding personal opinions…": "根据记忆完成中文缩写，不要加入个人观点……",
  "Writing time has ended. Your response can no longer be edited.": "写作时间已结束，答案不能再修改。",
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
  "Create an encouraging message together": "一起写下鼓励学习者的话",
  "Post anonymously": "匿名显示",
  "Add to the Wall": "加入文字墙",
  "Sign In to Post": "登录并发布",
  "Live Messages": "实时短句",
  "Community posts": "真实留言",
  "Study examples": "官方示例",
  "What Should We Create Next?": "下一期写什么？",
  "Currently on the wall": "正在组成文字墙",
  "Study tips currently form the characters while we wait for the first community message.": "在等待第一条社区留言时，文字墙暂时由学习提示组成。",
  "Voted · Click to remove": "已投票 · 点击取消",
  "Encouragement & Support": "鼓励与支持",
  "Hover over the mosaic to read each message and see who posted it.": "将鼠标移到文字上，可以查看完整留言和发布者。",
  "Write up to 20 Chinese characters. Your message will join the mosaic in real time.": "最多写20个汉字，你的留言会实时加入文字墙。",
  "Make your message part of “成功”.": "让你的留言成为“成功”的一部分。",
  "Browse every exercise here. Discussion access follows your current practice access, and your saved answers are never published automatically.": "在这里浏览全部题目。讨论权限与当前做题权限一致，你保存的答案不会被自动公开。",
  "Be the first to share": "等待第一个想法",
  "Ask a question or explain which details you would keep.": "提出问题，或者说说你会保留哪些信息。",
  "Back to Community": "返回学习社区",
  "Page": "第",
  "of": "/",
  "Vote for this theme": "为这个字投票",
  "Sign in to vote": "登录后投票",
  "Contact Us": "联系我们",
  "← Back to Community": "← 返回学习社区",
  "See how other learners decided which information to keep.": "看看其他学习者如何判断应该保留哪些信息。",
  "Share your reasoning or question so the next learner can continue the conversation.": "分享你的思路或问题，让下一位学习者继续参与讨论。",
  "Upgrade your membership to join this discussion.": "升级会员后即可参与本题讨论。",
  "Sign in to access discussions within the free range.": "登录后即可参与免费范围内的题目讨论。",
  "Unable to load discussions.": "无法加载讨论内容。",
  "Not available": "暂无",
  "Sign in": "登录",
  "₩12,900 / month": "₩12,900 / 月",
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
  "Membership Active — Start Practicing": "会员已生效，开始练习",
  "Manage or Cancel Subscription →": "管理或取消订阅 →",
  "exercises": "道练习",
  "tests": "套模拟题",
};

const koTranslations: Record<string, string> = {
  "Home": "홈",
  "Writing Practice": "요약 쓰기 연습",
  "Sentence Summarization": "문장 요약",
  "Passage Summarization": "단락 요약",
  "HSK 6 Mock Tests": "HSK 6 쓰기 모의고사",
  "HSK 6 Mock Test": "HSK 6 쓰기 모의고사",
  "Mock Test": "모의고사",
  "Exercise": "연습",
  "Practiced": "연습",
  "time": "회",
  "times": "회",
  "Requirements: Add a title · About": "조건: 제목 작성 · 중국어 약",
  "Chinese characters": "자",
  "Page": "페이지",
  "of": "/",
  "Mock Tests": "모의고사",
  "My Practice": "나의 연습",
  "Community": "학습 커뮤니티",
  "Membership": "멤버십",
  "Motivation Wall": "응원 메시지 벽",
  "Exercise Discussion": "문제 토론",
  "Exercise Discussions": "문제별 토론",
  "Discussions": "토론",
  "Privacy Policy": "개인정보 처리방침",
  "Terms of Service": "이용약관",
  "Refunds & Cancellation": "환불 및 해지",
  "Contact": "문의",
  "Practice": "연습",
  "Practice Overview": "연습 안내",
  "← Back to Home": "← 홈으로",
  "← Back to Writing Practice": "← 요약 쓰기 연습으로",
  "← Previous": "← 이전",
  "Next →": "다음 →",
  "HSK 6 Writing · Summarization Practice": "HSK 6 쓰기 · 요약 연습",
  "Identify Key Ideas and Write Concisely": "핵심 내용을 찾고 간결하게 쓰세요",
  "Begin with sentences, continue with passages, and then move on to complete HSK 6 mock writing tests.": "문장부터 시작해 단락 요약을 연습한 뒤 HSK 6 쓰기 모의고사에 도전하세요.",
  "Remove unnecessary details and combine ideas without changing the original meaning.": "원문의 뜻을 바꾸지 않으면서 불필요한 세부 내용을 덜어 내고 핵심을 한 문장으로 정리합니다.",
  "Identify the people, events, and outcome, then rewrite the passage clearly and concisely.": "인물, 사건, 결과를 찾아 짧고 자연스러운 글로 다시 구성합니다.",
  "Foundation": "기초",
  "Intermediate": "중급",
  "Start Practice": "연습 시작",
  "Sentence Summarization · 100 Exercises": "문장 요약 · 100문제",
  "Keep the Main Idea, Remove the Details": "핵심은 남기고 세부 내용은 덜어 내세요",
  "Write your summary, then compare it with the suggested answer and key point.": "직접 요약한 뒤 예시 답안과 핵심 해설을 비교해 보세요.",
  "Keep the Main Idea in Fewer Words": "더 적은 말로 핵심을 유지하세요",
  "Write your Chinese summary here…": "중국어 요약문을 작성하세요…",
  "Passage Summarization · 80 Exercises": "단락 요약 · 80문제",
  "Follow the Main Thread": "글의 중심 흐름을 따라가세요",
  "Read for 3 minutes, then write for 7 minutes. The original passage cannot be reopened during writing.": "3분 동안 원문을 읽고 7분 동안 요약문을 작성합니다. 쓰기 단계에서는 원문을 다시 볼 수 없습니다.",
  "Read the original passage for 3 minutes, then write your summary in 7 minutes.": "3분 동안 원문을 읽은 뒤 7분 동안 요약문을 작성합니다.",
  "The passage will be hidden during writing and cannot be reopened.": "쓰기 단계에서는 원문이 가려지며 다시 열 수 없습니다.",
  "Do not take notes. Remember the main people, events, reasons, and outcome. The passage will be hidden when time ends.": "메모하지 말고 주요 인물, 사건, 이유와 결과를 기억하세요. 읽기 시간이 끝나면 원문이 가려집니다.",
  "Write your Chinese passage summary here…": "중국어 단락 요약문을 작성하세요…",
  "HSK 6 · Writing Mock Test": "HSK 6 · 쓰기 모의고사",
  "Practice with the Official Exam Flow": "실제 시험 순서대로 연습하세요",
  "Read for 10 minutes and write for 35 minutes. Once hidden, the original passage cannot be viewed again.": "10분 동안 원문을 읽고 35분 동안 요약문을 작성합니다. 원문이 가려진 뒤에는 다시 볼 수 없습니다.",
  "Read for 10 minutes. After the passage is hidden, add your own title and write a summary of about 400 Chinese characters within 35 minutes. Do not take notes or reopen the passage.": "10분 동안 원문을 읽으세요. 원문이 가려지면 직접 제목을 정하고 35분 안에 약 400자의 중국어 요약문을 작성하세요. 메모하거나 원문을 다시 열 수 없습니다.",
  "Do not copy or take notes. Remember the people, sequence of events, and outcome.": "베껴 쓰거나 메모하지 말고 인물, 사건의 순서와 결과를 기억하세요.",
  "Add a Chinese title": "중국어 제목을 입력하세요",
  "Write your Chinese summary from memory without adding personal opinions…": "개인 의견을 덧붙이지 말고 기억한 내용을 바탕으로 중국어 요약문을 작성하세요…",
  "Writing time has ended. Your response can no longer be edited.": "쓰기 시간이 끝나 답안을 더 이상 수정할 수 없습니다.",
  "Coming Soon": "준비 중",
  "Open": "열기",
  "Main features": "주요 기능",
  "HSK 6 · AI Writing Practice": "HSK 6 · AI 쓰기 연습",
  "HSK 6 Writing Practice": "HSK 6 쓰기 연습",
  "Build summarization skills step by step, then practice with the complete HSK 6 writing format.": "문장과 단락으로 요약 능력을 익힌 뒤 실제 HSK 6 쓰기 방식으로 연습하세요.",
  "Start with sentences and short passages. Learn to identify key information and write accurate, concise summaries.": "문장과 짧은 글에서 핵심 정보를 찾고 정확하고 간결하게 요약하는 법을 배웁니다.",
  "Follow the HSK 6 exam format: read the passage, continue after it is hidden, and write a summary of about 400 Chinese characters.": "HSK 6 시험 방식에 따라 원문을 읽고, 원문이 가려진 뒤 약 400자의 중국어 요약문을 작성합니다.",
  "Review completed exercises, saved answers, and revision history in one place.": "완료한 연습, 저장한 답안, 수정 기록을 한곳에서 확인합니다.",
  "Compare approaches to the same prompt and exchange writing and exam-preparation ideas.": "같은 문제를 다른 학습자가 어떻게 요약했는지 살펴보고 쓰기와 시험 준비 방법을 나눕니다.",
  "10-Minute Reading": "10분 읽기",
  "35-Minute Writing": "35분 쓰기",
  "Full Writing · AI Feedback": "전체 쓰기 · AI 피드백",
  "About 1,000 Chinese characters": "원문 약 1,000자",
  "My Summary · About 400 characters": "나의 요약 · 약 400자",
  "Content Accuracy": "내용 정확성",
  "Identify Missing Ideas": "빠진 핵심 찾기",
  "Get Revision Guidance": "수정 방향 확인",
  "Sentence Summaries": "문장 요약",
  "Passage Summaries": "단락 요약",
  "Saved Exercises": "저장한 문제",
  "Practice History": "연습 기록",
  "Writing Discussions": "쓰기 토론",
  "Study Discussions": "시험 준비 토론",
  "Writing History": "쓰기 기록",
  "Recently Completed": "최근 완료한 연습",
  "Overall Progress": "전체 진행률",
  "Unique exercises completed": "완료한 서로 다른 문제",
  "Completed": "완료",
  "Continue": "계속하기",
  "Continue →": "계속하기 →",
  "View Details": "상세 보기",
  "View Details →": "상세 보기 →",
  "No Practice History Yet": "아직 연습 기록이 없습니다",
  "Start Your First Exercise": "첫 연습 시작",
  "Original Prompt": "원문",
  "My Answer": "나의 답안",
  "Suggested Answer": "예시 답안",
  "Key Point": "핵심 해설",
  "Continue Practicing": "계속 연습",
  "View All Records": "전체 기록 보기",
  "Key Skill": "핵심 기술",
  "Original Sentence": "원문 문장",
  "Your Summary": "나의 요약",
  "Submit and View Suggested Answer": "제출하고 예시 답안 보기",
  "Edit My Answer": "답안 수정",
  "Discuss This Exercise": "이 문제 토론하기",
  "Previous": "이전",
  "Next": "다음",
  "Exercise Flow": "연습 순서",
  "Start Reading": "읽기 시작",
  "Reading Time Remaining": "남은 읽기 시간",
  "Writing Time Remaining": "남은 쓰기 시간",
  "Writing Time Ended": "쓰기 시간이 끝났습니다",
  "Submitted": "제출 완료",
  "Reading Passage": "읽기 자료",
  "Original Passage Review": "원문 다시 보기",
  "Reading Phase": "읽기 단계",
  "Finish Reading and Start Writing": "읽기를 마치고 쓰기 시작",
  "Retell the Main Content Coherently": "주요 내용을 자연스럽게 다시 쓰세요",
  "Start Mock Test": "모의고사 시작",
  "Phase One": "1단계",
  "Phase Two": "2단계",
  "Test Finished": "모의고사 종료",
  "Read the Passage": "원문 읽기",
  "Write Your Summary": "요약문 작성",
  "Title": "제목",
  "Submit Mock Response": "모의 답안 제출",
  "Suggested Title": "예시 제목",
  "Suggested Summary": "예시 요약",
  "Summary Approach": "요약 방법",
  "Write HSK AI Tutor": "Write HSK AI 튜터",
  "Personalized Feedback on Your Summary": "작성한 요약문 맞춤 피드백",
  "Get AI Feedback": "AI 피드백 받기",
  "Reviewing your summary…": "요약문을 확인하고 있습니다…",
  "Top Priority": "가장 먼저 고칠 부분",
  "Task Requirements": "과제 조건 확인",
  "Length": "글자 수",
  "Fidelity": "원문 충실도",
  "Personal Opinion": "개인 의견",
  "What You Did Well": "잘한 점",
  "What Needs Improvement": "수정할 점",
  "Suggested Revision": "개선 예시",
  "Complete Question Bank": "전체 문제",
  "Write HSK · Membership": "Write HSK · 멤버십",
  "Start Free, Then Unlock the Complete Question Bank": "무료로 시작하고 전체 문제를 이용하세요",
  "Sign in to save progress, join the community, and try AI feedback. Members receive all writing exercises, every HSK 6 mock test, and more AI feedback.": "로그인하면 진도를 저장하고 커뮤니티와 AI 피드백을 이용할 수 있습니다. 멤버는 모든 쓰기 연습과 HSK 6 모의고사, 추가 AI 피드백을 이용할 수 있습니다.",
  "Try part of each exercise set. Sign in to save your history and join the community.": "각 연습 세트의 일부를 무료로 이용하세요. 로그인하면 기록을 저장하고 커뮤니티에 참여할 수 있습니다.",
  "For learners who want every summarization exercise, all HSK 6 mock tests, and continued AI feedback.": "모든 요약 연습과 HSK 6 모의고사, 지속적인 AI 피드백이 필요한 학습자에게 적합합니다.",
  "Save practice progress": "연습 진도 저장",
  "Join the community": "학습 커뮤니티 참여",
  "Personalized AI feedback": "개인 맞춤 AI 피드백",
  "3 free sessions after sign-in": "로그인 후 3회 무료 체험",
  "5 sessions per 24 hours": "24시간마다 5회",
  "Monthly subscription · Renews automatically": "월간 구독 · 매월 자동 갱신",
  "Cancel anytime. Access remains active until the end of the current billing period.": "언제든지 해지할 수 있으며 현재 결제 기간이 끝날 때까지 이용할 수 있습니다.",
  "This is a recurring monthly subscription, not a one-time purchase. Payment authorizes automatic monthly billing until cancellation.": "일회성 구매가 아닌 월간 자동 갱신 구독입니다. 결제하면 해지할 때까지 매월 자동 결제에 동의하게 됩니다.",
  "Sign In to Continue": "로그인 후 계속",
  "Sign In and Save Progress": "로그인하고 진도 저장",
  "Current Plan: Free": "현재 무료 플랜",
  "Free": "무료",
  "Full Access": "전체 이용",
  "Available": "이용 가능",
  "Membership Status": "멤버십 상태",
  "Active": "이용 중",
  "Test Membership": "테스트 멤버십",
  "Started": "시작일",
  "Access Until": "이용 종료일",
  "Next Renewal": "다음 결제일",
  "Manage or Cancel Subscription": "구독 관리 또는 해지",
  "Sign In to Subscribe": "로그인 후 구독",
  "Subscribe — Renews Monthly": "멤버십 구독 · 매월 자동 갱신",
  "Opening checkout…": "결제 화면을 여는 중…",
  "Learning Community": "학습 커뮤니티",
  "← Back to Community": "← 커뮤니티로 돌아가기",
  "Browse every exercise here. Discussion access follows your current practice access, and your saved answers are never published automatically.": "모든 문제를 여기에서 확인하세요. 토론 이용 범위는 현재 연습 이용 범위와 같으며, 저장한 답안은 자동으로 공개되지 않습니다.",
  "Be the first to share": "첫 의견을 남겨 보세요",
  "Ask a question or explain which details you would keep.": "질문을 남기거나 어떤 내용을 유지할지 설명해 보세요.",
  "See how other learners decided which information to keep.": "다른 학습자들이 어떤 정보를 남겼는지 확인해 보세요.",
  "Upgrade your membership to join this discussion.": "멤버십을 업그레이드하면 이 문제의 토론에 참여할 수 있습니다.",
  "Sign in to access discussions within the free range.": "로그인하면 무료 이용 범위의 문제 토론에 참여할 수 있습니다.",
  "Each new submission is saved as a separate record": "새로 제출할 때마다 별도의 기록으로 저장됩니다",
  "Your progress and writing history are saved here.": "진행 상황과 쓰기 기록이 여기에 저장됩니다.",
  "All Exercises": "전체 문제",
  "Open Discussion": "토론 열기",
  "Locked": "잠김",
  "Members Only": "멤버 전용",
  "Sign In Required": "로그인 필요",
  "Join the Discussion": "토론 참여",
  "Post Idea": "의견 게시",
  "Publishing…": "게시 중…",
  "Live Messages": "실시간 메시지",
  "Contact Us": "문의하기",
  "Support Email": "고객지원 이메일",
  "Legal & Privacy": "약관 및 개인정보",
};

const zhPatterns: Array<[RegExp, (...matches: string[]) => string]> = [
  [/^Sentence Summarization · (\d+) Exercises$/, (_all, a) => `句子缩写 · ${a} 道练习`],
  [/^Passage Summarization · (\d+) Exercises$/, (_all, a) => `短文缩写 · ${a} 道练习`],
  [/^Requirements: Add a title · About (\d+) Chinese characters$/, (_all, a) => `要求：自拟标题 · 约 ${a} 个汉字`],
  [/^Exercise (\d+) \/ (\d+)$/, (_all, a, b) => `练习 ${a} / ${b}`],
  [/^Mock Test (\d+) \/ (\d+)$/, (_all, a, b) => `模拟题 ${a} / ${b}`],
  [/^Completed (\d+) \/ (\d+)$/, (_all, a, b) => `已完成 ${a} / ${b}`],
  [/^Page (\d+) of (\d+)$/, (_all, a, b) => `第 ${a} / ${b} 页`],
  [/^Key Point · (.+)$/, (_all, a) => `简要解析 · ${a}`],
  [/^Exercise (\d+)$/, (_all, a) => `第 ${a} 题`],
  [/^Practiced (\d+) time(?:s)?$/, (_all, a) => `已练习 ${a} 次`],
  [/^(\d+) exercises$/, (_all, a) => `共 ${a} 道题`],
  [/^(\d+) posts$/, (_all, a) => `${a} 条`],
  [/^(\d+) discussions$/, (_all, a) => `${a} 条讨论`],
  [/^(\d+) votes$/, (_all, a) => `${a} 票`],
  [/^(\d+) characters$/, (_all, a) => `${a} 字`],
  [/^(\d+) messages are forming these Chinese characters in real time$/, (_all, a) => `${a} 条留言正在实时组成这些汉字`],
  [/^Sentence Summarization (\d+)$/, (_all, a) => `句子缩写 ${a}`],
  [/^Passage Summarization (\d+)$/, (_all, a) => `短文缩写 ${a}`],
  [/^Your progress and writing history are saved here for (.+)\.$/, (_all, a) => `${a} 的做题进度和写作记录会保存在这里。`],
  [/^(\d+) \/ (\d+) exercises$/, (_all, a, b) => `${a} / ${b} 道练习`],
  [/^(\d+) \/ (\d+) tests$/, (_all, a, b) => `${a} / ${b} 套模拟题`],
  [/^Page (\d+) of (\d+)$/, (_all, a, b) => `第 ${a} / ${b} 页`],
  [/^(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2}), (\d{4})$/, (_all, month, day, year) => {
    const months: Record<string, number> = { January: 1, February: 2, March: 3, April: 4, May: 5, June: 6, July: 7, August: 8, September: 9, October: 10, November: 11, December: 12 };
    return `${year}年${months[month]}月${day}日`;
  }],
];

const koPatterns: Array<[RegExp, (...matches: string[]) => string]> = [
  [/^Sentence Summarization · (\d+) Exercises$/, (_all, a) => `문장 요약 · ${a}문제`],
  [/^Passage Summarization · (\d+) Exercises$/, (_all, a) => `단락 요약 · ${a}문제`],
  [/^Exercise (\d+) \/ (\d+)$/, (_all, a, b) => `연습 ${a} / ${b}`],
  [/^Mock Test (\d+) \/ (\d+)$/, (_all, a, b) => `모의고사 ${a} / ${b}`],
  [/^Requirements: Add a title · About (\d+) Chinese characters$/, (_all, a) => `조건: 제목 작성 · 중국어 약 ${a}자`],
  [/^Completed (\d+) \/ (\d+)$/, (_all, a, b) => `완료 ${a} / ${b}`],
  [/^Page (\d+) of (\d+)$/, (_all, a, b) => `${a} / ${b} 페이지`],
  [/^Exercise (\d+)$/, (_all, a) => `${a}번 문제`],
  [/^Practiced (\d+) time(?:s)?$/, (_all, a) => `${a}회 연습`],
  [/^(\d+) exercises$/, (_all, a) => `총 ${a}문제`],
  [/^(\d+) posts$/, (_all, a) => `${a}개 게시물`],
  [/^Sentence Summarization (\d+)$/, (_all, a) => `문장 요약 ${a}`],
  [/^Passage Summarization (\d+)$/, (_all, a) => `단락 요약 ${a}`],
  [/^Your progress and writing history are saved here for (.+)\.$/, (_all, a) => `${a} 계정의 진행 상황과 쓰기 기록이 여기에 저장됩니다.`],
  [/^(\d+) discussions$/, (_all, a) => `${a}개 토론`],
  [/^(\d+) votes$/, (_all, a) => `${a}표`],
  [/^(\d+) characters$/, (_all, a) => `${a}자`],
];

const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();

function translateText(value: string, locale: Exclude<Locale, "en">) {
  const trimmed = value.trim();
  const translations = locale === "zh" ? zhTranslations : koTranslations;
  const patterns = locale === "zh" ? zhPatterns : koPatterns;
  const direct = translations[trimmed];
  if (direct) return value.replace(trimmed, direct);
  for (const [pattern, replacer] of patterns) {
    const match = trimmed.match(pattern);
    if (match) return value.replace(trimmed, replacer(...match));
  }
  return value;
}

function localizeDocument(locale: Locale) {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : locale === "ko" ? "ko-KR" : "en";
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !parent.closest("[data-no-translate]") && !["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) {
      const current = node.nodeValue || "";
      let source = originalText.get(node);
      if (source === undefined) {
        source = current;
        originalText.set(node, source);
      } else {
        const rendered = locale === "en" ? source : translateText(source, locale);
        // React may reuse the same text node when the current exercise changes.
        // If its value is neither the stored source nor our rendered translation,
        // treat it as fresh application content instead of restoring stale text.
        if (current !== source && current !== rendered) {
          source = current;
          originalText.set(node, source);
        }
      }
      const translated = locale === "en" ? source : translateText(source, locale);
      if (node.nodeValue !== translated) node.nodeValue = translated;
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
      if (current === null) return;
      let source = saved!.get(name);
      if (source === undefined) {
        source = current;
        saved!.set(name, source);
      } else {
        const rendered = locale === "en" ? source : translateText(source, locale);
        if (current !== source && current !== rendered) {
          source = current;
          saved!.set(name, source);
        }
      }
      const translated = locale === "en" ? source : translateText(source, locale);
      if (current !== translated) element.setAttribute(name, translated);
    });
  });
}

export default function LanguageController() {
  const [locale, setLocale] = useState<Locale>("en");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem(SITE_LOCALE_KEY);
    const initial: Locale = pathname === "/ko" ? "ko" : saved === "zh" || saved === "ko" || saved === "en" ? saved : "en";
    setLocale(initial);
    localizeDocument(initial);
  }, []);

  useEffect(() => {
    localizeDocument(locale);
    const observer = new MutationObserver(() => localizeDocument(locale));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, [locale]);

  function switchLanguage(next: Locale) {
    window.localStorage.setItem(SITE_LOCALE_KEY, next);
    setLocale(next);
    window.dispatchEvent(new Event(SITE_LOCALE_EVENT));
    if (next === "ko" && pathname === "/") router.push("/ko");
    if (next !== "ko" && pathname === "/ko") router.push("/");
  }

  return (
    <div className="language-switcher" data-no-translate role="group" aria-label="Language / 语言 / 언어">
      <button type="button" className={locale === "en" ? "active" : ""} onClick={() => switchLanguage("en")} aria-pressed={locale === "en"}>EN</button>
      <button type="button" className={locale === "zh" ? "active" : ""} onClick={() => switchLanguage("zh")} aria-pressed={locale === "zh"}>中文</button>
      <button type="button" className={locale === "ko" ? "active" : ""} onClick={() => switchLanguage("ko")} aria-pressed={locale === "ko"}>한국어</button>
    </div>
  );
}
