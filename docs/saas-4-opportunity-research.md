# SaaS #4 Opportunity Research

更新时间：2026-05-21

## 结论

第四项目不急着开 repo。先把候选池收敛到 1 个主推方向和 2 个备选方向，等 ImageSEOFix / LLMReadyCheck 进入 GSC 观察后，再决定是否开发。

当前推荐主推：

**ExtensionRiskCheck：Chrome Extension Permission & Security Checker**

一句话定位：

> Paste a Chrome extension manifest or upload a CRX package to see risky permissions, content script exposure, CSP gaps, remote code hints, and a plain-English install risk score.

推荐理由：

- 榜单趋势里 AI Agents、Vibe Coding、AI Infrastructure、Cybersecurity & Privacy 都在上升。
- GenAI Chrome extensions 已经出现安全研究和恶意扩展案例，风险教育正在发生。
- 竞品存在付费价格锚点，说明不是纯免费玩具：静态扫描、专家扫描、持续监控都能收费。
- MVP 可以完全客户端运行，不抓 URL、不拿用户账号、不碰 API key，账单和攻击风险低。
- SEO 可做成工具页 + permission 解释页 + extension risk checklist，符合工具站打法。

## 榜单与需求信号

### Product Hunt

2026 年 5 月 Product Hunt 榜单里，AI coding、AI SEO、AI social scheduling、AI meeting companion、AI calls、SaaS billing 都排在前列。页面底部分类也把 Engineering & Development、LLMs、Productivity、Marketing & Sales、Finance、AI Agents 列为核心类别。

可提炼信号：

- AI agents / coding agents 热度高，但直接做通用 agent 平台竞争重。
- AI 工具越多，成本、权限、安全、可观测性会成为刚需周边工具。
- SaaS/AI billing 出现在榜单，说明“AI 公司成本/账单/风险控制”是明确商业主题。

来源：

- https://www.producthunt.com/products

### AI 工具目录

Futurepedia 的 trending categories 包含 Marketing、Productivity、Design、Video、Research、Text-To-Image、Design Generators、Email Assistant。AI Suggests 将 400+ AI tools 分到 20 类，其中包括 Website & Development、Analytics & SEO、E-Commerce & Sales、Finance & Accounting、Cybersecurity & Privacy。

可提炼信号：

- 纯 AI 生成类很拥挤，尤其 writing/image/video。
- 决策、比较、ROI、security、privacy、compliance 这类“AI 工具周边基础设施”更适合独立开发者找窄切口。
- Cybersecurity & Privacy 是可做工具页和 B2B 变现的方向。

来源：

- https://www.futurepedia.io/
- https://aisuggests.ai/
- https://tooldirectory.ai/
- https://www.toolify.ai/

### AI Agent 成本与可观测性

AI agent 成本监控是强信号方向。Reddit 讨论里反复出现 cost per workflow、cost per outcome、token spikes、retries、looping agent、per-user/per-feature attribution。论文也指出 agentic coding task 的 token 消耗波动大，单次任务之间可差到 30 倍，并且模型经常低估自己的 token 使用。

竞品已经有：

- TokenCalc：LLM token counter / API cost calculator。
- LLMetrics：LLM cost tracking dashboard，Pro $49/mo，Team $199/mo。
- TokenCost：AI cost monitoring dashboard，Pro $19/mo。
- BurnGuard：面向 AI agents 的 real-time cost monitoring。

判断：

- 需求真实，付费强。
- 但已经有不少竞品，且付费版本需要 SDK、后台、告警、账单数据接入，开发与安全复杂度高。
- 适合作为第二优先级备选，先从免费 `AI agent cost calculator` 工具页切入。

来源：

- https://arxiv.org/abs/2604.22750
- https://www.reddit.com/r/micro_saas/comments/1sshjdm/how_are_you_tracking_ai_agent_costs/
- https://www.tokencalc.org/
- https://www.llmetrics.io/
- https://www.gettokencost.com/
- https://burnguard.dev/

### Browser Extension Security

Chrome extension 风险是更窄、更可落地的机会。

公开信号：

