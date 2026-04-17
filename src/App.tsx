import { useState } from "react";

// --- Mock Data ---
const initialPipelines = [
  {
    id: 1,
    status: "active",
    dataSource: {
      pic: "-",
      name: "SAP Daily Kurlog",
      host: "10.33.41.245",
      sourceEngine: "SQL Server",
      type: "Database",
      port: 1433,
      dbSchemaTable: "-",
      description: "-",
      specs: "8 CPU, 16GB RAM, SSD 500GB",
      credentials: "user: admin password: admin123",
    },
    dataflow: {
      pic: "Raihan",
      etlServer: "10.24.20.12",
      etlType: "Python Script",
      etlScriptFolder: "/home/etlbigdata/script/global_etl/",
      etlMainScript: "main_sap.py",
      etlExecutionEnv: "cron",
      cronSchedule: "0 2 * * *",
    },
    destination: {
      pic: "Raihan",
      type: "Data Warehouse (Redshift)",
      pathDestination: "posind_kurlog.sap.sap_daily_kurlog",
      description: "Path S3 s3://sap-feeder/245_IMSAPFICO/bagian=kurlog/",
    },
  },
  {
    id: 2,
    status: "inactive",
    dataSource: {
      name: "MongoDB User Logs",
      host: "192.168.1.150",
      ownerPic: "Alice Wong",
      sourceEngine: "MongoDB",
      type: "NoSQL Database",
      port: 27017,
      dbSchemaTable: "appdb.user_activity",
      description: "User activity and event logs",
      specs: "4 CPU, 8GB RAM, NVMe 1TB",
      credentials: "encrypted_****",
    },
    dataflow: {
      etlServer: "etl-server-02",
      etlType: "Shell Script (Bash)",
      etlScriptFolder: "/opt/etl/scripts/logs",
      etlMainScript: "ingest_logs.sh",
      etlExecutionEnv: "Ubuntu 22.04 / Bash 5.1",
      cronSchedule: "*/30 * * * *",
    },
    destination: {
      type: "Elasticsearch",
      pathDestination: "logstash-logs-user-activity",
      pic: "Bob Lee",
      description: "Elasticsearch index for log analysis",
    },
  },
  {
    id: 3,
    status: "active",
    dataSource: {
      name: "REST API CRM",
      host: "https://api.crm.example.com",
      ownerPic: "Carlos Rivera",
      sourceEngine: "REST API",
      type: "API",
      port: 443,
      dbSchemaTable: "N/A (JSON Response)",
      description: "CRM customer data via REST API v2",
      specs: "Rate limit: 1000 req/min",
      credentials: "encrypted_****",
    },
    dataflow: {
      etlServer: "etl-server-01",
      etlType: "Python (Custom)",
      etlScriptFolder: "/opt/etl/scripts/crm",
      etlMainScript: "fetch_customers.py",
      etlExecutionEnv: "Python 3.10 / Docker container",
      cronSchedule: "0 6,18 * * *",
    },
    destination: {
      type: "PostgreSQL (DWH)",
      pathDestination: "dwh.public.dim_customers",
      pic: "Diana Prince",
      description: "Dimension table for customer analytics",
    },
  },
];

// --- Empty Form Template ---
const emptyForm = {
  source: "",
  engineType: "",
  host: "",
  port: "",
  dbSchemaTable: "",
  etlServer: "",
  etlType: "",
  etlScriptFolder: "",
  etlMainScript: "",
  etlExecutionEnv: "",
  schedules: "",
  dwhRedshift: "",
  dwhRdsMssql: "",
  dwhRdsPostgres: "",
  pic: "",
  updatedAt: "",
  description: "",
};

// --- Icon Components ---
const ChevronIcon = ({ expanded }) => (
  <svg
    className={`w-5 h-5 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 9l-7 7-7-7"
    />
  </svg>
);

const EditIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
    />
  </svg>
);

const DeleteIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const DataSourceIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7zm0 0V5a2 2 0 012-2h12a2 2 0 012 2v2m-16 0h16m-8 5h.01"
    />
  </svg>
);

const DataflowIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const DestinationIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

const X = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const Check = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);

// --- Detail Section Component ---
function DetailSection({ icon, title, color, fields, data }) {
  const colorClasses = {
    blue: {
      border: "border-blue-400",
      bg: "bg-blue-50",
      badge: "bg-blue-100 text-blue-800",
      icon: "text-blue-500",
    },
    amber: {
      border: "border-amber-400",
      bg: "bg-amber-50",
      badge: "bg-amber-100 text-amber-800",
      icon: "text-amber-500",
    },
    emerald: {
      border: "border-emerald-400",
      bg: "bg-emerald-50",
      badge: "bg-emerald-100 text-emerald-800",
      icon: "text-emerald-500",
    },
  };

  const c = colorClasses[color];
  return (
    <div className={`border-l-4 ${c.border} ${c.bg} rounded-r-lg p-4`}>
      <div className="flex items-center gap-2 mb-3">
        <span className={c.icon}>{icon}</span>
        <h4 className={`font-semibold text-sm ${c.badge} px-2 py-0.5 rounded`}>
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field) => (
          <div
            key={field.key}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-100"
          >
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {field.label}
            </label>
            <p className="text-sm text-gray-800 mt-1 font-mono break-all">
              {data[field.key] || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Status Badge ---
function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}
    >
      <span
        className={`w-2 h-2 rounded-full ${status === "active" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}
      />
      {status === "active" ? "Active" : "Inactive"}
    </span>
  );
}

