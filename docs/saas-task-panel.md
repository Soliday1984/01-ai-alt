# SaaS Matrix Task Panel

更新时间：2026-05-20

目标：用矩阵方式并行验证 2-3 个出海工具站/SaaS。先安全上线、收录验证、流量验证，再接 Stripe 收费。每个产品都必须有明确关键词、可交付工具、页面结构、风控边界和复盘指标。

## 工作规则

- 默认最多同时推进 2 个活跃产品；第 3 个只做候选池和轻量调研。
- 每个产品先做免费工具页，付费点放在批量、隐私、导出、历史记录、API、团队/Agency 工作区。
- 未验证前不开放高成本 API；所有 AI、上传、webhook、批处理接口必须先有鉴权、限流、预算上限。
- 每周复盘一次：收录、曝光、点击、工具使用、邮件/注册、付费意向、MRR。
- 满足退出条件就停止：无收录、无点击、SERP 强权威压制、无清晰付费点、接口成本不可控。

## 当前总览

| 产品 | 状态 | 目标市场 | 核心关键词 | 当前阶段 | 本周目标 | 风险等级 |
| --- | --- | --- | --- | --- | --- | --- |
| ImageSEOFix | Active | Shopify/ecommerce SEO | shopify alt text generator | 已推 GitHub，等待 Vercel 安全上线 | 完成生产部署、Spend Management、GSC 准备 | Medium |
| LLMReadyCheck | Active | AI SEO / technical SEO | llms.txt checker, ai crawler visibility checker | GitHub + Vercel production 已上线 | GSC 提交、Vercel 账单保护、观察收录 | Medium |
| Shopify Schema Checker | Analysis | Shopify/ecommerce SEO | shopify schema checker, product schema checker | 第三项目分析 | 复核 SERP，判断是否并入 ImageSEOFix | Medium |

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

## LLMReadyCheck

定位：AI crawler visibility / LLM readiness checker，检查网站是否具备让搜索引擎和 AI agent 清晰理解的技术基础。

Repo：`Soliday1984/02-llm-ready-check`

本地路径：`E:\AIphaDev-02-llm-ready-check`

线上地址：`https://llm-ready-check.vercel.app`

执行文档：`docs/saas-2-llm-ready-check-execution.md`

### 当前判断

- 作为第二个活跃产品继续推进。
- 不只做 `llms.txt generator`，而是覆盖 `robots.txt`、`sitemap.xml`、`llms.txt`、结构化数据、TDH、canonical、可抓取正文和 AI crawler 规则。
- 先做静态页面和 mock audit；没有 SSRF 防护、限流、缓存、Spend Management 与 WAF 时，不公开任意 URL 抓取 API。

### 首批页面

- `/llms-txt-checker`
- `/llms-txt-generator`
- `/ai-crawler-visibility-checker`
- `/robots-txt-ai-crawler-checker`
- `/ai-seo-audit`
- `/llms-txt-examples`

### 已完成

- [x] 确定品牌名、域名候选和 repo 策略
- [x] 从模板搭静态 landing + mock audit
- [x] 写 audit score 数据结构
- [x] 写 SSRF/限流/缓存/超时设计：`docs/safety.md`
- [x] 创建 GitHub repo：`Soliday1984/02-llm-ready-check`
- [x] 推送 `main` 到 GitHub
- [x] 瘦身模板：删除 auth、AI、上传、支付、docs、blog、demo routes
- [x] 精简依赖：保留 9 个生产依赖，移除旧模板依赖和高风险接口依赖
- [x] 升级 Next.js 到 `16.2.6`，解决 Vercel vulnerable Next.js 拦截
- [x] 本地构建通过：`pnpm build`
- [x] 本地 production 抽检通过：首页、SEO 页、`robots.txt`、`/api/ping` 404
- [x] Vercel production 部署成功：`dpl_5CVS3aG6SgxR4ugwL2U9GUEpdN2g`
- [x] 线上抽检通过：首页、`/llms-txt-checker`、`robots.txt`、`sitemap.xml`、`/api/ping` 404

### 关键提交

- `71135b2` Scaffold LLMReadyCheck MVP
- `d6996c2` Slim LLMReadyCheck for safe deployment
- `a69c664` Update Next for Vercel deployment

### 风控清单

- [x] 当前 MVP 不抓取用户 URL，只在客户端生成 mock audit
- [x] 删除全部旧模板 API routes
- [x] `src/proxy.ts` 对 `/api/`、`/admin/`、`/dashboard/`、`/settings/` 返回 404
- [x] `robots.txt` 禁止 `/api/`、`/admin/`、`/dashboard/`、`/settings/`
- [ ] Vercel Spend Management 设置月度硬预算
- [ ] Vercel usage alerts 设置 50% / 75% / 100%
- [ ] Vercel Firewall / WAF 对 `/api/*` 设置 challenge 或 block
- [ ] 开放真实 URL 抓取前实现：仅允许 `http/https`
- [ ] 开放真实 URL 抓取前实现：阻止 localhost、内网、保留地址、metadata IP
- [ ] 开放真实 URL 抓取前实现：跳转后重新校验目标
- [ ] 开放真实 URL 抓取前实现：响应体上限 1 MB，总超时 10 秒内
- [ ] 开放真实 URL 抓取前实现：匿名每天 3 次，URL hash 缓存 24 小时
- [ ] AI 调用只在登录和预算上限之后开放

