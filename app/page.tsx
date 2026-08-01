import AuthEntry from "../components/auth-entry";

const mainEntries = [
  {
    number: "01",
    icon: "practice",
    title: "分项练习",
    description: "先把写作拆开练：读懂原文、找出重点，再练句子和段落的缩写。",
    links: ["阅读理解", "缩写练习"],
    tone: "sage",
  },
  {
    number: "02",
    icon: "library",
    title: "写作题库",
    description: "想完整练一篇时，可以从历年题目或原创模拟题开始。",
    links: ["历年题目", "模拟练习"],
    tone: "sand",
  },
  {
    number: "03",
    icon: "mine",
    title: "我的题库",
    description: "收藏过、做过的题，还有每次作文的修改记录，都放在这里。",
    links: ["我的收藏", "练习记录"],
    tone: "blue",
  },
  {
    number: "04",
    icon: "community",
    title: "学习社区",
    description: "看看别人怎样缩写同一篇文章，也可以交流写作和备考经验。",
    links: ["作文交流", "备考讨论"],
    tone: "rose",
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
          <a href="#practice">分项练习</a>
          <a href="#library">写作题库</a>
          <a href="#mine">我的题库</a>
          <a href="#community">学习社区</a>
        </nav>

        <div className="header-actions">
          <AuthEntry />
        </div>
      </header>

      <section className="hero-wrap">
        <div className="hero">
          <span className="eyebrow">阅读 · 提取 · 缩写</span>
          <h1>HSK 6 写作练习</h1>
          <p>读懂原文，抓住重点，完成缩写。</p>
          <div className="hero-actions">
            <button className="primary-button" type="button">
              开始练习
            </button>
            <a href="#entries">
              看看有哪些练习 <span>→</span>
            </a>
          </div>
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
            <div className="thinking-line">
              <span className="thinking-step">
                <span>理解</span>
                <i>→</i>
              </span>
              <span className="thinking-step">
                <span>提取</span>
                <i>→</i>
              </span>
              <span className="thinking-step">
                <span>缩写</span>
              </span>
            </div>
            <div className="summary-box">
              <small>主要信息</small>
              <p>一次相遇改变了年轻人离开城市的决定。</p>
            </div>
          </div>
          <span className="visual-note note-one">找出变化</span>
          <span className="visual-note note-two">删去细节</span>
        </div>
      </section>

      <div className="entry-heading">
        <div>
          <span className="eyebrow">开始学习</span>
          <h2>你想先练哪一项？</h2>
        </div>
        <p>第一次来，可以先从阅读理解开始。</p>
      </div>

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
            <button type="button" aria-label={`进入${entry.title}`}>
              进入 <span>→</span>
            </button>
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
