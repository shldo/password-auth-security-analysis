# Front-End Redesign Requirements

本文档用于指导下一版 `dashboard/` 前端重构。目标不是单纯把页面做得“花哨”，而是把项目内容、评分标准、技术证据和 5 分钟 tutor 展示整合成一个清晰、美观、可讲述的落地产物。

## 1. 项目定位

项目选择：B. Analyse something using a security engineering approach。

项目主题：Password Authentication Security Analysis。

初步题案：

> Analyzing passwords is not simply about making them more complex. A secure password-authentication design also depends on how passwords are accepted, stored, leaked, and attacked. This project builds a controlled case study to analyse how password policy, password storage method, and offline cracking cost affect password exposure risk after a database leak.

核心研究问题：

> Password security 到底主要取决于“密码看起来复杂”，还是取决于整个认证链路的安全工程设计？

本项目不是：

- 不是攻击真实系统。
- 不是收集真实用户密码。
- 不是展示如何非法破解别人的密码。
- 不是实现 MFA 登录系统。
- 不是把 MFA 作为实验结果展示。

本项目是：

- 构造一个安全、可控、可复现的数据库泄露案例。
- 使用合成用户密码和本地 wordlist 做离线猜测实验。
- 比较 plaintext、salted SHA-256、bcrypt、Argon2id 的暴露效果和攻击成本。
- 比较复杂度规则与分层密码策略对不同密码形式的接受/拒绝结果。
- 用前端把安全工程分析过程可视化，帮助 tutor 在 5 分钟内理解项目成果。

## 2. 必须参考的项目文件

### 2.1 课程与评分依据

| 文件/来源 | 用途 |
|---|---|
| `COMP6841_Project_Information.docx` | 课程官方项目要求、deliverables、report/presentation 评分标准、30 小时工作量要求。 |
| 导师 Tom 的 email notes | 报告页数不硬性卡 5-15 页；重点是是否满足 criteria；如果有 code，应提供 GitHub repo 和能体现约 30 小时的 commit history；presentation 要 engaging。 |
| `docs/assessment-traceability.md` | 把项目产物映射到评分标准，确保前端不是孤立页面。 |
| `docs/work-log.md` | 证明持续工作过程，支持约 30 小时工作量。 |

### 2.2 项目内容依据

| 文件 | 前端应如何使用 |
|---|---|
| `README.md` | 项目总问题、交付物结构、运行方式。前端首页文案应与 README 保持一致。 |
| `docs/report-outline.md` | 前端叙事顺序应支持报告结构：introduction、methodology、implementation、results、reflection。 |
| `docs/threat-model.md` | 前端 attack chain 必须来自 threat model，而不是临时拼接页面。 |
| `docs/research-notes.md` | 前端中的安全解释必须与研究依据一致，例如 NIST/OWASP 对 password policy 和 password storage 的观点。 |
| `docs/references.md` | 前端不需要放完整引用，但报告和演示中提到的 claims 必须能在这里找到来源。 |
| `docs/demo-script.md` | 前端每个界面都要能支撑 5 分钟 demo script 的一句核心讲解。 |
| `docs/presentation-outline.md` | 前端截图应能直接放入 slides，视觉上需要像“展示成果”，不是开发调试页。 |
| `docs/mfa-risk-model.md` | MFA 只作为报告限制和扩展讨论，不进入 dashboard 实验流程。 |

### 2.3 技术与数据依据

| 文件 | 前端应如何使用 |
|---|---|
| `data/sample_passwords.csv` | 密码样本来源。前端展示密码类型时应基于这里的合成密码。 |
| `data/attack_wordlist.txt` | 本地 wordlist 来源。前端要说明它是 controlled local wordlist。 |
| `scripts/generate_results.py` | 技术实现依据：hashing、policy evaluation、offline cracking simulation。 |
| `scripts/export_analysis_summary.py` | 报告摘要生成依据。 |
| `results/analysis_results.json` | 前端唯一实验数据源。前端不能硬编码实验结论。 |
| `results/analysis_summary.md` | 前端结果文案应与报告摘要一致。 |

