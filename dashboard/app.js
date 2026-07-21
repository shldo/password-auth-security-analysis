const state = {
  data: null,
  activeView: "assessment",
  activeMethod: "sha256",
  isRunning: false,
  runTimer: null,
};

const methodOrder = ["plaintext", "sha256", "bcrypt", "argon2id"];
const chainViews = ["assessment", "choices", "leak", "cracking", "final"];
const chainLabels = {
  assessment: "Case setup",
  choices: "Policy effect",
  leak: "Storage exposure",
  cracking: "Cracking cost",
  final: "Layered outcome",
};

const impactMap = [
  {
    view: "assessment",
    control: "Controlled case",
    stage: "Define assumptions",
    indicator: "Synthetic users, fixed wordlist, fixed budget",
    meaning: "Keeps the comparison ethical and repeatable.",
    evidenceType: "Scope",
  },
  {
    view: "choices",
    control: "Password policy",
    stage: "Password creation",
    indicator: "Weak rejection and strong acceptance rates",
    meaning: "Shows why complexity and guess resistance differ.",
    evidenceType: "Measured",
  },
  {
    view: "leak",
    control: "Storage method",
    stage: "Database leak",
    indicator: "Leaked value format and verification cost",
    meaning: "Shows what the attacker receives after a leak.",
    evidenceType: "Measured",
  },
  {
    view: "cracking",
    control: "Hashing cost",
    stage: "Offline guessing",
    indicator: "Cracked accounts, guesses/sec, first crack",
    meaning: "Shows how storage cost changes attacker speed.",
    evidenceType: "Measured",
  },
  {
    view: "final",
    control: "Layered design",
    stage: "Whole measured chain",
    indicator: "Policy, exposure, and cracking metrics",
    meaning: "Turns the case study into a security recommendation.",
    evidenceType: "Analysis",
  },
];

const passwordTypeExamples = [
  {
    title: "Complex but common",
    example: "Password123!",
    shape: "Dictionary word + number sequence + symbol",
    riskLabel: "weak_common",
    complexity: "Accepted",
    layered: "Rejected",
    note: "Looks compliant, but it follows one of the most common password patterns.",
  },
  {
    title: "Season and year pattern",
    example: "Summer2026!",
    shape: "Season + current year + symbol",
    riskLabel: "predictable_pattern",
    complexity: "Accepted",
    layered: "Rejected",
    note: "Predictable because attackers often try dates, seasons, and recent years.",
  },
  {
    title: "Context-specific pattern",
    example: "UNSW2026!",
    shape: "Organisation keyword + year + symbol",
    riskLabel: "predictable_pattern",
    complexity: "Rejected",
    layered: "Rejected",
    note: "A targeted attacker can guess school, company, product, or event names.",
  },
  {
    title: "Transformed dictionary word",
    example: "Tr0ub4dor&3",
    shape: "Word with character substitutions",
    riskLabel: "predictable_pattern",
    complexity: "Accepted",
    layered: "Rejected",
    note: "Substituting letters with numbers is common enough to appear in cracking rules.",
  },
  {
    title: "Long phrase",
    example: "RiverLanternMuseumOrbit",
    shape: "Multiple words joined into one long password",
    riskLabel: "strong_passphrase",
    complexity: "Rejected",
    layered: "Accepted",
    note: "Longer and more memorable, but old complexity rules may reject it for lacking digits or symbols.",
  },
  {
    title: "Phrase with number",
    example: "VioletMapleCoffee27",
    shape: "Several words joined together + number",
    riskLabel: "strong_passphrase",
    complexity: "Rejected",
    layered: "Accepted",
    note: "Combines length with lower predictability while still being practical for typical password fields.",
  },
];

const recommendationItems = [
  {
    title: "Replace fast password hashing",
    body: "Use Argon2id or bcrypt instead of plaintext or fast general-purpose hashes. This raises attacker cost after a database leak.",
  },
  {
    title: "Use blocklists and long passwords",
    body: "Reject common, breached, and context-specific passwords while allowing long password phrases that users can remember.",
  },
  {
    title: "Tune password hashing cost",
    body: "Select bcrypt or Argon2id parameters that are expensive for attackers while still acceptable for normal login performance.",
  },
  {
    title: "State experiment limits clearly",
    body: "Synthetic data demonstrates mechanism and control impact; it should not be presented as real-world password prevalence.",
  },
];

