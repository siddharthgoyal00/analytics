import { fetchJsonCached } from "./httpCache.js";
import { renderDataTable } from "./dataTable.js";

function isoToday() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeApiUnavailable(result) {
  return result && result.__available === false;
}

function percent(n, d) {
  if (!d || d === 0) return "0";
  return ((n / d) * 100).toFixed(2);
}

export class AnalyticsDashboard extends HTMLElement {
  connectedCallback() {
    const launchDate = this.getAttribute("data-launch-date") || "2026-01-01";
    const today = isoToday();

    this.innerHTML = `
      <section class="analytics-dashboard">
        <div class="container">
          <h2>Analytical Dashboard (Tables)</h2>
          <p class="muted" style="margin-bottom: 18px;">
            Charts and map will be added later. For now this page focuses on fast, filter-driven tables.
          </p>

          <div class="filters-grid">
            <div class="filter-card">
              <div class="filter-title">Summary (Date Range)</div>
              <div class="filter-row">
                <label>Start</label>
                <input type="date" id="summaryStart" value="${launchDate}">
                <label>End</label>
                <input type="date" id="summaryEnd" value="${today}">
                <button id="summaryApply">Apply</button>
              </div>
              <div id="summaryStatus" class="muted" style="margin-top:8px;"></div>
            </div>

            <div class="filter-card">
              <div class="filter-title">Observation ID</div>
              <div class="filter-row">
                <input type="text" id="obsId" placeholder="Enter Observation ID">
                <button id="obsApply">Load</button>
              </div>
              <div id="obsStatus" class="muted" style="margin-top:8px;"></div>
            </div>

            <div class="filter-card">
              <div class="filter-title">RC_ID</div>
              <div class="filter-row">
                <input type="text" id="rcId" placeholder="Enter RC_ID">
                <button id="rcApply">Load</button>
              </div>
              <div id="rcStatus" class="muted" style="margin-top:8px;"></div>
            </div>

            <div class="filter-card">
              <div class="filter-title">Mode ID</div>
              <div class="filter-row">
                <input type="text" id="modeId" placeholder="Enter Mode ID">
                <button id="modeApply">Load</button>
              </div>
              <div id="modeStatus" class="muted" style="margin-top:8px;"></div>
            </div>
          </div>
        </div>

        <div id="summaryTable"></div>

        <div class="container" style="margin-top:18px;">
          <h2>Details (Filter-driven tables)</h2>
          <p class="muted">
            The backend endpoints for these tables can be added next; the UI is ready now and will show "API not available" until then.
          </p>
        </div>

        <div id="obsDetails"></div>
        <div id="rcDetails"></div>
        <div id="modeDetails"></div>
      </section>
    `;

    this.summaryTableDiv = this.querySelector("#summaryTable");
    this.obsDetailsDiv = this.querySelector("#obsDetails");
    this.rcDetailsDiv = this.querySelector("#rcDetails");
    this.modeDetailsDiv = this.querySelector("#modeDetails");

    this.querySelector("#summaryApply").addEventListener("click", () =>
      this.loadSummary()
    );
    this.querySelector("#obsApply").addEventListener("click", () =>
      this.loadObservation()
    );
    this.querySelector("#rcApply").addEventListener("click", () =>
      this.loadRc()
    );
    this.querySelector("#modeApply").addEventListener("click", () =>
      this.loadMode()
    );

    // Landing page requirement: auto-prefetch and render launch->today summary.
    this.loadSummary({ prefetch: true });
  }

