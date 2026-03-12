
class TimeBasedInitialTable extends HTMLElement {

  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <h2>Filter Based On Date</h2>

        <div style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:16px; align-items:center;">
          <label>Start Date:</label>
          <input type="date" id="startDate">

          <label>End Date:</label>
          <input type="date" id="endDate">

          <button id="searchBtn">Search</button>
        </div>
        <p id="status" class="muted" style="margin:0 0 10px 0;"></p>

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
      </div>
    `;

    this.setupEvents();
  }

  setupEvents() {
    const searchBtn = this.querySelector("#searchBtn");

    searchBtn.addEventListener("click", () => {
      const startDate = this.querySelector("#startDate").value;
      const endDate = this.querySelector("#endDate").value;

      if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
      }

      this.load(startDate, endDate);
    });
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

  async load(startDate, endDate) {
    const status = this.querySelector("#status");
    if (status) status.textContent = "Loading...";

    const url = `/api/analytics/summary?start=${encodeURIComponent(
      startDate
    )}&end=${encodeURIComponent(endDate)}`;

    try {
      const { fetchJsonCached } = await import("./httpCache.js");
      const result = await fetchJsonCached(url, { ttlMs: 2 * 60_000 });
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

customElements.define("time-based-initial-table", TimeBasedInitialTable);