import React, { useState, useEffect } from "react";

const TableWithSearch = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ ci: "", cn: "", email: "", expiry: "", days: "", status: "" });

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((jsonData) => {
        console.log("Fetched Data:", jsonData); // Display fetched data in console
        setData(jsonData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFilterChange = (e, key) => {
    setFilters({ ...filters, [key]: e.target.value });
  };

  const filteredData = data.filter((item) =>
    Object.keys(filters).every((key) =>
      item[key]?.toString().toLowerCase().includes(filters[key].toLowerCase())
    )
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Expiry Report</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            {Object.keys(filters).map((key) => (
              <th key={key} className="border p-2">
                <input
                  type="text"
                  placeholder={`Search ${key}`}
                  value={filters[key]}
                  onChange={(e) => handleFilterChange(e, key)}
                  className="border p-1 w-full"
                />
              </th>
            ))}
          </tr>
          <tr>
            <th className="border p-2">CI</th>
            <th className="border p-2">Common Name (CN)</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Expiry Date</th>
            <th className="border p-2">Days</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index} className="border">
              <td className="border p-2">{item.ci}</td>
              <td className="border p-2">{item.cn}</td>
              <td className="border p-2">{item.email}</td>
              <td className="border p-2">{item.expiry}</td>
              <td className="border p-2">{item.days}</td>
              <td className="border p-2">
                <img src={item.badge} alt={item.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableWithSearch;
