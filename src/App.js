import React, { useState } from "react";
import UserInputPage from "./UserInputPage";
import OutputPage from "./OutputPage";

function App() {
  const [page, setPage] = useState("input");
  const [excelData, setExcelData] = useState([]);
  const [config, setConfig] = useState({});

  return (
    <div>
      {page === "input" && (
        <UserInputPage
          onGenerate={(data, config) => {
            setExcelData(data);
            setConfig(config);
            setPage("output");
          }}
        />
      )}
      {page === "output" && (
        <OutputPage
          excelData={excelData}
          config={config}
          onBack={() => setPage("input")}
        />
      )}
    </div>
  );
}

export default App;