// --- Main App Component ---
export default function ETLPipelineManager() {
  const [pipelines, setPipelines] = useState(initialPipelines);
  const [expandedRow, setExpandedRow] = useState(null);
  const [expandedSection, setExpandedSection] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  // ✅ Modal Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ ...emptyForm });

  const dataSourceFields = [
    { key: "name", label: "Name" },
    { key: "host", label: "Host" },
    { key: "ownerPic", label: "Owner / PIC" },
    { key: "sourceEngine", label: "Source Engine" },
    { key: "type", label: "Type" },
    { key: "port", label: "Port" },
    { key: "dbSchemaTable", label: "DB.Schema.Table" },
    { key: "description", label: "Description" },
    { key: "specs", label: "Specs" },
    { key: "credentials", label: "Credentials" },
  ];

  const dataflowFields = [
    { key: "etlServer", label: "ETL Server" },
    { key: "etlType", label: "ETL Type" },
    { key: "etlScriptFolder", label: "ETL Script / Executables Folder" },
    { key: "etlMainScript", label: "ETL Main Script / Executables File" },
    { key: "etlExecutionEnv", label: "ETL Execution Env" },
    { key: "cronSchedule", label: "Cron Schedule" },
  ];

  const destinationFields = [
    { key: "type", label: "Type" },
    { key: "pathDestination", label: "Path Destination" },
    { key: "pic", label: "PIC" },
    { key: "description", label: "Description" },
  ];

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
    setExpandedSection({});
  };

  const toggleSection = (pipelineId, section) => {
    setExpandedSection((prev) => ({
      ...prev,
      [pipelineId]: prev[pipelineId] === section ? null : section,
    }));
  };

  const handleDelete = (id) => {
    setPipelines((prev) => prev.filter((p) => p.id !== id));
    setShowDeleteConfirm(null);
    if (expandedRow === id) setExpandedRow(null);
  };

  const toggleStatus = (id) => {
    setPipelines((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, status: p.status === "active" ? "inactive" : "active" }
          : p,
      ),
    );
  };

  const filteredPipelines = pipelines.filter((p) => {
    const matchSearch =
      p.dataSource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.destination.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatDateTime = (iso) => {
    if (!iso) return "-";
    return new Date(iso).toLocaleString("id-ID");
  };

  // ✅ Modal Handlers
  const openModal = (pipeline = null) => {
    setEditingId(pipeline?.id || null);
    if (pipeline) {
      setFormData({
        id: pipeline.id,
        source: pipeline.dataSource?.name || "",
        engineType: pipeline.dataSource?.sourceEngine || "",
        host: pipeline.dataSource?.host || "",
        port: pipeline.dataSource?.port?.toString() || "",
        dbSchemaTable: pipeline.dataSource?.dbSchemaTable || "",
        etlServer: pipeline.dataflow?.etlServer || "",
        etlType: pipeline.dataflow?.etlType || "",
        etlScriptFolder: pipeline.dataflow?.etlScriptFolder || "",
        etlMainScript: pipeline.dataflow?.etlMainScript || "",
        etlExecutionEnv: pipeline.dataflow?.etlExecutionEnv || "",
        schedules: pipeline.dataflow?.cronSchedule || "",
        dwhRedshift: "",
        dwhRdsMssql: "",
        dwhRdsPostgres: pipeline.destination?.pathDestination || "",
        pic: pipeline.dataSource?.ownerPic || pipeline.destination?.pic || "",
        updatedAt: new Date().toISOString().slice(0, 16),
        description: pipeline.dataSource?.description || "",
      });
    } else {
      setFormData({
        ...emptyForm,
        updatedAt: new Date().toISOString().slice(0, 16),
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ ...emptyForm });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPipeline = {
      id: editingId || Date.now(),
      status: editingId
        ? pipelines.find((p) => p.id === editingId)?.status || "active"
        : "active",
      // Flat fields for table display
      source: formData.source,
      engineType: formData.engineType,
      host: formData.host,
      port: formData.port,
      dbSchemaTable: formData.dbSchemaTable,
      etlServer: formData.etlServer,
      etlType: formData.etlType,
      etlScriptFolder: formData.etlScriptFolder,
      etlMainScript: formData.etlMainScript,
      etlExecutionEnv: formData.etlExecutionEnv,
      schedules: formData.schedules,
      dwhRedshift: formData.dwhRedshift,
      dwhRdsMssql: formData.dwhRdsMssql,
      dwhRdsPostgres: formData.dwhRdsPostgres,
      pic: formData.pic,
      updatedAt: formData.updatedAt,
      description: formData.description,
      // Nested objects for detail sections
      dataSource: {
        name: formData.source,
        host: formData.host,
        ownerPic: formData.pic,
        sourceEngine: formData.engineType,
        type: "Database",
        port: parseInt(formData.port) || 0,
        dbSchemaTable: formData.dbSchemaTable,
        description: formData.description,
        specs: "—",
        credentials: "encrypted_****",
      },
      dataflow: {
        etlServer: formData.etlServer,
        etlType: formData.etlType,
        etlScriptFolder: formData.etlScriptFolder,
        etlMainScript: formData.etlMainScript,
        etlExecutionEnv: formData.etlExecutionEnv,
        cronSchedule: formData.schedules,
      },
      destination: {
        type: formData.dwhRdsPostgres
          ? "PostgreSQL (DWH)"
          : formData.dwhRedshift
            ? "Redshift"
            : "Data Warehouse",
        pathDestination:
          formData.dwhRdsPostgres ||
          formData.dwhRedshift ||
          formData.dwhRdsMssql ||
          "—",
        pic: formData.pic,
        description: formData.description,
      },
    };

    if (editingId) {
      setPipelines((prev) =>
        prev.map((p) => (p.id === editingId ? newPipeline : p)),
      );
    } else {
      setPipelines((prev) => [...prev, newPipeline]);
    }
    closeModal();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-xl shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ETL Pipeline Manager
                </h1>
                <p className="text-sm text-gray-500">
                  Manage your data pipelines in one place
                </p>
              </div>
            </div>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
            >
              <PlusIcon />
              Add Pipeline
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Total Pipelines</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {pipelines.length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Active</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">
              {pipelines.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Inactive</p>
            <p className="text-3xl font-bold text-red-600 mt-1">
              {pipelines.filter((p) => p.status === "inactive").length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 font-medium">Unique Sources</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">
              {new Set(pipelines.map((p) => p.dataSource.sourceEngine)).size}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search pipelines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        {/* Pipeline Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1 px-4 py-3">Status</div>
            <div className="col-span-3 px-4 py-3">Data Source</div>
            <div className="col-span-3 px-4 py-3">Dataflow</div>
            <div className="col-span-3 px-4 py-3">Destination</div>
            <div className="col-span-2 px-4 py-3 text-center">Actions</div>
          </div>

          {/* Rows */}
          {filteredPipelines.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg font-medium">No pipelines found</p>
              <p className="text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            filteredPipelines.map((pipeline) => (
              <div
                key={pipeline.id}
                className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors"
              >
                {/* Main Row */}
                <div
                  className="grid grid-cols-12 items-center cursor-pointer"
                  onClick={() => toggleRow(pipeline.id)}
                >
                  {/* Status */}
                  <div className="col-span-1 md:col-span-1 px-4 py-4">
                    <StatusBadge status={pipeline.status} />
                  </div>

                  {/* Data Source */}
                  <div className="col-span-11 md:col-span-3 px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">
                        <DataSourceIcon />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {pipeline.dataSource.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pipeline.dataSource.sourceEngine} •{" "}
                          {pipeline.dataSource.type}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dataflow */}
                  <div className="hidden md:flex col-span-3 px-4 py-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500">
                        <DataflowIcon />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {pipeline.dataflow.etlType}
                        </p>
                        <p className="text-xs text-gray-500">
                          {pipeline.dataflow.etlServer}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Destination */}
                  <div className="hidden md:flex col-span-3 px-4 py-4 items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-500">
                        <DestinationIcon />
                      </span>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {pipeline.destination.type}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {pipeline.destination.pathDestination}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="hidden md:flex col-span-2 px-4 py-4 items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(pipeline.id);
                      }}
                      className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                      title="Toggle Status"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(pipeline);
                      }}
                      className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                      title="Edit"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowDeleteConfirm(pipeline.id);
                      }}
                      className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </button>
                    <ChevronIcon expanded={expandedRow === pipeline.id} />
                  </div>

                  {/* Mobile expand button */}
                  <div className="md:hidden px-4 py-3 flex justify-end">
                    <ChevronIcon expanded={expandedRow === pipeline.id} />
                  </div>
                </div>

                {/* Expanded Detail Panel */}
                {expandedRow === pipeline.id && (
                  <div className="bg-gray-50/80 border-t border-gray-200 px-4 py-5 space-y-4 animate-in">
                    {/* Section Tabs */}
                    <div className="flex gap-2 mb-2">
                      {[
                        { key: "source", label: "Data Source", color: "blue" },
                        { key: "dataflow", label: "Dataflow", color: "amber" },
                        {
                          key: "destination",
                          label: "Destination",
                          color: "emerald",
                        },
                      ].map((section) => (
                        <button
                          key={section.key}
                          onClick={() =>
                            toggleSection(pipeline.id, section.key)
                          }
                          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                            expandedSection[pipeline.id] === section.key
                              ? section.color === "blue"
                                ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                                : section.color === "amber"
                                  ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                                  : "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>

                    {/* Section Content */}
                    {expandedSection[pipeline.id] === "source" && (
                      <DetailSection
                        icon={<DataSourceIcon />}
                        title="Data Source"
                        color="blue"
                        fields={dataSourceFields}
                        data={pipeline.dataSource}
                      />
                    )}
                    {expandedSection[pipeline.id] === "dataflow" && (
                      <DetailSection
                        icon={<DataflowIcon />}
                        title="Dataflow"
                        color="amber"
                        fields={dataflowFields}
                        data={pipeline.dataflow}
                      />
                    )}
                    {expandedSection[pipeline.id] === "destination" && (
                      <DetailSection
                        icon={<DestinationIcon />}
                        title="Destination"
                        color="emerald"
                        fields={destinationFields}
                        data={pipeline.destination}
                      />
                    )}
                  </div>
                )}

                {/* Delete Confirmation */}
                {showDeleteConfirm === pipeline.id && (
                  <div className="bg-red-50 border-t border-red-200 px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="bg-red-100 p-2 rounded-full">
                          <DeleteIcon />
                        </span>
                        <div>
                          <p className="font-semibold text-red-800 text-sm">
                            Delete Pipeline?
                          </p>
                          <p className="text-xs text-red-600">
                            This will permanently remove{" "}
                            <strong>{pipeline.dataSource.name}</strong> and all
                            its configurations.
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(pipeline.id)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>
            ETL Pipeline Manager © 2026 — {filteredPipelines.length} pipeline(s)
            displayed
          </p>
        </div>

        {/* ✅ MODAL FORM - Add/Edit Pipeline */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-5 border-b border-gray-200 sticky top-0 bg-white z-10">
                <h2 className="text-lg font-semibold text-gray-800">
                  {editingId
                    ? "✏️ Edit Pipeline Configuration"
                    : "➕ Add New Pipeline"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X />
                </button>
              </div>
              <form
                onSubmit={handleSubmit}
                className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {[
                  {
                    label: "Source Name *",
                    name: "source",
                    type: "text",
                    required: true,
                  },
                  { label: "Engine Type", name: "engineType", type: "text" },
                  { label: "Host", name: "host", type: "text" },
                  { label: "Port", name: "port", type: "text" },
                  {
                    label: "DB.Schema.Table",
                    name: "dbSchemaTable",
                    type: "text",
                  },
                  { label: "ETL Server", name: "etlServer", type: "text" },
                  { label: "ETL Type", name: "etlType", type: "text" },
                  {
                    label: "Script Folder",
                    name: "etlScriptFolder",
                    type: "text",
                  },
                  { label: "Main Script", name: "etlMainScript", type: "text" },
                  {
                    label: "Execution Env",
                    name: "etlExecutionEnv",
                    type: "text",
                  },
                  {
                    label: "Schedule (Cron)",
                    name: "schedules",
                    type: "text",
                    placeholder: "0 2 * * *",
                  },
                  { label: "DWH Redshift", name: "dwhRedshift", type: "text" },
                  { label: "DWH RDS MSSQL", name: "dwhRdsMssql", type: "text" },
                  {
                    label: "DWH RDS Postgres",
                    name: "dwhRdsPostgres",
                    type: "text",
                  },
                  { label: "PIC / Owner", name: "pic", type: "text" },
                  {
                    label: "Updated At",
                    name: "updatedAt",
                    type: "datetime-local",
                  },
                  {
                    label: "Description",
                    name: "description",
                    type: "textarea",
                    span: true,
                  },
                ].map((field) => (
                  <div
                    key={field.name}
                    className={field.span ? "md:col-span-2" : ""}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}{" "}
                      {field.required && (
                        <span className="text-red-500">*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        rows={3}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                        placeholder={field.placeholder || ""}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder={field.placeholder || ""}
                      />
                    )}
                  </div>
                ))}
                <div className="md:col-span-2 flex justify-end gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
                  >
                    <X /> Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-sm"
                  >
                    <Check />{" "}
                    {editingId ? "Update Pipeline" : "Create Pipeline"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
