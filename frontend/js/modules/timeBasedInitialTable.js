
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

        <table border="1" cellpadding="8" cellspacing="0"
               style="width:100%; border-collapse:collapse; text-align:center;">
          
          <thead style="background-color:#f2f2f2;">
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

      console.log("Start Date:", startDate);
      console.log("End Date:", endDate);

      // Later you can call backend here
      // fetch(`/api/time-summary?start=${startDate}&end=${endDate}`)
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
}

customElements.define("time-based-initial-table", TimeBasedInitialTable);