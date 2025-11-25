import React, { useEffect, useState } from "react";
import axios from "axios";

export default function SellerRequestsPage({ userId }) {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchRequests = async () => {
      const res = await axios.get(`http://localhost:5000/api/request/seller/${userId}`);
      setRequests(res.data);
    };
    fetchRequests();
  }, [userId]);

  const handleApprove = async (id) => {
    await axios.put(`http://localhost:5000/api/request/${id}/approve`);
    setRequests(requests.filter((req) => req._id !== id));
  };

  const handleReject = async (id) => {
    await axios.put(`http://localhost:5000/api/request/${id}/reject`);
    setRequests(requests.filter((req) => req._id !== id));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Pending Purchase Requests</h2>
      {requests.length === 0 ? <p>No requests yet.</p> : (
        requests.map((req) => (
          <div key={req._id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
            <h4>{req.listingId.title}</h4>
            <p>Requested by: {req.buyerId?.name || "Unknown"}</p>
            <p>Status: {req.status}</p>
            {req.status === "pending" && (
              <>
                <button onClick={() => handleApprove(req._id)}>Approve</button>
                <button onClick={() => handleReject(req._id)}>Reject</button>
              </>
            )}
          </div>
        ))
      )}
    </div>
  );
}
