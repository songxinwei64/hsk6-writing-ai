import Link from "next/link";
import { getMembershipAccess } from "../../lib/membership";
import { PRACTICE_ACCESS } from "../../lib/practice-items";
import CheckoutButton from "../../components/checkout-button";

export const dynamic = "force-dynamic";

const benefits = [
  {
    label: "句子缩写",
    free: PRACTICE_ACCESS.sentence.free,
    total: PRACTICE_ACCESS.sentence.total,
    unit: "道",
  },
  {
    label: "短文缩写",
    free: PRACTICE_ACCESS.paragraph.free,
    total: PRACTICE_ACCESS.paragraph.total,
    unit: "篇",
  },
  {
    label: "HSK写作模拟",
    free: PRACTICE_ACCESS.mock.free,
    total: PRACTICE_ACCESS.mock.total,
    unit: "篇",
  },
] as const;

export default async function MembershipPage() {
  const access = await getMembershipAccess();

  return (
    <main className="page">
      <section className="membership-shell">
        <div className="membership-heading">
          <span className="eyebrow">Write HSK · 会员权益</span>
          <h1>免费开始练习，需要时再解锁完整题库</h1>
          <p>登录后可以保存进度、参与社区并体验AI反馈；付费会员可以使用全部缩写练习、HSK 6模拟题和更多AI反馈。</p>
        </div>

        <div className="membership-plans">
          <article className="membership-plan">
            <div className="membership-plan-title">
              <span>免费版</span>
              <strong>¥0</strong>
            </div>
            <p>每类练习开放部分题目。登录后还可以保存记录并参与社区。</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit.label}>
                  <span>{benefit.label}</span>
                  <b>{benefit.free} / {benefit.total} {benefit.unit}</b>
                </li>
              ))}
              <li><span>保存做题进度</span><b>{access.isAuthenticated ? "可使用" : "登录后可用"}</b></li>
              <li><span>参与学习社区</span><b>{access.isAuthenticated ? "可使用" : "登录后可用"}</b></li>
              <li><span>AI个性化反馈</span><b>登录后免费体验3次</b></li>
            </ul>
            {!access.isAuthenticated ? (
              <Link className="membership-secondary-action" href="/?auth=login&next=/membership">登录并保存进度</Link>
            ) : (
              <span className="membership-current">当前为免费账户</span>
            )}
          </article>

          <article className="membership-plan membership-plan-paid">
            <div className="membership-plan-badge">完整题库</div>
            <div className="membership-plan-title">
              <span>付费会员</span>
              <strong>全部开放</strong>
            </div>
            <p>适合需要完成全部缩写训练、HSK 6模拟训练并持续获得AI反馈的学习者。</p>
            <ul>
              {benefits.map((benefit) => (
                <li key={benefit.label}>
                  <span>{benefit.label}</span>
                  <b>{benefit.total} / {benefit.total} {benefit.unit}</b>
                </li>
              ))}
              <li><span>保存做题进度</span><b>可使用</b></li>
              <li><span>参与学习社区</span><b>可使用</b></li>
              <li><span>AI个性化反馈</span><b>最近24小时5次</b></li>
            </ul>
            {access.isPaidMember ? (
              <Link className="membership-primary-action" href="/practice">会员已生效，开始练习</Link>
            ) : access.isAuthenticated ? (
              <CheckoutButton />
            ) : (
              <Link className="membership-primary-action" href="/?auth=login&next=/membership">登录后升级会员</Link>
            )}
          </article>
        </div>

        <p className="membership-note">会员按月自动续费，可随时取消；取消后仍可使用到当前付费周期结束。</p>
      </section>
    </main>
  );
}
