const state = {
  data: null,
  activeView: "overview",
  activeMethod: "sha256",
  attackWindow: 2,
  isRunning: false,
  runTimer: null,
};

const methodOrder = ["plaintext", "sha256", "bcrypt", "argon2id"];
const attackWindows = [0.25, 1, 2, 5, 10];

const legacyViews = {
  assessment: "overview",
  choices: "passwords",
  leak: "setup",
  cracking: "results",
  final: "findings",
};

const stages = [
  {
    id: "overview",
    kicker: "Cost model",
    title: "How much can an offline attacker recover within a fixed budget?",
    takeaway: "coverage x rank x cost x budget",
  },
  {
    id: "passwords",
    kicker: "Password set",
    title: "Password types shape wordlist coverage and guess order",
    takeaway: "patterns, policies, priorities",
  },
  {
    id: "setup",
    kicker: "Attack budget",
    title: "Choose the storage method and attacker time budget",
    takeaway: "same list, same budget",
  },
  {
    id: "results",
    kicker: "Attack results",
    title: "Higher verification cost reduces recovered passwords",
    takeaway: "recovered accounts by storage method",
  },
  {
    id: "findings",
    kicker: "Final assessment",
    title: "The security goal is to raise offline attack cost",
    takeaway: "block cheap guesses; slow the rest",
  },
];

const recommendationItems = [
  {
    evidence: "Predictable passwords appear early in the wordlist",
    action: "Use blocklists and long-password-friendly rules",
  },
  {
    evidence: "Plaintext has zero cracking cost",
    action: "Never store recoverable passwords",
  },
  {
    evidence: "SHA-256 makes each guess extremely cheap",
    action: "Do not use fast general-purpose hashes for passwords",
  },
  {
    evidence: "bcrypt and Argon2id spend the attack budget",
    action: "Tune adaptive password hashing cost deliberately",
  },
];

function qs(selector) {
  return document.querySelector(selector);
}

function formatNumber(value, decimals = 2) {
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: decimals });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

function getHashView() {
  const hashView = window.location.hash.replace("#", "");
  const mappedView = legacyViews[hashView] || hashView;
  return stages.some((stage) => stage.id === mappedView) ? mappedView : "overview";
}

async function loadData() {
  qs("#view-panel").innerHTML = '<div class="empty-state">Loading experiment data</div>';

  try {
    const response = await fetch("../results/analysis_results.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    state.data = await response.json();
    state.attackWindow = state.data.experiment_context.attack_budget_seconds_per_method;
    setActiveView(getHashView(), { updateHash: false });
  } catch (error) {
    qs("#view-panel").innerHTML = `
      <div class="empty-state error">
        <h2>Dashboard data unavailable</h2>
        <p>Run <code>python scripts/generate_results.py</code> and serve the project root.</p>
      </div>
    `;
  }
}

function setActiveView(view, options = { updateHash: true }) {
  state.activeView = view;
  if (options.updateHash && window.location.hash !== `#${view}`) {
    window.history.replaceState(null, "", `#${view}`);
  }

  const activeIndex = stages.findIndex((stage) => stage.id === view);
  document.querySelectorAll(".stage-tab").forEach((button) => {
    const index = stages.findIndex((stage) => stage.id === button.dataset.view);
    button.classList.toggle("is-active", button.dataset.view === view);
    button.classList.toggle("is-complete", index < activeIndex);
  });

  updateHeader();
  renderActiveView();
}

function updateHeader() {
  const stage = getStage();
  qs("#stage-kicker").textContent = state.isRunning ? `Running demo: ${stage.kicker}` : stage.kicker;
  qs("#stage-title").textContent = stage.title;
  qs("#stage-takeaway").textContent = stage.takeaway;

  if (!state.data) {
    return;
  }

  const sha = estimateAttack("sha256", state.attackWindow);
  const argon = estimateAttack("argon2id", state.attackWindow);
  const total = state.data.experiment_context.user_count;
  qs("#metric-window").textContent = `${state.attackWindow}s`;
  qs("#metric-samples").textContent = total;
  qs("#metric-sha").textContent = `${sha.crackedCount}/${total}`;
  qs("#metric-argon").textContent = `${argon.crackedCount}/${total}`;
}

function renderActiveView() {
  if (!state.data) {
    return;
  }

  const renderers = {
    overview: renderOverview,
    passwords: renderPasswords,
    setup: renderSetup,
    results: renderResults,
    findings: renderFindings,
  };

  qs("#view-panel").innerHTML = renderers[state.activeView]();
  bindDynamicEvents();
}

function bindDynamicEvents() {
  document.querySelectorAll("[data-method]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeMethod = button.dataset.method;
      updateHeader();
      renderActiveView();
    });
  });

  document.querySelectorAll("[data-window]").forEach((button) => {
    button.addEventListener("click", () => {
      state.attackWindow = Number(button.dataset.window);
      updateHeader();
      renderActiveView();
    });
  });
}

