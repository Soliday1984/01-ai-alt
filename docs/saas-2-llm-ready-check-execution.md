# SaaS #2: LLMReadyCheck Execution Plan

更新时间：2026-05-20

## 定位

LLMReadyCheck 是一个面向 SaaS、内容站、Shopify/ecommerce 站点的 AI crawler visibility / LLM readiness checker。

它不是只做 `llms.txt generator`，而是检查一个网站是否能被搜索引擎和 AI agent 清楚理解：`robots.txt`、`sitemap.xml`、`llms.txt`、结构化数据、TDH、canonical、可抓取正文、AI crawler 规则、页面索引入口。

## 为什么作为第二项目执行

- 搜索需求正在从传统 SEO 扩展到 AI visibility，但单独押注 `llms.txt` 风险较高；做成完整技术审计工具更稳。
- 成本低，MVP 主要是抓取公开页面并解析 HTML、robots、sitemap、JSON-LD，不需要先接昂贵 AI API。
- 交付明确，用户输入 URL 后得到分数、问题、修复建议和 `llms.txt` 草稿。
- 付费边界天然存在：定时监控、批量站点、白标报告、导出、团队空间、API。

参考依据：

- `llms.txt` 提案把 `/llms.txt` 定义为放在站点根路径的 Markdown 文件，用于给 LLM 提供简洁站点信息和关键链接，并且可与 `robots.txt`、`sitemap.xml`、结构化数据共存。
- OWASP SSRF 防护资料强调：用户可控 URL 抓取属于高风险场景，必须做输入校验、协议限制、公网 IP 校验、重定向控制和网络层防护。
- Vercel Spend Management 支持按账单周期设定花费额度、通知、webhook 和自动暂停 production deployment，但设置额度本身不等于自动停用，必须显式开启暂停动作。

来源：

