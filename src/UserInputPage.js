import React, { useState } from "react";
import * as XLSX from "xlsx";

function UserInputPage({ onGenerate }) {
  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [config, setConfig] = useState({
    classes: 1,
    tablesPerRow: 5,
    rows: 5,
    studentsPerTable: 2,
    avoidDepartment: true,
    avoidSubject: true,
    avoidGender: true,
    classFillMode: "fill",
    seatingType: "sequential",
  });

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: "binary" });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      setPreviewData(data);
    };
    reader.readAsBinaryString(f);
  };

  const handleConfigChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || previewData.length === 0) {
      alert("Please upload a valid Excel file.");
      return;
    }
    onGenerate(previewData, config);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f4f7fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 2px 16px #1976d220",
          padding: "36px 32px",
          minWidth: 350,
          maxWidth: 480,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        <h2 style={{ color: "#1976d2", fontWeight: 700, marginBottom: 0, textAlign: "center" }}>
          Exam Seating Plan Generator
        </h2>

        {/* File Upload */}
        <div>
          <label style={{ fontWeight: 600, color: "#1976d2" }}>
            Upload Excel File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            style={{
              marginTop: 8,
              padding: "8px 0",
              width: "100%",
              border: "1px solid #e0e0e0",
              borderRadius: 6,
              background: "#fafdff",
            }}
          />
          {previewData.length > 0 && (
            <div style={{ color: "#388e3c", fontSize: 13, marginTop: 4 }}>
              {previewData.length - 1} students loaded
            </div>
          )}
        </div>

        {/* Seating Configuration */}
        <div
          style={{
            background: "#fafdff",
            borderRadius: 10,
            padding: "18px 16px",
            border: "1px solid #e3eaf2",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, color: "#1976d2", marginBottom: 4 }}>
            Seating Configuration
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Classes</label>
              <input
                type="number"
                name="classes"
                min={1}
                value={config.classes}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Rows</label>
              <input
                type="number"
                name="rows"
                min={1}
                value={config.rows}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Tables/Row</label>
              <input
                type="number"
                name="tablesPerRow"
                min={1}
                value={config.tablesPerRow}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Seats/Table</label>
              <input
                type="number"
                name="studentsPerTable"
                min={1}
                value={config.studentsPerTable}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              />
            </div>
          </div>
        </div>

        {/* Seating Type & Fill Mode */}
        <div
          style={{
            background: "#fafdff",
            borderRadius: 10,
            padding: "18px 16px",
            border: "1px solid #e3eaf2",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, color: "#1976d2", marginBottom: 4 }}>
            Seating Pattern & Fill Mode
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label>Seating Type</label>
              <select
                name="seatingType"
                value={config.seatingType}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              >
                <option value="sequential">Sequential Order (Row-wise)</option>
                <option value="serpentine">Serpentine Order (Snake-wise)</option>
                <option value="alternate">Alternate Seating (Gap)</option>
                <option value="evenodd">Even-Odd Roll Number Mixing</option>
                <option value="gender">Gender-Based Alternating</option>
                <option value="random">Randomized Allocation</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label>Class Fill Mode</label>
              <select
                name="classFillMode"
                value={config.classFillMode}
                onChange={handleConfigChange}
                style={{ width: "100%", padding: 6, borderRadius: 5, border: "1px solid #e0e0e0" }}
              >
                <option value="fill">Fill from start</option>
                <option value="spread">Spread evenly</option>
              </select>
            </div>
          </div>
        </div>

        {/* Constraints */}
        <div
          style={{
            background: "#fafdff",
            borderRadius: 10,
            padding: "18px 16px",
            border: "1px solid #e3eaf2",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontWeight: 600, color: "#1976d2", marginBottom: 4 }}>
            Seating Constraints
          </div>
          <label>
            <input
              type="checkbox"
              name="avoidDepartment"
              checked={config.avoidDepartment}
              onChange={handleConfigChange}
              style={{ marginRight: 8 }}
            />
            Avoid same Department at a table
          </label>
          <label>
            <input
              type="checkbox"
              name="avoidSubject"
              checked={config.avoidSubject}
              onChange={handleConfigChange}
              style={{ marginRight: 8 }}
            />
            Avoid same Subject at a table
          </label>
          <label>
            <input
              type="checkbox"
              name="avoidGender"
              checked={config.avoidGender}
              onChange={handleConfigChange}
              style={{ marginRight: 8 }}
            />
            Avoid different Gender in same table
          </label>
        </div>

        <button
          type="submit"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 700,
            fontSize: 18,
            marginTop: 8,
            cursor: "pointer",
            boxShadow: "0 2px 8px #1976d220",
            transition: "background 0.2s",
          }}
        >
          Generate Seating Plan
        </button>
      </form>
    </div>
  );
}

export default UserInputPage;