### 2.4 前端实现文件

| 文件 | 职责 |
|---|---|
| `dashboard/index.html` | 页面语义结构、导航、主要容器。 |
| `dashboard/style.css` | 视觉系统、布局、响应式、图表样式。 |
| `dashboard/app.js` | 数据加载、阶段切换、demo 运行、图表/矩阵渲染。 |

## 3. Mark 标准转化为前端需求

### 3.1 Project Report /20 对前端的要求

课程要求报告展示：成果、证据、研究、分析、问题处理、伦理、优劣势、学习成长。

前端必须支持这些证据：

- 清楚说明项目问题：complexity alone is not enough。
- 展示方法：same passwords, same wordlist, same attack budget, different storage methods。
- 展示技术实现结果：cracked rate、guesses per second、verification time、account-level outcome。
- 展示分析，不只是数字：为什么 plaintext 直接暴露，为什么 fast hash 便宜，为什么 bcrypt/Argon2id 提高攻击成本。
- 展示伦理边界：synthetic data only, local experiment, no real credentials。
- 展示 limitation：small synthetic dataset、local wordlist、MFA not implemented/tested。

前端不得：

- 暗示这是对真实系统的攻击。
- 暗示 MFA 已经被实现或测试。
- 用假数据制造没有实验依据的结论。
- 只堆 KPI 卡片但不解释指标意义。

### 3.2 Presentation /10 对前端的要求

课程要求 5 分钟 presentation 清楚传达：

- 项目目标或问题陈述。
- 构建、分析或调查了什么。
- 主要发现或成果。

前端必须支持一个流畅的 5 分钟讲法：

1. 15 秒：一句话说明项目问题。
2. 30 秒：展示 attack chain。
3. 60 秒：展示密码形式和 policy effect。
4. 60 秒：展示泄露后 attacker 看到什么。
5. 90 秒：展示 cracking cost 的主要结果。
6. 45 秒：展示最终 layered recommendation。
7. 20 秒：说明 ethical boundary 和 limitation。

前端必须具备：

- 一个明显的 `Run demo` 按钮。
- 清晰的阶段导航。
- 当前阶段标题和一句 takeaway。
- 可以直接截图进 slides 的视觉效果。
- 不需要 tutor 事先理解 hashing 才能看懂页面。

## 4. 前端重构目标

### 4.1 总体目标

把 `dashboard/` 重构成一个美观、专业、演示友好的 Password Leak Lab。

核心观感：

- 像一个安全工程实验展示台，而不是普通作业网页。
- 第一屏就能看出项目主题、实验链路和主要数据。
- 每个阶段只回答一个问题，避免信息堆叠。
- 图表和矩阵是主角，长段文字降到最低。

### 4.2 视觉方向

推荐风格：modern security lab / investigation console。

设计要求：

- 使用克制但有层次的深浅配色，不要单调 beige、全灰、全蓝或满屏卡片。
- 页面要有明显视觉焦点：主结论区、实验流程图、结果图表。
- 卡片只能用于指标、结果块、密码样本块，不要卡片套卡片。
- 字体层级清晰：页面标题、阶段标题、指标值、解释文字大小要有明显区别。
- 所有按钮、标签、矩阵单元、图表条都要对齐整齐。
- 重要数字要大，但不能压过上下文。
- 移动端不能出现文字重叠、横向溢出、按钮挤压。

### 4.3 交互目标

必须保留：

- `Run demo`：自动按顺序播放五个阶段。
- 阶段导航：用户可手动点击任意阶段。
- Storage selector：在泄露阶段切换 plaintext、SHA-256、bcrypt、Argon2id。

可以新增：

- 实验结果 highlighter：点击某个 storage method 后，相关图表同步高亮。
- Short mode / presenter mode：隐藏细节，只保留适合 5 分钟展示的结果。
- Explain metric tooltip：解释 cracked rate、guesses/sec、verification time。

不要新增：

