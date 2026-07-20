const state = {
  data: null,
  activeView: "assessment",
  activeMethod: "sha256",
  activeMfaScenario: "current",
  isRunning: false,
  runTimer: null,
};

const methodOrder = ["plaintext", "sha256", "bcrypt", "argon2id"];
const mfaScenarios = [
  {
    id: "off",
    label: "MFA off",
    description: "Every cracked password can be used directly.",
  },
  {
    id: "current",
    label: "Current mixed state",
    description: "Some sample accounts have MFA enabled and some do not.",
  },
  {
    id: "required",
    label: "MFA required",
    description: "Every cracked password is challenged by MFA.",
  },
];
const chainViews = ["assessment", "choices", "leak", "cracking", "login", "final"];
const chainLabels = {
  assessment: "Assessment",
  choices: "Password types",
  leak: "Database leak",
  cracking: "Offline cracking",
  login: "Login risk",
  final: "Final assessment",
};

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
    title: "Require MFA for risky accounts",
    body: "MFA does not stop offline cracking, but it reduces account takeover when a password is already known.",
  },
  {
    title: "Protect account recovery",
    body: "Recovery flows can bypass strong password storage and MFA, so they must be treated as part of authentication.",
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
  const summary = state.data.attack_chain_summary.headline_metrics;
  qs("#metric-budget").textContent = `${context.attack_budget_seconds_per_method}s`;
  qs("#metric-users").textContent = context.user_count;
  qs("#metric-wordlist").textContent = context.wordlist_size;
  qs("#metric-mfa").textContent = summary.mfa_blocked_takeovers_under_sha256;
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
  qs("#execution-status").textContent = "Ready to evaluate the client's password authentication design.";
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
    assessment: renderClientAssessment,
    choices: renderChoices,
    leak: renderLeak,
    cracking: renderCracking,
    login: renderLoginRisk,
    final: renderFinalAssessment,
  };

  qs("#view-panel").innerHTML = renderers[state.activeView]();
  bindViewEvents();
}

function bindViewEvents() {
  document.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMethod = button.dataset.method;
      renderActiveView();
    });
  });
  document.querySelectorAll("[data-mfa-scenario]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMfaScenario = button.dataset.mfaScenario;
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

function mfaScenarioButtons() {
  return `
    <div class="control-row" aria-label="MFA scenario selector">
      ${mfaScenarios
        .map((scenario) => {
          const active = scenario.id === state.activeMfaScenario ? " is-active" : "";
          return `<button class="method-button${active}" type="button" data-mfa-scenario="${scenario.id}">${scenario.label}</button>`;
        })
        .join("")}
    </div>
  `;
}

function getMfaEnabledForScenario(account) {
  if (state.activeMfaScenario === "off") {
    return false;
  }
  if (state.activeMfaScenario === "required") {
    return true;
  }
  return account.mfa_enabled;
}

function getMfaScenarioStats(crackedAccounts) {
  const blocked = crackedAccounts.filter((account) => getMfaEnabledForScenario(account)).length;
  return {
    cracked: crackedAccounts.length,
    takeover: crackedAccounts.length - blocked,
    blocked,
  };
}

function getActiveMfaScenario() {
  return mfaScenarios.find((scenario) => scenario.id === state.activeMfaScenario);
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

function renderClientAssessment() {
  const assessment = state.data.attack_chain_summary.client_assessment;
  return `
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 1</p>
        <h2>Client assessment</h2>
        <p>The client believes the system is safe because users must create complex-looking passwords. This assessment tests that assumption after a database leak.</p>
        <div class="flow-line">
          <div class="flow-item"><span>1</span><div><strong>Password policy</strong><br><span class="small-muted">${assessment.password_policy}</span></div></div>
          <div class="flow-item"><span>2</span><div><strong>Password storage</strong><br><span class="small-muted">${assessment.storage}</span></div></div>
          <div class="flow-item"><span>3</span><div><strong>MFA</strong><br><span class="small-muted">${assessment.mfa}</span></div></div>
          <div class="flow-item"><span>4</span><div><strong>Breached-password check</strong><br><span class="small-muted">${assessment.breached_password_check}</span></div></div>
        </div>
      </div>
      <div class="sub-card">
        <h3>Attack chain used in the project</h3>
        <div class="flow-line">
          <div class="flow-item"><span>A</span><div><strong>User chooses a password</strong><br><span class="small-muted">Policy shapes real user behaviour.</span></div></div>
          <div class="flow-item"><span>B</span><div><strong>Database is leaked</strong><br><span class="small-muted">The attacker gets stored password records.</span></div></div>
          <div class="flow-item"><span>C</span><div><strong>Offline cracking begins</strong><br><span class="small-muted">Storage method controls guessing cost.</span></div></div>
          <div class="flow-item"><span>D</span><div><strong>Login is attempted</strong><br><span class="small-muted">MFA changes whether cracked passwords become account takeover.</span></div></div>
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
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 2</p>
        <h2>Password types</h2>
        <p>This stage compares password forms so the client can see why "looks complex" and "hard to guess" are different ideas.</p>
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
      <div class="sub-card">
        <h3>Password form comparison</h3>
        <div class="password-type-grid">${typeCards}</div>
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
          <td>${record.mfa_enabled ? "On" : "Off"}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 3</p>
        <h2>Database leak</h2>
        <p>The same fake passwords are stored four different ways. The leaked value changes what the attacker can do next.</p>
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
              <th>MFA</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;
}

function renderCracking() {
  const maxCracked = Math.max(...state.data.storage_results.map((result) => result.total_accounts));
  const bars = state.data.storage_results
    .map((result) => {
      const width = Math.max(4, (result.cracked_accounts / maxCracked) * 100);
      const fillClass = result.method === "plaintext" || result.method === "sha256" ? "" : result.method === "bcrypt" ? " medium" : " secure";
      return `
        <div class="bar-row">
          <strong>${result.label}</strong>
          <div class="bar-track" aria-label="${result.label} cracked ${result.cracked_accounts} of ${result.total_accounts}">
            <div class="bar-fill${fillClass}" style="width:${width}%"></div>
          </div>
          <span class="bar-value">${result.cracked_accounts}/${result.total_accounts}</span>
        </div>
      `;
    })
    .join("");

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
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 4</p>
        <h2>Offline cracking</h2>
        <p>Each method gets the same users, same wordlist, and the same ${state.data.experiment_context.attack_budget_seconds_per_method}-second attack budget.</p>
        <div class="sub-card">
          <h3>Accounts cracked within budget</h3>
          <div class="bar-list">${bars}</div>
        </div>
      </div>
      <div class="sub-card">
        <h3>Cost indicators</h3>
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
    </div>
  `;
}

function renderLoginRisk() {
  const selected = getStorageResult();
  const scenario = getActiveMfaScenario();
  const stats = getMfaScenarioStats(selected.cracked);
  return `
    <div>
      <p class="eyebrow">Step 5</p>
      <h2>Login risk after cracking</h2>
      <p>Hashing affects whether the attacker obtains passwords. MFA affects whether cracked passwords become account takeover.</p>
      <div class="simulation-rule">
        <strong>Simulation rule:</strong> cracked password + MFA off = account takeover; cracked password + MFA on = blocked or challenged.
      </div>
      ${methodButtons()}
      <div class="scenario-panel">
        <div>
          <h3>MFA scenario</h3>
          <p class="small-muted">${scenario.description}</p>
        </div>
        ${mfaScenarioButtons()}
      </div>
      <div class="pipeline">
        <div class="pipeline-step">
          <span class="table-label">Cracked passwords</span>
          <strong>${stats.cracked}</strong>
          <small class="small-muted">known passwords from offline attack</small>
        </div>
        <div class="pipeline-step">
          <span class="table-label">Account takeovers</span>
          <strong>${stats.takeover}</strong>
          <small class="small-muted">password was enough to log in</small>
        </div>
        <div class="pipeline-step">
          <span class="table-label">MFA blocked/challenged</span>
          <strong>${stats.blocked}</strong>
          <small class="small-muted">extra factor prevented direct takeover</small>
        </div>
      </div>
      <div class="sub-card" style="margin-top: 14px;">
        <h3>Login attempts under ${selected.label}</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Password found</th>
              <th>MFA in scenario</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            ${selected.cracked
              .map((account) => {
                const mfaEnabled = getMfaEnabledForScenario(account);
                return `
                  <tr>
                    <td>${escapeHtml(account.username)}</td>
                    <td><code>${escapeHtml(account.password)}</code></td>
                    <td>${mfaEnabled ? "On" : "Off"}</td>
                    <td>${mfaEnabled ? "Blocked or challenged" : "Account takeover"}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderFinalAssessment() {
  return `
    <div class="view-grid">
      <div>
        <p class="eyebrow">Step 6</p>
        <h2>Final assessment</h2>
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
