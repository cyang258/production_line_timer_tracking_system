import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const FinalSubmissionPage = () => {
  const [totalParts, setTotalParts] = useState("");
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/timer"); // back to Page 2
  };

  const handleSubmit = () => {
    if (!totalParts || totalParts <= 0) {
      alert("Please enter a valid total parts number");
      return;
    }

    // TODO: save session data to the database here
    console.log("Saving session:", { totalParts });

    navigate("/"); // redirect to Page 1
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 40%, #a18cd1 60%, #84fab0 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.2)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderRadius: "1.5rem",
          padding: "2rem",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
          color: "#fff",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "0.5rem", fontSize: "1.8rem" }}>
          Enter Total Parts
        </h2>
        <p
          style={{ fontSize: "0.95rem", marginBottom: "1.5rem", opacity: 0.85 }}
        >
          Please enter the total number of parts before submitting your session.
        </p>

        <input
          type="number"
          value={totalParts}
          onChange={(e) => setTotalParts(e.target.value)}
          placeholder="e.g. 150"
          style={{
            width: "100%",
            padding: "0.75rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            border: "none",
            outline: "none",
            marginBottom: "2rem",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          }}
        />

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button
            onClick={handleBack}
            style={{
              padding: "0.75rem 1.5rem",
              background: "transparent",
              border: "2px solid white",
              borderRadius: "0.5rem",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.1)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "0.75rem 1.5rem",
              background: "white",
              color: "#333",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinalSubmissionPage;
