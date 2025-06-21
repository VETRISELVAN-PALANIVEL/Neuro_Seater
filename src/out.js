import React, { useState } from "react";

function OutputPage({ excelData, config, onBack }) {
  const [showPopup, setShowPopup] = useState(false);

  // Placeholder: Generate a simple seating plan (to be improved)
  const students = excelData.slice(1); // skip header
  const plan = [];
  let idx = 0;
  for (let r = 0; r < config.rows; r++) {
    const row = [];
    for (let t = 0; t < config.tablesPerRow; t++) {
      const table = [];
      for (let s = 0; s < config.studentsPerTable; s++) {
        if (idx < students.length) {
          table.push(students[idx]);
          idx++;
        }
      }
      row.push(table);
    }
    plan.push(row);
  }

  const handleDownload = () => {
    setShowPopup(true);
  };

  const confirmDownload = () => {
    setShowPopup(false);
    // TODO: Implement download logic (PDF/Excel)
    alert("Download started (implement logic here)");
  };

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <h2>Exam Hall Seating Plan</h2>
      <button onClick={onBack}>Back</button>
      <button style={{ marginLeft: 10 }} onClick={handleDownload}>
        Download Plan
      </button>
      {showPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ background: "#fff", padding: 30, borderRadius: 8 }}>
            <p>Are you sure you want to download the hall plan?</p>
            <button onClick={confirmDownload}>Yes</button>
            <button onClick={() => setShowPopup(false)} style={{ marginLeft: 10 }}>No</button>
          </div>
        </div>
      )}
      <div style={{ marginTop: 30 }}>
        {plan.map((row, rIdx) => (
          <div key={rIdx} style={{ display: "flex", marginBottom: 10 }}>
            {row.map((table, tIdx) => (
              <div key={tIdx} style={{
                border: "1px solid #333", minWidth: 120, minHeight: 60, marginRight: 10, padding: 5
              }}>
                <strong>Table {tIdx + 1}</strong>
                <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                  {table.map((student, sIdx) => (
                    <li key={sIdx}>{student.join(" | ")}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default OutputPage;