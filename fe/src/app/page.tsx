"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
type NavItem = "etls" | "datasources" | "dataflows" | "destinations" | "users";

interface User {
  id: number;
  username: string;
  role: string;
  isactive: boolean;
  created_at: string;
  updated_at: string;
}

interface Datasource {
  id: number;
  name: string;
  host: string;
  owner_pic?: string;
  source_engine: string;
  type: string;
  port: number;
  db_schema_table: string;
  description?: string;
  specs?: string;
  credentials?: string;
  isactive: boolean;
}

interface Dataflow {
  id: number;
  etl_server: string;
  etl_type: string;
  etl_script_folder: string;
  etl_main_script: string;
  etl_execution_env: string;
  cronschedule: string;
  isactive: boolean;
}

interface Destination {
  id: number;
  type: string;
  path_destination: string;
  pic?: string;
  description?: string;
  isactive: boolean;
}

interface Etl {
  id: number;
  datasource_id: number;
  dataflow_id: number;
  destination_id: number;
  isactive: boolean;
  datasource?: Datasource;
  dataflow?: Dataflow;
  destination?: Destination;
}

// ──────────────────────────────────────────────
// API helpers
// ──────────────────────────────────────────────
const apiFetch = async (path: string, opts?: RequestInit) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(opts?.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`${res.status}`);
  if (res.status === 204) return null;
  return res.json();
};

// ──────────────────────────────────────────────
// Icons
// ──────────────────────────────────────────────
const DatabaseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);
const BoltIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);
const CloudIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
  </svg>
);
const PipelineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
  </svg>
);
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const XIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

