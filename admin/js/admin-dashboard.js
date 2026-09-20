/**
 * admin-dashboard.js
 * Populates the summary cards and the recent enquiries table on
 * admin/index.html. Waits for the "admin-ready" event from
 * admin-auth.js so it never queries before a session is confirmed.
 */
(function () {
  if (!supabaseClient) {
    const tableBody = document.querySelector("[data-recent-enquiries]");
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="5">Supabase is not configured yet.</td></tr>`;
    return;
  }

  const ENQUIRY_TYPE_LABELS = {
    vehicle: "Vehicle Importation",
    agriculture: "Agriculture",
    livestock: "Livestock",
    general: "General Enquiry"
  };

  function formatDate(isoString) {
    return new Date(isoString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function renderCount(selector, value) {
    const el = document.querySelector(selector);
    if (el) el.textContent = value ?? "0";
  }

  async function loadCounts() {
    try {
      const [total, fresh, vehicle, agriculture] = await Promise.all([
        supabaseClient.from("enquiries").select("id", { count: "exact", head: true }),
        supabaseClient.from("enquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
        supabaseClient.from("enquiries").select("id", { count: "exact", head: true }).eq("enquiry_type", "vehicle"),
        supabaseClient.from("enquiries").select("id", { count: "exact", head: true }).in("enquiry_type", ["agriculture", "livestock"])
      ]);

      renderCount("[data-count-total]", total.count);
      renderCount("[data-count-new]", fresh.count);
      renderCount("[data-count-vehicle]", vehicle.count);
      renderCount("[data-count-agriculture]", agriculture.count);
    } catch (err) {
      console.error("[admin-dashboard] could not load counts:", err);
      ["total", "new", "vehicle", "agriculture"].forEach((key) => renderCount(`[data-count-${key}]`, "-"));
    }
  }

  async function loadRecent() {
    const tableBody = document.querySelector("[data-recent-enquiries]");
    if (!tableBody) return;

    const { data, error } = await supabaseClient
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error) {
      tableBody.innerHTML = `<tr><td colspan="5">Could not load recent enquiries.</td></tr>`;
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `<tr><td colspan="5">No enquiries yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = data
      .map(
        (row) => `
        <tr>
          <td>${row.name}</td>
          <td>${ENQUIRY_TYPE_LABELS[row.enquiry_type] || row.enquiry_type}</td>
          <td><span class="status-badge status-badge--${row.status}">${row.status}</span></td>
          <td>${formatDate(row.created_at)}</td>
          <td><a href="/admin/enquiries.html?id=${row.id}" class="btn btn-outline btn-small">View</a></td>
        </tr>
      `
      )
      .join("");
  }

  document.addEventListener("admin-ready", () => {
    loadCounts();
    loadRecent();
  });
})();