- Extension.Ninja 明确卖 Chrome extension security scanner：Static scan $10/ext、Continuous protection $50/ext/month、Expert scan $500/ext。
- ExtSafe 已经做单扩展风险报告，评分维度包括 permissions、code findings、manifest/CSP。
- Chrome-Stats 有 Permission Inspector / Extension Guard / raw data export 等方向，说明“extension 风险可视化”已经有需求。
- 2025 年底论文分析 GenAI Chrome extensions，提到攻击者利用 GenAI 趋势发布伪装成 AI 工具的恶意扩展，并识别出数百个恶意扩展。

判断：

- 比 AI agent cost monitoring 更窄，MVP 更轻。
- 静态工具页即可验证：粘贴 manifest.json 或上传 CRX，输出权限风险和修复建议。
- 可收费路径清晰：批量扫描、CSV 报告、监控已安装扩展更新、企业白标报告、专家审计线索。

来源：

- https://www.extension.ninja/chrome-extension-security-scanner/
- https://extsafe.com/
- https://chrome-stats.com/
- https://arxiv.org/abs/2512.10029

### Metadata / File Privacy

metadata remover 也适合静态工具站。已有竞品把 EXIF、PDF、DOCX、AI provenance/C2PA、batch cleanup 做成页面矩阵，并强调全部在浏览器本地处理。

判断：

- 搜索需求明确，MVP 可客户端运行。
- 但竞品多、免费预期强，独立做 $1000 MRR 需要靠 batch cleanup / business plan / compliance bundle。
- 可以作为内容型工具站备选，不作为第四项目首选。

来源：

- https://beforeshare.com/en
- https://www.byemetadata.com/
- https://vaulternal.com/metadata-remover/

## 候选关键词评分

> 未接 Semrush/Ahrefs，Volume/KD/CPC 暂不填数字。先用榜单热度、竞品价格、SERP 强度、MVP 可交付性做定性评分；后续接 Ahrefs/Semrush 后再补 `kdroi = volume * cpc / kd`。

| 方向 | 核心关键词 | 来源 | 搜索意图 | Volume | KD | CPC | SERP 风险 | 产品形态 | 变现 | 推荐 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| ExtensionRiskCheck | `chrome extension security scanner` | Extension.Ninja / ExtSafe / arXiv | 判断扩展是否安全，扫描权限和代码风险 | 待补 | 中 | 高 | 中 | manifest/CRX 静态扫描工具 | $19/mo 批量报告，$49/mo 监控，专家审计 lead | A |
| ExtensionRiskCheck | `chrome extension permission checker` | Chrome-Stats | 看扩展权限含义和风险 | 待补 | 低中 | 中 | 中 | 权限解释器 + 风险分 | $10 报告，B2B dashboard | A |
| ExtensionRiskCheck | `manifest v3 permission checker` | Chrome extension 开发者需求 | 开发者检查 MV3 权限、CSP、host permissions | 待补 | 低中 | 中 | 低中 | manifest linter | Pro $19-$49 | A- |
| AgentCostCalc | `ai agent cost calculator` | Reddit / arXiv / BurnGuard | 估算 agent workflow token 成本 | 待补 | 中 | 高 | 中高 | workflow cost calculator | Pro $19-$49 monitoring | B+ |
| AgentCostCalc | `llm cost tracking` | LLMetrics / TokenCost | 监控 LLM spend，分 feature/model | 待补 | 中高 | 高 | 高 | SDK + dashboard | $49/mo 起 | B |
| FilePrivacyCheck | `pdf metadata remover` | BeforeShare / ByeMetadata | 删除 PDF 作者、软件、时间等隐藏数据 | 待补 | 中 | 中 | 高 | client-side remover | batch cleanup / business plan | B |
| FilePrivacyCheck | `remove ai metadata` | BeforeShare / C2PA trend | 去掉 AI provenance / C2PA / creator-tool tags | 待补 | 低中 | 中 | 中 | image metadata cleanup | Ads + batch | B |
| VideoPromptTools | `veo 3 prompt generator` | Toolify / Futurepedia / SERP | 生成 AI video prompt | 待补 | 中高 | 中 | 高 | prompt generator | prompt packs / ads | C |
| AIToolROI | `ai tool roi calculator` | AI Suggests decision platform | 选择 AI 工具前计算 ROI | 待补 | 中 | 高 | 中 | calculator + comparison pages | affiliate / lead gen | C+ |