function resetSimulation() {
  if (state.runTimer) {
    window.clearTimeout(state.runTimer);
  }
  state.isRunning = false;
  state.runTimer = null;
  qs("#run-chain").disabled = false;
  qs("#run-chain").textContent = "Run demo";
  setActiveView("overview");
}

function startSimulation() {
  if (!state.data || state.isRunning) {
    return;
  }

  state.isRunning = true;
  qs("#run-chain").disabled = true;
  qs("#run-chain").textContent = "Running";

  let index = 0;
  const advance = () => {
    setActiveView(stages[index].id);
    index += 1;

    if (index < stages.length) {
      state.runTimer = window.setTimeout(advance, 1250);
      return;
    }

    state.runTimer = window.setTimeout(() => {
      state.isRunning = false;
      qs("#run-chain").disabled = false;
      qs("#run-chain").textContent = "Run again";
      updateHeader();
    }, 1250);
  };

  advance();
}

function methodClass(method) {
  if (method === "plaintext") {
    return "exposed";
  }
  if (method === "sha256") {
    return "danger";
  }
  if (method === "bcrypt") {
    return "medium";
  }
  return "safe";
}

function outcomeMode(method) {
  if (method === "plaintext") {
    return "direct exposure";
  }
  return "wordlist cracking";
}

function riskClass(label) {
  if (label === "strong_passphrase") {
    return "safe";
  }
  if (label === "predictable_pattern") {
    return "medium";
  }
  return "danger";
}

function riskLabel(label) {
  if (label === "strong_passphrase") {
    return "Long phrase";
  }
  if (label === "predictable_pattern") {
    return "Pattern";
  }
  return "Common";
}

function getAttemptMap() {
  const sha256 = getStorageResult("sha256");
  return new Map(sha256.cracked.map((account) => [account.username, account.attempts_for_user]));
}

function estimateAttack(method, attackWindow) {
  const result = getStorageResult(method);
  const total = state.data.experiment_context.user_count;

  if (method === "plaintext") {
    return {
      method,
      label: result.label,
      crackedCount: total,
      exposedCount: total,
      crackedRate: 1,
      details: state.data.users.map((user) => ({
        ...user,
        outcome: "exposed",
        seconds: 0,
      })),
    };
  }

  const attemptsByUser = getAttemptMap();
  const secondsPerGuess = 1 / result.guesses_per_second;
  let elapsed = 0;
  let stopped = false;
  const details = state.data.users.map((user) => {
    if (stopped) {
      return { ...user, outcome: "not found", seconds: null };
    }

    const attempts = attemptsByUser.get(user.username) || state.data.experiment_context.wordlist_size;
    const startOfMatchingGuess = elapsed + Math.max(0, attempts - 1) * secondsPerGuess;
    const finishTime = elapsed + attempts * secondsPerGuess;

    if (startOfMatchingGuess <= attackWindow) {
      elapsed = finishTime;
      return { ...user, outcome: "cracked", seconds: finishTime };
    }

    stopped = true;
    return { ...user, outcome: "not found", seconds: null };
  });

  const crackedCount = details.filter((user) => user.outcome === "cracked").length;
  return {
    method,
    label: result.label,
    crackedCount,
    exposedCount: 0,
    crackedRate: crackedCount / total,
    details,
  };
}

function windowButtons() {
  return `
    <div class="segmented-control" aria-label="Attack budget">
      ${attackWindows
        .map((seconds) => {
          const active = seconds === state.attackWindow ? " is-active" : "";
          const measured = seconds === state.data.experiment_context.attack_budget_seconds_per_method ? " measured" : "";
          return `<button class="${active}${measured}" type="button" data-window="${seconds}">${seconds}s</button>`;
        })
        .join("")}
    </div>
  `;
}

function methodButtons() {
  return `
    <div class="method-picker" aria-label="Storage method">
      ${methodOrder
        .map((method) => {
          const result = getStorageResult(method);
          const active = method === state.activeMethod ? " is-active" : "";
          return `<button class="${methodClass(method)}${active}" type="button" data-method="${method}">${result.label}</button>`;
        })
        .join("")}
    </div>
  `;
}

function renderOverview() {
  const context = state.data.experiment_context;
  const argon = estimateAttack("argon2id", state.attackWindow);
  const sha = estimateAttack("sha256", state.attackWindow);
  const ratio = Math.round(getStorageResult("sha256").guesses_per_second / getStorageResult("argon2id").guesses_per_second);

  return `
    <div class="showcase-grid">
      <section class="visual-card lead-card">
        <div class="attack-map" aria-label="Password leak attack chain">
          <div><span>1</span><strong>Password guessability</strong></div>
          <div><span>2</span><strong>Leaked records</strong></div>
          <div><span>3</span><strong>Cost per guess</strong></div>
          <div><span>4</span><strong>Budget result</strong></div>
        </div>
      </section>

      <section class="result-card">
        <span>Same attack budget</span>
        <strong>${sha.crackedCount}/${context.user_count} vs ${argon.crackedCount}/${context.user_count}</strong>
        <small>SHA-256 cracked vs Argon2id cracked at ${state.attackWindow}s</small>
      </section>

      <section class="result-card">
        <span>Speed gap</span>
        <strong>${formatNumber(ratio, 0)}x</strong>
        <small>more guesses per second for SHA-256 in this run</small>
      </section>
    </div>
  `;
}

function renderPasswords() {
  const composition = getPolicyResult("composition");
  const layered = getPolicyResult("layered");
  const samples = state.data.users.slice(0, 8);

  return `
    <section class="two-column wide-right">
      <div class="chart-card">
        <div class="section-head">
          <h3>Balanced password set</h3>
          <span>${state.data.users.length} samples</span>
        </div>
        ${renderDecisionBalance()}
        <div class="password-gallery">
          ${samples
            .map(
              (user) => `
                <article class="password-tile ${riskClass(user.risk_label)}">
                  <span>${riskLabel(user.risk_label)}</span>
                  <code>${escapeHtml(user.password)}</code>
                  <strong>${escapeHtml(user.profile)}</strong>
                </article>
              `,
            )
            .join("")}
        </div>
      </div>

      <div class="chart-card decision-matrix-card">
        <div class="section-head">
          <h3>Decision matrix</h3>
          <span>Complexity vs layered</span>
        </div>
        ${renderPolicyMatrix()}
      </div>
    </section>

    <section class="chart-card policy-effect-card">
      <div class="section-head">
        <h3>Policy effect</h3>
        <span>weak rejected / strong accepted</span>
      </div>
      ${renderPolicyComparison(composition, layered)}
    </section>
  `;
}

function decisionForUser(user) {
  const complexity = getPolicyResult("composition").decisions.find((decision) => decision.username === user.username);
  const layered = getPolicyResult("layered").decisions.find((decision) => decision.username === user.username);

  if (complexity.accepted && layered.accepted) {
    return { key: "bothAccept", label: "Both accept", className: "safe" };
  }
  if (complexity.accepted && !layered.accepted) {
    return { key: "complexityOnly", label: "Complexity only", className: "danger" };
  }
  if (!complexity.accepted && layered.accepted) {
    return { key: "layeredOnly", label: "Layered only", className: "medium" };
  }
  return { key: "bothReject", label: "Both reject", className: "neutral" };
}

