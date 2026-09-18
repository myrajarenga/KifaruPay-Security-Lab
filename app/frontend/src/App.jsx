import { useEffect, useState } from "react";

function App() {
  const [apiStatus, setApiStatus] = useState("Checking API...");

  useEffect(() => {
    fetch("http://localhost:5000/api/health")
      .then((response) => response.json())
      .then((data) => {
        setApiStatus(data.status);
      })
      .catch(() => {
        setApiStatus("API unavailable");
      });
  }, []);

  return (
    <div>
      <h1>KifaruPay</h1>
      <p>FinTech Security Assessment Lab</p>

      <h2>System Status</h2>
      <p>API: {apiStatus}</p>
    </div>
  );
}

export default App;