// ──────────────────────────────────────────────
// Shared components
// ──────────────────────────────────────────────
function Badge({ children, color }: { children: React.ReactNode; color: "blue" | "amber" | "emerald" | "red" | "violet" }) {
  const map = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    red: "bg-red-100 text-red-700 border-red-200",
    violet: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[color]}`}>
      {children}
    </span>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <p className="text-lg font-medium">No {label} found</p>
      <p className="text-sm mt-1">Click the button above to add your first one</p>
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <XIcon />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({ label, name, value, onChange, type = "text", placeholder = "", required = false, options }: {
  label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  type?: string; placeholder?: string; required?: boolean; options?: { label: string; value: string }[];
}) {
  const cls = "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent bg-gray-50 transition";
  if (options) {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <select name={name} value={value} onChange={onChange} required={required} className={cls}>
          <option value="">— Select —</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>
    );
  }
  if (type === "textarea") {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
        <textarea name={name} value={value} onChange={onChange} required={required} rows={3} placeholder={placeholder}
          className={`${cls} resize-none`} />
      </div>
    );
  }
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} className={cls} />
    </div>
  );
}

function DeleteConfirmModal({ itemLabel, onConfirm, onCancel }: { itemLabel: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <TrashIcon />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Confirm Delete</h3>
            <p className="text-sm text-gray-500 mt-0.5">Are you sure you want to delete <strong>{itemLabel}</strong>? This cannot be undone.</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition">Delete</button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// DATASOURCE section
// ──────────────────────────────────────────────
const emptyDatasource = { name: "", host: "", owner_pic: "", source_engine: "", type: "", port: "", db_schema_table: "", description: "", specs: "", credentials: "" };

function DatasourceSection({ token }: { token: string }) {
  const [records, setRecords] = useState<Datasource[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Datasource | null>(null);
  const [form, setForm] = useState({ ...emptyDatasource });
  const [deleteTarget, setDeleteTarget] = useState<Datasource | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/datasources");
      setRecords(data || []);
    } catch { setRecords([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openAdd = () => { setForm({ ...emptyDatasource }); setEditing(null); setModal("add"); };
  const openEdit = (r: Datasource) => { setEditing(r); setForm({ name: r.name, host: r.host, owner_pic: r.owner_pic || "", source_engine: r.source_engine, type: r.type, port: String(r.port), db_schema_table: r.db_schema_table, description: r.description || "", specs: r.specs || "", credentials: r.credentials || "" }); setModal("edit"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = { ...form, port: parseInt(form.port) || 0 };
      if (editing) { await apiFetch(`/datasources/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await apiFetch("/datasources", { method: "POST", body: JSON.stringify(body) }); }
      setModal(null);
      await load();
    } catch (err) { alert("Failed to save. Check backend."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apiFetch(`/datasources/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch { alert("Failed to delete."); }
  };

  const filtered = records.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.source_engine.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search datasources…" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full sm:w-72 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" />
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-blue-200 active:scale-95 whitespace-nowrap">
          <PlusIcon /> Add Datasource
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState label="datasources" /> : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Name", "Source Engine", "Type", "Host", "Port", "DB.Schema.Table", "Owner/PIC", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-blue-50/40 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">{r.name}</td>
                  <td className="px-4 py-3"><Badge color="blue">{r.source_engine}</Badge></td>
                  <td className="px-4 py-3 text-gray-600">{r.type}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{r.host}</td>
                  <td className="px-4 py-3 text-gray-600">{r.port}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs max-w-[180px] truncate">{r.db_schema_table}</td>
                  <td className="px-4 py-3 text-gray-600">{r.owner_pic || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition" title="Edit"><EditIcon /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition" title="Delete"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Datasource" : "Edit Datasource"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Name" name="name" value={form.name} onChange={handleChange} required placeholder="SAP Daily" />
            <FormField label="Source Engine" name="source_engine" value={form.source_engine} onChange={handleChange} required placeholder="SQL Server" />
            <FormField label="Host" name="host" value={form.host} onChange={handleChange} placeholder="10.33.41.245" />
            <FormField label="Port" name="port" value={form.port} onChange={handleChange} type="number" placeholder="1433" />
            <FormField label="Type" name="type" value={form.type} onChange={handleChange} placeholder="Database" />
            <FormField label="Owner / PIC" name="owner_pic" value={form.owner_pic} onChange={handleChange} placeholder="Raihan" />
            <div className="sm:col-span-2">
              <FormField label="DB.Schema.Table" name="db_schema_table" value={form.db_schema_table} onChange={handleChange} placeholder="dbo.schema.table" />
            </div>
            <FormField label="Specs" name="specs" value={form.specs} onChange={handleChange} placeholder="8 CPU, 16GB RAM" />
            <FormField label="Credentials" name="credentials" value={form.credentials} onChange={handleChange} placeholder="encrypted_****" />
            <div className="sm:col-span-2">
              <FormField label="Description" name="description" value={form.description} onChange={handleChange} type="textarea" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {saving ? "Saving…" : modal === "add" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <DeleteConfirmModal itemLabel={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// DATAFLOW section
// ──────────────────────────────────────────────
const emptyDataflow = { etl_server: "", etl_type: "", etl_script_folder: "", etl_main_script: "", etl_execution_env: "", cronschedule: "" };

function DataflowSection({ token }: { token: string }) {
  const [records, setRecords] = useState<Dataflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Dataflow | null>(null);
  const [form, setForm] = useState({ ...emptyDataflow });
  const [deleteTarget, setDeleteTarget] = useState<Dataflow | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiFetch("/dataflows"); setRecords(data || []); }
    catch { setRecords([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyDataflow }); setEditing(null); setModal("add"); };
  const openEdit = (r: Dataflow) => { setEditing(r); setForm({ etl_server: r.etl_server, etl_type: r.etl_type, etl_script_folder: r.etl_script_folder, etl_main_script: r.etl_main_script, etl_execution_env: r.etl_execution_env, cronschedule: r.cronschedule }); setModal("edit"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await apiFetch(`/dataflows/${editing.id}`, { method: "PUT", body: JSON.stringify(form) }); }
      else { await apiFetch("/dataflows", { method: "POST", body: JSON.stringify(form) }); }
      setModal(null); await load();
    } catch { alert("Failed to save."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apiFetch(`/dataflows/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch { alert("Failed to delete."); }
  };

  const filtered = records.filter(r => r.etl_type.toLowerCase().includes(search.toLowerCase()) || r.etl_server.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search dataflows…" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full sm:w-72 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400" />
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-amber-200 active:scale-95 whitespace-nowrap">
          <PlusIcon /> Add Dataflow
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState label="dataflows" /> : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["ETL Server", "ETL Type", "Main Script", "Script Folder", "Execution Env", "Cron Schedule", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-amber-50/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.etl_server}</td>
                  <td className="px-4 py-3"><Badge color="amber">{r.etl_type}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.etl_main_script}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[180px] truncate">{r.etl_script_folder}</td>
                  <td className="px-4 py-3 text-gray-600 text-xs max-w-[160px] truncate">{r.etl_execution_env}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.cronschedule}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-600 transition" title="Edit"><EditIcon /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition" title="Delete"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Dataflow" : "Edit Dataflow"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="ETL Server" name="etl_server" value={form.etl_server} onChange={handleChange} required placeholder="10.24.20.12" />
            <FormField label="ETL Type" name="etl_type" value={form.etl_type} onChange={handleChange} required placeholder="Python Script" />
            <FormField label="Cron Schedule" name="cronschedule" value={form.cronschedule} onChange={handleChange} placeholder="0 2 * * *" />
            <FormField label="Execution Env" name="etl_execution_env" value={form.etl_execution_env} onChange={handleChange} placeholder="cron / Docker" />
            <div className="sm:col-span-2">
              <FormField label="Script Folder" name="etl_script_folder" value={form.etl_script_folder} onChange={handleChange} placeholder="/home/etlbigdata/script/" />
            </div>
            <div className="sm:col-span-2">
              <FormField label="Main Script File" name="etl_main_script" value={form.etl_main_script} onChange={handleChange} placeholder="main_sap.py" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-xl hover:bg-amber-600 transition disabled:opacity-60">
                {saving ? "Saving…" : modal === "add" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <DeleteConfirmModal itemLabel={`${deleteTarget.etl_type} @ ${deleteTarget.etl_server}`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// DESTINATION section
// ──────────────────────────────────────────────
const emptyDestination = { type: "", path_destination: "", pic: "", description: "" };

function DestinationSection({ token }: { token: string }) {
  const [records, setRecords] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Destination | null>(null);
  const [form, setForm] = useState({ ...emptyDestination });
  const [deleteTarget, setDeleteTarget] = useState<Destination | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiFetch("/destinations"); setRecords(data || []); }
    catch { setRecords([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyDestination }); setEditing(null); setModal("add"); };
  const openEdit = (r: Destination) => { setEditing(r); setForm({ type: r.type, path_destination: r.path_destination, pic: r.pic || "", description: r.description || "" }); setModal("edit"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await apiFetch(`/destinations/${editing.id}`, { method: "PUT", body: JSON.stringify(form) }); }
      else { await apiFetch("/destinations", { method: "POST", body: JSON.stringify(form) }); }
      setModal(null); await load();
    } catch { alert("Failed to save."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apiFetch(`/destinations/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch { alert("Failed to delete."); }
  };

  const filtered = records.filter(r => r.type.toLowerCase().includes(search.toLowerCase()) || r.path_destination.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search destinations…" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full sm:w-72 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-emerald-200 active:scale-95 whitespace-nowrap">
          <PlusIcon /> Add Destination
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState label="destinations" /> : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Type", "Path / Destination", "PIC", "Description", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="px-4 py-3"><Badge color="emerald">{r.type}</Badge></td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 max-w-[240px] truncate">{r.path_destination}</td>
                  <td className="px-4 py-3 text-gray-600">{r.pic || "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">{r.description || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition" title="Edit"><EditIcon /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition" title="Delete"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add Destination" : "Edit Destination"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Type" name="type" value={form.type} onChange={handleChange} required placeholder="Data Warehouse (Redshift)" />
            <FormField label="PIC / Owner" name="pic" value={form.pic} onChange={handleChange} placeholder="Raihan" />
            <div className="sm:col-span-2">
              <FormField label="Path / Destination" name="path_destination" value={form.path_destination} onChange={handleChange} required placeholder="posind_kurlog.sap.sap_daily_kurlog" />
            </div>
            <div className="sm:col-span-2">
              <FormField label="Description" name="description" value={form.description} onChange={handleChange} type="textarea" placeholder="Optional description…" />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60">
                {saving ? "Saving…" : modal === "add" ? "Create" : "Update"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <DeleteConfirmModal itemLabel={deleteTarget.type} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// ETL PIPELINE section
// ──────────────────────────────────────────────
function EtlSection({ token }: { token: string }) {
  const [records, setRecords] = useState<Etl[]>([]);
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [dataflows, setDataflows] = useState<Dataflow[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<Etl | null>(null);
  const [form, setForm] = useState({ datasource_id: "", dataflow_id: "", destination_id: "" });
  const [deleteTarget, setDeleteTarget] = useState<Etl | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [etls, ds, df, dest] = await Promise.all([
        apiFetch("/etls"),
        apiFetch("/datasources"),
        apiFetch("/dataflows"),
        apiFetch("/destinations"),
      ]);
      setRecords(etls || []);
      setDatasources(ds || []);
      setDataflows(df || []);
      setDestinations(dest || []);
    } catch { }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ datasource_id: "", dataflow_id: "", destination_id: "" }); setEditing(null); setModal("add"); };
  const openEdit = (r: Etl) => { setEditing(r); setForm({ datasource_id: String(r.datasource_id), dataflow_id: String(r.dataflow_id), destination_id: String(r.destination_id) }); setModal("edit"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      const body = { datasource_id: parseInt(form.datasource_id), dataflow_id: parseInt(form.dataflow_id), destination_id: parseInt(form.destination_id) };
      if (editing) { await apiFetch(`/etls/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await apiFetch("/etls", { method: "POST", body: JSON.stringify(body) }); }
      setModal(null); await load();
    } catch { alert("Failed to save."); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apiFetch(`/etls/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch { alert("Failed to delete."); }
  };

  const dsOptions = datasources.map(d => ({ value: String(d.id), label: `${d.name} (${d.source_engine})` }));
  const dfOptions = dataflows.map(d => ({ value: String(d.id), label: `${d.etl_type} @ ${d.etl_server}` }));
  const destOptions = destinations.map(d => ({ value: String(d.id), label: `${d.type} — ${d.path_destination}` }));

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-200 active:scale-95">
          <PlusIcon /> Add ETL Pipeline
        </button>
      </div>

      {loading ? <Spinner /> : records.length === 0 ? <EmptyState label="ETL pipelines" /> : (
        <div className="space-y-3">
          {records.map(r => {
            const ds = r.datasource || datasources.find(d => d.id === r.datasource_id);
            const df = r.dataflow || dataflows.find(d => d.id === r.dataflow_id);
            const dest = r.destination || destinations.find(d => d.id === r.destination_id);
            const expanded = expandedId === r.id;

            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                {/* Summary row */}
                <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition" onClick={() => setExpandedId(expanded ? null : r.id)}>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500"><DatabaseIcon /></span>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Source</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{ds?.name || `ID:${r.datasource_id}`}</p>
                        <p className="text-xs text-gray-500">{ds?.source_engine}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500"><BoltIcon /></span>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Dataflow</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{df?.etl_type || `ID:${r.dataflow_id}`}</p>
                        <p className="text-xs text-gray-500">{df?.etl_server}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500"><CloudIcon /></span>
                      <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Destination</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{dest?.type || `ID:${r.destination_id}`}</p>
                        <p className="text-xs text-gray-500 truncate">{dest?.path_destination}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={e => { e.stopPropagation(); openEdit(r); }} className="p-2 rounded-lg bg-violet-50 hover:bg-violet-100 text-violet-600 transition" title="Edit"><EditIcon /></button>
                    <button onClick={e => { e.stopPropagation(); setDeleteTarget(r); }} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition" title="Delete"><TrashIcon /></button>
                    <span className={`transition-transform duration-200 text-gray-400 ${expanded ? "rotate-90" : ""}`}><ChevronRightIcon /></span>
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Datasource detail */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-3 flex items-center gap-1"><DatabaseIcon /> Data Source</p>
                      {ds ? [
                        ["Host", ds.host], ["Port", String(ds.port)], ["Type", ds.type],
                        ["DB.Schema.Table", ds.db_schema_table], ["Owner/PIC", ds.owner_pic || "—"],
                        ["Specs", ds.specs || "—"], ["Credentials", ds.credentials || "—"], ["Description", ds.description || "—"]
                      ].map(([k, v]) => (
                        <div key={k} className="mb-1.5">
                          <span className="text-xs text-blue-400 font-medium">{k}: </span>
                          <span className="text-xs text-blue-900 font-mono break-all">{v}</span>
                        </div>
                      )) : <p className="text-xs text-gray-400">No details available</p>}
                    </div>

                    {/* Dataflow detail */}
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3 flex items-center gap-1"><BoltIcon /> Dataflow</p>
                      {df ? [
                        ["ETL Server", df.etl_server], ["ETL Type", df.etl_type],
                        ["Script Folder", df.etl_script_folder], ["Main Script", df.etl_main_script],
                        ["Exec Env", df.etl_execution_env], ["Cron", df.cronschedule]
                      ].map(([k, v]) => (
                        <div key={k} className="mb-1.5">
                          <span className="text-xs text-amber-500 font-medium">{k}: </span>
                          <span className="text-xs text-amber-900 font-mono break-all">{v}</span>
                        </div>
                      )) : <p className="text-xs text-gray-400">No details available</p>}
                    </div>

                    {/* Destination detail */}
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide mb-3 flex items-center gap-1"><CloudIcon /> Destination</p>
                      {dest ? [
                        ["Type", dest.type], ["Path", dest.path_destination],
                        ["PIC", dest.pic || "—"], ["Description", dest.description || "—"]
                      ].map(([k, v]) => (
                        <div key={k} className="mb-1.5">
                          <span className="text-xs text-emerald-500 font-medium">{k}: </span>
                          <span className="text-xs text-emerald-900 font-mono break-all">{v}</span>
                        </div>
                      )) : <p className="text-xs text-gray-400">No details available</p>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add ETL Pipeline" : "Edit ETL Pipeline"} onClose={() => setModal(null)}>
          <p className="text-sm text-gray-500 mb-5">Select an existing Datasource, Dataflow, and Destination to link them into an ETL pipeline.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Datasource" name="datasource_id" value={form.datasource_id} onChange={handleChange} required options={dsOptions} />
            <FormField label="Dataflow" name="dataflow_id" value={form.dataflow_id} onChange={handleChange} required options={dfOptions} />
            <FormField label="Destination" name="destination_id" value={form.destination_id} onChange={handleChange} required options={destOptions} />
            {(datasources.length === 0 || dataflows.length === 0 || destinations.length === 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                ⚠️ You need at least one <strong>Datasource</strong>, <strong>Dataflow</strong>, and <strong>Destination</strong> before creating a pipeline.
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving || datasources.length === 0 || dataflows.length === 0 || destinations.length === 0}
                className="px-4 py-2 text-sm font-semibold text-white bg-violet-600 rounded-xl hover:bg-violet-700 transition disabled:opacity-60">
                {saving ? "Saving…" : modal === "add" ? "Create Pipeline" : "Update Pipeline"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <DeleteConfirmModal itemLabel={`Pipeline #${deleteTarget.id}`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// USERS SECTION (admin only)
// ──────────────────────────────────────────────
const emptyUser = { username: "", password: "", role: "user" };

function UsersSection() {
  const [records, setRecords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"add" | "edit" | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({ ...emptyUser });
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { const data = await apiFetch("/users"); setRecords(data || []); }
    catch { setRecords([]); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const openAdd = () => { setForm({ ...emptyUser }); setEditing(null); setModal("add"); };
  const openEdit = (r: User) => { setEditing(r); setForm({ username: r.username, password: "", role: r.role }); setModal("edit"); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modal === "add" && !form.password) { alert("Password is required"); return; }
    setSaving(true);
    try {
      const body: Record<string, string> = { username: form.username, role: form.role };
      if (form.password) body.password = form.password;
      if (editing) { await apiFetch(`/users/${editing.id}`, { method: "PUT", body: JSON.stringify(body) }); }
      else { await apiFetch("/users", { method: "POST", body: JSON.stringify(body) }); }
      setModal(null);
      await load();
    } catch (err: any) {
      alert(err.message === "409" ? "Username already exists" : "Failed to save.");
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try { await apiFetch(`/users/${deleteTarget.id}`, { method: "DELETE" }); setDeleteTarget(null); await load(); }
    catch { alert("Failed to deactivate user."); }
  };

  const filtered = records.filter(r => r.username.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users…" className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm w-full sm:w-72 bg-white focus:outline-none focus:ring-2 focus:ring-rose-400" />
        <button onClick={openAdd} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-rose-200 active:scale-95 whitespace-nowrap">
          <PlusIcon /> Add User
        </button>
      </div>

      {loading ? <Spinner /> : filtered.length === 0 ? <EmptyState label="users" /> : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Username", "Role", "Created At", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filtered.map(r => (
                <tr key={r.id} className="hover:bg-rose-50/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-rose-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {r.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold text-gray-900">{r.username}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge color={r.role === "admin" ? "red" : "blue"}>{r.role}</Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{new Date(r.created_at).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(r)} className="p-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition" title="Edit"><EditIcon /></button>
                      <button onClick={() => setDeleteTarget(r)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition" title="Deactivate"><TrashIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(modal === "add" || modal === "edit") && (
        <Modal title={modal === "add" ? "Add User" : "Edit User"} onClose={() => setModal(null)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Username" name="username" value={form.username} onChange={handleChange} required placeholder="johndoe" />
            <FormField label={modal === "edit" ? "New Password (leave blank to keep current)" : "Password"} name="password" value={form.password} onChange={handleChange} type="password" placeholder="••••••••" required={modal === "add"} />
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Role<span className="text-red-500 ml-1">*</span></label>
              <select name="role" value={form.role} onChange={handleChange} required className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-gray-50">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={() => setModal(null)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition">Cancel</button>
              <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition disabled:opacity-60">
                {saving ? "Saving…" : modal === "add" ? "Create User" : "Update User"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {deleteTarget && <DeleteConfirmModal itemLabel={deleteTarget.username} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
    </div>
  );
}

// ──────────────────────────────────────────────
// MAIN APP
// ──────────────────────────────────────────────
const allNavItems: { key: NavItem; label: string; icon: React.ReactNode; color: string; activeClass: string; adminOnly?: boolean }[] = [
  { key: "etls", label: "ETL Pipelines", icon: <PipelineIcon />, color: "violet", activeClass: "bg-violet-600 text-white shadow-lg shadow-violet-200" },
  { key: "datasources", label: "Datasource", icon: <DatabaseIcon />, color: "blue", activeClass: "bg-blue-600 text-white shadow-lg shadow-blue-200" },
  { key: "dataflows", label: "Dataflow", icon: <BoltIcon />, color: "amber", activeClass: "bg-amber-500 text-white shadow-lg shadow-amber-200" },
  { key: "destinations", label: "Destination", icon: <CloudIcon />, color: "emerald", activeClass: "bg-emerald-600 text-white shadow-lg shadow-emerald-200" },
  { key: "users", label: "User Management", icon: <UsersIcon />, color: "rose", activeClass: "bg-rose-600 text-white shadow-lg shadow-rose-200", adminOnly: true },
];

const pageTitles: Record<NavItem, { title: string; subtitle: string }> = {
  etls: { title: "ETL Pipelines", subtitle: "Manage your end-to-end data pipeline connections" },
  datasources: { title: "Datasources", subtitle: "Manage your data source connections and configurations" },
  dataflows: { title: "Dataflows", subtitle: "Manage ETL scripts, schedules, and execution environments" },
  destinations: { title: "Destinations", subtitle: "Manage data warehouse and destination targets" },
  users: { title: "User Management", subtitle: "Admin only — manage system users and roles" },
};

export default function App() {
  const [activeNav, setActiveNav] = useState<NavItem>("etls");
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ username: string; role: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) { router.push("/login"); return; }
    setToken(t);
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      setCurrentUser(u);
    } catch { }
  }, [router]);

  const isAdmin = currentUser?.role === "admin";
  const navItems = allNavItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const current = pageTitles[activeNav];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-30 flex flex-col shadow-xl transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 md:static md:shadow-none`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-blue-600 rounded-xl flex items-center justify-center text-white flex-shrink-0">
              <PipelineIcon />
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">ETL Pipeline</p>
              <p className="text-xs text-gray-400">Manager</p>
            </div>
          </div>
        </div>

        {/* User info */}
        {currentUser && (
          <div className="px-4 py-3 mx-3 mb-2 bg-gray-50 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{currentUser.username}</p>
              <Badge color={currentUser.role === "admin" ? "red" : "blue"}>{currentUser.role}</Badge>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Navigation</p>
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setActiveNav(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeNav === item.key ? item.activeClass : "text-gray-600 hover:bg-gray-100"}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition">
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900 leading-tight">{current.title}</h1>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">{current.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {navItems.find(n => n.key === activeNav)?.icon}
              <span className="hidden sm:inline font-medium">{current.title}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
          {activeNav === "etls" && <EtlSection token={token} />}
          {activeNav === "datasources" && <DatasourceSection token={token} />}
          {activeNav === "dataflows" && <DataflowSection token={token} />}
          {activeNav === "destinations" && <DestinationSection token={token} />}
          {activeNav === "users" && isAdmin && <UsersSection />}
          {activeNav === "users" && !isAdmin && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <svg className="w-16 h-16 mb-4 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p className="text-lg font-semibold">Access Denied</p>
              <p className="text-sm mt-1">User Management is restricted to admins only.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
