import React, { useState } from "react";
import API from "../api/api";

const DataUpload = ({ setResult }) => {

  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const response = await API.post("/upload-dataset", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);

    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border border-gray-700 rounded-lg bg-black/40 backdrop-blur-md">

      <h2 className="text-xl text-white mb-4">
        Upload Dataset
      </h2>

      <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="text-white"
      />

      {loading && (
        <p className="text-blue-400 mt-2">
          Processing dataset...
        </p>
      )}

    </div>
  );
};

export default DataUpload;