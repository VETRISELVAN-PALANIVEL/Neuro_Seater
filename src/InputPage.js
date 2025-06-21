import React, { useState } from "react";

function InputPage({ onSubmit }) {
  const [excelFile, setExcelFile] = useState(null);
  const [rows, setRows] = useState("");
  const [tablesPerRow, setTablesPerRow] = useState("");
  const [studentsPerTable, setStudentsPerTable] = useState("");
  const [constraints, setConstraints] = useState({
    department: true,
    subject: true,
    gender: true,
  });

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleConstraintChange = (e) => {
    setConstraints({
      ...constraints,
      [e.target.name]: e.target.checked,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!excelFile || !rows || !tablesPerRow || !studentsPerTable) {
      alert("Please fill all fields and upload the Excel file.");
      return;
    }
    onSubmit({
      excelFile,
      rows,
      tablesPerRow,
      studentsPerTable,
      constraints,
    });
  };

  return (
    <div
      style={{
        maxWidth: 500,
        margin: "40px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px #0001",
        padding: 32,
      }}
    >
      <h2 style={{ color: "#1976d2", marginBottom: 24 }}>Upload Exam Data</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 18 }}>
          <label>
            <b>Excel File</b> (Roll No, Name, Department, Subject, Gender):
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              style={{ display: "block", marginTop: 8 }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>
            <b>Number of Rows:</b>
            <input
              type="number"
              min={1}
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              style={{ marginLeft: 8, width: 80 }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>
            <b>Tables per Row:</b>
            <input
              type="number"
              min={1}
              value={tablesPerRow}
              onChange={(e) => setTablesPerRow(e.target.value)}
              style={{ marginLeft: 8, width: 80 }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <label>
            <b>Students per Table:</b>
            <input
              type="number"
              min={1}
              value={studentsPerTable}
              onChange={(e) => setStudentsPerTable(e.target.value)}
              style={{ marginLeft: 8, width: 80 }}
              required
            />
          </label>
        </div>
        <div style={{ marginBottom: 18 }}>
          <b>Seating Constraints:</b>
          <div>
            <label>
              <input
                type="checkbox"
                name="department"
                checked={constraints.department}
                onChange={handleConstraintChange}
              />
              Avoid same Department at a table
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="subject"
                checked={constraints.subject}
                onChange={handleConstraintChange}
              />
              Avoid same Subject at a table
            </label>
          </div>
          <div>
            <label>
              <input
                type="checkbox"
                name="gender"
                checked={constraints.gender}
                onChange={handleConstraintChange}
              />
              Avoid same Gender at a table
            </label>
          </div>
        </div>
        <button
          type="submit"
          style={{
            background: "#1976d2",
            color: "#fff",
            border: "none",
            borderRadius: 5,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Generate Hall Plan
        </button>
      </form>
    </div>
  );
}

export default InputPage;