  async loadSummary({ prefetch = false } = {}) {
    const start = this.querySelector("#summaryStart").value;
    const end = this.querySelector("#summaryEnd").value;
    const status = this.querySelector("#summaryStatus");

    if (!start || !end) {
      status.textContent = "Please select both start and end dates.";
      return;
    }

    status.textContent = prefetch ? "Prefetching summary..." : "Loading summary...";

    // Planned backend shape (to be implemented later):
    // GET /api/analytics/summary?start=YYYY-MM-DD&end=YYYY-MM-DD
    // -> { cop_count, l0_completed, dpgs_completed, failed_l0, failed_dpgs }
    const url = `/api/analytics/summary?start=${encodeURIComponent(
      start
    )}&end=${encodeURIComponent(end)}`;

    const result = await fetchJsonCached(url, { ttlMs: 5 * 60_000 });

    if (normalizeApiUnavailable(result)) {
      status.textContent = "API not available yet. Showing placeholder values.";
      renderDataTable({
        container: this.summaryTableDiv,
        title: `Analytics Summary (${start} → ${end})`,
        columns: [
          { key: "cop_count", label: "COP Observation Count" },
          { key: "l0_completed", label: "L0 Completed Observation Count" },
          { key: "dpgs_completed", label: "DPGS Completed Observation Count" },
          { key: "failed_l0", label: "Failed Observation Count At L0" },
          { key: "failed_dpgs", label: "Failed Observation Count At DPGS" },
          { key: "dpgs_success_percent", label: "Percentage % Of DPGS Success" },
        ],
        rows: [
          {
            cop_count: "-",
            l0_completed: "-",
            dpgs_completed: "-",
            failed_l0: "-",
            failed_dpgs: "-",
            dpgs_success_percent: "-",
          },
        ],
      });
      return;
    }

    const dpgsSuccessPercent = percent(
      Number(result.dpgs_completed || 0),
      Number(result.cop_count || 0)
    );

    status.textContent = "Loaded.";
    renderDataTable({
      container: this.summaryTableDiv,
      title: `Analytics Summary (${start} → ${end})`,
      columns: [
        { key: "cop_count", label: "COP Observation Count" },
        { key: "l0_completed", label: "L0 Completed Observation Count" },
        { key: "dpgs_completed", label: "DPGS Completed Observation Count" },
        { key: "failed_l0", label: "Failed Observation Count At L0" },
        { key: "failed_dpgs", label: "Failed Observation Count At DPGS" },
        { key: "dpgs_success_percent", label: "Percentage % Of DPGS Success" },
      ],
      rows: [
        {
          ...result,
          dpgs_success_percent:
            result.dpgs_success_percent ?? dpgsSuccessPercent,
        },
      ],
    });
  }

  async loadObservation() {
    const obsId = this.querySelector("#obsId").value.trim();
    const status = this.querySelector("#obsStatus");
    if (!obsId) {
      status.textContent = "Enter an Observation ID.";
      return;
    }
    status.textContent = "Loading observation details...";

    // Planned backend:
    // GET /api/analytics/observation?observation_id=...
    // -> {
    //   observation: {...},
    //   cop_attributes: [...],
    //   l0_completed: [...],
    //   dpgs_completed: [...],
    //   l0_failed: [...],
    //   dpgs_failed: [...],
    //   patch_stats: [...],
    //   products: [...]
    // }
    const url = `/api/analytics/observation?observation_id=${encodeURIComponent(
      obsId
    )}`;
    const result = await fetchJsonCached(url, { ttlMs: 60_000 });

    if (normalizeApiUnavailable(result)) {
      status.textContent = "API not available yet.";
      this.renderObservationPlaceholders(obsId);
      return;
    }

    status.textContent = "Loaded.";
    this.renderObservationResult(obsId, result);
  }

