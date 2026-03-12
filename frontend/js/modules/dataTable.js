export function renderDataTable({
  container,
  title,
  columns,
  rows,
  emptyMessage = "No data.",
}) {
  container.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "container";

  if (title) {
    const h = document.createElement("h2");
    h.textContent = title;
    wrapper.appendChild(h);
  }

  const tableWrap = document.createElement("div");
  tableWrap.className = "table-wrap";

  const table = document.createElement("table");
  table.className = "data-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((c) => {
    const th = document.createElement("th");
    th.textContent = c.label ?? c.key;
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  if (!rows || rows.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = columns.length || 1;
    td.className = "muted";
    td.textContent = emptyMessage;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    rows.forEach((r) => {
      const tr = document.createElement("tr");
      columns.forEach((c) => {
        const td = document.createElement("td");
        const v =
          typeof c.value === "function" ? c.value(r) : r?.[c.key] ?? "";
        td.textContent = v === null || v === undefined || v === "" ? "-" : String(v);
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
  table.appendChild(tbody);

  tableWrap.appendChild(table);
  wrapper.appendChild(tableWrap);
  container.appendChild(wrapper);
}