function qs(selector) {
  return document.querySelector(selector);
}

function formatNumber(value) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatOptionalNumber(value, suffix = "") {
  if (value === null || value === undefined) {
    return "Direct exposure";
  }
  return `${formatNumber(value)}${suffix}`;
}

function formatRatio(numerator, denominator) {
  if (!denominator) {
    return "0%";
  }
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function loadData() {
  const panel = qs("#view-panel");
  panel.innerHTML = '<div class="loading">Loading dashboard data</div>';

  try {
    const response = await fetch("../results/analysis_results.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.data = await response.json();
    updateSummaryMetrics();
    setActiveView(getHashView(), { updateHash: false });
    qs("#dataset-status").textContent = `Results generated ${state.data.generated_at}`;
  } catch (error) {
    panel.innerHTML = `
      <div class="error">
        <div>
          <h2>Dashboard data could not be loaded</h2>
          <p>Run <code>python scripts/generate_results.py</code>, then serve the project root with <code>python -m http.server 8000</code>.</p>
        </div>
      </div>
    `;
    qs("#dataset-status").textContent = "Results unavailable";
  }
}

function getHashView() {
  const hashView = window.location.hash.replace("#", "");
  return chainViews.includes(hashView) ? hashView : "assessment";
}

function updateSummaryMetrics() {
  const context = state.data.experiment_context;
  const sha256 = getStorageResult("sha256");
  const argon2id = getStorageResult("argon2id");
  qs("#metric-budget").textContent = `${context.attack_budget_seconds_per_method}s`;
  qs("#metric-users").textContent = `${context.user_count}`;
  qs("#metric-fast").textContent = `${sha256.cracked_accounts}/${sha256.total_accounts}`;
  qs("#metric-secure").textContent = `${argon2id.cracked_accounts}/${argon2id.total_accounts}`;
}

function setActiveView(view, options = { updateHash: true }) {
  state.activeView = view;
  if (options.updateHash && window.location.hash !== `#${view}`) {
    window.history.replaceState(null, "", `#${view}`);
  }
  const activeIndex = chainViews.indexOf(view);
  document.querySelectorAll(".chain-step").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.view === view);
    button.classList.toggle("is-complete", chainViews.indexOf(button.dataset.view) < activeIndex);
  });
  updateExecutionStatus(view);
  renderActiveView();
}

function updateExecutionStatus(view = state.activeView) {
  const status = qs("#execution-status");
  if (!status) {
    return;
  }
  const label = chainLabels[view];
  status.textContent = state.isRunning
    ? `Running evaluation: ${label}`
    : `Current stage: ${label}`;
}

function resetSimulation() {
  if (state.runTimer) {
    window.clearTimeout(state.runTimer);
  }
  state.runTimer = null;
  state.isRunning = false;
  const runButton = qs("#run-chain");
  if (runButton) {
    runButton.disabled = false;
    runButton.textContent = "Start simulation";
  }
  setActiveView("assessment");
  qs("#execution-status").textContent = "Ready to evaluate the case-study password authentication design.";
}

function startSimulation() {
  if (!state.data || state.isRunning) {
    return;
  }

  state.isRunning = true;
  const runButton = qs("#run-chain");
  runButton.disabled = true;
  runButton.textContent = "Simulation running";

  let index = 0;
  const advance = () => {
    setActiveView(chainViews[index]);
    index += 1;

    if (index < chainViews.length) {
      state.runTimer = window.setTimeout(advance, 1400);
      return;
    }

    state.runTimer = window.setTimeout(() => {
      state.isRunning = false;
      runButton.disabled = false;
      runButton.textContent = "Run again";
      qs("#execution-status").textContent = "Evaluation complete: review the layered authentication recommendation.";
    }, 1400);
  };

  advance();
}

function getStorageResult(method = state.activeMethod) {
  return state.data.storage_results.find((result) => result.method === method);
}

function getPolicyResult(policy) {
  return state.data.policy_results.find((result) => result.policy === policy);
}

function renderActiveView() {
  if (!state.data) {
    return;
  }

  const renderers = {
    assessment: renderSystemAssessment,
    choices: renderChoices,
    leak: renderLeak,
    cracking: renderCracking,
    final: renderFinalAssessment,
  };

  qs("#view-panel").innerHTML = `${renderers[state.activeView]()}${renderImpactMap()}`;
  bindViewEvents();
}

