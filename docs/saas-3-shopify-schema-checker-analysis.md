# SaaS #3: Shopify Schema Checker Analysis

更新时间：2026-05-20

## 结论

Shopify Schema Checker 有需求，但现在不建议单独开第三个 repo。

推荐路线：先把它做成 ImageSEOFix 的扩展页面/子工具，定位为 **Shopify Product SEO + AI Commerce Readiness Checker**。先用一页可抓取 SEO 页面和客户端 JSON-LD 检查器验证搜索流量，不开放任意 URL 抓取 API。

原因：

- 用户群和 ImageSEOFix 高度重叠：Shopify 店主、SEO freelancer、agency。
- 泛 `product schema checker` 已经被 Google、Schema.org、SEO 工具和若干免费 checker 覆盖。
- `shopify schema checker` 更细分，但 SERP 已出现直接工具和 Shopify app 类结果，需要差异化。
- Shopify 正在把 structured data 和 AI shopping/agentic commerce 绑定起来，这给了新叙事：不只是 rich results，而是让 AI agents 更容易理解商品页。

## 需求来源

| 来源 | 观察 | 判断 |
| --- | --- | --- |
| Google Product structured data | Google 文档强调产品结构化数据会影响商品在 Search、Images、Lens、merchant listings 等场景的丰富展示，包括 price、availability、ratings、shipping、returns 等信息 | 需求真实，用户有明确 SEO/merchant listing 动机 |
| Shopify Agentic Commerce Readiness | Shopify 官方已经推出面向 AI shopping/agentic commerce 的 readiness scanner，包含 structured product data 等检查 | 方向正在被官方教育，但官方免费工具会压制泛 checker |
| SERP: `shopify schema checker` | 出现 Shopify-specific checker、schema app、structured data app、AI readiness 类页面 | 有可做空间，但必须做 Shopify-specific 和 actionable fix |
| SERP: `product schema checker` | 通用 schema validator、Google/Schema.org 文档、SEO 工具更强 | 不适合作为主攻关键词 |
| Shopify app ecosystem | structured data / JSON-LD app 多，说明商家愿意为“修好 schema”付费 | 独立站要避开直接 app 竞争，先做免费诊断和 lead capture |

## 关键词判断

没有接入 Semrush/Ahrefs 前，先用 SERP 结构和商业意图做定性评分。

| 关键词 | 搜索意图 | 可交付结果 | SERP 风险 | 推荐 |
| --- | --- | --- | --- | --- |
| `shopify schema checker` | 店主想检查 Shopify 商品页 schema | URL/JSON-LD 检查、缺失字段、修复建议 | 中 | 主攻页 |
| `shopify structured data checker` | 检查 Shopify structured data 是否正确 | Product/Offer/Review/Breadcrumb 检查 | 中 | 主攻长尾 |
| `shopify product schema checker` | 检查产品页 Product schema | 商品页规则检查 | 中 | 主攻长尾 |
| `product schema checker` | 通用 Product schema 验证 | 粘贴 JSON-LD 后检测字段 | 高 | 只做辅助页 |
| `shopify ai commerce readiness checker` | 检查 AI shopping/agentic commerce readiness | schema + product content + crawlability | 中高，但新 | 可作为差异化标题 |
| `shopify schema generator` | 生成 JSON-LD/Liquid 片段 | 复制代码片段 | 中 | 后续页 |

## 推荐定位

不要叫泛泛的 `Product Schema Checker`。

推荐命名：

**Shopify AI Commerce Schema Checker**

一句话定位：

> Check whether your Shopify product pages have clean Product structured data, rich-result fields, and AI-commerce-ready product signals.

核心差异化：

- Shopify-specific：识别 Shopify theme、variant、app conflict、重复 JSON-LD。
- AI commerce narrative：把 schema、product copy、availability、shipping/returns、crawlability 放到一个 readiness score。
- Actionable fix：不是只报错，而是给 Liquid/JSON-LD 修复片段。
- Bulk/agency path：用 sitemap/CSV 批量检查产品页，导出报告。

## 页面方案

先并入 ImageSEOFix，不开第三 repo。

首批页面：

| 页面 | 目标关键词 | 页面目标 |
| --- | --- | --- |
| `/shopify-schema-checker` | `shopify schema checker` | 免费 JSON-LD/HTML 粘贴检查器 |
| `/shopify-structured-data-checker` | `shopify structured data checker` | 解释 Product/Offer/Review/Breadcrumb 字段 |
| `/shopify-ai-commerce-readiness-checker` | `shopify ai commerce readiness checker` | 用 AI shopping/agentic commerce 叙事做差异化 |
| `/product-schema-checker` | `product schema checker` | 辅助长尾，不作为首页入口 |

