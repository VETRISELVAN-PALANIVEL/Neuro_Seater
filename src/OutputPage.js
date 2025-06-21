import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import {
  sequentialOrder,
  serpentineOrder,
  alternateSeating,
  evenOddMix,
  genderAlternating,
  randomizedAllocation
} from "./seatingAlgorithms";

// Helper to get column letters (A, B, C, ...)
const getColumnLetter = (index) => {
  let s = "";
  while (index >= 0) {
    s = String.fromCharCode((index % 26) + 65) + s;
    index = Math.floor(index / 26) - 1;
  }
  return s;
};

function OutputPage({ excelData, config, onBack }) {
  const [showPopup, setShowPopup] = useState(false);
  const [plans, setPlans] = useState([]);
  const [seatingOrder, setSeatingOrder] = useState("");
  const [pending, setPending] = useState([]);

  const tablesPerRow = Number(config.tablesPerRow);
  const rows = Number(config.rows);
  const studentsPerTable = Number(config.studentsPerTable);
  const classes = Number(config.classes || 1);

  useEffect(() => {
    generatePlans();
    // eslint-disable-next-line
  }, [excelData, config]);

  const generatePlans = () => {
    const students = excelData.slice(1).map(row => ({
      row,
      Department: row[2],
      Subject: row[3],
      Gender: row[4],
    }));

    let arrangedStudents;
    const totalSeats = rows * tablesPerRow * studentsPerTable;

    let classPlans = [];        // <-- move here
    let pendingStudents = [];   // <-- move here

    switch (config.seatingType) {
      case "serpentine":
        setSeatingOrder("Serpentine Order (Snake-wise)");
        arrangedStudents = sequentialOrder(students);
        break;
      case "alternate":
        setSeatingOrder("Alternate Seating (Gap)");
        arrangedStudents = alternateSeating(sequentialOrder(students), totalSeats * classes);
        break;
      case "evenodd":
        setSeatingOrder("Even-Odd Roll Number Mixing");
        arrangedStudents = evenOddMix(students);
        break;
      case "gender":
        setSeatingOrder("Gender-Based Alternating");
        arrangedStudents = genderAlternating(students);
        break;
      case "random":
        setSeatingOrder("Randomized Allocation");
        arrangedStudents = randomizedAllocation(students);
        break;
      case "sequential":
      default:
        setSeatingOrder("Sequential Order (Row-wise)");
        arrangedStudents = sequentialOrder(students);
        break;
    }

    if (config.classFillMode === "spread") {
      // Calculate base size and remainder
      const total = arrangedStudents.length;
      const base = Math.floor(total / classes);
      const remainder = total % classes;
      let start = 0;
      let classStudentLists = [];
      for (let c = 0; c < classes; c++) {
        // First 'remainder' classes get one extra student
        const size = base + (c < remainder ? 1 : 0);
        classStudentLists.push(arrangedStudents.slice(start, start + size));
        start += size;
      }

      for (let c = 0; c < classes; c++) {
        let studentsCopy = [...classStudentLists[c]];
        let classArr = [];
        for (let r = 0; r < rows; r++) {
          let rowArr = [];
          for (let t = 0; t < tablesPerRow; t++) {
            let tableArr = [];
            for (let s = 0; s < studentsPerTable; s++) {
              tableArr.push(studentsCopy.length > 0 ? studentsCopy.shift() : null);
            }
            rowArr.push(tableArr);
          }
          classArr.push(rowArr);
        }
        classPlans.push(classArr);
      }
      // Pending: any students not assigned (should be none, but just in case)
      const assigned = []
        .concat(...classPlans.flat(2))
        .filter(stu => stu && stu.row)
        .map(stu => stu.row[0]);
      pendingStudents = arrangedStudents.filter(stu => stu && stu.row && !assigned.includes(stu.row[0]));
    } else {
      // Fill from start: fill Class 1 fully, then Class 2, etc.
      let idx = 0;
      for (let c = 0; c < classes; c++) {
        let classArr = [];
        for (let r = 0; r < rows; r++) {
          let rowArr = [];
          for (let t = 0; t < tablesPerRow; t++) {
            let tableArr = [];
            for (let s = 0; s < studentsPerTable; s++) {
              tableArr.push(idx < arrangedStudents.length ? arrangedStudents[idx++] : null);
            }
            rowArr.push(tableArr);
          }
          classArr.push(rowArr);
        }
        classPlans.push(classArr);
      }
      // Any students left are pending
      pendingStudents = arrangedStudents.slice(idx);
    }

    setPlans(classPlans);
    setPending(pendingStudents);
  };

  const handleDownload = () => {
    setShowPopup(true);
  };

  const confirmDownload = () => {
    setShowPopup(false);

    const wb = XLSX.utils.book_new();

    plans.forEach((plan, classIdx) => {
      // Prepare two header rows
      const headerRow1 = [""];
      for (let t = 0; t < tablesPerRow; t++) {
        headerRow1.push(getColumnLetter(t));
        for (let s = 1; s < studentsPerTable; s++) {
          headerRow1.push("");
        }
      }

      const headerRow2 = [""];
      for (let t = 0; t < tablesPerRow; t++) {
        for (let s = 0; s < studentsPerTable; s++) {
          headerRow2.push(
            studentsPerTable === 1
              ? "Seat"
              : studentsPerTable === 2
              ? s === 0
                ? "Left"
                : "Right"
              : studentsPerTable === 3
              ? s === 0
                ? "Left"
                : s === 1
                ? "Middle"
                : "Right"
              : `Seat ${s + 1}`
          );
        }
      }

      // Prepare data rows
      const excelRows = [headerRow1, headerRow2];
      for (let r = 0; r < plan.length; r++) {
        const row = [];
        row.push(r + 1); // Row header
        for (let t = 0; t < plan[r].length; t++) {
          for (let s = 0; s < plan[r][t].length; s++) {
            const student = plan[r][t][s];
            row.push(student && student.row ? student.row[0] : "");
          }
        }
        excelRows.push(row);
      }

      // Calculate merges for headerRow1 (top header)
      const merges = [];
      let col = 1;
      for (let t = 0; t < tablesPerRow; t++) {
        if (studentsPerTable > 1) {
          merges.push({
            s: { r: 0, c: col },
            e: { r: 0, c: col + studentsPerTable - 1 },
          });
        }
        col += studentsPerTable;
      }

      // Create worksheet and add merges
      const ws = XLSX.utils.aoa_to_sheet(excelRows);
      ws["!merges"] = merges;

      // Center align header cells (first two rows) and row headers
      const totalCols = 1 + tablesPerRow * studentsPerTable;
      for (let c = 0; c < totalCols; c++) {
        const cell1 = ws[XLSX.utils.encode_cell({ r: 0, c })];
        const cell2 = ws[XLSX.utils.encode_cell({ r: 1, c })];
        if (cell1)
          cell1.s = {
            alignment: { horizontal: "center", vertical: "center" },
          };
        if (cell2)
          cell2.s = {
            alignment: { horizontal: "center", vertical: "center" },
          };
      }
      for (let r = 2; r < excelRows.length; r++) {
        const cell = ws[XLSX.utils.encode_cell({ r, c: 0 })];
        if (cell)
          cell.s = {
            alignment: { horizontal: "center", vertical: "center" },
          };
      }

      // Set column widths for better appearance
      ws["!cols"] = Array(totalCols).fill({ wch: 18 });

      XLSX.utils.book_append_sheet(wb, ws, `Class_${classIdx + 1}`);
    });

    // Add pending students sheet if any
    if (pending.length > 0) {
      const pendingRows = [
        ["Roll No", "Name", "Department", "Subject", "Gender"],
        ...pending.map(stu => [
          stu.row[0],
          stu.row[1],
          stu.row[2],
          stu.row[3],
          stu.row[4],
        ]),
      ];
      const wsPending = XLSX.utils.aoa_to_sheet(pendingRows);
      XLSX.utils.book_append_sheet(wb, wsPending, "Pending_Students");
    }

    XLSX.writeFile(wb, "exam_seating_plan.xlsx");
  };

  // Render
  return (
    <div
      style={{
        width: "100vw",
        minHeight: "100vh",
        background: "#f4f7fa",
        padding: 0,
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          width: "100%",
          padding: "24px 0 0 0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        <h2 style={{ color: "#1976d2", marginLeft: 40, fontWeight: 700, letterSpacing: 1 }}>
          Exam Hall Seating Plan
        </h2>
        <div style={{ marginRight: 40 }}>
          <button
            onClick={onBack}
            style={{
              background: "#fff",
              color: "#1976d2",
              border: "1.5px solid #1976d2",
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 600,
              marginRight: 10,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #1976d220",
              transition: "background 0.2s",
            }}
          >
            Back
          </button>
          <button
            style={{
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 22px",
              fontWeight: 600,
              fontSize: 16,
              cursor: "pointer",
              boxShadow: "0 2px 8px #1976d220",
              transition: "background 0.2s",
            }}
            onClick={handleDownload}
          >
            Download Plan
          </button>
        </div>
      </div>
      <div style={{ margin: "0 40px 18px 40px", color: "#1976d2", fontWeight: 500, fontSize: 18 }}>
        Seating Order: {seatingOrder}
        {classes > 1 && (
          <span style={{ color: "#1976d2", marginLeft: 16, fontWeight: 400, fontSize: 16 }}>
            (Showing {classes} classes/halls)
          </span>
        )}
      </div>
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 30,
              borderRadius: 12,
              minWidth: 320,
              boxShadow: "0 4px 24px #0002",
            }}
          >
            <p
              style={{
                fontWeight: 600,
                fontSize: 20,
                marginBottom: 24,
                color: "#1976d2",
              }}
            >
              Are you sure you want to download the hall plan?
            </p>
            <button
              onClick={confirmDownload}
              style={{
                background: "#1976d2",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "10px 22px",
                fontWeight: 600,
                marginRight: 10,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              Yes
            </button>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                background: "#fff",
                color: "#1976d2",
                border: "1.5px solid #1976d2",
                borderRadius: 6,
                padding: "10px 22px",
                fontWeight: 600,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
      {/* Table Layout for each class */}
      <div
        style={{
          margin: "0 auto",
          width: "100%",
          maxWidth: 1200,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 36,
          paddingBottom: 36,
        }}
      >
        {plans.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              fontSize: 20,
              margin: 40,
            }}
          >
            No data to display.
          </div>
        ) : (
          plans.map((plan, classIdx) => (
            <div
              key={classIdx}
              style={{
                background: "#fff",
                borderRadius: 16,
                boxShadow: "0 2px 16px #1976d220",
                padding: "32px 24px 24px 24px",
                marginTop: 24,
              }}
            >
              <h3 style={{ color: "#1976d2", margin: "0 0 18px 0", fontWeight: 700, fontSize: 22 }}>
                Class {classIdx + 1}
              </h3>
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    borderCollapse: "collapse",
                    width: "100%",
                    background: "#fafdff",
                    borderRadius: 10,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px #1976d210",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        rowSpan={2}
                        style={{
                          background: "#1976d2",
                          color: "#fff",
                          padding: "16px 12px",
                          minWidth: 60,
                          minHeight: 60,
                          fontSize: 18,
                          verticalAlign: "middle",
                          border: "none",
                        }}
                      ></th>
                      {Array.from({ length: tablesPerRow }).map((_, tIdx) => (
                        <th
                          key={tIdx}
                          colSpan={studentsPerTable}
                          style={{
                            background: "#1976d2",
                            color: "#fff",
                            padding: "16px 12px",
                            border: "none",
                            fontWeight: 700,
                            textAlign: "center",
                            minWidth: 120,
                            minHeight: 60,
                            fontSize: 18,
                            verticalAlign: "middle",
                          }}
                        >
                          {getColumnLetter(tIdx)}
                        </th>
                      ))}
                    </tr>
                    <tr>
                      {Array.from({ length: tablesPerRow }).map((_, tIdx) =>
                        Array.from({ length: studentsPerTable }).map((_, sIdx) => (
                          <th
                            key={tIdx + "-" + sIdx}
                            style={{
                              background: "#1976d2",
                              color: "#fff",
                              padding: "10px 8px",
                              border: "none",
                              fontWeight: 500,
                              textAlign: "center",
                              fontSize: 15,
                              minWidth: 100,
                              minHeight: 40,
                              verticalAlign: "middle",
                            }}
                          >
                            {studentsPerTable === 1
                              ? "Seat"
                              : studentsPerTable === 2
                              ? sIdx === 0
                                ? "Left"
                                : "Right"
                              : studentsPerTable === 3
                              ? sIdx === 0
                                ? "Left"
                                : sIdx === 1
                                ? "Middle"
                                : "Right"
                              : `Seat ${sIdx + 1}`}
                          </th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {plan.map((row, rIdx) => (
                      <tr key={rIdx}>
                        <td
                          style={{
                            background: "#1976d2",
                            color: "#fff",
                            fontWeight: 600,
                            textAlign: "center",
                            padding: "10px 8px",
                            minWidth: 60,
                            minHeight: 40,
                            fontSize: 16,
                            verticalAlign: "middle",
                            border: "none",
                          }}
                        >
                          {rIdx + 1}
                        </td>
                        {row.map((table, tIdx) =>
                          table.map((student, sIdx) => (
                            <td
                              key={tIdx + "-" + sIdx}
                              style={{
                                padding: "10px 8px",
                                border: "1px solid #e0e0e0",
                                background: student && student.row ? "#e3f2fd" : "#fafdff",
                                minWidth: 100,
                                minHeight: 40,
                                textAlign: "center",
                                fontSize: 16,
                                color: "#333",
                                verticalAlign: "middle",
                                borderRadius: 4,
                              }}
                            >
                              {student && student.row
                                ? (
                                    <>
                                      <div style={{ fontWeight: 600 }}>{student.row[0]}</div>
                                      <div style={{ fontSize: 13, color: "#1976d2" }}>{student.row[4]}</div>
                                      <div style={{ fontSize: 12 }}>{student.row[2]} | {student.row[3]}</div>
                                    </>
                                  )
                                : ""}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
        {/* Pending Students Table */}
        {pending.length > 0 && (
          <div
            style={{
              margin: "32px auto",
              maxWidth: 900,
              background: "#fff5f5",
              borderRadius: 14,
              boxShadow: "0 2px 12px #d32f2f22",
              padding: "24px 18px",
            }}
          >
            <h3 style={{ color: "#d32f2f", marginBottom: 16, fontWeight: 700 }}>
              Pending Students (Not Seated)
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{
                borderCollapse: "collapse",
                width: "100%",
                background: "#fff",
                borderRadius: 8,
                overflow: "hidden",
                boxShadow: "0 1px 4px #0001"
              }}>
                <thead>
                  <tr>
                    <th style={{ background: "#d32f2f", color: "#fff", padding: "8px 12px" }}>Roll No</th>
                    <th style={{ background: "#d32f2f", color: "#fff", padding: "8px 12px" }}>Name</th>
                    <th style={{ background: "#d32f2f", color: "#fff", padding: "8px 12px" }}>Department</th>
                    <th style={{ background: "#d32f2f", color: "#fff", padding: "8px 12px" }}>Subject</th>
                    <th style={{ background: "#d32f2f", color: "#fff", padding: "8px 12px" }}>Gender</th>
                  </tr>
                </thead>
                <tbody>
                  {pending.map((stu, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: "8px 12px" }}>{stu.row[0]}</td>
                      <td style={{ padding: "8px 12px" }}>{stu.row[1]}</td>
                      <td style={{ padding: "8px 12px" }}>{stu.row[2]}</td>
                      <td style={{ padding: "8px 12px" }}>{stu.row[3]}</td>
                      <td style={{ padding: "8px 12px" }}>{stu.row[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 8, color: "#d32f2f", fontWeight: 600, fontSize: 16 }}>
              Total Pending: {pending.length}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPage;