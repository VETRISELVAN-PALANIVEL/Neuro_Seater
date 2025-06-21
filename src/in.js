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
    genderArrangement: "Mixed",
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
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ maxWidth: 600, margin: "auto" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontWeight: "bold", fontSize: 32 }}>ES</div>
        <h2>ExamSeat AI</h2>
      </header>
      <h3>Upload Excel</h3>
      <input type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
      <button
        onClick={() => {}}
        disabled={!file}
        style={{ marginLeft: 10 }}
      >
        Preview Excel
      </button>
      {previewData.length > 0 && (
        <table border="1" cellPadding="5" style={{ marginTop: 20, width: "100%" }}>
          <thead>
            <tr>
              {previewData[0].map((col, idx) => (
                <th key={idx}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.slice(1, 6).map((row, idx) => (
              <tr key={idx}>
                {row.map((cell, cidx) => (
                  <td key={cidx}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h3>Configuration</h3>
      <div>
        <label>
          Number of Classes:
          <input
            type="number"
            name="classes"
            value={config.classes}
            min={1}
            onChange={handleConfigChange}
          />
        </label>
        <br />
        <label>
          Tables per Row:
          <input
            type="number"
            name="tablesPerRow"
            value={config.tablesPerRow}
            min={1}
            onChange={handleConfigChange}
          />
        </label>
        <br />
        <label>
          Number of Rows:
          <input
            type="number"
            name="rows"
            value={config.rows}
            min={1}
            onChange={handleConfigChange}
          />
        </label>
        <br />
        <label>
          Students per Table:
          <input
            type="number"
            name="studentsPerTable"
            value={config.studentsPerTable}
            min={1}
            max={3}
            onChange={handleConfigChange}
          />
        </label>
        <br />
        <label>
          Gender Arrangement:
          <select
            name="genderArrangement"
            value={config.genderArrangement}
            onChange={handleConfigChange}
          >
            <option value="Mixed">Mixed</option>
            <option value="Separate">Separate</option>
          </select>
        </label>
      </div>
      <button
        style={{ marginTop: 20 }}
        disabled={previewData.length === 0}
        onClick={() => onGenerate(previewData, config)}
      >
        Generate Seating Plan
      </button>
    </div>
  );
}

export default UserInputPage;