/**
 * admin-enquiries.js
 * Loads every enquiry once, then filters/searches client-side since
 * the volume for a small business site will be small. Clicking a
 * row opens a detail panel where the status can be changed (saved
 * immediately to Supabase) and the admin can call, email or
 * WhatsApp the enquirer using their own submitted details.
 */
(function () {
  if (!supabaseClient) {
    const tableBody = document.querySelector("[data-enquiries-table]");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="5">Supabase is not configured yet.</td></tr>`;
    return;
  }

  const ENQUIRY_TYPE_LABELS = {
    vehicle: "Vehicle Importation",
    agriculture: "Agriculture",
    livestock: "Livestock",
    general: "General Enquiry"
  };

  let allEnquiries = [];

  const tableBody = document.querySelector("[data-enquiries-table]");
  const searchInput = document.querySelector("[data-search-input]");
  const typeFilter = document.querySelector("[data-filter-type]");
  const statusFilter = document.querySelector("[data-filter-status]");

  const panel = document.querySelector("[data-detail-panel]");
  const panelScrim = document.querySelector("[data-detail-scrim]");

  function formatDate(isoString) {
    return new Date(isoString).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function matchesFilters(row) {
    const term = (searchInput.value || "").trim().toLowerCase();
    const matchesSearch =
      !term ||
      row.name.toLowerCase().includes(term) ||
      row.email.toLowerCase().includes(term) ||
      row.phone.toLowerCase().includes(term);

    const matchesType = typeFilter.value === "all" || row.enquiry_type === typeFilter.value;
    const matchesStatus = statusFilter.value === "all" || row.status === statusFilter.value;

    return matchesSearch && matchesType && matchesStatus;
  }

  function renderTable() {
    const filtered = allEnquiries.filter(matchesFilters);

    if (!filtered.length) {
      tableBody.innerHTML = `<tr><td colspan="5">No matching enquiries found.</td></tr>`;
      return;
    }

    tableBody.innerHTML = filtered
      .map(
        (row) => `
        <tr data-row-id="${row.id}">
          <td>${row.name}</td>
          <td>${ENQUIRY_TYPE_LABELS[row.enquiry_type] || row.enquiry_type}</td>
          <td><span class="status-badge status-badge--${row.status}">${row.status}</span></td>
          <td>${formatDate(row.created_at)}</td>
          <td><button type="button" class="btn btn-outline btn-small" data-open-detail="${row.id}">View</button></td>
        </tr>
      `
      )
      .join("");
  }

  function openDetail(id) {
    const row = allEnquiries.find((item) => item.id === id);
    if (!row || !panel) return;

    panel.querySelector("[data-detail-name]").textContent = row.name;
    panel.querySelector("[data-detail-email]").textContent = row.email;
    panel.querySelector("[data-detail-phone]").textContent = row.phone;
    panel.querySelector("[data-detail-type]").textContent = ENQUIRY_TYPE_LABELS[row.enquiry_type] || row.enquiry_type;
    panel.querySelector("[data-detail-message]").textContent = row.message;
    panel.querySelector("[data-detail-date]").textContent = formatDate(row.created_at);

    const statusSelect = panel.querySelector("[data-detail-status]");
    statusSelect.value = row.status;
    statusSelect.dataset.currentId = row.id;

    panel.querySelector("[data-detail-call]").setAttribute("href", `tel:${row.phone}`);
    panel.querySelector("[data-detail-email-link]").setAttribute("href", `mailto:${row.email}`);
    panel
      .querySelector("[data-detail-whatsapp]")
      .setAttribute("href", `https://wa.me/${row.phone.replace(/[^0-9]/g, "")}`);

    panel.dataset.open = "true";
    if (panelScrim) panelScrim.dataset.open = "true";

    const url = new URL(window.location);
    url.searchParams.set("id", row.id);
    window.history.replaceState({}, "", url);
  }

  function closeDetail() {
    if (!panel) return;
    panel.dataset.open = "false";
    if (panelScrim) panelScrim.dataset.open = "false";

    const url = new URL(window.location);
    url.searchParams.delete("id");
    window.history.replaceState({}, "", url);
  }

  async function updateStatus(id, newStatus) {
    const { error } = await supabaseClient.from("enquiries").update({ status: newStatus }).eq("id", id);
    if (error) {
      alert("Could not update the status. Please try again.");
      return;
    }
    const row = allEnquiries.find((item) => item.id === id);
    if (row) row.status = newStatus;
    renderTable();
  }

  async function loadEnquiries() {
    const { data, error } = await supabaseClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      tableBody.innerHTML = `<tr><td colspan="5">Could not load enquiries.</td></tr>`;
      return;
    }

    allEnquiries = data;
    renderTable();

    const requestedId = new URLSearchParams(window.location.search).get("id");
    if (requestedId) openDetail(requestedId);
  }

  searchInput.addEventListener("input", renderTable);
  typeFilter.addEventListener("change", renderTable);
  statusFilter.addEventListener("change", renderTable);

  tableBody.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-open-detail]");
    if (trigger) openDetail(trigger.dataset.openDetail);
  });

  if (panelScrim) panelScrim.addEventListener("click", closeDetail);
  const closeBtn = panel ? panel.querySelector("[data-detail-close]") : null;
  if (closeBtn) closeBtn.addEventListener("click", closeDetail);

  const statusSelect = panel ? panel.querySelector("[data-detail-status]") : null;
  if (statusSelect) {
    statusSelect.addEventListener("change", () => {
      updateStatus(statusSelect.dataset.currentId, statusSelect.value);
    });
  }

  document.addEventListener("admin-ready", loadEnquiries);
})();
