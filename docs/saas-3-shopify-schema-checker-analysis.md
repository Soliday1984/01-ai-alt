# SaaS #3: Shopify Schema Checker Analysis

更新时间：2026-05-20

## 结论

Shopify Product Schema Checker 值得放入第三项目候选池，但暂不单独开发。它更适合作为 ImageSEOFix 的 ecommerce SEO 扩展方向，等 ImageSEOFix 有收录、点击或 Shopify 用户反馈后再决定是否独立成站。

## 定位

面向 Shopify 店主、SEO freelancer、agency 的 Product structured data checker / generator。

核心任务：用户粘贴产品页 URL 或 JSON-LD，工具检查 `Product`、`Offer`、`AggregateRating`、shipping、availability、return policy 等结构化数据是否完整，并输出可操作修复建议。

## 为什么有机会

- 与 ImageSEOFix 用户高度相邻，都是 Shopify/ecommerce SEO。
- Google Search Central 明确说明产品结构化数据可让商品信息以更丰富方式出现在 Google Search、Google Images、Google Lens，并可展示 price、availability、review ratings、shipping、returns 等信息。
- MVP 成本低，主要是 HTML/JSON-LD 解析和规则校验。
- 付费边界比普通 validator 更清晰：批量产品检查、历史监控、白标报告、theme/app 修复片段。

来源：

- [Google Search Central: Product structured data](https://developers.google.com/search/docs/appearance/structured-data/product)

## 初始关键词池

| 关键词 | 页面类型 | 搜索意图 | 风险 |
| --- | --- | --- | --- |
| `shopify schema checker` | 工具页 | 检查 Shopify 商品结构化数据 | 需要 SERP 复核 |
| `product schema checker` | 工具页 | 通用 Product schema 验证 | Google/validator 竞争强 |
| `shopify structured data checker` | 工具页 | Shopify 结构化数据检查 | 适合细分 |
| `product schema generator` | 工具页 | 生成 Product JSON-LD | 容易变成一次性免费工具 |
| `ecommerce schema markup generator` | 功能页/教程页 | 电商 schema 生成 | 宽词，难度更高 |

## 搜索意图拆解

| 页面 | 目标用户 | 交付结果 |
| --- | --- | --- |
| `/shopify-schema-checker` | Shopify 店主 | 输入 URL，输出缺失字段和修复建议 |
| `/product-schema-checker` | SEO 从业者 | 粘贴 JSON-LD，检测 Product/Offer 必填和推荐字段 |
| `/shopify-product-schema-generator` | 店主/开发者 | 生成基础 JSON-LD 片段 |
| `/product-rich-results-checklist` | 内容 SEO | 上线前检查清单 |
| `/shopify-schema-bulk-audit` | agency | 批量检查产品 URL，导出 CSV |

## MVP 草案

免费版本：

- 粘贴 Shopify 产品页 URL 或 JSON-LD。
- 抽取页面中的 `application/ld+json`。
- 识别 `Product`、`Offer`、`AggregateRating`、`Review`、`BreadcrumbList`。
- 检查商品名、图片、描述、价格、币种、availability、SKU/GTIN/MPN、brand、review、shipping、return policy。
- 输出缺失字段、警告、可复制 JSON-LD 示例。

付费版本：

- 批量抓取 100-1000 个产品页。
- 每周自动监控结构化数据变化。
- CSV/PDF/白标报告。
- Shopify theme snippet 建议。
- Agency client workspace。

## 差异化角度

不要做泛泛的 schema validator，因为 Google Rich Results Test、Schema.org validator 和大量 SEO 工具已经很强。

可差异化方向：

- Shopify-specific：识别 Shopify theme 常见问题、重复 schema、app 冲突、variant 丢失。
- Bulk-first：从 sitemap 或 CSV 批量检查产品页。
- Actionable fix：不是只报错，而是给 Liquid/JSON-LD 修复片段。
- Cross-sell：从 ImageSEOFix 的 image SEO 报告入口推荐 schema audit。

## 风险

| 风险 | 判断 |
| --- | --- |
| SERP 强竞争 | 中高，需要进一步查前 10 结果 |
| 与 ImageSEOFix 重叠 | 中，可能作为功能页比独立站更好 |
| URL 抓取安全 | 中高，必须复用第二项目的 SSRF/限流/缓存策略 |
| 规则更新 | 中，需要跟踪 Google 文档变化 |
| 付费意愿 | 中，agency/bulk 方向更可能付费 |

## 推荐决策

暂不作为第二个活跃产品。它保留为第三项目分析线：

- 如果 ImageSEOFix 的 Shopify/ecommerce SEO 流量开始出现，把它做成同站第二个工具页。
- 如果 `shopify schema checker` 相关 SERP 有弱页面、广告、付费工具或 agency 内容，再考虑独立站。
- 如果用户反馈只想要 “alt text + schema + product SEO audit” 一体化报告，则并入 ImageSEOFix 的 Growth/Agency 套餐。

## 下一步分析任务

- 复核 `shopify schema checker`、`shopify structured data checker`、`product schema checker` 的 SERP 前 10。
- 用 Similarweb/Semrush/Ahrefs 查看 3-5 个竞品流量来源。
- 找 Shopify app store 中 schema/SEO app 的差评，提炼痛点。
- 判断它是独立站、ImageSEOFix 子页面，还是后续付费功能。
