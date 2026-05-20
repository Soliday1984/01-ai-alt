# SaaS Matrix Task Panel

更新时间：2026-05-20

目标：用矩阵方式并行验证 2-3 个出海工具站/SaaS，先安全上线、收录验证、流量验证，再接 Stripe 收费。每个产品都必须有明确关键词、可交付工具、页面结构、风控边界和复盘指标。

## 工作规则

- 默认最多同时推进 2 个活跃产品；第 3 个只做候选池和轻量调研。
- 每个产品先做免费工具页，付费点放在批量、隐私、导出、历史记录、API、团队/Agency 工作区。
- 未验证前不开放高成本 API；所有 AI、上传、webhook、批处理接口必须先有鉴权、限流、预算上限。
- 每周复盘一次：收录、曝光、点击、工具使用、邮件/注册、付费意向、MRR。
- 满足退出条件就停止，不恋战：无收录、无点击、SERP 强权威压制、无清晰付费点、接口成本不可控。

## 当前总览

| 产品 | 状态 | 目标市场 | 核心关键词 | 当前阶段 | 本周目标 | 风险等级 |
| --- | --- | --- | --- | --- | --- | --- |
| ImageSEOFix | Active | Shopify/ecommerce SEO | shopify alt text generator | 安全部署与上线准备 | Vercel 防护、部署成功、GSC 准备 | Medium |
| SaaS #2 | Research | 待定 | 待定 | 需求矩阵筛选 | 选出 5 个候选并打分 | Low |
| SaaS #3 | Backlog | 待定 | 待定 | 候选池 | 只记录机会，不开发 | Low |

## ImageSEOFix

定位：Shopify image SEO checker / alt text generator，先用 CSV-first 工具验证搜索需求和付费意向。

### 已完成

- [x] 选品与竞品机会文档：`docs/image-seo-opportunity.md`
- [x] MVP 页面地图：`docs/mvp-page-map.md`
- [x] 基于 MkSaaS 模板建立 Next.js 项目
- [x] 首页与 `/shopify-alt-text-generator` 工具页
- [x] 浏览器内 CSV 审计、建议生成、CSV 导出
- [x] 品牌、导航、价格文案初步替换
- [x] GitHub 推送到 `Soliday1984/01-ai-alt`
- [x] 代码层禁用未上线高成本 API 路径
- [x] 公开页面 middleware 不再每次查 auth session

### 进行中

- [ ] Vercel production deployment 成功
- [ ] Vercel Spend Management 设置低预算与用量告警
- [ ] Vercel Firewall / WAF 对 `/api/*` 加防刷规则
- [ ] Deployment Protection 用于非正式推广阶段

### 待办

- [ ] 设置 `BETTER_AUTH_SECRET`，决定是否暂时关闭 GitHub/Google login
- [ ] 绑定正式域名
- [ ] 配置 `NEXT_PUBLIC_BASE_URL`
- [ ] 检查 `robots.txt` 与 `sitemap.xml`
- [ ] 提交 Google Search Console
- [ ] 建 6 个首批 SEO 页面：
  - `/shopify-alt-text-generator`
  - `/bulk-alt-text-generator`
  - `/shopify-image-seo-checker`
  - `/shopify-alt-text-csv-generator`
  - `/ai-alt-text-generator-for-shopify`
  - `/woocommerce-alt-text-generator`
- [ ] 加 lead capture：导出 CSV 前可选收集邮箱
- [ ] 加基础 analytics：GSC + Vercel Analytics 或 Plausible
- [ ] 设计 Stripe Growth $29 / Agency $59 的真实 checkout 流程

### 风控清单

- [x] 未上线 AI/content/image/storage API 返回 404
- [ ] Vercel 设置月度硬预算
- [ ] Vercel 设置 50% / 75% / 100% 用量提醒
- [ ] `/api/*` 按路径限流或 challenge
- [ ] 上传、AI、Stripe webhook 只有上线时再开放
- [ ] 所有需要消耗外部 API 的功能必须先登录
- [ ] 所有批处理必须有免费额度和每日上限

### 验证指标

| 阶段 | 指标 | 通过标准 |
| --- | --- | --- |
| 收录 | GSC indexed pages | 7 天内核心页被收录 |
| 曝光 | GSC impressions | 14 天内出现长尾 query |
| 点击 | Organic clicks | 30 天内自然点击 >= 20 |
| 工具使用 | Generate suggestions clicks | 30 天内 >= 30 次 |
| 转化 | Email / waitlist | 30 天内 >= 5 个有效邮箱 |
| 付费 | Stripe checkout intent | 60 天内 >= 1 个真实付费或强意向 |

## SaaS #2 验证流水线

目标：不立即开发，先用矩阵选出比 ImageSEOFix 更快验证或能复用模板的数据型/SEO 型工具。

### 候选来源

- Toolify / Product Hunt / AppSumo / Gumroad 新工具
- Shopify / WooCommerce / Etsy / Amazon seller 细分需求
- Google autocomplete + People Also Ask
- 竞品 pricing 页面和 alternatives 页面
- `generator` / `checker` / `converter` / `calculator` / `extractor` / `template` 后缀词组合

### 打分表

| 候选 | 关键词 | 搜索意图 | 工具形态 | 付费点 | SERP 风险 | 成本风险 | 优先级 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 待填 | 待填 | 工具页/模板页/对比页 | 待填 | 导出/批量/API/隐私 | Low/Med/High | Low/Med/High | P0/P1/P2 |

### 通过标准

- 有明确长尾关键词，不只靠灵感。
- SERP 前 10 至少有弱页面或可差异化角度。
- 免费工具可以 3-7 天内做出可用版本。
- 付费点不是“更好看”，而是批量、导出、私密、自动化或商业使用。
- 成本可控，默认不依赖昂贵模型实时调用。

## SaaS #3 候选池

只记录，不开发。除非 SaaS #2 被淘汰，或 ImageSEOFix 已完成上线安全与收录基础。

| 机会 | 来源 | 为什么可能值得做 | 暂不做原因 |
| --- | --- | --- | --- |
| 待填 | 待填 | 待填 | 当前只允许 2 个活跃方向 |

## 每周复盘模板

日期：

| 产品 | 本周动作 | 指标变化 | 学到什么 | 下周动作 | 决策 |
| --- | --- | --- | --- | --- | --- |
| ImageSEOFix | 待填 | 待填 | 待填 | 待填 | 继续/暂停/加码 |
| SaaS #2 | 待填 | 待填 | 待填 | 待填 | 继续/暂停/加码 |

## 权限与工具需求

高优先级：

- GitHub：查看 repo、issues、actions、提交状态、创建 PR。
- Vercel：查看 deployment、build logs、env vars、domains、Firewall、Spend Management。
- Cloudflare：DNS、域名、WAF、缓存、Turnstile、R2。

最低权限原则：

- 不给长期全权限 token。
- 优先 OAuth / official CLI login / scoped connector。
- GitHub token 只给 repo 级细权限；Vercel 只给项目级；Cloudflare 只给单域名 DNS/WAF 权限。
- 任何密钥泄露后立即 revoke 并轮换。
