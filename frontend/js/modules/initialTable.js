class InitialTable extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="container">
        <h2>Data From launch Date to till now </h2>

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

customElements.define("initial-table", InitialTable);