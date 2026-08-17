import Link from "next/link";

const writingLevels = [
  {
    number: "01",
    title: "Sentence Summarization",
    description: "Remove unnecessary details and combine ideas without changing the original meaning.",
    status: "Foundation",
    href: "/practice/sentence",
  },
  {
    number: "02",
    title: "Passage Summarization",
    description: "Identify the people, events, and outcome, then rewrite the passage clearly and concisely.",
    status: "Intermediate",
    href: "/practice/paragraph",
  },
];

export default function PracticePage() {
  return (
    <main className="page">

      <section className="practice-shell">
        <div className="practice-intro">
          <Link className="back-link" href="/">← Back to Home</Link>
          <span className="eyebrow">HSK 6 Writing · Summarization Practice</span>
          <h1>Identify Key Ideas and Write Concisely</h1>
          <p>Begin with sentences, continue with passages, and then move on to complete HSK 6 mock writing tests.</p>
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
                  Start Practice <span>→</span>
                </span>
              ) : (
                <span className="choice-action disabled" aria-disabled="true">Coming Soon</span>
              )}
              </>
            );

            return level.href ? (
              <Link
                className="writing-level-card writing-level-card-link"
                href={level.href}
                key={level.number}
                aria-label={`Start ${level.title}`}
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
