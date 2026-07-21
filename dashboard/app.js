const state = {
  data: null,
  activeView: "assessment",
  activeMethod: "sha256",
  isRunning: false,
  runTimer: null,
};

const methodOrder = ["plaintext", "sha256", "bcrypt", "argon2id"];

const stages = [
  {
    id: "assessment",
    title: "Case Setup",
    status: "Scope and assumptions",
  },
  {
    id: "choices",
    title: "Policy Effect",
    status: "Password forms",
  },
  {
    id: "leak",
    title: "Storage Exposure",
    status: "Database leak",
  },
  {
    id: "cracking",
    title: "Cracking Cost",
    status: "Main measured experiment",
  },
  {
    id: "final",
    title: "Layered Outcome",
    status: "Recommendation",
  },
];

const passwordTypeExamples = [
  {
    title: "Complex but common",
    example: "Password123!",
    shape: "Dictionary word + number sequence + symbol",
    riskLabel: "weak_common",
  },
  {
    title: "Season and year pattern",
    example: "Summer2026!",
    shape: "Season + current year + symbol",
    riskLabel: "predictable_pattern",
  },
  {
    title: "Context-specific pattern",
    example: "UNSW2026!",
    shape: "Organisation keyword + year + symbol",
    riskLabel: "predictable_pattern",
  },
  {
    title: "Transformed dictionary word",
    example: "Tr0ub4dor&3",
    shape: "Word with common substitutions",
    riskLabel: "predictable_pattern",
  },
  {
    title: "Long phrase",
    example: "RiverLanternMuseumOrbit",
    shape: "Multiple words joined together",
    riskLabel: "strong_passphrase",
  },
  {
    title: "Phrase with number",
    example: "VioletMapleCoffee27",
    shape: "Several words joined together + number",
    riskLabel: "strong_passphrase",
  },
];

const recommendationItems = [
  {
    title: "Replace fast password hashing",
    body: "Use Argon2id or bcrypt instead of plaintext or fast general-purpose hashes.",
  },
  {
    title: "Use blocklists and long passwords",
    body: "Reject common and context-specific passwords while allowing practical long password phrases.",
  },
  {
    title: "Tune hashing cost deliberately",
    body: "Choose parameters that raise attacker cost while keeping normal login acceptable.",
  },
  {
    title: "Keep claims inside the evidence",
    body: "Report the dashboard results as a measured password-leak path, with separate limitations for controls outside this experiment.",
  },
];

function qs(selector) {
  return document.querySelector(selector);
}

function formatNumber(value, options = {}) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: options.decimals ?? 2,
  });
}

function formatOptionalNumber(value, suffix = "") {
  if (value === null || value === undefined) {
    return "Direct exposure";
  }
  return `${formatNumber(value)}${suffix}`;
}

function percent(numerator, denominator) {
  if (!denominator) {
    return 0;
  }
  return Math.round((numerator / denominator) * 100);
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
  qs("#view-panel").innerHTML = '<div class="loading">Loading dashboard data</div>';

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
    qs("#view-panel").innerHTML = `
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
  return stages.some((stage) => stage.id === hashView) ? hashView : "assessment";
}

function getStage(view = state.activeView) {
  return stages.find((stage) => stage.id === view);
}

function getStorageResult(method = state.activeMethod) {
  return state.data.storage_results.find((result) => result.method === method);
}

function getPolicyResult(policy) {
  return state.data.policy_results.find((result) => result.policy === policy);
}

function updateSummaryMetrics() {
  const context = state.data.experiment_context;
  const sha256 = getStorageResult("sha256");
  const argon2id = getStorageResult("argon2id");

  qs("#metric-budget").textContent = `${context.attack_budget_seconds_per_method}s`;
  qs("#metric-users").textContent = context.user_count;
  qs("#metric-fast").textContent = `${sha256.cracked_accounts}/${sha256.total_accounts}`;
  qs("#metric-secure").textContent = `${argon2id.cracked_accounts}/${argon2id.total_accounts}`;
}

function setActiveView(view, options = { updateHash: true }) {
  state.activeView = view;
  if (options.updateHash && window.location.hash !== `#${view}`) {
    window.history.replaceState(null, "", `#${view}`);
  }

  const activeIndex = stages.findIndex((stage) => stage.id === view);
  document.querySelectorAll(".stage-link").forEach((button) => {
    const index = stages.findIndex((stage) => stage.id === button.dataset.view);
    button.classList.toggle("is-active", button.dataset.view === view);
    button.classList.toggle("is-complete", index < activeIndex);
  });

  qs("#stage-title").textContent = getStage(view).title;
  updateExecutionStatus(view);
  renderActiveView();
}

