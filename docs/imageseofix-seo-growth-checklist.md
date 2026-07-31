# ImageSEOFix SEO、外链与首单验证清单

更新时间：2026-07-31

目标：先修复核心关键词页面的内容重复和收录问题，再建立首批真实外链与用户分发，最终取得第一笔外部真实付款。本文档是 ImageSEOFix 当前增长阶段的执行入口。

## 完成规则

- 只有“工作完成 + 验证通过 + 证据已记录”时才能勾选 `[x]`。
- 代码任务必须留下文件路径、测试命令或截图；线上任务必须留下生产 URL 和检查日期。
- 外链“已提交”不等于“已完成”；页面公开可访问后才计为 live backlink。
- GSC “Request indexing”不等于“已收录”；必须在复查日期记录最终状态。
- 生产部署、付费发布、社区发帖等外部动作，在执行时单独取得确认。
- 不购买外链包，不做自动评论，不批量提交低质量目录，不堆精确匹配锚文本。

## 当前基线

检查日期：2026-07-31；GSC 索引报告最近更新时间：2026-07-24。

| 指标 | 基线 | 证据/备注 |
| --- | ---: | --- |
| 已收录页面 | 5 | GSC Page indexing |
| 未收录页面 | 11 | 2 redirects、1 canonical alternate、6 discovered、2 crawled fonts |
| 外部链接 | 0 | GSC Links；报告可能存在延迟 |
| GSC 识别的内部链接 | 8 | 只识别首页和 `/shopify-schema-checker` 为主要目标 |
| 近 3 个月曝光 | 14 | GSC Performance |
| 近 3 个月点击 | 1 | CTR 7.1% |
| 平均排名 | 13.4 | 当前主要问题是曝光和收录，不是 CTR |

未收录的核心商业页面：

- `/shopify-alt-text-generator`
- `/bulk-alt-text-generator`
- `/shopify-image-seo-checker`

### 核心页面搜索意图规格

| URL | 目标用户与问题 | 输入 -> 输出 | 主关键词 | 核心 CTA | 不覆盖的意图 |
| --- | --- | --- | --- | --- | --- |
| `/shopify-alt-text-generator` | 想为少量 Shopify 产品图快速获得可编辑描述的店主 | 产品行/CSV -> 逐行建议、复制或 CSV 预览 | `shopify alt text generator` | Generate alt text for 5 products | 不承诺自动写入 Shopify 或无审核的 AI 批改 |
| `/bulk-alt-text-generator` | 有较大目录、需要批量审计和导出的店主或代理 | 官方 Products CSV -> 问题表、5-product preview、完整清理路径 | `bulk alt text generator` | Audit a bulk CSV | 不把简化 CSV 伪装成安全可导入 Shopify 文件 |
| `/shopify-image-seo-checker` | 先想知道图片 alt text 是否存在系统性问题的店主 | 公开店铺/Products CSV -> 缺失、过短、通用、过长问题清单 | `shopify image SEO checker` | Check 5 Shopify products | 不把审计分数包装成排名保证 |

## Gate A：页面质量与技术 SEO

通过条件：三个核心页面具有独立搜索意图、独立可抓取正文和上下文内链；本地构建与页面抽检通过。

- [x] `SEO-A01` 记录 GSC 收录、曝光、点击、内部链接和外部链接基线。
  - 证据：本文档“当前基线”。
- [x] `SEO-A02` 确认 `robots.txt` 未阻止核心工具页，公开 sitemap 可访问。
  - 证据：生产环境检查；GSC sitemap 状态为成功。
- [x] `SEO-A03` 定位页面重复问题：六个关键词页面复用同一个 `ImageSeoHome` 可见正文。
  - 证据：`src/app/*/page.tsx` 与 `src/components/image-seo/image-seo-home.tsx`。
- [x] `SEO-A04` 为三个核心页面分别写搜索意图规格。
  - 完成定义：每页记录目标用户、问题、输入、输出、核心 CTA、主关键词、辅助关键词和不覆盖的意图。
  - 证据位置：本文档“核心页面搜索意图规格”。
- [x] `SEO-A05` 重构 `/shopify-alt-text-generator`，提供 Shopify-specific 的独立正文和工具流程。
  - 完成定义：独立 H1、使用步骤、真实输入输出示例、Shopify CSV 工作流、FAQ、CTA。
