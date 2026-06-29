"use client";

import { useEffect, useState } from "react";

type ReportRow = {
  id: number;
  company: string;
  batchYear: string | null;
  status: string;
  note: string | null;
  createdAt: string;
};

const STATUS_LABELS: Record<string, string> = {
  delayed: "Delayed",
  onboarded: "Onboarded",
  offer_revoked: "Offer revoked",
  no_update: "No update",
};

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  async function loadReports() {
    setLoading(true);
    const res = await fetch("/api/reports", { cache: "no-store" });
    setReports(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    loadReports();
  }, []);

  async function handleDelete(id: number) {
    setMessage("");
    setSaving(id);

    const res = await fetch(`/api/reports/${id}`, {
      method: "DELETE",
      cache: "no-store",
      headers: {
        "x-admin-key": adminKey,
      },
    });
    const data = await res.json();
    setSaving(null);

    if (!res.ok) {
      setMessage(data.error || "Delete failed.");
      return;
    }

    setMessage("Deleted.");
    loadReports();
  }

  return (
    <div className="container">
      <h1>Admin</h1>
      <p className="subtitle">Use the admin key to remove bad submissions.</p>

      <div className="card">
        <div className="form-grid" style={{ gridTemplateColumns: "1fr auto" }}>
          <input
            type="password"
            placeholder="ADMIN_KEY"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
          <button onClick={loadReports} disabled={loading}>
            {loading ? "Loading…" : "Refresh"}
          </button>
        </div>
        {message && <span className="muted">{message}</span>}
      </div>

      <div className="card">
        {reports.length === 0 ? (
          <p className="muted">No reports found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Status</th>
                <th>Note</th>
                <th>Timestamp</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.company}</td>
                  <td>{STATUS_LABELS[report.status] || report.status}</td>
                  <td>{report.note || "—"}</td>
                  <td>{new Date(report.createdAt).toLocaleString()}</td>
                  <td style={{ textAlign: "right" }}>
                    <button onClick={() => handleDelete(report.id)} disabled={saving === report.id}>
                      {saving === report.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
