import { buildUrl, fetchJson } from "./modules/search.js";
import "./modules/initialTable.js";
import "./modules/timeBasedInitialTable.js"
import "./modules/analyticsDashboard.js";
import {
  showError,
  showLoading,
  renderResults,
  renderMultipleSessionTimelines,
  showObservationDetails as renderObservationDetails,
} from "./modules/render.js";

// Sidebar removed

// Lightweight controller for Failed Observation dropdown and views
document.addEventListener("DOMContentLoaded", () => {
  const dropdownToggle = document.getElementById("failedDropdownToggle");
  const dropdownMenu = document.getElementById("failedDropdownMenu");
  const l0View = document.getElementById("failed-l0-view");
  const dpgsView = document.getElementById("failed-dpgs-view");

  if (!dropdownToggle || !dropdownMenu || !l0View || !dpgsView) return;

  const closeMenu = () => {
    dropdownMenu.style.display = "none";
  };

  dropdownToggle.addEventListener("click", () => {
    const visible = dropdownMenu.style.display === "block";
    dropdownMenu.style.display = visible ? "none" : "block";
  });

  document.addEventListener("click", (e) => {
    if (!dropdownMenu.contains(e.target) && e.target !== dropdownToggle) {
      closeMenu();
    }
  });

  const renderTable = (container, title, columns, rows) => {
    container.innerHTML = "";
    const outer = document.createElement("div");
    outer.className = "container";

    const h = document.createElement("h2");
    h.textContent = title;
    outer.appendChild(h);

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";

    const table = document.createElement("table");
    table.className = "data-table";

    const thead = document.createElement("thead");
    const hr = document.createElement("tr");
    columns.forEach((c) => {
      const th = document.createElement("th");
      th.textContent = c.label;
      hr.appendChild(th);
    });
    thead.appendChild(hr);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");
    if (!rows.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = columns.length;
      td.textContent = "No failures found.";
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      rows.forEach((r) => {
        const tr = document.createElement("tr");
        columns.forEach((c) => {
          const td = document.createElement("td");
          const v = r[c.key];
          td.textContent =
            v === null || v === undefined || v === "" ? "-" : String(v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }
    table.appendChild(tbody);
    wrap.appendChild(table);
    outer.appendChild(wrap);

    container.appendChild(outer);
    container.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const loadL0Failed = async () => {
    l0View.innerHTML = "<div class='container'><p class='loading'>Loading L0 failures...</p></div>";
    try {
      const res = await fetch("/api/failures/l0");
      const json = await res.json();
      const rows = json.data || [];
      renderTable(
        l0View,
        "L0 Failed Observation Attributes",
        [
          { key: "observation_id", label: "Observation ID" },
          { key: "rc_id", label: "RC ID" },
          { key: "dump_orbit", label: "Dump Orbit" },
          { key: "dump_station", label: "Dump Station" },
          { key: "error_message", label: "Error Message" },
        ],
        rows,
      );
    } catch (e) {
      console.error(e);
      l0View.innerHTML =
        "<div class='container'><p class='error'>Failed to load L0 failures.</p></div>";
    }
  };

  const loadDpgsFailed = async () => {
    dpgsView.innerHTML = "<div class='container'><p class='loading'>Loading DPGS failures...</p></div>";
    try {
      const res = await fetch("/api/failures/dpgs");
      const json = await res.json();
      const rows = json.data || [];
      renderTable(
        dpgsView,
        "DPGS Failed Observation Attributes",
        [
          { key: "observation_id", label: "Observation ID" },
          { key: "rc_id", label: "RC ID" },
          { key: "track", label: "Track" },
          { key: "frame", label: "Frame" },
          { key: "work_order_id", label: "Work Order ID" },
          { key: "error_message", label: "Error Message" },
        ],
        rows,
      );
    } catch (e) {
      console.error(e);
      dpgsView.innerHTML =
        "<div class='container'><p class='error'>Failed to load DPGS failures.</p></div>";
    }
  };

  dropdownMenu.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-failed-view]");
    if (!btn) return;
    const which = btn.getAttribute("data-failed-view");
    closeMenu();
    if (which === "l0") {
      loadL0Failed();
    } else if (which === "dpgs") {
      loadDpgsFailed();
    }
  });
});
class ObservationsApp extends HTMLElement {
    // Convert ISO date format (YYYY-MM-DD) to Julian day format (YYYY-DDD)
    isoToJulianDay(isoDate, time = "") {
      if (!isoDate) return "";
    
      const date = new Date(isoDate + "T00:00:00Z");
      const year = date.getUTCFullYear();
      const startOfYear = new Date(Date.UTC(year, 0, 1));
      const diff = date - startOfYear;
      const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
      const julianDay = String(dayOfYear).padStart(3, "0");
    
      const timeStr = time ? `T${time}` : "";
      return `${year}-${julianDay}${timeStr}`;
    }

  constructor() {
    super();
    this.currentPage = 1;
    this.currentPattern = "";
    this.filters = []; // Array to store multiple active filters
    this.filterCounter = 0; // For unique filter IDs
  }

  connectedCallback() {
    this.innerHTML = `
<div class="container">
    <h2>Observation Search</h2>

    <div class="search-box">
        <div id="filtersContainer" style="display:flex; flex-direction:column; gap:12px;">
            <div id="primaryFilter"></div>
            <div id="additionalFilters"></div>
            <div style="display:flex; gap:8px;">
                <button id="addFilterBtn" style="display:none;">+ Add Filter</button>
                <button id="searchBtn">Search</button>
            </div>
        </div>
    </div>
    
     <!-- Table showing total count -->
    <div>
        <table border="1" cellpadding="8" cellspacing="0" style="width:100%; border-collapse:collapse; text-align:center;">
            <thead style="background-color:#f2f2f2;">
                <tr>
                    <th>Observation ID Count</th>
                    <th>Datatake ID Count</th>
                    <th>Config ID Count</th>
                    <th>Session Count</th>
                </tr>
            </thead>
            <tbody id="configTableBody">
                <tr>
                    <td colspan="4">No data yet. Click "Search" to see counts.</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div id="result"></div>
</div>
`;



    this.resultDiv = this.querySelector("#result");
    this.primaryFilterDiv = this.querySelector("#primaryFilter");
    this.additionalFiltersDiv = this.querySelector("#additionalFilters");
    this.addFilterBtn = this.querySelector("#addFilterBtn");
    this.searchBtn = this.querySelector("#searchBtn");

    // Initialize with primary filter
    this.renderPrimaryFilter();

    this.addFilterBtn.addEventListener("click", () => this.addFilter());
    this.searchBtn.addEventListener("click", () => this.performSearch());
  }
   
  
  renderPrimaryFilter() {
    this.primaryFilterDiv.innerHTML = `
      <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
        <select id="primaryFilterType">
          <option value="observation">Observation ID</option>
          <option value="session">Session ID</option>
        </select>
        <div id="primaryInputContainer" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;"></div>
      </div>
    `;

    const primarySelect = this.querySelector("#primaryFilterType");
    this.renderFilterInputs("primary", primarySelect.value);
    primarySelect.addEventListener("change", (e) => {
      this.filters = []; // Reset additional filters when primary changes
      this.additionalFiltersDiv.innerHTML = "";
      this.renderFilterInputs("primary", e.target.value);
      this.updateAddFilterButton(e.target.value);
    });

    // Initialize add filter button visibility
    this.updateAddFilterButton(primarySelect.value);
  }

  renderFilterInputs(filterType, filterValue) {
    const container = filterType === "primary" 
      ? this.querySelector("#primaryInputContainer")
      : document.getElementById(`filterInputs-${filterType}`);

    if (!container) return;

    container.innerHTML = "";

    if (filterValue === "observation") {
      container.innerHTML = `<input type="text" placeholder="Enter Observation ID (supports * ?)" class="search-input" data-filter="observation">`;
    } else if (filterValue === "session") {
      container.innerHTML = `<input type="text" placeholder="Enter Session ID (supports * ?)" class="search-input" data-filter="session">`;
    } else if (filterValue === "config") {
      container.innerHTML = `<input type="text" placeholder="Enter Config ID (e.g. 254)" class="search-input" data-filter="config">`;
    } else if (filterValue === "cmd_time") {
      container.innerHTML = `
        <label>Start:</label>
        <input type="date" class="cmd-start-date" data-filter="cmd_time">
        <input type="time" class="cmd-start-time" step="1" data-filter="cmd_time">
        <label>End:</label>
        <input type="date" class="cmd-end-date" data-filter="cmd_time">
        <input type="time" class="cmd-end-time" step="1" data-filter="cmd_time">
      `;
    }
  }

  updateAddFilterButton(primaryFilterType) {
    // show add button for both observation and session (session only gets cmd_time)
    if (primaryFilterType === "observation" || primaryFilterType === "session") {
      this.addFilterBtn.style.display = "inline-block";
    } else {
      this.addFilterBtn.style.display = "none";
    }
  }

  addFilter() {
    const primaryType = this.querySelector("#primaryFilterType").value;
    
    // Available filters to add (depends on primary filter)
    let availableFilters = [];
    if (primaryType === "observation") {
      availableFilters = ["config", "cmd_time"];
    } else if (primaryType === "session") {
      availableFilters = ["cmd_time"];
    }

    if (availableFilters.length === 0) {
      alert("No more filters available to add.");
      return;
    }

    const chooseAndAdd = (chosen) => {
      const filterId = `filter-${++this.filterCounter}`;
      this.filters.push({ id: filterId, type: chosen });
      this.renderAdditionalFilters();
    };

    if (availableFilters.length === 1) {
      chooseAndAdd(availableFilters[0]);
    } else {
      // build a temporary selector interface
      const choiceDiv = document.createElement("div");
      choiceDiv.style.display = "inline-flex";
      choiceDiv.style.gap = "4px";
      const sel = document.createElement("select");
      availableFilters.forEach(f => {
        const opt = document.createElement("option");
        opt.value = f;
        opt.textContent = f.replace(/_/g, " ");
        sel.appendChild(opt);
      });
      const okBtn = document.createElement("button");
      okBtn.textContent = "Add";
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      choiceDiv.appendChild(sel);
      choiceDiv.appendChild(okBtn);
      choiceDiv.appendChild(cancelBtn);
      this.addFilterBtn.parentElement.insertBefore(choiceDiv, this.addFilterBtn.nextSibling);

      const cleanup = () => {
        choiceDiv.remove();
      };
      okBtn.onclick = () => {
        chooseAndAdd(sel.value);
        cleanup();
      };
      cancelBtn.onclick = () => {
        cleanup();
      };
    }
  }

  renderAdditionalFilters() {
    this.additionalFiltersDiv.innerHTML = "";

    this.filters.forEach((filter, index) => {
      const filterDiv = document.createElement("div");
      filterDiv.id = `filter-${filter.id}`;
      filterDiv.style.cssText = "display:flex; gap:8px; align-items:center; flex-wrap:wrap; padding:8px; background:#f5f5f5; border-radius:4px;";

      let selectHTML = `
        <select id="select-${filter.id}" data-filter-id="${filter.id}">
          <option value="observation" ${filter.type === "observation" ? "selected" : ""}>Observation ID</option>
          <option value="config" ${filter.type === "config" ? "selected" : ""}>Config ID</option>
          <option value="cmd_time" ${filter.type === "cmd_time" ? "selected" : ""}>CMD SSAR Time</option>
        </select>
      `;

      filterDiv.innerHTML = selectHTML + `<div id="filterInputs-${filter.id}" style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;"></div>
        <button class="remove-filter-btn" data-filter-id="${filter.id}" style="padding:4px 8px; background:#ff6b6b; color:white; border:none; border-radius:3px; cursor:pointer;">Remove</button>`;

      this.additionalFiltersDiv.appendChild(filterDiv);

      // Render inputs for this filter
      this.renderFilterInputs(filter.id, filter.type);

      // Add change listener
      filterDiv.querySelector(`#select-${filter.id}`).addEventListener("change", (e) => {
        filter.type = e.target.value;
        this.renderFilterInputs(filter.id, e.target.value);
      });

      // Add remove listener
      filterDiv.querySelector(".remove-filter-btn").addEventListener("click", () => {
        this.filters = this.filters.filter(f => f.id !== filter.id);
        this.renderAdditionalFilters();
      });
    });
  }

  buildUrlFromFilters(page = 1) {
    const primaryType = this.querySelector("#primaryFilterType").value;
    const params = [];

    // Get primary filter value
    const primaryInputContainer = this.querySelector("#primaryInputContainer");
    if (primaryType === "observation") {
      const value = primaryInputContainer.querySelector(".search-input");
      if (value && value.value.trim()) params.push(`pattern=${encodeURIComponent(value.value.trim())}`);
    } else if (primaryType === "session") {
      const value = primaryInputContainer.querySelector(".search-input");
      if (value && value.value.trim()) params.push(`session_id=${encodeURIComponent(value.value.trim())}`);
    }

    // Get additional filters (observation can have config/cmd_time, session can have cmd_time)
    this.filters.forEach(filter => {
      const inputs = document.getElementById(`filterInputs-${filter.id}`);
      if (!inputs) return;

      if (filter.type === "observation") {
        const val = inputs.querySelector(".search-input")?.value.trim();
        if (val) params.push(`pattern=${encodeURIComponent(val)}`);
      } else if (filter.type === "config") {
        const val = inputs.querySelector(".search-input")?.value.trim();
        if (val) params.push(`config=${encodeURIComponent(val)}`);
      } else if (filter.type === "cmd_time") {
        const sd = inputs.querySelector(".cmd-start-date")?.value.trim();
        const st = inputs.querySelector(".cmd-start-time")?.value.trim();
        const ed = inputs.querySelector(".cmd-end-date")?.value.trim();
        const et = inputs.querySelector(".cmd-end-time")?.value.trim();

        if (sd) {
          const startJulian = this.isoToJulianDay(sd, st);
          params.push(`cmd_start=${encodeURIComponent(startJulian)}`);
        }
        if (ed) {
          const endJulian = this.isoToJulianDay(ed, et);
          params.push(`cmd_end=${encodeURIComponent(endJulian)}`);
        }
      }
    });

    params.push(`page=${page}`);
    const endpoint = primaryType === "session" ? "/api/session" : "/api/observation";
    return `${endpoint}?${params.join("&")}`;
  }

  async performSearch() {
    const primaryType = this.querySelector("#primaryFilterType").value;
    const primaryInputContainer = this.querySelector("#primaryInputContainer");
    let hasValidInput = false;

    // Validate primary filter has input
    const value = primaryInputContainer.querySelector(".search-input")?.value.trim();
    if (!value) {
      showError(this.resultDiv, "Please enter a value for the primary filter.");
      return;
    }

    showLoading(this.resultDiv);

    try {
      // For observations, fetch counts first and display immediately
      if (primaryType === "observation") {
        const countsUrl = this.buildCountsUrl();
        const observationUrl = this.buildUrlFromFilters(1);
        
        // Start both queries in parallel
        const [countsResult, observationResult] = await Promise.all([
          fetchJson(countsUrl),
          fetchJson(observationUrl)
        ]);

        // Display counts immediately (this is fast)
        this.displayCountsFromResult(countsResult);

        // Then display observation results
        if (!observationResult.data || observationResult.data.length === 0) {
          showError(this.resultDiv, "No observations found.");
          return;
        }
        renderResults(this.resultDiv, observationResult, (page) => this.fetchObservation(page));
      } else {
        // For session search, fetch and display normally
        const url = this.buildUrlFromFilters(1);
        const result = await fetchJson(url);

        if (!result.data || result.data.length === 0) {
          showError(this.resultDiv, "No session found.");
          return;
        }
        renderMultipleSessionTimelines(
          this.resultDiv,
          result.data,
          renderObservationDetails,
        );

        // pagination controls for sessions
        const totalPages = Math.ceil(result.total / result.per_page);
        const paginationDiv = document.createElement("div");
        paginationDiv.style.marginTop = "20px";

        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Previous";
        prevBtn.disabled = result.page <= 1;
        prevBtn.onclick = () => this.fetchSession(result.page - 1);

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Next";
        nextBtn.disabled = result.page >= totalPages;
        nextBtn.onclick = () => this.fetchSession(result.page + 1);

        const pageInfo = document.createElement("span");
        pageInfo.textContent = ` Page ${result.page} of ${totalPages} `;
        pageInfo.style.margin = "0 10px";

        paginationDiv.appendChild(prevBtn);
        paginationDiv.appendChild(pageInfo);
        paginationDiv.appendChild(nextBtn);
        this.resultDiv.appendChild(paginationDiv);
      }
    } catch (error) {
      console.error(error);
      showError(this.resultDiv, "Something went wrong.");
    }
  }

  async fetchObservation(page) {
    try {
      showLoading(this.resultDiv);
      const url = this.buildUrlFromFilters(page);
      const result = await fetchJson(url);
      renderResults(this.resultDiv, result, (p) => this.fetchObservation(p));
    } catch (error) {
      console.error(error);
      showError(this.resultDiv, "Something went wrong.");
    }
  }

  async fetchSession(page) {
    // use same URL builder as performSearch to include any cmd filters
    const url = this.buildUrlFromFilters(page);
    try {
      showLoading(this.resultDiv);
      const result = await fetchJson(url);

      if (!result.data || result.data.length === 0) {
        showError(this.resultDiv, "No session found.");
        return;
      }

      renderMultipleSessionTimelines(
        this.resultDiv,
        result.data,
        renderObservationDetails,
      );

      // pagination controls (same as above)
      const totalPages = Math.ceil(result.total / result.per_page);
      const paginationDiv = document.createElement("div");
      paginationDiv.style.marginTop = "20px";

      const prevBtn = document.createElement("button");
      prevBtn.textContent = "Previous";
      prevBtn.disabled = result.page <= 1;
      prevBtn.onclick = () => this.fetchSession(result.page - 1);

      const nextBtn = document.createElement("button");
      nextBtn.textContent = "Next";
      nextBtn.disabled = result.page >= totalPages;
      nextBtn.onclick = () => this.fetchSession(result.page + 1);

      const pageInfo = document.createElement("span");
      pageInfo.textContent = ` Page ${result.page} of ${totalPages} `;
      pageInfo.style.margin = "0 10px";

      paginationDiv.appendChild(prevBtn);
      paginationDiv.appendChild(pageInfo);
      paginationDiv.appendChild(nextBtn);
      this.resultDiv.appendChild(paginationDiv);
    } catch (error) {
      console.error(error);
      showError(this.resultDiv, "Something went wrong.");
    }
  }

  buildCountsUrl() {
    const primaryType = this.querySelector("#primaryFilterType").value;
    const params = [];

    // Get primary filter value
    const primaryInputContainer = this.querySelector("#primaryInputContainer");
    if (primaryType === "observation") {
      const value = primaryInputContainer.querySelector(".search-input");
      if (value && value.value.trim()) params.push(`pattern=${encodeURIComponent(value.value.trim())}`);
    } else if (primaryType === "session") {
      const value = primaryInputContainer.querySelector(".search-input");
      if (value && value.value.trim()) params.push(`session_id=${encodeURIComponent(value.value.trim())}`);
    }

    // Get additional filters (observation can have config/cmd_time, session can have cmd_time)
    this.filters.forEach(filter => {
      const inputs = document.getElementById(`filterInputs-${filter.id}`);
      if (!inputs) return;

      if (filter.type === "observation") {
        const val = inputs.querySelector(".search-input")?.value.trim();
        if (val) params.push(`pattern=${encodeURIComponent(val)}`);
      } else if (filter.type === "config") {
        const val = inputs.querySelector(".search-input")?.value.trim();
        if (val) params.push(`config=${encodeURIComponent(val)}`);
      } else if (filter.type === "cmd_time") {
        const sd = inputs.querySelector(".cmd-start-date")?.value.trim();
        const st = inputs.querySelector(".cmd-start-time")?.value.trim();
        const ed = inputs.querySelector(".cmd-end-date")?.value.trim();
        const et = inputs.querySelector(".cmd-end-time")?.value.trim();

        if (sd) {
          const startJulian = this.isoToJulianDay(sd, st);
          params.push(`cmd_start=${encodeURIComponent(startJulian)}`);
        }
        if (ed) {
          const endJulian = this.isoToJulianDay(ed, et);
          params.push(`cmd_end=${encodeURIComponent(endJulian)}`);
        }
      }
    });

    return `/api/observation/counts?${params.join("&")}`;
  }

  displayCountsFromResult(countsResult) {
    const tableBody = this.querySelector("#configTableBody");
    if (!tableBody) return;

    tableBody.innerHTML = ""; // Clear existing rows

    // Add single row with unique counts
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = countsResult.observation_count;
    row.insertCell(1).textContent = countsResult.datatake_count;
    row.insertCell(2).textContent = countsResult.config_count;
    row.insertCell(3).textContent = countsResult.session_count;
  }

  async displayObservationCounts() {
    try {
      const countsUrl = this.buildCountsUrl();
      const countsResult = await fetchJson(countsUrl);
      this.displayCountsFromResult(countsResult);
    } catch (error) {
      console.error("Failed to load counts:", error);
    }
  }
}

customElements.define("observations-app", ObservationsApp);