import AuthEntry from "../components/auth-entry";
import Link from "next/link";

const mainEntries = [
  {
    number: "01",
    icon: "practice",
    title: "缩写练习",
    description: "从句子缩写开始，逐步完成短文缩写和接近HSK 6写作流程的完整模拟。",
    links: ["句子缩写", "短文缩写", "HSK 6 写作模拟"],
    tone: "sage",
    href: "/practice",
  },
  {
    number: "02",
    icon: "library",
    title: "历年真题",
    description: "按年份查看HSK 6写作题目，了解真实考试中的文章类型和写作要求。",
    links: ["HSK 6 写作", "按年份查看"],
    tone: "sand",
    href: "#library",
  },
  {
    number: "03",
    icon: "mine",
    title: "我的题库",
    description: "收藏过、做过的题，还有每次作文的修改记录，都放在这里。",
    links: ["我的收藏", "练习记录"],
    tone: "blue",
    href: "#mine",
  },
  {
    number: "04",
    icon: "community",
    title: "学习社区",
    description: "看看别人怎样缩写同一篇文章，也可以交流写作和备考经验。",
    links: ["作文交流", "备考讨论"],
    tone: "rose",
    href: "#community",
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
      <header className="header">
        <a className="brand" href="#" aria-label="Write HSK 首页">
          <span className="brand-mark">W</span>
          <span>Write HSK</span>
        </a>

        <nav className="nav" aria-label="主菜单">
          <a href="#practice">缩写练习</a>
          <a href="#library">历年真题</a>
          <a href="#mine">我的题库</a>
          <a href="#community">学习社区</a>
        </nav>

        <div className="header-actions">
          <AuthEntry />
        </div>
      </header>

      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">HSK 6 · AI 写作练习</span>
          <h1>HSK 6级写作练习</h1>
          <p>完成缩写后，获得AI反馈。</p>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="paper">
            <div className="paper-top">
              <span>缩写练习</span>
              <small>先找出文章里的变化</small>
            </div>
            <p className="paper-text">
              年轻人原本打算离开这座城市。
              <mark>一次偶然的相遇</mark>
              ，让他重新考虑了这个决定。
            </p>
            <div className="summary-box">
              <small>我的缩写</small>
              <p>年轻人遇到一个人后，决定留在这座城市。</p>
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
                原文只说他“重新考虑”离开的决定，没有说明他最终决定留下。
              </p>
              <div className="ai-suggestion">
                <small>建议修改</small>
                <span>一次偶然的相遇，让年轻人重新考虑离开城市的决定。</span>
              </div>
            </div>
          </div>
          <span className="visual-note note-one">发现原意偏差</span>
          <span className="visual-note note-two">给出修改方向</span>
        </div>
      </section>

      <section className="entry-grid" id="entries" aria-label="主要功能">
        {mainEntries.map((entry, index) => (
          <article
            className={`entry-card ${entry.tone}`}
            id={sectionIds[index]}
            key={entry.number}
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
            <Link className="entry-action" href={entry.href} aria-label={`进入${entry.title}`}>
              进入 <span>→</span>
            </Link>
          </article>
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