- [x] `SEO-A06` 重构 `/bulk-alt-text-generator`，突出批量处理、审核、导出和限制。
  - 完成定义：独立 H1、批量场景、表格示例、质量规则、FAQ、CTA。
- [x] `SEO-A07` 重构 `/shopify-image-seo-checker`，突出审计、问题分级和修复建议。
  - 完成定义：独立 H1、检查项、评分解释、报告示例、FAQ、CTA。
- [x] `SEO-A08` 为三个核心页面补齐独立 TDH、canonical 和适用的结构化数据。
  - 完成定义：Title、Description、H1 不重复；canonical 指向自身；结构化数据通过解析检查。
- [x] `SEO-A09` 建立上下文内链，而非只依赖首页相关链接列表。
  - 完成定义：三个核心页面互相链接，并链接到 CSV generator、schema checker 和使用指南；锚文本自然且可抓取。
- [x] `SEO-A10` 修正 sitemap 的 `lastModified` 策略。
  - 完成定义：不再为所有 URL 每次构建都写当前时间；使用稳定日期或在无真实更新时间时省略。
- [x] `SEO-A11` 本地质量验证。
  - 完成定义：lint/typecheck/build 通过；三个页面返回 200；抓取 HTML 可看到不同 H1 和正文；canonical 正确；移动端无明显布局问题。
  - 证据：`pnpm build` 通过；静态 HTML 抽检确认三个唯一 H1、FAQ 和 WebApplication 数据；sitemap 未再输出 `<lastmod>`。

## Gate B：部署与重新收录

前置条件：Gate A 全部完成。通过条件：生产版本抽检通过，三个核心 URL 已重新提交，并按时记录 GSC 结果。

- [ ] `SEO-B01` 取得生产部署确认并部署修复版本。
  - 完成定义：部署成功，记录 commit SHA、GitHub Actions/Cloudflare deployment URL 和时间。
- [ ] `SEO-B02` 生产环境 SEO 抽检。
  - 完成定义：三个核心页面均返回 200，TDH/正文互不重复，canonical、robots、sitemap、内链正确。
- [ ] `SEO-B03` 使用 GSC URL Inspection 检查三个核心 URL 的 live page。
  - 完成定义：记录 live test 结果；没有 robots、canonical、渲染或服务器错误。
- [ ] `SEO-B04` 对三个核心 URL 执行 Request indexing。
  - 完成定义：记录提交日期和 GSC 返回状态。
- [ ] `SEO-B05` 7 天后复查收录。
  - 完成定义：逐 URL 记录 Indexed/Not indexed 及原因；未收录则创建具体修复任务。
- [ ] `SEO-B06` 14 天后复查查询词和页面曝光。
  - 完成定义：记录页面、query、impressions、clicks、CTR、position，并和当前基线比较。

## Gate C：外链与主动分发

前置条件：Gate A 完成；不必等待所有页面收录。通过条件：完成 10 个相关渠道的人工触达或提交，取得至少 3 个真实、相关、公开可访问的外链，并记录来源。

- [x] `SEO-C01` 补充 `gefei-saas-workflow` 的外链与分发 reference。
  - 完成定义：包含安全外链原则、渠道优先级、深链策略、锚文本、提交记录、复查指标和垃圾链接红线；skill 校验通过。
  - 证据：`C:\Users\Administrator\.codex\skills\gefei-saas-workflow\references\backlink-distribution.md`；`quick_validate.py` 通过。
- [ ] `SEO-C02` 准备统一发布素材包。
  - 完成定义：一句话定位、100 字介绍、300 字介绍、logo/screenshot、免费工具 URL、三个深链、创始人简介、隐私说明。
- [ ] `SEO-C03` 发布一个真实 Shopify CSV alt text 修复案例。
  - 完成定义：包含问题、处理前后示例、修改行数、店主如何导入、限制和结果；不泄露商家隐私。
- [ ] `SEO-C04` 完善 GitHub 外链。
  - 完成定义：Repo About、Website 和 README 指向生产域名；README 至少包含一个核心工具深链；线上 GitHub 页面可访问。
- [ ] `SEO-C05` 提交 Product Hunt 产品页。
  - 完成定义：产品页公开，记录 URL、日期和指向页面。
- [ ] `SEO-C06` 发布 Indie Hackers 构建/案例帖。
  - 完成定义：帖子公开，内容以经验和案例为主，记录 URL 和反馈。
