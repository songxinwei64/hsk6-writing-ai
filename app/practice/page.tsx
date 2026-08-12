import Link from "next/link";

const writingLevels = [
  {
    number: "01",
    title: "句子缩写",
    description: "从一个长句开始，删除多余细节、合并表达，在不改变原意的情况下把句子写得更简洁。",
    status: "基础训练",
    href: "/practice/sentence",
  },
  {
    number: "02",
    title: "短文缩写",
    description: "阅读一篇短文，提取人物、事件和结果，删除次要内容，写成更精炼、连贯的短文。",
    status: "进阶训练",
    href: "/practice/paragraph",
  },
];

export default function PracticePage() {
  return (
    <main className="page">

      <section className="practice-shell">
        <div className="practice-intro">
          <Link className="back-link" href="/">← 返回首页</Link>
          <span className="eyebrow">HSK 6 写作 · 缩写练习</span>
          <h1>练会提取重点与压缩表达</h1>
          <p>先从句子开始，再练习短文缩写。准备好以后，可以进入HSK写作模拟题库完成整篇训练。</p>
        </div>

        <div className="writing-level-grid">
          {writingLevels.map((level) => {
            const cardContent = (
              <>
              <div className="writing-level-top">
                <span>{level.number}</span>
                <small>{level.status}</small>
              </div>
              <h2>{level.title}</h2>
              <p>{level.description}</p>
              {level.href ? (
                <span className="choice-action">
                  开始练习 <span>→</span>
                </span>
              ) : (
                <span className="choice-action disabled" aria-disabled="true">即将开放</span>
              )}
              </>
            );

            return level.href ? (
              <Link
                className="writing-level-card writing-level-card-link"
                href={level.href}
                key={level.number}
                aria-label={`开始${level.title}`}
              >
                {cardContent}
              </Link>
            ) : (
              <article className="writing-level-card" key={level.number}>
                {cardContent}
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
