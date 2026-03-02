import { buildUrl, fetchJson } from "./modules/search.js";
import {
  showError,
  showLoading,
  renderResults,
  renderMultipleSessionTimelines,
  showObservationDetails as renderObservationDetails,
} from "./modules/render.js";

class ObservationsApp extends HTMLElement {
  constructor() {
    super();
    this.currentPage = 1;
    this.currentPattern = "";
  }

  connectedCallback() {
    this.innerHTML = `
<div class="container">
    <h2>Observation Search</h2>

    <div class="search-box">
        <select id="filterType">
            <option value="observation">Observation ID</option>
            <option value="session">Session ID</option>
            <option value="cmd_time">CMD SSAR Time</option>
            <option value="config">Config ID</option>
        </select>

        <div id="inputContainer" style="display:flex; gap:8px; align-items:center;">
            <input type="text" id="mainSearchInput" placeholder="Enter Observation ID">
            <div id="cmdInputs" style="display:none; gap:6px; align-items:center;">
                <label>Start:</label>
                <input type="date" id="cmdStartDate">
                <input type="time" id="cmdStartTime" step="1">
                <label>End:</label>
                <input type="date" id="cmdEndDate">
                <input type="time" id="cmdEndTime" step="1">
            </div>
            <button id="searchBtn">Search</button>
        </div>
    </div>

    <div id="result"></div>
</div>
`;

    this.resultDiv = this.querySelector("#result");
    this.filterType = this.querySelector("#filterType");
    this.mainInput = this.querySelector("#mainSearchInput");
    this.cmdInputs = this.querySelector("#cmdInputs");
    this.cmdStartDate = this.querySelector("#cmdStartDate");
    this.cmdStartTime = this.querySelector("#cmdStartTime");
    this.cmdEndDate = this.querySelector("#cmdEndDate");
    this.cmdEndTime = this.querySelector("#cmdEndTime");
    this.searchBtn = this.querySelector("#searchBtn");

    this.searchBtn.addEventListener("click", () => this.performSearch());
    this.filterType.addEventListener("change", () => this.updatePlaceholder());
  }

  updatePlaceholder() {
    const value = this.filterType.value;

    // hide everything initially
    this.mainInput.style.display = "";
    if (this.cmdInputs) this.cmdInputs.style.display = "none";

    if (value === "observation") {
      this.mainInput.placeholder = "Enter Observation ID (supports * ? )";
    } else if (value === "session") {
      this.mainInput.placeholder = "Enter Session ID (supports * ?)";
    } else if (value === "cmd_time") {
      this.mainInput.style.display = "none";
      this.cmdInputs.style.display = "flex";
      [
        this.cmdStartDate,
        this.cmdStartTime,
        this.cmdEndDate,
        this.cmdEndTime,
      ].forEach((i) => {
        if (i) i.value = "";
      });
    } else if (value === "config") {
      this.mainInput.placeholder = "Enter Config ID (e.g. 254)";
    }
  }

  async performSearch() {
    const type = this.filterType.value;
    let value = "";
    // variables for cmd_time search
    let sd, st, ed, et;

    if (type === "cmd_time") {
      sd = this.cmdStartDate.value.trim();
      st = this.cmdStartTime.value.trim();
      ed = this.cmdEndDate.value.trim();
      et = this.cmdEndTime.value.trim();
      if (!sd && !st && !ed && !et) {
        showError(
          this.resultDiv,
          "Please enter at least one start or end date/time.",
        );
        return;
      }
      // we build the query URL separately below
    } else {
      value = this.mainInput.value.trim();
    }

    if (type !== "cmd_time" && !value) {
      showError(this.resultDiv, "Please enter a value.");
      return;
    }

    showLoading(this.resultDiv);

    try {
      let url;
      if (type === "cmd_time") {
        const params = [];
        if (sd)
          params.push(
            `cmd_start=${encodeURIComponent(sd + (st ? `T${st}` : ""))}`,
          );
        if (ed)
          params.push(
            `cmd_end=${encodeURIComponent(ed + (et ? `T${et}` : ""))}`,
          );
        url = `/api/observation?${params.join("&")}`;
      } else {
        url = buildUrl(type, value);
      }
      const result = await fetchJson(url);

      if (type === "session") {
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
      } else {
        if (!result.data || result.data.length === 0) {
          showError(
            this.resultDiv,
            type === "cmd_time"
              ? "No observations found for specified CMD time."
              : "No observations found.",
          );
          return;
        }
        renderResults(this.resultDiv, result, (page) =>
          this.fetchObservation(page),
        );
      }
    } catch (error) {
      console.error(error);
      showError(this.resultDiv, "Something went wrong.");
    }
  }

  async fetchObservation(page) {
    const type = this.filterType.value;
    let url;

    if (type === "cmd_time") {
      const sd = this.cmdStartDate.value.trim();
      const st = this.cmdStartTime.value.trim();
      const ed = this.cmdEndDate.value.trim();
      const et = this.cmdEndTime.value.trim();
      const params = [];
      if (sd)
        params.push(
          `cmd_start=${encodeURIComponent(sd + (st ? `T${st}` : ""))}`,
        );
      if (ed)
        params.push(`cmd_end=${encodeURIComponent(ed + (et ? `T${et}` : ""))}`);
      params.push(`page=${page}`);
      url = `/api/observation?${params.join("&")}`;
    } else {
      const value = this.mainInput.value.trim();
      url = buildUrl(type, value, page);
    }

    try {
      showLoading(this.resultDiv);
      const result = await fetchJson(url);
      renderResults(this.resultDiv, result, (p) => this.fetchObservation(p));
    } catch (error) {
      console.error(error);
      showError(this.resultDiv, "Something went wrong.");
    }
  }

  async fetchSession(page) {
    const value = this.mainInput.value.trim();
    if (!value) {
      showError(this.resultDiv, "Please enter a value.");
      return;
    }

    const url = buildUrl("session", value, page);
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
}

customElements.define("observations-app", ObservationsApp);