  renderObservationPlaceholders(obsId) {
    this.obsDetailsDiv.innerHTML = "";

    const header = document.createElement("div");
    header.className = "container";
    header.innerHTML = `<h2>Observation Details: ${obsId}</h2><p class="muted">Backend not wired yet.</p>`;
    this.obsDetailsDiv.appendChild(header);

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "Observation-level Information",
      columns: [
        { key: "DOP", label: "DOP" },
        { key: "DOD", label: "DOD" },
        { key: "RC_ID", label: "RC_ID" },
        { key: "DO", label: "DO" },
        { key: "L0_Status", label: "L0 Status" },
        { key: "Latest_Patch", label: "Latest Patch" },
        { key: "Work_Order_ID", label: "Work order ID" },
        { key: "DP_Status", label: "DP Status" },
      ],
      rows: [],
      emptyMessage: "No data (endpoint pending).",
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "COP Observation Attributes",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "Imaging_Start_Date", label: "Imaging Start Date" },
        { key: "Imaging_Start_Time", label: "Imaging Start Time" },
        { key: "Imaging_End_Time", label: "Imaging End Time" },
        { key: "Sensor", label: "Sensor" },
        { key: "Config_ID", label: "Config ID" },
        { key: "Session_ID", label: "Session ID" },
        { key: "Datatake_ID", label: "Datatake ID" },
        { key: "Extents_GeoJSON", label: "Extents (GeoJSON)" },
        { key: "Level0_Acquired", label: "Level 0 Acquired or not" },
      ],
      rows: [],
      emptyMessage: "No data (endpoint pending).",
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "L0 Completed Observation Attributes",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "RC_ID", label: "RC ID" },
        { key: "Dump_Orbit", label: "Dump Orbit" },
        { key: "Dump_Station", label: "Dump Station" },
      ],
      rows: [],
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "DPGS Completed Observation Attributes",
      columns: [
        { key: "RC_ID", label: "RC ID" },
        { key: "Track", label: "Track" },
        { key: "Frame", label: "Frame" },
        { key: "Work_Order_ID", label: "Work Order ID" },
      ],
      rows: [],
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "L0 Failed Observation Attributes",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "RC_ID", label: "RC ID" },
        { key: "Dump_Orbit", label: "Dump Orbit" },
        { key: "Dump_Station", label: "Dump Station" },
        { key: "Error_Message", label: "Error Message" },
      ],
      rows: [],
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "DPGS Failed Observation Attributes",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "RC_ID", label: "RC ID" },
        { key: "Track", label: "Track" },
        { key: "Frame", label: "Frame" },
        { key: "Work_Order_ID", label: "Work Order ID" },
        { key: "Error_Message", label: "Error Message" },
      ],
      rows: [],
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "Patch Wise Statistics / Patch Regeneration Statistics",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "RC_ID", label: "RC ID" },
        { key: "Cycle_NO", label: "Cycle NO." },
        { key: "Track", label: "Track" },
        { key: "Frame", label: "Frame" },
        { key: "Status", label: "Status" },
      ],
      rows: [],
    });

    renderDataTable({
      container: this.obsDetailsDiv,
      title: "Product",
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "Patch_NO", label: "Patch NO." },
        { key: "Work_Order_ID", label: "Work Order ID" },
        { key: "Track", label: "Track" },
        { key: "Frame", label: "Frame" },
        { key: "Product_IDs", label: "Product ID’s" },
      ],
      rows: [],
    });
  }

  renderObservationResult(obsId, result) {
    // If backend returns arrays keyed as below, these will render immediately.
    // If keys differ, we can easily map them later.
    this.obsDetailsDiv.innerHTML = "";

    const header = document.createElement("div");
    header.className = "container";
    header.innerHTML = `<h2>Observation Details: ${obsId}</h2>`;
    this.obsDetailsDiv.appendChild(header);

    const detailRow = result.observation ? [result.observation] : [];
    renderDataTable({
      container: this.obsDetailsDiv,
      title: "Observation-level Information",
      columns: [
        { key: "DOP", label: "DOP" },
        { key: "DOD", label: "DOD" },
        { key: "RC_ID", label: "RC_ID" },
        { key: "DO", label: "DO" },
        { key: "L0_Status", label: "L0 Status" },
        { key: "Latest_Patch", label: "Latest Patch" },
        { key: "Work_Order_ID", label: "Work order ID" },
        { key: "DP_Status", label: "DP Status" },
      ],
      rows: detailRow,
    });

    // Other tables
    const tableConfigs = [
      {
        key: "cop_attributes",
        title: "COP Observation Attributes",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "Imaging_Start_Date", label: "Imaging Start Date" },
          { key: "Imaging_Start_Time", label: "Imaging Start Time" },
          { key: "Imaging_End_Time", label: "Imaging End Time" },
          { key: "Sensor", label: "Sensor" },
          { key: "Config_ID", label: "Config ID" },
          { key: "Session_ID", label: "Session ID" },
          { key: "Datatake_ID", label: "Datatake ID" },
          { key: "Extents_GeoJSON", label: "Extents (GeoJSON)" },
          { key: "Level0_Acquired", label: "Level 0 Acquired or not" },
        ],
      },
      {
        key: "l0_completed",
        title: "L0 Completed Observation Attributes",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "RC_ID", label: "RC ID" },
          { key: "Dump_Orbit", label: "Dump Orbit" },
          { key: "Dump_Station", label: "Dump Station" },
        ],
      },
      {
        key: "dpgs_completed",
        title: "DPGS Completed Observation Attributes",
        columns: [
          { key: "RC_ID", label: "RC ID" },
          { key: "Track", label: "Track" },
          { key: "Frame", label: "Frame" },
          { key: "Work_Order_ID", label: "Work Order ID" },
        ],
      },
      {
        key: "l0_failed",
        title: "L0 Failed Observation Attributes",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "RC_ID", label: "RC ID" },
          { key: "Dump_Orbit", label: "Dump Orbit" },
          { key: "Dump_Station", label: "Dump Station" },
          { key: "Error_Message", label: "Error Message" },
        ],
      },
      {
        key: "dpgs_failed",
        title: "DPGS Failed Observation Attributes",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "RC_ID", label: "RC ID" },
          { key: "Track", label: "Track" },
          { key: "Frame", label: "Frame" },
          { key: "Work_Order_ID", label: "Work Order ID" },
          { key: "Error_Message", label: "Error Message" },
        ],
      },
      {
        key: "patch_stats",
        title: "Patch Wise Statistics / Patch Regeneration Statistics",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "RC_ID", label: "RC ID" },
          { key: "Cycle_NO", label: "Cycle NO." },
          { key: "Track", label: "Track" },
          { key: "Frame", label: "Frame" },
          { key: "Status", label: "Status" },
        ],
      },
      {
        key: "products",
        title: "Product",
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "Patch_NO", label: "Patch NO." },
          { key: "Work_Order_ID", label: "Work Order ID" },
          { key: "Track", label: "Track" },
          { key: "Frame", label: "Frame" },
          { key: "Product_IDs", label: "Product ID’s" },
        ],
      },
    ];

    tableConfigs.forEach((cfg) => {
      renderDataTable({
        container: this.obsDetailsDiv,
        title: cfg.title,
        columns: cfg.columns,
        rows: Array.isArray(result?.[cfg.key]) ? result[cfg.key] : [],
        emptyMessage: "No rows.",
      });
    });
  }

  async loadRc() {
    const rcId = this.querySelector("#rcId").value.trim();
    const status = this.querySelector("#rcStatus");
    if (!rcId) {
      status.textContent = "Enter an RC_ID.";
      return;
    }
    status.textContent = "Loading RC_ID table...";

    // Planned backend:
    // GET /api/analytics/rc?rc_id=... -> [{ Observation_ID, DOP, DO, ... }]
    const url = `/api/analytics/rc?rc_id=${encodeURIComponent(rcId)}`;
    const result = await fetchJsonCached(url, { ttlMs: 60_000 });

    if (normalizeApiUnavailable(result)) {
      status.textContent = "API not available yet.";
      renderDataTable({
        container: this.rcDetailsDiv,
        title: `RC_ID: ${rcId} (Associated Observations)`,
        columns: [
          { key: "Observation_ID", label: "Observation ID" },
          { key: "DOP", label: "DOP" },
          { key: "DO", label: "DO" },
        ],
        rows: [],
        emptyMessage: "No data (endpoint pending).",
      });
      return;
    }

    status.textContent = "Loaded.";
    renderDataTable({
      container: this.rcDetailsDiv,
      title: `RC_ID: ${rcId} (Associated Observations)`,
      columns: [
        { key: "Observation_ID", label: "Observation ID" },
        { key: "DOP", label: "DOP" },
        { key: "DO", label: "DO" },
      ],
      rows: Array.isArray(result?.data) ? result.data : Array.isArray(result) ? result : [],
    });
  }

  async loadMode() {
    const modeId = this.querySelector("#modeId").value.trim();
    const status = this.querySelector("#modeStatus");
    if (!modeId) {
      status.textContent = "Enter a Mode ID.";
      return;
    }
    status.textContent = "Loading Mode bounds...";

    // Planned backend:
    // GET /api/analytics/mode?mode_id=... -> { top_left_lon, top_left_lat, ... }
    const url = `/api/analytics/mode?mode_id=${encodeURIComponent(modeId)}`;
    const result = await fetchJsonCached(url, { ttlMs: 5 * 60_000 });

    if (normalizeApiUnavailable(result)) {
      status.textContent = "API not available yet.";
      renderDataTable({
        container: this.modeDetailsDiv,
        title: `Mode ID: ${modeId} (Boundary Coordinates)`,
        columns: [
          { key: "Top_Left_Longitude", label: "Top left Longitude" },
          { key: "Top_Left_Latitude", label: "Top Left Latitude" },
          { key: "Top_Right_Longitude", label: "Top Right Longitude" },
          { key: "Top_Right_Latitude", label: "Top Right Latitude" },
          { key: "Bottom_Left_Longitude", label: "Bottom left Longitude" },
          { key: "Bottom_Left_Latitude", label: "Bottom Left Latitude" },
          { key: "Bottom_Right_Longitude", label: "Bottom Right Longitude" },
          { key: "Bottom_Right_Latitude", label: "Bottom Right Latitude" },
        ],
        rows: [],
        emptyMessage: "No data (endpoint pending).",
      });
      return;
    }

    status.textContent = "Loaded.";
    const rows = Array.isArray(result?.data)
      ? result.data
      : result
      ? [result]
      : [];
    renderDataTable({
      container: this.modeDetailsDiv,
      title: `Mode ID: ${modeId} (Boundary Coordinates)`,
      columns: [
        { key: "Top_Left_Longitude", label: "Top left Longitude" },
        { key: "Top_Left_Latitude", label: "Top Left Latitude" },
        { key: "Top_Right_Longitude", label: "Top Right Longitude" },
        { key: "Top_Right_Latitude", label: "Top Right Latitude" },
        { key: "Bottom_Left_Longitude", label: "Bottom left Longitude" },
        { key: "Bottom_Left_Latitude", label: "Bottom Left Latitude" },
        { key: "Bottom_Right_Longitude", label: "Bottom Right Longitude" },
        { key: "Bottom_Right_Latitude", label: "Bottom Right Latitude" },
      ],
      rows,
    });
  }
}

customElements.define("analytics-dashboard", AnalyticsDashboard);