function renderImpactMap() {
  const activeIndex = chainViews.indexOf(state.activeView);
  const cards = impactMap
    .map((item) => {
      const stepIndex = chainViews.indexOf(item.view);
      const stateClass = stepIndex === activeIndex ? " is-active" : stepIndex < activeIndex ? " is-complete" : "";
      return `
        <button class="impact-step${stateClass}" type="button" data-view="${item.view}">
          <span class="impact-number">${stepIndex + 1}</span>
          <span class="impact-copy">
            <strong>${escapeHtml(item.control)}</strong>
            <span>${escapeHtml(item.stage)}</span>
            <small>${escapeHtml(item.indicator)}</small>
          </span>
          <span class="impact-type">${escapeHtml(item.evidenceType)}</span>
        </button>
      `;
    })
    .join("");

  return `
    <section class="logic-map" aria-label="Controlled case-study logic">
      <div class="logic-map-header">
        <div>
          <p class="eyebrow">Project logic</p>
          <h2>Each control affects one stage of the attack chain</h2>
        </div>
        <p class="small-muted">The data is synthetic by design. The point is not real-world password prevalence; it is a controlled comparison of how controls change the attack path.</p>
      </div>
      <div class="impact-grid">${cards}</div>
    </section>
  `;
}

function renderStageEvidence(items) {
  return `
    <div class="stage-evidence-grid">
      ${items
        .map(
          (item) => `
            <div class="stage-evidence-item">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <small>${escapeHtml(item.note)}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function bindViewEvents() {
  document.querySelectorAll(".impact-step").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.view));
  });
  document.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMethod = button.dataset.method;
      renderActiveView();
    });
  });
}

function methodButtons() {
  return `
    <div class="control-row" aria-label="Storage method selector">
      ${methodOrder
        .map((method) => {
          const result = getStorageResult(method);
          const active = method === state.activeMethod ? " is-active" : "";
          return `<button class="method-button${active}" type="button" data-method="${method}">${result.label}</button>`;
        })
        .join("")}
    </div>
  `;
}

function riskBadge(label) {
  if (label === "strong_passphrase") {
    return '<span class="risk-badge low">long phrase</span>';
  }
  if (label === "predictable_pattern") {
    return '<span class="risk-badge medium">predictable</span>';
  }
  return '<span class="risk-badge high">weak/common</span>';
}

function methodTone(method) {
  if (method === "plaintext" || method === "sha256") {
    return "high";
  }
  if (method === "bcrypt") {
    return "medium";
  }
  return "low";
}

function methodLabel(method) {
  return getStorageResult(method).label;
}

function renderPolicyDecisionMatrix() {
  const comparedPolicies = ["composition", "layered"];
  const policyLookup = new Map(
    comparedPolicies.map((policy) => [
      policy,
      new Map(getPolicyResult(policy).decisions.map((decision) => [decision.password, decision])),
    ]),
  );

  const rows = passwordTypeExamples
    .map((example) => {
      const decisions = comparedPolicies
        .map((policy) => {
          const decision = policyLookup.get(policy).get(example.example);
          const accepted = decision && decision.accepted;
          const policyLabel = policy === "composition" ? "Complexity" : "Layered";
          return `<span class="decision-cell ${accepted ? "accepted" : "rejected"}"><small>${policyLabel}</small>${accepted ? "accept" : "reject"}</span>`;
        })
        .join("");
      return `
        <div class="decision-row">
          <div>
            <strong>${escapeHtml(example.title)}</strong>
            <code>${escapeHtml(example.example)}</code>
          </div>
          <div class="decision-cells">${decisions}</div>
        </div>
      `;
    })
    .join("");

  return `
    <div class="decision-matrix" aria-label="Policy acceptance comparison">
      <div class="decision-header">
        <span>Password form</span>
        <span>Complexity vs layered</span>
      </div>
      ${rows}
    </div>
  `;
}