- [ ] `SEO-C07` 在 Shopify Community 完成至少 2 次相关问题回复。
  - 完成定义：回答真实问题，仅在确有帮助时加入相关页面链接；记录帖子 URL。
- [ ] `SEO-C08` 在符合版规的 Reddit 社区完成至少 2 次案例型参与。
  - 完成定义：不做纯推广帖；记录社区、帖子 URL、是否保留链接和反馈。
- [ ] `SEO-C09` 发布一次 Show HN 或其他开发者社区发布。
  - 完成定义：帖子公开并记录 URL；若被删除，记录原因但不计 live backlink。
- [ ] `SEO-C10` 人工筛选并提交 3 个相关 Shopify/SEO/ecommerce 工具目录。
  - 完成定义：记录目录质量、提交 URL、状态；至少一个页面被目录正式收录。
- [x] `SEO-C11` 建立外链台账。
  - 完成定义：每条记录来源域名、目标 URL、锚文本、提交日期、live 日期、nofollow/sponsored、状态和备注。
  - 证据：`docs/imageseofix-backlink-ledger.md`。
- [ ] `SEO-C12` 14/30 天复查外链表现。
  - 完成定义：检查 live 状态、引荐访问、GSC Links 是否识别；GSC 未识别时保留 live URL 证据并注明数据延迟。

## Gate D：用户价值与首单

通过条件：不是只获得曝光，而是有真实 Shopify 商家完成工具流程，并产生第一笔非内部、非零扣款、非亲友测试付款。

- [ ] `VAL-D01` 核对完整漏斗事件。
  - 完成定义：至少能区分 landing view、工具启动、CSV 上传、清理完成、checkout start、payment success、download success。
- [ ] `VAL-D02` 核对 `$19` self-serve 购买和交付路径。
  - 完成定义：新用户从上传真实 Shopify CSV 到付款、返回、下载修复文件全链路成功；Stripe webhook 与交付记录一致。
- [ ] `VAL-D03` 准备 10 个真实 Shopify 店铺的定向触达名单。
  - 完成定义：只记录公开业务信息；每个店铺有具体图片 alt text 问题和对应联系渠道。
- [ ] `VAL-D04` 完成 10 次个性化触达。
  - 完成定义：每次触达包含具体问题截图/样例和免费前 5 个产品审计，不群发模板垃圾邮件。
- [ ] `VAL-D05` 获得至少 3 个真实商家完成免费流程。
  - 完成定义：服务端或 analytics 有完整事件记录，并收集阻碍、输出质量和导入理解反馈。
- [ ] `VAL-D06` 获得第一笔真实外部付款。
  - 完成定义：非内部优惠券、非零扣款、非亲友测试；Stripe 支付成功；用户成功下载并确认文件可用。
- [ ] `VAL-D07` 完成首单售后复盘。
  - 完成定义：记录获客渠道、用户问题、支付动机、交付结果、退款/支持情况、下一次购买可能性。

## 每周复盘与决策门槛

每周五更新一次：

| 周期 | Indexed core pages | Impressions | Clicks | Tool starts | CSV uploads | Checkout starts | External paid | Live backlinks | 本周结论 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Baseline 2026-07-31 | 0/3 | 14/3 months | 1/3 months | 待补 | 待补 | 待补 | 0 | 0 | 先修页面与分发 |

30 天继续条件，满足任意两项：

- 三个核心页面至少两个被收录，并出现相关非品牌 query。
- 至少 5 个真实 Shopify 商家完成 CSV 上传或免费审计。
- 至少 2 个真实用户启动 checkout。
- 至少 1 笔真实外部付款。
- 至少 3 个相关 live backlinks，并带来引荐访问或抓取改善。

30 天暂停或调整条件：

- 核心页面独立化并完成分发后仍无有效曝光。
- 10 次合格触达没有商家愿意完成免费流程。
- 用户完成审计，但不认为输出值得导入或付费。
- 获客与人工支持成本明显高于 `$19` 一次性收入，且没有升级/复购路径。

## 执行顺序

1. 完成 Gate A：页面质量与技术 SEO。
2. 用户确认后完成 Gate B 的生产部署与重新收录。
3. Gate A 完成后并行执行 Gate C 的外链与主动分发。
4. 分发带来真实用户后完成 Gate D 的完整交付与首单验证。
5. 每周更新指标；30 天按继续/暂停条件做决策，不凭感觉持续投入。
