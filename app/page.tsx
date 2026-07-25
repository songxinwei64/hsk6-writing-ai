const menuItems = ["学习训练", "完整写作", "我的学习", "学习社区"];

const learningSteps = [
  {
    number: "01",
    icon: "读",
    title: "读懂",
    description: "抓住人物、变化和结果，不被不重要的细节带走。",
    tone: "sage",
  },
  {
    number: "02",
    icon: "缩",
    title: "缩好",
    description: "保留文章的主要内容，把一篇长文慢慢变得简洁。",
    tone: "peach",
  },
  {
    number: "03",
    icon: "写",
    title: "写清楚",
    description: "用自然、连贯的中文，重新讲述一个完整的故事。",
    tone: "lavender",
  },
];

const feedbackItems = [
  ["内容完整", "重要事件保留得很好", "good"],
  ["信息取舍", "有两个细节可以删掉", "notice"],
  ["中文表达", "句子自然，顺序清楚", "good"],
];

export default function Home() {
  return (
    <main className="page">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">文</span>
          <span className="brand-name">
            Write HSK
            <small>HSK 写作学习</small>
          </span>
        </div>

        <nav className="menu" aria-label="主菜单">
          {menuItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </nav>

        <div className="avatar">林</div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">HSK 6 · AI 写作学习</span>
          <h1>
            读懂文章的脉络，
            <br />
            写出清楚的中文。
          </h1>
          <p>
            从小练习到完整模拟，AI 陪你找到问题、修改作文，也看见每一次进步。
          </p>

          <div className="hero-actions">
            <span className="visual-button primary">开始今天的练习　→</span>
            <span className="visual-button text">先看看怎么学</span>
          </div>

          <div className="learner-proof">
            <div className="face-stack">
              <span>安</span>
              <span>J</span>
              <span>민</span>
              <span>M</span>
            </div>
            <p>
              <b>1,284</b> 位学习者正在一起坚持
            </p>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <span className="shape shape-one" />
          <span className="shape shape-two" />
          <div className="practice-paper">
            <div className="paper-heading">
              <span>今日小练习</span>
              <small>约 8 分钟</small>
            </div>
            <p className="question">
              下面哪一句最适合作为这一段的主要内容？
            </p>
            <div className="answer">A　他每天七点准时出门。</div>
            <div className="answer selected">
              <span>B　一次意外让他改变了原来的计划。</span>
              <b>✓</b>
            </div>
            <div className="answer">C　街边新开了一家咖啡店。</div>
            <div className="ai-note">
              <span className="ai-badge">AI</span>
              <p>
                <b>选得很好</b>
                <small>这一句保留了故事中最重要的“变化”。</small>
              </p>
            </div>
          </div>
          <span className="floating-tag tag-read">理解</span>
          <span className="floating-tag tag-write">表达</span>
        </div>
      </section>

      <section className="section learning-section">
        <div className="section-heading">
          <span className="eyebrow">你的学习路径</span>
          <h2>写好缩写，其实可以一步一步来</h2>
          <p>不用一开始就面对完整作文，先把三个重要能力练扎实。</p>
        </div>

        <div className="step-grid">
          {learningSteps.map((step) => (
            <article className={`step-card ${step.tone}`} key={step.number}>
              <span className="large-number">{step.number}</span>
              <span className="step-icon">{step.icon}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="card-more">查看练习　→</span>
            </article>
          ))}
        </div>
      </section>

      <section className="section progress-section">
        <div className="progress-card">
          <div className="progress-copy">
            <span className="eyebrow light">继续上一次学习</span>
            <h2>今天，先完成一个小目标</h2>
            <p>
              你正在练习“找出文章中的原因和结果”。还差 2 组就完成本节。
            </p>
            <div className="progress-line">
              <span />
            </div>
            <small>本节进度 60%</small>
          </div>
          <span className="visual-button cream">继续学习　→</span>
        </div>
      </section>

      <section className="section ai-section">
        <div className="ai-preview">
          <div className="essay-card">
            <div className="essay-top">
              <span>我的作文</span>
              <small>第二次修改</small>
            </div>
            <h3>一个特别的决定</h3>
            <p>
              年轻人原本打算离开这座城市，但一次偶然的相遇让他重新考虑了自己的选择……
            </p>
            <span className="correction correction-one">表达更自然了</span>
            <span className="correction correction-two">这里还可以更简洁</span>
          </div>

          <div className="feedback-card">
            <div className="feedback-title">
              <span className="ai-badge">AI</span>
              <div>
                <b>本次写作反馈</b>
                <small>根据你的第二次修改</small>
              </div>
              <strong>78</strong>
            </div>
            <div className="feedback-list">
              {feedbackItems.map(([title, text, status]) => (
                <div className="feedback-row" key={title}>
                  <span className={status}>{status === "good" ? "✓" : "!"}</span>
                  <div>
                    <b>{title}</b>
                    <small>{text}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="ai-copy">
          <span className="eyebrow">不只是给你一个分数</span>
          <h2>知道哪里有问题，也知道下一步怎么改</h2>
          <p>
            AI 会告诉你遗漏了什么、哪些细节可以删除、哪句话不够自然，再陪你完成第二次修改。
          </p>
          <ul>
            <li><span>01</span> 找出文章中遗漏的重要信息</li>
            <li><span>02</span> 对照原文说明问题在哪里</li>
            <li><span>03</span> 根据问题安排下一项练习</li>
          </ul>
        </div>
      </section>

      <section className="section community-section">
        <div className="section-heading left">
          <span className="eyebrow">不只是一个人练习</span>
          <h2>看看大家，怎么写同一个故事</h2>
          <p>分享不同的写法，也从别人的思路里发现新的表达方式。</p>
        </div>

        <div className="community-layout">
          <div className="quote-grid">
            <article className="quote-card">
              <div className="person">
                <span className="person-avatar coral">M</span>
                <div>
                  <b>Mina</b>
                  <small>学习中文 4 年</small>
                </div>
              </div>
              <p>
                “以前我总想把每个细节都写进去。看过其他人的版本后，才慢慢知道什么应该留下。”
              </p>
              <span className="small-tag"># 缩写练习</span>
            </article>

            <article className="quote-card shifted">
              <div className="person">
                <span className="person-avatar green">준</span>
                <div>
                  <b>Jun</b>
                  <small>准备 HSK 6</small>
                </div>
              </div>
              <p>
                “AI 没有直接替我改完，而是让我自己再写一次。这一次，我真的记住了。”
              </p>
              <span className="small-tag"># 今日打卡</span>
            </article>
          </div>

          <aside className="community-stat">
            <span>今天的社区</span>
            <strong>326</strong>
            <p>位学习者完成了今日练习</p>
            <div className="mini-faces">
              <i>소</i><i>A</i><i>李</i><i>+9</i>
            </div>
          </aside>
        </div>
      </section>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">文</span>
          <span className="brand-name">
            Write HSK
            <small>HSK 写作学习</small>
          </span>
        </div>
        <p>把复杂的中文，写得清楚一点。</p>
        <span>HSK 6 AI 写作学习平台 · 首页 UI</span>
      </footer>
    </main>
  );
}
