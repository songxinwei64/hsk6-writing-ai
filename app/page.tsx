import Link from "next/link";

const mainEntries = [
  {
    number: "01",
    icon: "practice",
    title: "缩写练习",
    description: "先从句子和短文开始，练习提取重点、删除次要信息，把内容写得准确、简洁。",
    links: ["句子缩写", "短文缩写"],
    tone: "sage",
    href: "/practice",
  },
  {
    number: "02",
    icon: "library",
    title: "HSK写作模拟题库",
    description: "完成基础练习后，按照HSK 6考试流程阅读原文、隐藏原文并完成约400字的缩写。",
    links: ["阅读10分钟", "写作35分钟", "AI反馈"],
    tone: "sand",
    href: "/practice/mock",
  },
  {
    number: "03",
    icon: "mine",
    title: "我的题库",
    description: "收藏过、做过的题，还有每次作文的修改记录，都放在这里。",
    links: ["我的收藏", "练习记录"],
    tone: "blue",
    href: "/my-library",
  },
  {
    number: "04",
    icon: "community",
    title: "学习社区",
    description: "看看别人怎样缩写同一篇文章，也可以交流写作和备考经验。",
    links: ["作文交流", "备考讨论"],
    tone: "rose",
    href: "/community",
  },
];

const sectionIds = ["practice", "library", "mine", "community"];

function EntryIcon({ name }: { name: string }) {
  if (name === "practice") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.5h9l3 3V20.5H6z" />
        <path d="M15 3.5v3h3M9 11h6M9 15h4" />
      </svg>
    );
  }

  if (name === "library") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 5.5h6.2c1.1 0 1.8.5 1.8 1.5v12c0-1-.7-1.5-1.8-1.5H4.5z" />
        <path d="M19.5 5.5h-6.2c-1.1 0-1.8.5-1.8 1.5v12c0-1 .7-1.5 1.8-1.5h6.2z" />
      </svg>
    );
  }

  if (name === "mine") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h6l1.7 2H20v10H4z" />
        <path d="M9.5 13h5M12 10.5V16" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5h11v8H9l-4 3v-3H4z" />
      <path d="M10 9h10v8h-3v3l-4-3h-3" />
    </svg>
  );
}

export default function Home() {
  return (
    <main className="page">
      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">HSK 6 · AI 写作练习</span>
          <h1>HSK 6级写作练习</h1>
          <p>先用句子和短文练习提取重点，再按照HSK 6考试流程完成整篇缩写。</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="paper">
            <div className="paper-top">
              <span>完整写作 · AI反馈</span>
              <small>原文约1000字</small>
            </div>
            <p className="paper-text">
              大雪封路后，老周仍步行四小时，把急需的药送到山村。
              <mark>这件事也让邮局重新认识了山区邮路的价值。</mark>
            </p>
            <div className="summary-box">
              <small>我的缩写 · 约400字</small>
              <p>老周冒雪为老人送药，邮局因此决定保留这条邮路。</p>
            </div>
            <div className="ai-feedback-card">
              <div className="ai-feedback-head">
                <span className="ai-avatar">W</span>
                <span className="ai-identity">
                  <b>Write HSK AI 助教</b>
                  <small>内容准确性</small>
                </span>
                <span className="ai-spark" aria-hidden="true">✦</span>
              </div>
              <p>
                你保留了送药和邮路被保留的结果，但遗漏了村民清雪开路，以及邮路长期承担便民服务的原因。
              </p>
              <div className="ai-suggestion">
                <small>建议修改</small>
                <span>补充村民的行动和邮路的实际作用，让事件发展与最终结果衔接完整。</span>
              </div>
            </div>
          </div>
          <span className="visual-note note-one">发现原意偏差</span>
          <span className="visual-note note-two">给出修改方向</span>
        </div>
      </section>

      <section className="entry-grid" id="entries" aria-label="主要功能">
        {mainEntries.map((entry, index) => (
          <Link
            className={`entry-card ${entry.tone}`}
            id={sectionIds[index]}
            key={entry.number}
            href={entry.href}
            aria-label={`进入${entry.title}`}
          >
            <div className="entry-top">
              <span className="entry-icon">
                <EntryIcon name={entry.icon} />
              </span>
              <span className="entry-number">{entry.number}</span>
            </div>
            <h3>{entry.title}</h3>
            <p>{entry.description}</p>
            <div className="entry-links">
              {entry.links.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
            <span className="entry-action">
              进入 <span>→</span>
            </span>
          </Link>
        ))}
      </section>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span>Write HSK</span>
        </div>
        <p>陪你练好 HSK 6 写作</p>
        <span>© 2026 Write HSK</span>
      </footer>
    </main>
  );
}
