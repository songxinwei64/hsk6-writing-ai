import type { Metadata } from "next";
import LegalPage from "../../components/legal-page";

export const metadata: Metadata = {
  title: "退款与取消政策 | Write HSK",
  description: "Write HSK 会员订阅的续费、取消和退款规则。",
};

export default function RefundsPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · 会员订阅"
      title="退款与取消政策"
      summary="会员按月自动续订。你可以随时取消，取消后通常仍可使用至当前已付费周期结束。"
    >
      <section>
        <h2>1. 自动续订</h2>
        <p>Write HSK 会员是按月订阅服务。除非在下一次续费前取消，否则系统会按结账时显示的价格自动向原支付方式收费。适用税费和最终结算金额由 Lemon Squeezy 在结账页面显示。</p>
      </section>

      <section>
        <h2>2. 如何取消</h2>
        <p>你可以通过会员页面中的订阅管理入口或 Lemon Squeezy 提供的客户门户取消订阅。建议至少在下一次续费前48小时完成操作，以避免处理延迟。取消会停止未来续费，但会员权限通常保留到当前付费周期结束。</p>
      </section>

      <section>
        <h2>3. 退款申请</h2>
        <p>退款将根据具体情况审查。重复扣款、未经授权的交易、长时间无法提供已购买服务或其他依法应退款的情况，请尽快联系我们，并提供订单号和购买时使用的邮箱。对已经开始使用的数字服务、正常续费以及当前周期内未使用的剩余时间，通常不提供按比例退款，但适用法律另有要求的除外。</p>
      </section>

      <section>
        <h2>4. 处理方式与时间</h2>
        <p>Lemon Squeezy 是本订阅交易的 Merchant of Record，并负责处理实际付款和退款。退款获批后，款项退回原支付方式；到账时间取决于银行或支付机构，可能需要最多约10天。Lemon Squeezy 也可能依据其买家条款、欺诈防护和适用法律作出最终处理。</p>
      </section>

      <section>
        <h2>5. 申请时请提供</h2>
        <ul>
          <li>购买会员时使用的电子邮箱；</li>
          <li>Lemon Squeezy 收据中的订单号；</li>
          <li>退款原因以及相关错误截图；</li>
          <li>如属重复或异常扣款，请说明交易日期和金额，但不要发送完整银行卡号或密码。</li>
        </ul>
      </section>
    </LegalPage>
  );
}