- [llms.txt proposal](https://llmstxt.org/)
- [OWASP SSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Vercel Spend Management](https://vercel.com/docs/pricing/spend-management)

## 初始关键词池

| 关键词 | 页面类型 | 搜索意图 | 备注 |
| --- | --- | --- | --- |
| `llms.txt checker` | 工具页 | 检查网站是否有合格 `llms.txt` | 新兴词，需人工复核 SERP |
| `llms.txt generator` | 工具页 | 生成站点 `llms.txt` | 可作为入口页，不做唯一产品 |
| `ai crawler visibility checker` | 工具页 | 检查 AI crawler 是否能访问站点 | 更贴近付费监控 |
| `robots.txt ai crawler checker` | 工具页 | 检查 GPTBot、ClaudeBot 等规则 | 技术 SEO 人群明确 |
| `ai seo audit` | 功能页/教程页 | 宽泛 AI SEO 审计 | SERP 风险更高 |
| `llm seo checker` | 工具页 | 面向 LLM 搜索可见性检查 | 可做长尾聚合 |
| `chatgpt crawler checker` | 工具页 | 检查 ChatGPT 相关 crawler | 注意不要误导为官方工具 |

## MVP 范围

第一版只做单 URL 审计，不做登录强依赖，不做 AI 实时生成。

免费工具能力：

- 输入一个公开网站 URL。
- 抓取首页，检查 HTTP 状态、canonical、title、description、H1、主要正文长度、meta robots。
- 检查 `/robots.txt` 是否存在，并识别 `GPTBot`、`ChatGPT-User`、`Google-Extended`、`ClaudeBot`、`PerplexityBot`、`Applebot-Extended`、`CCBot` 等规则。
- 检查 `/sitemap.xml` 是否存在，抽样读取核心 URL。
- 检查 `/llms.txt` 是否存在，校验 H1、摘要、链接列表和站点核心页面覆盖。
- 检查 JSON-LD 结构化数据类型，至少识别 `Organization`、`WebSite`、`Product`、`Article`、`FAQPage`、`BreadcrumbList`。
- 输出 0-100 分、问题列表、优先级、可复制修复建议。
- 给出 `llms.txt` 草稿，但不自动写入用户网站。

暂不做：

- 不开放批量抓取。
- 不接入昂贵 AI model。
- 不抓取登录后页面。
- 不做真实 DDoS/压力测试。
- 不承诺“保证被 ChatGPT 收录”这类不可验证结果。

## 安全与账单防护

服务端 URL 抓取是本项目最高风险点。公开上线前必须先满足这些安全门槛：

| 风险 | 必做防护 | 上线状态 |
| --- | --- | --- |
| SSRF | 只允许 `http`/`https`；拒绝 `localhost`、内网、保留地址、metadata IP、非公网 A/AAAA 解析 | 未完成不得公开 API |
| 重定向绕过 | 最多 3 次跳转，每次跳转后重新解析并校验目标 IP | 未完成不得公开 API |
| 大文件消耗 | 响应体上限 1 MB，超出立即停止读取 | P0 |
| 慢请求消耗 | 连接与总请求超时 10 秒内 | P0 |
| 滥刷接口 | IP + URL hash 限流；匿名用户每天 3 次；同 URL 24 小时缓存 | P0 |
| 账单失控 | Vercel Spend Management、50/75/100% alert、production pause、`/api/audit` firewall | P0 |
| AI 成本 | AI 建议只在登录后开启，且必须有每日 token/cost cap | 后置 |
| 日志泄漏 | 日志不保存完整页面正文，不保存 secret，不输出请求头敏感值 | P0 |

执行原则：先做静态页面和 mock audit，再做受保护的 fetch API。没有 WAF、限流、缓存和 Spend Management 时，不把 URL 抓取接口放到公开生产环境。

## 页面地图

首批页面保持少而准：

- `/llms-txt-checker`
- `/llms-txt-generator`
- `/ai-crawler-visibility-checker`
- `/robots-txt-ai-crawler-checker`
- `/ai-seo-audit`
- `/llms-txt-examples`
- `/pricing`

每个页面都要有可抓取正文、FAQ、示例结果、内链到核心工具页，避免纯前端工具没有正文。

## 变现路径

| 套餐 | 价格假设 | 价值 |
| --- | --- | --- |
| Free | $0 | 每天 3 次单 URL audit，公开报告，不保存历史 |
| Growth | $19-29/月 | 10 个站点、每周自动监控、历史记录、CSV/PDF 导出 |
| Agency | $59-99/月 | 100 个站点、白标报告、客户工作区、API access |

首个收入目标：找到 1 个愿意为 “每周自动检查 AI crawler/SEO readiness 并导出报告” 付费的独立站、SEO freelancer 或小 agency。

## 7 天执行 Sprint

| 天数 | 任务 | 完成标准 |
| --- | --- | --- |
| Day 1 | 确认品牌名、repo 策略、页面地图 | 项目名、首批 URL、文案定位确定 |
| Day 2 | 用模板搭静态 landing + mock report | 本地可访问，页面可被爬虫读取正文 |
| Day 3 | 做前端 audit 结果组件和示例数据 | 有分数、问题、修复建议、`llms.txt` 草稿 |
| Day 4 | 写安全 fetch API 设计，不公开上线 | SSRF、限流、缓存、超时策略成文并开始实现 |
| Day 5 | 在受保护环境接入真实抓取 | 只允许测试域名或本地白名单 |
| Day 6 | 补 SEO 页面、FAQ、robots、sitemap | 首批页面 TDH 完成 |
| Day 7 | 上线低风险版本并提交 GSC | API 受保护，Spend Management 已开 |

## 复盘指标

| 阶段 | 指标 | 通过标准 |
| --- | --- | --- |
| 收录 | GSC indexed pages | 7 天内核心页面被收录 |
| 曝光 | GSC impressions | 14 天内出现长尾 query |
| 点击 | Organic clicks | 30 天内自然点击 >= 20 |
| 工具使用 | Audit starts | 30 天内 >= 50 次 |
| 转化 | Email / waitlist | 30 天内 >= 10 个有效邮箱 |
| 付费 | Stripe checkout intent | 60 天内 >= 1 个真实付费或强意向 |

## 退出条件

- 30 天无收录或无搜索曝光。
- 搜索结果完全被强权威工具占据，并且无法通过 AI crawler / Shopify / docs site 细分差异化。
- URL 抓取的滥用风险高于产品收益，且无法用 WAF、缓存、配额压住。
- 用户只要一次性免费生成，不需要监控、导出、历史或批量能力。
