class InitialTable extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <h2>Data From launch Date to till now </h2>

        <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>COP Observation Count</th>
              <th>L0 Completed Observation Count</th>
              <th>DPGS Completed Observation Count</th>
              <th>Failed Observation Count At L0</th>
              <th>Failed Observation Count At DPGS</th>
              <th>% Of DPGS Success</th>
            </tr>
          </thead>

          <tbody>
            <tr id="initialTableValues">
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
              <td>-</td>
            </tr>
          </tbody>

        </table>
        </div>
        <p id="status" class="muted" style="margin-top:10px;"></p>
      </div>
    `;

    // Auto-load launch->today (landing requirement)
    this.load();
  }

  updateValues(data) {
    const row = this.querySelector("#initialTableValues");

    row.innerHTML = `
      <td>${data.cop_count}</td>
      <td>${data.l0_completed}</td>
      <td>${data.dpgs_completed}</td>
      <td>${data.failed_l0}</td>
      <td>${data.failed_dpgs}</td>
      <td>${data.dpgs_success_percent}%</td>
    `;
  }

  async load() {
    const status = this.querySelector("#status");
    if (status) status.textContent = "Loading...";

    // Matches planned analytics endpoint used by analytics-dashboard.
    // Default launch date can be adjusted later.
    const launchDate = "2026-01-01";
    const today = new Date().toISOString().slice(0, 10);
    const url = `/api/analytics/summary?start=${encodeURIComponent(
      launchDate
    )}&end=${encodeURIComponent(today)}`;

    try {
      const { fetchJsonCached } = await import("./httpCache.js");
      const result = await fetchJsonCached(url, { ttlMs: 5 * 60_000 });
      if (result && result.__available === false) {
        if (status) status.textContent = "API not available yet.";
        return;
      }
      this.updateValues(result);
      if (status) status.textContent = "";
    } catch (e) {
      console.error(e);
      if (status) status.textContent = "Failed to load.";
    }
  }
}

customElements.define("initial-table", InitialTable);