- 登录表单。
- 真实密码输入框。
- MFA 模拟按钮。
- 真实攻击配置面板。
- 会让 tutor 以为这是 hacking tool 的功能。

### 4.4 最新界面方向

根据当前前端反馈，下一版界面必须进一步简化：

- 页面整体要简洁、整齐，不用大面积文字堆砌解释。
- 前端必须能直接展示密码类型，让 tutor 看到不同密码形式的差异。
- 前端必须能展示攻击效果，而不是只展示概念流程。
- 前端需要支持选择攻击时长/预算，并根据实验速率展示对应攻击结果。
- 可视化必须成为表达核心观点的主方式，包括条形图、矩阵、流程图或结果卡片。
- 页面切换时内容不能重复：每个界面只承担一个独立任务。
- `Password Types` 页面负责展示密码形式和 policy effect。
- `Attack Setup` 页面负责选择攻击窗口和存储方式。
- `Results` 页面负责集中展示攻击结果和可视化图表。
- `Findings` 页面负责把证据映射到安全工程建议。

## 5. 信息架构

下一版前端建议保留五个阶段，但改成更有叙事感的页面。

### Stage 1: Experiment Setup

要回答的问题：

> 我到底构造了一个什么安全工程案例？

必须展示：

- 项目类型：security engineering analysis。
- 实验范围：database leak -> offline cracking -> recommendation。
- 数据边界：synthetic users, local wordlist, no real credentials。
- 实验控制变量：same password set, same wordlist, same time budget。

推荐视觉：

- 一条横向 attack chain。
- 三个 evidence chips：10 synthetic passwords、18 wordlist candidates、2s per method。
- 一个 ethical boundary banner。

### Stage 2: Password Forms and Policy Effect

要回答的问题：

> 为什么“复杂度合规”不等于“难猜”？

必须展示：

- 不同密码形式：common password、season/year pattern、context-specific pattern、transformed word、long joined phrase。
- Complexity rule 接受/拒绝结果。
- Layered policy 接受/拒绝结果。
- 弱密码拒绝率对比。

推荐视觉：

- Password pattern gallery。
- Policy decision matrix。
- 一个小型对比图：complexity rule vs layered policy。

文案注意：

- 不强调“去除空格”。
- 可以说 long joined phrases 更适合许多系统的实际输入限制。
- 不要说所有系统都禁止空格和特殊符号，只说本实验采用 joined phrase 样本以便统一比较。

### Stage 3: Storage Exposure

要回答的问题：

> 数据库泄露后，不同存储方式让攻击者拿到什么？

必须展示：

- Plaintext：直接看到密码。
- Salted SHA-256：看到 salt + fast hash，需要猜测但成本低。
- bcrypt：看到 adaptive hash，猜测成本上升。
- Argon2id：看到 memory-hard/adaptive hash，猜测成本更高。

推荐视觉：

- 左侧：storage method selector。
- 中间：attacker view，展示泄露记录形态。
- 右侧：security meaning，解释该方法改变攻击链哪一步。

### Stage 4: Offline Cracking Cost

要回答的问题：

> 同样的攻击预算下，攻击者能恢复多少密码？

必须展示：

- Cracked accounts within budget。
- Guesses per second。
- Average verification time。
- SHA-256 vs Argon2id speed ratio。
- Account-level outcome matrix。

推荐视觉：

- 主图：storage methods 横向条形图，显示 cracked rate。
- 次图：log-scaled guessing speed comparison。
- 账号矩阵：每个用户在各存储方式下是 exposed、cracked、not found。

指标解释：

- `cracked rate`：在固定 wordlist 和时间预算内恢复密码的比例。
- `guesses/sec`：每秒能测试多少候选密码，代表攻击者离线成本。
- `avg verify ms`：验证一个候选密码平均需要多久，代表防守方人为增加的成本。
- `time to first crack`：攻击者最早拿到第一个密码的时间。

### Stage 5: Final Assessment

要回答的问题：

> 根据证据，应该推荐什么安全工程设计？

