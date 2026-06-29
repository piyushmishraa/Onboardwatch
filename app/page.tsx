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

type CompanyStat = {
  company: string;
  total: number;
  delayed: number;
  onboarded: number;
  offerRevoked: number;
  noUpdate: number;
  pctDelayed: number;
};

const STATUS_LABELS: Record<string, string> = {
  delayed: "Delayed",
  onboarded: "Onboarded",
  offer_revoked: "Offer revoked",
  no_update: "No update",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export default function Page() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [company, setCompany] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [status, setStatus] = useState("");
  const [note, setNote] = useState("");

  async function loadData() {
    setLoading(true);
    const [reportsRes, companiesRes] = await Promise.all([
      fetch("/api/reports"),
      fetch("/api/companies"),
    ]);
    setReports(await reportsRes.json());
    setCompanies(await companiesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit() {
    setMessage("");
    if (!company.trim() || !status) {
      setMessage("Add a company and status first.");
      return;
    }
    setSubmitting(true);
    const res = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, batchYear, status, note }),
    });
    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setMessage(data.error || "Could not submit. Try again.");
      return;
    }

    setMessage("Submitted. Thanks for contributing.");
    setCompany("");
    setBatchYear("");
    setStatus("");
    setNote("");
    loadData();
  }

  const total = reports.length;
  const delayedCount = reports.filter((r) => r.status === "delayed").length;
  const onboardedCount = reports.filter((r) => r.status === "onboarded").length;
  const revokedCount = reports.filter((r) => r.status === "offer_revoked").length;

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1>OnboardWatch</h1>
          <p className="subtitle">Crowd-sourced fresher onboarding status, by company</p>
        </div>
        <button onClick={loadData} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <p className="stat-label">Total reports</p>
          <p className="stat-value">{total}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Delayed</p>
          <p className="stat-value">{delayedCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Onboarded</p>
          <p className="stat-value">{onboardedCount}</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Offers revoked</p>
          <p className="stat-value">{revokedCount}</p>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Report your status</h3>
        <div className="form-grid">
          <input
            placeholder="Company (e.g. Wipro)"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
          <input
            placeholder="Batch / year (e.g. 2025)"
            value={batchYear}
            onChange={(e) => setBatchYear(e.target.value)}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Status</option>
            <option value="delayed">Delayed</option>
            <option value="onboarded">Onboarded</option>
            <option value="offer_revoked">Offer revoked</option>
            <option value="no_update">No update</option>
          </select>
        </div>
        <div className="form-grid" style={{ gridTemplateColumns: "1fr" }}>
          <input
            placeholder="Optional note (e.g. 'BGV stuck since March')"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <button onClick={handleSubmit} disabled={submitting}>
          {submitting ? "Submitting…" : "Submit report"}
        </button>
        {message && <span className="muted" style={{ marginLeft: 10 }}>{message}</span>}
      </div>

      <h3>Company trends</h3>
      <div className="card">
        {companies.length === 0 ? (
          <p className="muted">No reports yet. Be the first to add one above.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th style={{ textAlign: "right" }}>Reports</th>
                <th style={{ textAlign: "right" }}>% delayed</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.company}>
                  <td>{c.company}</td>
                  <td style={{ textAlign: "right" }}>{c.total}</td>
                  <td style={{ textAlign: "right" }}>{c.pctDelayed}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <h3>Recent reports</h3>
      <div className="card">
        {reports.length === 0 ? (
          <p className="muted">Nothing here yet.</p>
        ) : (
          reports.slice(0, 10).map((r) => (
            <div className="report-row" key={r.id}>
              <div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 500 }}>
                  {r.company} <span className="muted">· batch {r.batchYear || "—"}</span>
                </p>
                {r.note && <p className="muted" style={{ margin: "4px 0 0" }}>{r.note}</p>}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                <span className={`badge badge-${r.status}`}>{STATUS_LABELS[r.status] || r.status}</span>
                <p className="muted" style={{ margin: "4px 0 0" }}>{timeAgo(r.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
