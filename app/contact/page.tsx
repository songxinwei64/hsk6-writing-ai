import type { Metadata } from "next";
import LegalPage from "../../components/legal-page";

export const metadata: Metadata = {
  title: "联系我们 | Write HSK",
  description: "联系 Write HSK 获取账号、会员、退款和隐私支持。",
};

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Write HSK · 支持"
      title="联系我们"
      summary="遇到账号、学习记录、AI 反馈、会员订阅或隐私问题时，可以通过电子邮件联系我们。"
    >
      <section className="contact-card">
        <h2>联系邮箱</h2>
        <a href="mailto:sxw77435@gmail.com">sxw77435@gmail.com</a>
        <p>服务运营地区：韩国</p>
        <p>一般会在3个工作日内回复。退款、异常扣款或账号安全问题请在邮件标题中注明，以便优先处理。</p>
      </section>

      <section>
        <h2>为了更快解决问题</h2>
        <ul>
          <li>账号问题：提供注册邮箱和问题发生时间；</li>
          <li>付款问题：提供订单号和购买邮箱，不要发送完整卡号或密码；</li>
          <li>练习问题：提供题目类型、题号和相关截图；</li>
          <li>隐私请求：说明希望查询、更正、导出或删除哪些数据。</li>
        </ul>
      </section>
    </LegalPage>
  );
}