必须展示：

- 不要存 plaintext。
- 不要用 fast general-purpose hash 作为 password storage。
- 使用 Argon2id 或 bcrypt。
- 使用 blocklist 阻止 common/context-specific passwords。
- 支持实际可用的长密码短语。
- MFA 作为 report-only 后续控制，不作为本 dashboard 的实验结果。

推荐视觉：

- Evidence-to-recommendation mapping。
- “Measured evidence” 和 “Recommendation” 一一对应。
- Limitations block。

## 6. 必须展示的指标

| 指标 | 来源 | 展示位置 | 作用 |
|---|---|---|---|
| Synthetic password count | `results/analysis_results.json` | Stage 1 summary | 说明样本规模。 |
| Wordlist size | `results/analysis_results.json` | Stage 1 summary | 说明攻击输入规模。 |
| Attack budget | `results/analysis_results.json` | Stage 1 and Stage 4 | 保证公平比较。 |
| Weak password rejection rate | `policy_results` | Stage 2 | 衡量 policy 效果。 |
| Cracked accounts | `storage_results` | Stage 4 | 衡量攻击成功。 |
| Guesses per second | `storage_results` | Stage 4 | 衡量攻击速度。 |
| Average verification ms | `storage_results` | Stage 4 | 衡量 storage 成本。 |
| Time to first crack | `storage_results` | Stage 4 | 衡量攻击早期收益。 |
| Account-level outcome | `storage_results.cracked` + users | Stage 4 | 让结果具体化。 |

## 7. 美观验收标准

重构完成后必须通过以下人工验收：

- 首页 5 秒内能看懂项目在分析 password leak attack chain。
- `Run demo` 按钮明显，点击后阶段切换清楚。
- 每个阶段最多一个核心结论，不要到处都是解释段落。
- 图表比文字更突出。
- Stage 4 的 cracking result 必须是全站最强视觉重点。
- 截图放进 slides 后仍然清楚，不依赖口头补充才能看懂。
- 没有文字重叠。
- 没有横向滚动。
- 移动端至少能正常阅读，不要求像桌面一样完整展示。
- 前端中不出现 MFA 实验结果。

技术验收：

- `node --check dashboard/app.js` 通过。
- `python -m py_compile scripts/generate_results.py scripts/export_analysis_summary.py` 通过。
- `python scripts/generate_results.py` 能重新生成结果。
- `python scripts/export_analysis_summary.py` 能重新生成摘要。
- `http://127.0.0.1:8000/dashboard/` 能打开。
- 搜索 `MFA|mfa|second-factor|takeover|challenge` 时，`dashboard/`、`data/`、`scripts/generate_results.py`、`results/analysis_results.json` 中不应出现实验逻辑残留。

## 8. 初步改版方案

建议下一版采用“presentation-first dashboard”。

页面结构：

1. 左侧或顶部：项目标题、Run demo、阶段导航。
2. 主区域顶部：当前阶段问题 + 一句结论。
3. 主区域中部：该阶段核心图表或矩阵。
4. 主区域底部：1-2 个 evidence note 或 limitation。

推荐首页文案：

> What happens when a password database leaks?
>
> This lab compares password policy and storage choices under the same offline attack budget.

推荐主结论文案：

> Complexity changes whether a password is accepted. Storage cost changes how expensive it is to guess after a leak.

## 9. 下一步实施清单

1. 先画低保真布局草图，不直接写 CSS。
2. 确定配色、字体层级、图表样式。
3. 重写 `dashboard/index.html` 的结构。
4. 重写 `dashboard/style.css` 的视觉系统。
5. 精简 `dashboard/app.js` 的渲染逻辑。
6. 用真实 `results/analysis_results.json` 数据驱动所有数值。
7. 截图检查桌面和移动端。
8. 更新 `docs/demo-script.md`，确保讲稿和新页面一致。
9. 更新 `docs/work-log.md`，记录本次前端重构工作。
10. commit 并 push 到 GitHub，保留开发历史。