function updateExecutionStatus(view = state.activeView) {
  const stage = getStage(view);
  qs("#execution-status").textContent = state.isRunning
    ? `Running demo: ${stage.title}`
    : `Current stage: ${stage.title} - ${stage.status}`;
}

function resetSimulation() {
  if (state.runTimer) {
    window.clearTimeout(state.runTimer);
  }
  state.runTimer = null;
  state.isRunning = false;
  const runButton = qs("#run-chain");
  runButton.disabled = false;
  runButton.textContent = "Run demo";
  setActiveView("assessment");
}

function startSimulation() {
  if (!state.data || state.isRunning) {
    return;
  }

  state.isRunning = true;
  const runButton = qs("#run-chain");
  runButton.disabled = true;
  runButton.textContent = "Running";

  let index = 0;
  const advance = () => {
    setActiveView(stages[index].id);
    index += 1;

    if (index < stages.length) {
      state.runTimer = window.setTimeout(advance, 1300);
      return;
    }

    state.runTimer = window.setTimeout(() => {
      state.isRunning = false;
      runButton.disabled = false;
      runButton.textContent = "Run again";
      qs("#execution-status").textContent = "Demo complete - review the layered outcome";
    }, 1300);
  };

  advance();
}

function renderActiveView() {
  const renderers = {
    assessment: renderAssessment,
    choices: renderPolicy,
    leak: renderLeak,
    cracking: renderCracking,
    final: renderFinal,
  };

  qs("#view-panel").innerHTML = renderers[state.activeView]();
  bindDynamicEvents();
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMethod = button.dataset.method;
      renderActiveView();
    });
  });
}

function methodTone(method) {
  if (method === "plaintext" || method === "sha256") {
    return "danger";
  }
  if (method === "bcrypt") {
    return "medium";
  }
  return "safe";
}

function resultFillClass(method) {
  if (method === "argon2id") {
    return "safe";
  }
  if (method === "bcrypt") {
    return "medium";
  }
  return "";
}