function renderDecisionBalance() {
  const groups = [
    ["bothAccept", "Both accept", "C accept / L accept", "safe"],
    ["complexityOnly", "Complexity only", "C accept / L reject", "danger"],
    ["layeredOnly", "Layered only", "C reject / L accept", "medium"],
    ["bothReject", "Both reject", "C reject / L reject", "neutral"],
  ];
  const counts = state.data.users.reduce((accumulator, user) => {
    const decision = decisionForUser(user);
    accumulator[decision.key] = (accumulator[decision.key] || 0) + 1;
    return accumulator;
  }, {});

  return `
    <div class="decision-balance">
      ${groups
        .map(
          ([key, label, caption, className]) => `
            <article class="${className}">
              <span>${label}</span>
              <strong>${counts[key] || 0}</strong>
              <small>${caption}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPolicyComparison(composition, layered) {
  const cards = [
    ["Complexity", "Weak rejected", composition.weak_password_rejection_rate, "medium"],
    ["Layered", "Weak rejected", layered.weak_password_rejection_rate, "safe"],
    ["Complexity", "Strong accepted", composition.strong_password_acceptance_rate, "medium"],
    ["Layered", "Strong accepted", layered.strong_password_acceptance_rate, "safe"],
  ];

  return `
    <div class="policy-score-grid">
      ${cards
        .map(
          ([policy, label, value, className]) => `
            <article>
              <span>${policy}</span>
              <strong>${Math.round(value * 100)}%</strong>
              <div class="bar-track"><div class="bar-fill ${className}" style="width:${value * 100}%"></div></div>
              <small>${label}</small>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderPolicyMatrix() {
  const policies = ["composition", "layered"];
  const lookup = new Map(
    policies.map((policy) => [
      policy,
      new Map(getPolicyResult(policy).decisions.map((decision) => [decision.username, decision])),
    ]),
  );

  return `
    <div class="decision-tile-grid">
      ${state.data.users
        .map((user) => {
          const decision = decisionForUser(user);
          const cells = policies
            .map((policy) => {
              const accepted = lookup.get(policy).get(user.username).accepted;
              return `<span class="verdict mini ${accepted ? "accept" : "reject"}">${policy === "composition" ? "C" : "L"}: ${accepted ? "accept" : "reject"}</span>`;
            })
            .join("");
          return `
            <article class="decision-tile ${decision.className}">
              <div class="decision-title">
                <strong>${escapeHtml(user.username)}</strong>
                <span>${decision.label}</span>
              </div>
              <code>${escapeHtml(user.password)}</code>
              <div class="decision-pair">${cells}</div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderSetup() {
  const selected = getStorageResult();
  const estimate = estimateAttack(state.activeMethod, state.attackWindow);
  const preview = state.data.leaked_record_previews[state.activeMethod];
  const projectionLabel =
    state.attackWindow === state.data.experiment_context.attack_budget_seconds_per_method ? "measured window" : "projected window";

  return `
    <section class="control-surface">
      <div>
        <span class="control-label">Attack budget</span>
        ${windowButtons()}
      </div>
      <div>
        <span class="control-label">Storage method</span>
        ${methodButtons()}
      </div>
    </section>

    <section class="three-column">
      <article class="result-card tall ${methodClass(state.activeMethod)}">
        <span>${projectionLabel}</span>
        <strong>${estimate.crackedCount}/${state.data.experiment_context.user_count}</strong>
        <small>${selected.label} recovered or exposed within ${state.attackWindow}s</small>
      </article>

      <article class="chart-card leak-preview">
        <div class="section-head">
          <h3>Leaked view</h3>
          <span>${selected.label}</span>
        </div>
        ${preview
          .map(
            (record) => `
              <div class="leak-row">
                <strong>${escapeHtml(record.username)}</strong>
                <code>${escapeHtml(record.leaked_value)}</code>
              </div>
            `,
          )
          .join("")}
      </article>

      <article class="chart-card compact">
        <h3>Cost signal</h3>
        <div class="vertical-flow">
          <span>${selected.guesses_per_second === null ? "direct exposure" : `${formatNumber(selected.guesses_per_second)} guesses/sec`}</span>
          <span>${formatNumber(selected.average_verify_ms)} ms / verify</span>
          <span>${selected.budget_exhausted ? "budget exhausted" : "budget available"}</span>
        </div>
      </article>
    </section>
  `;
}

function renderResults() {
  const selected = estimateAttack(state.activeMethod, state.attackWindow);
  const plaintext = estimateAttack("plaintext", state.attackWindow);
  const sha = estimateAttack("sha256", state.attackWindow);
  const argon = estimateAttack("argon2id", state.attackWindow);
  const total = state.data.experiment_context.user_count;
  const note =
    state.attackWindow === state.data.experiment_context.attack_budget_seconds_per_method
      ? "measured 2-second budget"
      : "projection from measured verification speed";

  return `
    <section class="results-hero">
      <div>
        <span>direct exposure</span>
        <strong>${plaintext.crackedCount}/${total} Plain text</strong>
      </div>
      <div>
        <span>${note}</span>
        <strong>${sha.crackedCount}/${total} SHA-256</strong>
      </div>
      <div>
        <span>adaptive hash result</span>
        <strong>${argon.crackedCount}/${total} Argon2id</strong>
      </div>
    </section>

    <section class="two-column">
      <div class="chart-card">
        <div class="section-head">
          <h3>Exposure vs cracking</h3>
          <span>selected: ${escapeHtml(selected.label)}</span>
        </div>
        ${renderCrackBars()}
      </div>
      <div class="chart-card">
        <div class="section-head">
          <h3>Guessing speed</h3>
          <span>log scale</span>
        </div>
        ${renderSpeedBars()}
      </div>
    </section>

    <section class="two-column wide-left">
      <div class="chart-card">
        <div class="section-head">
          <h3>Account outcome grid</h3>
          <span>exposed / cracked / not found</span>
        </div>
        ${renderOutcomeGrid()}
      </div>
      <div class="chart-card">
        <div class="section-head">
          <h3>${escapeHtml(selected.label)} details</h3>
          <span>${selected.crackedCount}/${total}</span>
        </div>
        ${renderRecoveredList(selected)}
      </div>
    </section>
  `;
}

function renderCrackBars() {
  const total = state.data.experiment_context.user_count;
  return methodOrder
    .map((method) => {
      const estimate = estimateAttack(method, state.attackWindow);
      const width = Math.max(3, (estimate.crackedCount / total) * 100);
      const active = method === state.activeMethod ? " is-active" : "";
      return `
        <button class="bar-row${active}" type="button" data-method="${method}">
          <span class="method-label">
            <strong>${escapeHtml(estimate.label)}</strong>
            <small>${outcomeMode(method)}</small>
          </span>
          <div class="bar-track"><div class="bar-fill ${methodClass(method)}" style="width:${width}%"></div></div>
          <b>${estimate.crackedCount}/${total}</b>
        </button>
      `;
    })
    .join("");
}

function renderSpeedBars() {
  const speeds = state.data.storage_results.filter((result) => result.guesses_per_second !== null);
  const maxLog = Math.max(...speeds.map((result) => Math.log10(result.guesses_per_second + 1)));

  return state.data.storage_results
    .map((result) => {
      const direct = result.guesses_per_second === null;
      const width = direct ? 0 : Math.max(4, (Math.log10(result.guesses_per_second + 1) / maxLog) * 100);
      const value = direct ? "no guessing" : `${formatNumber(result.guesses_per_second)} / sec`;
      return `
        <div class="speed-row${direct ? " no-speed" : ""}">
          <span class="method-label">
            <strong>${escapeHtml(result.label)}</strong>
            <small>${direct ? "already exposed" : "verify guesses"}</small>
          </span>
          <div class="bar-track"><div class="bar-fill ${methodClass(result.method)}" style="width:${width}%"></div></div>
          <b>${value}</b>
        </div>
      `;
    })
    .join("");
}

function renderOutcomeGrid() {
  const estimates = new Map(methodOrder.map((method) => [method, estimateAttack(method, state.attackWindow)]));
  return `
    <div class="outcome-grid">
      <span class="matrix-head">Account</span>
      ${methodOrder.map((method) => `<span class="matrix-head">${escapeHtml(getStorageResult(method).label)}</span>`).join("")}
      ${state.data.users
        .map((user) => {
          const cells = methodOrder
            .map((method) => {
              const detail = estimates.get(method).details.find((item) => item.username === user.username);
              return `<span class="outcome ${detail.outcome}">${detail.outcome === "not found" ? "safe" : detail.outcome}</span>`;
            })
            .join("");
          return `<strong>${escapeHtml(user.username)}</strong>${cells}`;
        })
        .join("")}
    </div>
  `;
}

function renderRecoveredList(estimate) {
  const visible = estimate.details.filter((detail) => detail.outcome !== "not found");
  if (!visible.length) {
    return '<div class="empty-state small">No passwords recovered in this window.</div>';
  }

  return `
    <div class="recovered-list">
      ${visible
        .map(
          (detail) => `
            <div>
              <strong>${escapeHtml(detail.username)}</strong>
              <span>${escapeHtml(detail.profile)}</span>
              <code>${detail.seconds === 0 ? "instant" : `${formatNumber(detail.seconds, 2)}s`}</code>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderFindings() {
  return `
    <section class="chart-card">
      <div class="section-head">
        <h3>Evidence to recommendation</h3>
        <span>measured path only</span>
      </div>
      <div class="recommendation-map">
        ${recommendationItems
          .map(
            (item) => `
              <article>
                <span>Evidence</span>
                <strong>${escapeHtml(item.evidence)}</strong>
                <b>${escapeHtml(item.action)}</b>
              </article>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="final-strip">
      <strong>Core point</strong>
      <span>Block cheap guesses; make remaining guesses expensive.</span>
    </section>
  `;
}

document.querySelectorAll(".stage-tab").forEach((button) => {
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
