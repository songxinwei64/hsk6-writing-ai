import Link from "next/link";
import SiteHeader from "../../components/site-header";

const writingLevels = [
  {
    number: "01",
    title: "短段缩写",
    description: "阅读一段短文，在原文保持可见的情况下，练习提取重点、删除细节并控制字数。",
    status: "日常练习",
  },
  {
    number: "02",
    title: "HSK 6 写作模拟",
    description: "按照接近HSK 6写作的流程，阅读完整文章、隐藏原文、计时并完成整篇缩写。",
    status: "完整训练",
  },
];

export default function PracticePage() {
  return (
    <main className="page">
      <SiteHeader />

      <section className="practice-shell">
        <div className="practice-intro">
          <Link className="back-link" href="/">← 返回首页</Link>
          <span className="eyebrow">HSK 6 写作 · 分项练习</span>
          <h1>从短段练习到完整模拟</h1>
          <p>先用短段反复练习缩写方法，再完成接近HSK 6写作流程的完整训练。</p>
        </div>

        <div className="writing-level-grid">
          {writingLevels.map((level) => (
            <article className="writing-level-card" key={level.number}>
              <div className="writing-level-top">
                <span>{level.number}</span>
                <small>{level.status}</small>
              </div>
              <h2>{level.title}</h2>
              <p>{level.description}</p>
              <span className="choice-action disabled" aria-disabled="true">即将开放</span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
