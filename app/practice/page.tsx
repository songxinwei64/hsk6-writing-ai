import Link from "next/link";
import SiteHeader from "../../components/site-header";

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
  {
    number: "03",
    title: "HSK 6 写作模拟",
    description: "按照接近HSK 6写作的流程，阅读完整文章、隐藏原文、计时并完成整篇缩写。",
    status: "完整训练",
    href: "/practice/mock",
  },
];

export default function PracticePage() {
  return (
    <main className="page">
      <SiteHeader />

      <section className="practice-shell">
        <div className="practice-intro">
          <Link className="back-link" href="/">← 返回首页</Link>
          <span className="eyebrow">HSK 6 写作 · 缩写练习</span>
          <h1>从一句话到完整模拟</h1>
          <p>先练句子缩写，再完成短文缩写，最后进入接近HSK 6写作流程的完整训练。</p>
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