function renderCrackedBars() {
  const total = state.data.experiment_context.user_count;
  return state.data.storage_results
    .map((result) => {
      const width = Math.max(3, (result.cracked_accounts / total) * 100);
      return `
        <div class="result-bar-row ${methodTone(result.method)}">
          <div>
            <strong>${result.label}</strong>
            <span>${formatRatio(result.cracked_accounts, total)} cracked</span>
          </div>
          <div class="result-bar-track">
            <div class="result-bar-fill" style="width:${width}%"></div>
          </div>
          <b>${result.cracked_accounts}/${total}</b>
        </div>
      `;
    })
    .join("");
}

function renderSpeedBars() {
  const hashResults = state.data.storage_results.filter((result) => result.guesses_per_second !== null);
  const maxLogSpeed = Math.max(...hashResults.map((result) => Math.log10(result.guesses_per_second + 1)));

  const rows = state.data.storage_results
    .map((result) => {
      if (result.guesses_per_second === null) {
        return `
          <div class="result-bar-row high">
            <div>
              <strong>${result.label}</strong>
              <span>no guessing needed</span>
            </div>
            <div class="result-bar-track">
              <div class="result-bar-fill" style="width:100%"></div>
            </div>
            <b>exposed</b>
          </div>
        `;
      }

      const width = Math.max(4, (Math.log10(result.guesses_per_second + 1) / maxLogSpeed) * 100);
      return `
        <div class="result-bar-row ${methodTone(result.method)}">
          <div>
            <strong>${result.label}</strong>
            <span>${formatOptionalNumber(result.average_verify_ms, " ms")} per guess</span>
          </div>
          <div class="result-bar-track">
            <div class="result-bar-fill" style="width:${width}%"></div>
          </div>
          <b>${formatOptionalNumber(result.guesses_per_second)}</b>
        </div>
      `;
    })
    .join("");

  return `
    <div class="visual-caption">Guessing speed uses a log scale so slow hashes remain visible.</div>
    ${rows}
  `;
}

function renderOutcomeMatrix() {
  const crackedByMethod = new Map(
    state.data.storage_results.map((result) => [
      result.method,
      new Set(result.cracked.map((account) => account.username)),
    ]),
  );

  const header = methodOrder.map((method) => `<span>${escapeHtml(methodLabel(method))}</span>`).join("");
  const rows = state.data.users
    .map((user) => {
      const cells = methodOrder
        .map((method) => {
          const exposed = method === "plaintext";
          const cracked = crackedByMethod.get(method).has(user.username);
          const label = exposed ? "exposed" : cracked ? "cracked" : "not found";
          const stateClass = exposed ? "exposed" : cracked ? "cracked" : "missed";
          return `<span class="outcome-cell ${stateClass}" aria-label="${user.username} ${methodLabel(method)} ${label}">${label}</span>`;
        })
        .join("");

      return `
        <div class="outcome-row">
          <div>
            <strong>${escapeHtml(user.username)}</strong>
            <span>${escapeHtml(user.profile)}</span>
          </div>
          ${cells}
        </div>
      `;
    })
    .join("");

  return `
    <div class="outcome-matrix" aria-label="Account-level cracking outcome by storage method">
      <div class="outcome-row outcome-header">
        <span>Account</span>
        ${header}
      </div>
      ${rows}
    </div>
  `;
}

function renderSystemAssessment() {
  const assessment = state.data.attack_chain_summary.system_assessment;
  return `
    ${renderStageEvidence([
      {
        label: "Control being framed",
        value: "Case-study assumptions",
        note: "Synthetic users and passwords avoid real-credential risk.",
      },
      {
        label: "Attack stage",
        value: "Before the leak",
        note: "Defines what will be held constant during the experiment.",
      },
      {
        label: "What this proves",
        value: "Comparison setup",
        note: "It does not claim to describe real password prevalence.",
      },
    ])}
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 1</p>
        <h2>Case setup</h2>
        <p>The case-study system appears safe because it requires complex-looking passwords. The controlled experiment tests what happens after the password database is leaked.</p>
        <div class="flow-line">
          <div class="flow-item"><span>1</span><div><strong>Password policy</strong><br><span class="small-muted">${assessment.password_policy}</span></div></div>
          <div class="flow-item"><span>2</span><div><strong>Password storage</strong><br><span class="small-muted">${assessment.storage}</span></div></div>
          <div class="flow-item"><span>3</span><div><strong>Breached-password check</strong><br><span class="small-muted">${assessment.breached_password_check}</span></div></div>
        </div>
      </div>
      <div class="sub-card">
        <h3>Attack chain used in the case study</h3>
        <div class="flow-line">
          <div class="flow-item"><span>A</span><div><strong>Password form is selected</strong><br><span class="small-muted">Policy shapes which password forms are accepted.</span></div></div>
          <div class="flow-item"><span>B</span><div><strong>Database is leaked</strong><br><span class="small-muted">The attacker gets stored password records.</span></div></div>
          <div class="flow-item"><span>C</span><div><strong>Offline cracking begins</strong><br><span class="small-muted">Storage method controls guessing cost.</span></div></div>
          <div class="flow-item"><span>D</span><div><strong>Measured outcome is compared</strong><br><span class="small-muted">Cracked accounts and cost indicators support the recommendation.</span></div></div>
        </div>
      </div>
    </div>
  `;
}

function renderChoices() {
  const composition = getPolicyResult("composition");
  const layered = getPolicyResult("layered");
  const typeCards = passwordTypeExamples
    .map(
      (item) => `
        <article class="password-type-card">
          <div class="password-type-heading">
            <h3>${escapeHtml(item.title)}</h3>
            ${riskBadge(item.riskLabel)}
          </div>
          <code>${escapeHtml(item.example)}</code>
          <p><strong>Form:</strong> ${escapeHtml(item.shape)}</p>
          <div class="policy-pair" aria-label="Policy result comparison">
            <span><strong>Complexity:</strong> ${escapeHtml(item.complexity)}</span>
            <span><strong>Layered:</strong> ${escapeHtml(item.layered)}</span>
          </div>
          <p class="small-muted">${escapeHtml(item.note)}</p>
        </article>
      `,
    )
    .join("");

  return `
    ${renderStageEvidence([
      {
        label: "Control being tested",
        value: "Password policy",
        note: "Complexity rule compared with layered policy.",
      },
      {
        label: "Attack-chain stage",
        value: "Password creation",
        note: "Affects which weak or predictable passwords enter the system.",
      },
      {
        label: "Indicator",
        value: "Rejection and acceptance rates",
        note: "Measured on the synthetic password set.",
      },
    ])}
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 2</p>
        <h2>Policy effect on password forms</h2>
        <p>This stage shows the first control point: policy changes which password forms are accepted before storage ever happens.</p>
        <div class="stack">
          <div class="sub-card">
            <h3>Complexity rule</h3>
            <p class="small-muted">${composition.description}</p>
            <strong>${Math.round(composition.weak_password_rejection_rate * 100)}%</strong>
            <span class="small-muted"> weak or predictable passwords rejected</span>
          </div>
          <div class="sub-card">
            <h3>Layered policy</h3>
            <p class="small-muted">${layered.description}</p>
            <strong>${Math.round(layered.weak_password_rejection_rate * 100)}%</strong>
            <span class="small-muted"> weak or predictable passwords rejected</span>
          </div>
        </div>
      </div>
      <div class="stack">
        <div class="sub-card">
          <h3>Policy decision matrix</h3>
          ${renderPolicyDecisionMatrix()}
        </div>
        <div class="sub-card">
          <h3>Password form comparison</h3>
          <div class="password-type-grid">${typeCards}</div>
        </div>
      </div>
    </div>
  `;
}