function riskBadge(label) {
  if (label === "strong_passphrase") {
    return '<span class="badge strong">long phrase</span>';
  }
  if (label === "predictable_pattern") {
    return '<span class="badge pattern">predictable</span>';
  }
  return '<span class="badge weak">weak/common</span>';
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

function renderEvidence(items) {
  return `
    <div class="evidence-grid">
      ${items
        .map(
          (item) => `
            <div class="evidence-item">
              <span>${escapeHtml(item.label)}</span>
              <strong>${escapeHtml(item.value)}</strong>
              <small class="muted">${escapeHtml(item.note)}</small>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMethodBars(kind) {
  const total = state.data.experiment_context.user_count;
  const hashResults = state.data.storage_results.filter((result) => result.guesses_per_second !== null);
  const maxLogSpeed = Math.max(...hashResults.map((result) => Math.log10(result.guesses_per_second + 1)));

  return state.data.storage_results
    .map((result) => {
      const countMode = kind === "count";
      const width = countMode
        ? Math.max(4, (result.cracked_accounts / total) * 100)
        : result.guesses_per_second === null
          ? 100
          : Math.max(4, (Math.log10(result.guesses_per_second + 1) / maxLogSpeed) * 100);
      const label = countMode
        ? `${percent(result.cracked_accounts, total)}% cracked`
        : result.guesses_per_second === null
          ? "no guessing required"
          : `${formatOptionalNumber(result.average_verify_ms, " ms")} per guess`;
      const value = countMode
        ? `${result.cracked_accounts}/${total}`
        : result.guesses_per_second === null
          ? "exposed"
          : formatOptionalNumber(result.guesses_per_second);

      return `
        <div class="method-row">
          <div>
            <strong>${result.label}</strong>
            <span>${label}</span>
          </div>
          <div class="bar-track" aria-label="${result.label} ${value}">
            <div class="bar-fill ${resultFillClass(result.method)}" style="width:${width}%"></div>
          </div>
          <b>${value}</b>
        </div>
      `;
    })
    .join("");
}

function renderOutcomeBoard() {
  const crackedByMethod = new Map(
    state.data.storage_results.map((result) => [
      result.method,
      new Set(result.cracked.map((account) => account.username)),
    ]),
  );
  const header = methodOrder.map((method) => `<span>${escapeHtml(getStorageResult(method).label)}</span>`).join("");
  const rows = state.data.users
    .map((user) => {
      const cells = methodOrder
        .map((method) => {
          const exposed = method === "plaintext";
          const cracked = crackedByMethod.get(method).has(user.username);
          const label = exposed ? "exposed" : cracked ? "cracked" : "not found";
          const className = exposed ? "exposed" : cracked ? "cracked" : "missed";
          return `<span class="outcome ${className}">${label}</span>`;
        })
        .join("");
      return `
        <div class="outcome-row">
          <div class="outcome-account">
            <strong>${escapeHtml(user.username)}</strong>
            <span>${escapeHtml(user.profile)}</span>
          </div>
          ${cells}
        </div>
      `;
    })
    .join("");

  return `
    <div class="outcome-board">
      <div class="outcome-row outcome-header">
        <span>Account</span>
        ${header}
      </div>
      ${rows}
    </div>
  `;
}

function renderPolicyBoard() {
  const comparedPolicies = ["composition", "layered"];
  const policyLookup = new Map(
    comparedPolicies.map((policy) => [
      policy,
      new Map(getPolicyResult(policy).decisions.map((decision) => [decision.password, decision])),
    ]),
  );

  const rows = passwordTypeExamples
    .map((example) => {
      const cells = comparedPolicies
        .map((policy) => {
          const decision = policyLookup.get(policy).get(example.example);
          const accepted = decision && decision.accepted;
          return `<span class="decision ${accepted ? "accepted" : "rejected"}">${accepted ? "accept" : "reject"}</span>`;
        })
        .join("");
      return `
        <div class="policy-row">
          <div>
            <strong>${escapeHtml(example.title)}</strong>
            <br>
            <code>${escapeHtml(example.example)}</code>
          </div>
          ${cells}
        </div>
      `;
    })
    .join("");

  return `
    <div class="policy-board">
      <div class="policy-row policy-header">
        <span>Password form</span>
        <span>Complexity</span>
        <span>Layered</span>
      </div>
      ${rows}
    </div>
  `;
}

function renderAssessment() {
  const context = state.data.experiment_context;
  return `
    <section class="hero-result">
      <div>
        <p class="eyebrow">Controlled case study</p>
        <h2>The demo measures the password path after a database leak</h2>
        <p>The dataset is synthetic by design. The value of the project is the controlled comparison: same passwords, same wordlist, same time budget, different controls.</p>
      </div>
      <div class="hero-number">
        <span>Measured stages</span>
        <strong>3</strong>
        <small>policy, storage, cracking cost</small>
      </div>
    </section>

    ${renderEvidence([
      {
        label: "Dataset",
        value: `${context.user_count} synthetic passwords`,
        note: "Safe to demonstrate and repeat.",
      },
      {
        label: "Wordlist",
        value: `${context.wordlist_size} candidates`,
        note: "Small local list for controlled comparison.",
      },
      {
        label: "Budget",
        value: `${context.attack_budget_seconds_per_method}s per method`,
        note: "Same time limit across storage methods.",
      },
    ])}

    <section class="chain-diagram" aria-label="Measured attack chain">
      <div class="chain-node"><span>1</span><strong>Password creation</strong><small class="muted">policy accepts or rejects forms</small></div>
      <div class="chain-node"><span>2</span><strong>Database leak</strong><small class="muted">stored values become attacker input</small></div>
      <div class="chain-node"><span>3</span><strong>Offline guessing</strong><small class="muted">storage cost controls speed</small></div>
      <div class="chain-node"><span>4</span><strong>Recommendation</strong><small class="muted">map evidence to controls</small></div>
    </section>
  `;
}

function renderPolicy() {
  const composition = getPolicyResult("composition");
  const layered = getPolicyResult("layered");
  const passwordCards = passwordTypeExamples
    .map(
      (example) => `
        <article class="password-card">
          ${riskBadge(example.riskLabel)}
          <strong>${escapeHtml(example.title)}</strong>
          <code>${escapeHtml(example.example)}</code>
          <span>${escapeHtml(example.shape)}</span>
        </article>
      `,
    )
    .join("");

  return `
    <section class="hero-result">
      <div>
        <p class="eyebrow">Step 2</p>
        <h2>Complex-looking passwords are not always hard to guess</h2>
        <p>The policy view separates compliance from guess resistance. A complexity rule can accept predictable forms; a layered rule blocks more weak patterns.</p>
      </div>
      <div class="hero-number">
        <span>Weak passwords rejected</span>
        <strong>${Math.round(layered.weak_password_rejection_rate * 100)}%</strong>
        <small>under layered policy</small>
      </div>
    </section>

    <section class="visual-grid">
      <div class="metric-tile">
        <span class="muted">Complexity rule</span>
        <strong>${Math.round(composition.weak_password_rejection_rate * 100)}%</strong>
        <p class="muted">${escapeHtml(composition.description)}</p>
      </div>
      <div class="metric-tile">
        <span class="muted">Layered policy</span>
        <strong>${Math.round(layered.weak_password_rejection_rate * 100)}%</strong>
        <p class="muted">${escapeHtml(layered.description)}</p>
      </div>
    </section>

    <section class="subsection">
      <h3>Policy decision board</h3>
      ${renderPolicyBoard()}
    </section>

    <section class="password-grid">
      ${passwordCards}
    </section>
  `;
}

function renderLeak() {
  const selected = getStorageResult();
  const rows = state.data.leaked_record_previews[state.activeMethod]
    .map(
      (record) => `
        <div class="leak-row">
          <strong>${escapeHtml(record.username)}</strong>
          <code>${escapeHtml(record.leaked_value)}</code>
        </div>
      `,
    )
    .join("");

  return `
    <section class="hero-result">
      <div>
        <p class="eyebrow">Step 3</p>
        <h2>Storage changes what the attacker receives</h2>
        <p>Use the storage selector to compare the same synthetic passwords stored as plaintext, fast hashes, and adaptive password hashes.</p>
      </div>
      <div class="hero-number">
        <span>Selected method</span>
        <strong>${escapeHtml(selected.label)}</strong>
        <small>${escapeHtml(selected.security_role)}</small>
      </div>
    </section>

    ${methodButtons()}

    <section class="split-grid">
      <div class="subsection">
        <h3>Attacker view after leak</h3>
        <div class="leak-preview">${rows}</div>
      </div>
      <div class="subsection">
        <h3>Security meaning</h3>
        <p>${escapeHtml(selected.summary)}</p>
        <p class="note-line">${escapeHtml(selected.security_role)}</p>
      </div>
    </section>
  `;
}

function renderCracking() {
  const sha256 = getStorageResult("sha256");
  const argon2id = getStorageResult("argon2id");
  const ratio = Math.round(sha256.guesses_per_second / argon2id.guesses_per_second);

  return `
    <section class="hero-result">
      <div>
        <p class="eyebrow">Step 4</p>
        <h2>Fast hashes let the attacker test dramatically more guesses</h2>
        <p>This is the main measured result. Every storage method gets the same password set, wordlist, and ${state.data.experiment_context.attack_budget_seconds_per_method}-second budget.</p>
      </div>
      <div class="hero-number">
        <span>SHA-256 vs Argon2id</span>
        <strong>${formatNumber(ratio)}x</strong>
        <small>more guesses per second in this run</small>
      </div>
    </section>

    <section class="visual-grid">
      <div class="subsection">
        <h3>Cracked accounts within budget</h3>
        ${renderMethodBars("count")}
      </div>
      <div class="subsection">
        <h3>Guessing speed comparison</h3>
        <p class="muted">Log-scaled bars keep slow hashes visible.</p>
        ${renderMethodBars("speed")}
      </div>
    </section>

    <section class="subsection">
      <h3>Account-level outcome</h3>
      <p class="muted">Plaintext is direct exposure. For hashed methods, cracked means the wordlist recovered the password within the budget.</p>
      ${renderOutcomeBoard()}
    </section>
  `;
}

function renderFinal() {
  return `
    <section class="hero-result">
      <div>
        <p class="eyebrow">Step 5</p>
        <h2>Password complexity is only one part of authentication security</h2>
        <p>${escapeHtml(state.data.attack_chain_summary.main_finding)}</p>
      </div>
      <div class="hero-number">
        <span>Measured conclusion</span>
        <strong>Layer</strong>
        <small>policy plus storage plus cracking cost</small>
      </div>
    </section>

    <section class="chain-diagram" aria-label="Recommendation chain">
      ${state.data.attack_chain_summary.risk_reduction_story
        .map((item, index) => `<div class="chain-node"><span>${index + 1}</span><strong>${escapeHtml(item)}</strong></div>`)
        .join("")}
    </section>

    <section class="recommendation-grid">
      ${recommendationItems
        .map(
          (item) => `
            <article class="recommendation">
              <h3>${escapeHtml(item.title)}</h3>
              <p>${escapeHtml(item.body)}</p>
            </article>
          `,
        )
        .join("")}
    </section>
  `;
}

document.querySelectorAll(".stage-link").forEach((button) => {
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