### 下一步

- [ ] 手动确认 Vercel Spend Management 和 usage alerts 已开启
- [ ] 提交 `https://llm-ready-check.vercel.app/sitemap.xml` 到 GSC
- [ ] 观察 7-14 天：收录、曝光、长尾 query、页面点击
- [ ] 为真实 URL 抓取 API 设计实现任务，但先不公开
- [ ] 如 GSC 有曝光，再加 email capture：导出报告前可选留邮箱
- [ ] 若 30 天内有自然点击和邮箱，设计 Stripe Growth $19 / Agency $59

### 验证指标

| 阶段 | 指标 | 通过标准 |
| --- | --- | --- |
| 收录 | GSC indexed pages | 7 天内首页和 2 个 SEO 页被收录 |
| 曝光 | GSC impressions | 14 天内出现 `llms.txt` 或 `ai crawler` query |
| 点击 | Organic clicks | 30 天内自然点击 >= 20 |
| 工具使用 | Mock audit runs | 30 天内 >= 50 次 |
| 转化 | Email / report intent | 30 天内 >= 5 个有效邮箱 |
| 付费 | Monitoring intent | 60 天内 >= 1 个真实付费或强意向 |

## Shopify Schema Checker

定位：第三项目分析线，面向 Shopify/ecommerce SEO 的 Product structured data checker / generator。

分析文档：`docs/saas-3-shopify-schema-checker-analysis.md`

### 当前判断

- 暂不作为活跃开发项目。
- 与 ImageSEOFix 用户高度相邻，更可能先作为 ImageSEOFix 的子页面或付费功能。
- 泛 schema validator 竞争强，差异化必须是 Shopify-specific、bulk audit、Liquid/theme 修复片段和 agency 报告。

### 后续分析任务

- [ ] 复核 `shopify schema checker`、`shopify structured data checker`、`product schema checker` 的 SERP 前 10
- [ ] 查 3-5 个竞品的流量来源和 pricing
- [ ] 看 Shopify app store 中 schema/SEO app 差评，提炼真实痛点
- [ ] 判断独立站、ImageSEOFix 子页面或 Growth/Agency 功能三选一

## 接入能力任务

目标：把持续构建所需权限接入成稳定能力，但不把密钥写入仓库、聊天或长期明文配置。

| 能力 | 当前状态 | 下一步 | 风险控制 | 优先级 |
| --- | --- | --- | --- | --- |
| GitHub connector | 插件可用；CLI 未安装 `gh` | 用 connector/网页登录补齐 repo、Actions、issues、PR 能力 | 不再使用 PAT；只用 OAuth/connector | P0 |
| Vercel CLI | 已登录 `soliday1984`，可部署与 inspect | 继续用于部署和状态检查 | 不输出 secrets；先开 Spend Management | P0 |
| Vercel MCP | 已尝试接入，当前偶发 backend transport error | 稳定后用于 deployment logs、project settings、env vars、domains | 只授权当前项目；避免全账户权限 | P0 |
| Cloudflare docs MCP | 可作为文档查询 | 到域名/DNS 阶段再用 | 只读文档，无账号风险 | P1 |
| Cloudflare API MCP | 暂不授权 | 绑定域名 DNS/WAF 阶段再授权 | 单域名、最小权限，不给全账号 | P1 |
| GitHub Actions | 未启用项目 CI | 加 `build` workflow，push 后自动验证 | 不放 secrets，先只跑静态检查 | P1 |
| Secrets 管理 | 未正式配置 | 建 `.env.production` 清单，不提交真实值 | 所有 secret 只进 Vercel/Cloudflare/GitHub secrets | P0 |
| 安全账单面板 | 待手动开启 | Vercel Spend Management、usage alerts、WAF `/api/*` 规则 | 先设低预算，再推广 | P0 |
| 域名/DNS | 未接入 | 选域名后接 Cloudflare DNS | 开启 DNSSEC/WAF 前先确认记录 | P1 |
| 监控通知 | 未接入 | Vercel usage alert + deployment failure email | webhook 不提交到仓库 | P2 |

最低权限原则：

- 不给长期全权限 token。
- 优先 OAuth / official CLI login / scoped connector。
- GitHub token 只给 repo 级细权限；Vercel 只给项目级；Cloudflare 只给单域名 DNS/WAF 权限。
- 任何密钥泄露后立刻 revoke 并轮换。
- Cloudflare API MCP 权限很强，只到“绑定域名、DNS、WAF、Turnstile、R2”阶段再授权。

## 每周复盘模板

日期：

| 产品 | 本周动作 | 指标变化 | 学到什么 | 下周动作 | 决策 |
| --- | --- | --- | --- | --- | --- |
| ImageSEOFix | 待填 | 待填 | 待填 | 待填 | 继续/暂停/加码 |
| LLMReadyCheck | 待填 | 待填 | 待填 | 待填 | 继续/暂停/加码 |
| Shopify Schema Checker | 待填 | 待填 | 待填 | 待填 | 继续分析/暂停/转入开发 |