function renderLeak() {
  const selected = getStorageResult();
  const rows = state.data.leaked_record_previews[state.activeMethod]
    .map(
      (record) => `
        <tr>
          <td>${escapeHtml(record.username)}</td>
          <td><code>${escapeHtml(record.leaked_value)}</code></td>
        </tr>
      `,
    )
    .join("");

  return `
    ${renderStageEvidence([
      {
        label: "Control being tested",
        value: "Storage method",
        note: "Plaintext, salted SHA-256, bcrypt, and Argon2id.",
      },
      {
        label: "Attack-chain stage",
        value: "Database leak",
        note: "Affects what the attacker receives after compromise.",
      },
      {
        label: "Indicator",
        value: "Leaked value and verify cost",
        note: "Plaintext exposes directly; hashes require guessing.",
      },
    ])}
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 3</p>
        <h2>Storage exposure after a leak</h2>
        <p>The same synthetic passwords are stored four different ways. This isolates storage method as the variable being compared.</p>
        ${methodButtons()}
        <div class="sub-card">
          <h3>${selected.label}</h3>
          <p>${selected.summary}</p>
          <p class="small-muted">${selected.security_role}</p>
        </div>
      </div>
      <div class="sub-card">
        <h3>Leaked record preview</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Leaked value</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCracking() {
  const sha256 = getStorageResult("sha256");
  const argon2id = getStorageResult("argon2id");
  const speedRatio = Math.round(sha256.guesses_per_second / argon2id.guesses_per_second);
  const speedRows = state.data.storage_results
    .map(
      (result) => `
        <tr>
          <td>${result.label}</td>
          <td>${formatOptionalNumber(result.guesses_per_second)}</td>
          <td>${formatOptionalNumber(result.average_verify_ms, " ms")}</td>
          <td>${formatOptionalNumber(result.time_to_first_crack_seconds, " s")}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="finding-banner">
      <div>
        <p class="eyebrow">Step 4</p>
        <h2>Offline cracking cost</h2>
        <p>Same passwords, same wordlist, same ${state.data.experiment_context.attack_budget_seconds_per_method}-second budget. The result is not just "hashed or not"; it is how expensive each guess becomes.</p>
      </div>
      <div class="finding-number">
        <span>SHA-256 vs Argon2id speed</span>
        <strong>${formatNumber(speedRatio)}x</strong>
        <small>more guesses per second in this run</small>
      </div>
    </div>
    ${renderStageEvidence([
      {
        label: "Control being tested",
        value: "Hashing cost",
        note: "Same wordlist and same time budget for each method.",
      },
      {
        label: "Attack-chain stage",
        value: "Offline guessing",
        note: "Attacker can test guesses without touching the real service.",
      },
      {
        label: "Indicator",
        value: "Cracked accounts and guesses/sec",
        note: "This is the main measured technical experiment.",
      },
    ])}
    <div class="visual-grid">
      <div class="sub-card">
        <h3>Cracked accounts within budget</h3>
        <div class="result-bar-list">${renderCrackedBars()}</div>
      </div>
      <div class="sub-card">
        <h3>Guessing speed comparison</h3>
        <div class="result-bar-list">${renderSpeedBars()}</div>
      </div>
    </div>
    <div class="sub-card" style="margin-top: 14px;">
      <h3>Account-level outcome matrix</h3>
      <p class="small-muted">This shows which synthetic accounts became exposed or cracked under each storage method.</p>
      ${renderOutcomeMatrix()}
    </div>
    <div class="sub-card" style="margin-top: 14px;">
      <h3>Exact timing indicators</h3>
      <table class="data-table">
        <thead>
          <tr>
            <th>Storage</th>
            <th>Guesses/sec</th>
            <th>Avg verify</th>
            <th>First crack</th>
          </tr>
        </thead>
        <tbody>${speedRows}</tbody>
      </table>
    </div>
  `;
}

function renderFinalAssessment() {
  return `
    ${renderStageEvidence([
      {
        label: "Control being assessed",
        value: "Layered authentication",
        note: "Policy, storage, cracking cost, and report-only limitations.",
      },
      {
        label: "Attack-chain stage",
        value: "Whole measured chain",
        note: "Each layer reduces a different failure mode.",
      },
      {
        label: "Output",
        value: "Final recommendation",
        note: "Includes limitations instead of overstating the model.",
      },
    ])}
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 5</p>
        <h2>Layered outcome</h2>
        <p>${state.data.attack_chain_summary.main_finding}</p>
        <div class="flow-line">
          ${state.data.attack_chain_summary.risk_reduction_story
            .map((item, index) => `<div class="flow-item"><span>${index + 1}</span><div>${escapeHtml(item)}</div></div>`)
            .join("")}
        </div>
      </div>
      <div class="recommendation-grid">
        ${recommendationItems
          .map(
            (item) => `
              <article class="sub-card recommendation-item">
                <h3>${escapeHtml(item.title)}</h3>
                <p class="small-muted">${escapeHtml(item.body)}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </div>
  `;
}

document.querySelectorAll(".chain-step").forEach((button) => {
  button.addEventListener("click", () => setActiveView(button.dataset.view));
});

qs("#run-chain").addEventListener("click", startSimulation);
qs("#reset-chain").addEventListener("click", resetSimulation);
window.addEventListener("hashchange", () => {
  if (!state.isRunning) {
    setActiveView(getHashView(), { updateHash: false });
  }
});

loadData();
