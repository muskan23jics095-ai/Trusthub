import React, { useEffect, useState } from "react";
import axios from "axios";

export default function MyAssetsPage({ userId }) {
  const [assets, setAssets] = useState([]);

  useEffect(() => {
    const fetchAssets = async () => {
      const res = await axios.get(`http://localhost:5000/api/request/buyer/${userId}`);
      setAssets(res.data);
    };
    fetchAssets();
  }, [userId]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Assets</h2>
      {assets.length === 0 ? <p>No purchased assets yet.</p> : (
        assets.map((item) => (
          <div key={item._id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
            <h4>{item.listingId.title}</h4>
            <p>Status: {item.status}</p>
            <button>Make Agreement</button>
            <button>Register Complaint</button>
            <button>Read Rules & Regulations</button>
          </div>
        ))
      )}
    </div>
  );
}