## 推荐项目方案：ExtensionRiskCheck

### MVP 页面

首批 6 页：

- `/chrome-extension-security-scanner`
- `/chrome-extension-permission-checker`
- `/manifest-v3-permission-checker`
- `/chrome-extension-risk-score`
- `/extension-csp-checker`
- `/ai-chrome-extension-safety-checker`

### 免费工具

全部客户端运行：

- 粘贴 `manifest.json`。
- 上传 `.crx` 或 `.zip` 后本地解包读取 manifest。
- 解析：
  - `permissions`
  - `host_permissions`
  - `content_scripts.matches`
  - `externally_connectable`
  - `background.service_worker`
  - `web_accessible_resources`
  - `content_security_policy`
  - remote URLs / broad origins
  - `scripting`、`tabs`、`cookies`、`webRequest`、`downloads`、`nativeMessaging`
- 输出：
  - risk score
  - high/medium/low findings
  - permission explanation
  - safer MV3 alternative
  - install decision checklist

### 暂不做

- 不抓 Chrome Web Store。
- 不下载远程扩展。
- 不做 runtime analysis。
- 不做恶意软件结论，只做 static risk signals。
- 不声称法律/安全认证，只说“risk review assistant”。

### SEO 与页面内容

每个页面必须有可抓取文字：

- 权限说明。
- 常见危险组合。
- 示例 manifest。
- 如何降低权限。
- FAQ。
- 相关工具内链。

程序化页面可以后续做：

- `/chrome-extension-permissions/tabs`
- `/chrome-extension-permissions/scripting`
- `/chrome-extension-permissions/cookies`
- `/chrome-extension-permissions/all-urls`
- `/chrome-extension-permissions/native-messaging`

这些页面有真实搜索意图，且可基于结构化权限词库生成，不是垃圾页。

### 变现路径

先不接 Stripe，等收录/点击/邮箱信号。

| 套餐 | 价格假设 | 付费点 | $1000 MRR 需要 |
| --- | --- | --- | --- |
| Free | $0 | 单次 manifest 扫描，基础风险解释 | 收集搜索/使用信号 |
| Pro | $19/mo | 保存扫描历史、导出 PDF/CSV、批量 50 个扩展 | 53 个客户 |
| Team | $49/mo | 团队扩展清单、更新监控、Slack/email alert | 21 个客户 |
| Expert Lead | $99-$500/report | 专家审计线索，不一定自动化交付 | 2-10 单/月 |

### 30 天验证指标

| 阶段 | 指标 | 通过标准 |
| --- | --- | --- |
| 收录 | GSC indexed pages | 7 天内首页 + 2 个工具页收录 |
| 曝光 | GSC impressions | 14 天出现 `chrome extension security scanner` 或 `permission checker` query |
| 点击 | Organic clicks | 30 天自然点击 >= 30 |
| 工具使用 | Manifest scans | 30 天 >= 50 次 |
| 转化 | Email / PDF export intent | 30 天 >= 5 |
| 付费 | Audit / monitoring intent | 60 天 >= 1 个强意向 |

## 下一步

1. 不创建 repo，先把该项目放入候选池。
2. 若用户批准开发，使用模板新建 `04-extension-risk-check`。
3. 第一版只做静态 Next.js + 客户端 manifest scanner。
4. 不接任何 API，不上传文件，不抓 Chrome Web Store。
5. 上线后再提交 GSC，观察 30 天。

## 决策

当前决策：**ExtensionRiskCheck 是第四项目首选候选，但先不开发，等待用户确认。**

暂停条件：

- Semrush/Ahrefs 补数后发现核心词搜索量极低。
- SERP 被强站和成熟工具完全压制，且没有可差异化的 permission/MV3 长尾。
- 用户只使用一次免费扫描，没有报告/批量/监控意向。

转入开发条件：

- 用户同意作为第四项目。
- 新建 repo 或从现有模板复制。
- 先做 6 个 SEO 页面 + 一个 manifest checker MVP。