首页/导航策略：

- ImageSEOFix 首页增加 “Product SEO tools” 内链区。
- 从 alt text 报告结果页引导到 schema checker：图片 SEO 和 Product rich result 都属于商品页 SEO。
- 不把 schema checker 放到独立品牌，先共享 ImageSEOFix 的 Shopify topical authority。

## MVP 功能

免费版本，全部客户端运行：

- 粘贴 Product JSON-LD 或商品页 HTML。
- 抽取 `application/ld+json`。
- 识别 `Product`、`Offer`、`AggregateRating`、`Review`、`BreadcrumbList`。
- 检查：
  - `name`
  - `image`
  - `description`
  - `brand`
  - `sku`
  - `gtin` / `mpn`
  - `offers.price`
  - `offers.priceCurrency`
  - `offers.availability`
  - `aggregateRating`
  - `review`
  - `shippingDetails`
  - `hasMerchantReturnPolicy`
  - duplicate Product schema
- 输出 readiness score、错误、警告、可复制修复示例。

暂不做：

- 不做服务器端任意 URL 抓取。
- 不做自动登录 Shopify。
- 不做自动改 theme。
- 不接 AI API。

## 付费路径

先不接 Stripe，等 ImageSEOFix 有收录/点击/邮箱后再决定。

| 套餐 | 价格假设 | 付费点 | $1000 MRR 需要 |
| --- | --- | --- | --- |
| Growth | $29/mo | 100 个产品页批量检查、CSV 导出、历史记录 | 35 个客户 |
| Agency | $59/mo | 1000 个产品页、白标报告、客户 workspace | 17 个客户 |
| One-time Audit | $49/report | 单次店铺报告 | 每月 21 单 |

最现实路径：先作为 ImageSEOFix 的 Growth/Agency 功能，而不是单独卖。

## 风险与控制

| 风险 | 控制 |
| --- | --- |
| Google/Schema.org/SEO 工具压制通用词 | 主攻 Shopify-specific 和 AI commerce readiness |
| 官方 Shopify readiness scanner 免费 | 做更细的 Product schema + bulk + fix snippet，不和官方泛扫描正面硬碰 |
| URL 抓取带来 SSRF/账单风险 | MVP 只粘贴 HTML/JSON-LD；真实 URL 抓取等风控完成后再开 |
| 规则变化 | 来源以 Google Search Central 和 Shopify docs 为准，定期复核 |
| 付费意愿不明 | 先作为 ImageSEOFix 内链页面收集搜索/邮箱数据 |

## 推荐下一步

1. 不创建第三 repo。
2. ImageSEOFix 安全部署完成后，新增 `/shopify-schema-checker` 页面。
3. 先做客户端 JSON-LD/HTML 粘贴检查，不开放 URL fetch。
4. 页面 TDH：
   - Title: `Shopify Schema Checker - Product Structured Data Audit`
   - Description: `Check Product, Offer, Review, Breadcrumb, shipping, and return policy structured data for Shopify product pages.`
   - H1: `Shopify Schema Checker`
5. 30 天观察：
   - GSC 是否出现 `shopify schema checker` / `shopify structured data checker` query
   - 工具使用次数是否 >= 30
   - 邮箱/导出意向是否 >= 5
6. 达标后再做批量检查和 Stripe Growth/Agency 套餐。

## 决策

当前决策：**并入 ImageSEOFix，作为第三项目候选功能，不独立开发。**

转独立站条件：

- `shopify schema checker` 相关页面 30 天内自然点击 >= 50。
- 至少 5 个用户留下邮箱或要求批量检查。
- SERP 中出现可被打穿的弱页面，而不是完全由官方/强工具占据。
- 批量报告或 Liquid fix snippet 有明确付费意向。

暂停条件：

- 30 天没有收录或曝光。
- 搜索词全部流向 Google/Schema.org/Shopify 官方。
- 用户只想要一次性免费生成 JSON-LD，没有批量/监控/报告需求。

## 参考来源

- Google Search Central: Product structured data  
  https://developers.google.com/search/docs/appearance/structured-data/product
- Shopify Agentic Commerce Readiness  
  https://www.shopify.com/agentic-readiness
- Shopify App Store: Schema/structured data apps  
  https://apps.shopify.com/search?q=schema
- Schema.org validator  
  https://validator.schema.org/
- Google Rich Results Test  
  https://search.google.com/test/rich-results
