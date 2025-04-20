// src/App.jsx
import React, { useState } from "react";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

export default function App() {
  const [teamAInput, setTeamAInput] = useState("");
  const [teamBInput, setTeamBInput] = useState("");
  const [fixedPlayers, setFixedPlayers] = useState([]);
  const [cvcOptions, setCvcOptions] = useState("");
  const [combinationsCount, setCombinationsCount] = useState(5);
  const [combinations, setCombinations] = useState([]);

  const handleGenerate = () => {
    const teamA = teamAInput.split(",").map((p) => p.trim());
    const teamB = teamBInput.split(",").map((p) => p.trim());
    const fullPool = [...teamA, ...teamB];
    const possibleCVC = cvcOptions.split(",").map((p) => p.trim()).filter(Boolean);

    let teams = [];
    for (let i = 0; i < combinationsCount; i++) {
      // Create a copy of the full pool and remove fixed players
      const availablePlayers = fullPool.filter(player => !fixedPlayers.includes(player));
      
      // Shuffle the available players
      const shuffled = [...availablePlayers].sort(() => 0.5 - Math.random());
      
      // Pick remaining players needed (11 - fixedPlayers.length)
      const picked = shuffled.slice(0, 11 - fixedPlayers.length);
      
      // Combine fixed players with picked players and ensure uniqueness
      const team = [...new Set([...fixedPlayers, ...picked])];

      // Select captain and vice-captain from possible C/VC options
      const validCVC = team.filter((p) => possibleCVC.includes(p));
      const captain = validCVC.length ? validCVC[Math.floor(Math.random() * validCVC.length)] : team[0];
      
      // Ensure vice-captain is different from captain
      let viceCaptain;
      do {
        viceCaptain = validCVC.length > 1 ? validCVC[Math.floor(Math.random() * validCVC.length)] : team[1];
      } while (viceCaptain === captain);

      teams.push({ team, captain, viceCaptain });
    }

    setCombinations(teams);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 10;
    const teamSpacing = 80; // vertical spacing between rows

    combinations.forEach((combo, idx) => {
      const x = idx % 2 === 0 ? margin : pageWidth / 2 + margin;
      const y = margin + Math.floor(idx / 2) * teamSpacing;

      doc.text(`Team ${idx + 1}:`, x, y);
      combo.team.forEach((player, i) => {
        doc.text(
          `${player} ${player === combo.captain ? "(C)" : ""} ${player === combo.viceCaptain ? "(VC)" : ""}`,
          x,
          y + 10 + i * 6
        );
      });
    });
    doc.save("dream11-teams.pdf");
  };

  const handleDownloadExcel = () => {
    const rows = combinations.map((combo, idx) => {
      const obj = { Team: `Team ${idx + 1}` };
      combo.team.forEach((player, i) => {
        obj[`Player ${i + 1}`] = `${player}${player === combo.captain ? " (C)" : ""}${player === combo.viceCaptain ? " (VC)" : ""}`;
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dream11 Teams");
    XLSX.writeFile(wb, "dream11-teams.xlsx");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6">
      <div className="max-w-screen-xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          Dream11 Team Generator
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <label className="block text-lg font-semibold text-blue-400 mb-2">Team A Squad:</label>
            <textarea
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={5}
              value={teamAInput}
              onChange={(e) => setTeamAInput(e.target.value)}
              placeholder="Player1, Player2, ..."
            />
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <label className="block text-lg font-semibold text-purple-400 mb-2">Team B Squad:</label>
            <textarea
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={5}
              value={teamBInput}
              onChange={(e) => setTeamBInput(e.target.value)}
              placeholder="Player1, Player2, ..."
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <label className="block text-lg font-semibold text-green-400 mb-2">Fixed Players:</label>
            <input
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              value={fixedPlayers.join(", ")}
              onChange={(e) => setFixedPlayers(e.target.value.split(",").map(p => p.trim()))}
              placeholder="Sanju Samson, Virat Kohli"
            />
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <label className="block text-lg font-semibold text-yellow-400 mb-2">C/VC Options:</label>
            <input
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              value={cvcOptions}
              onChange={(e) => setCvcOptions(e.target.value)}
              placeholder="Player1, Player2, ..."
            />
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg">
            <label className="block text-lg font-semibold text-pink-400 mb-2">Number of Teams:</label>
            <input
              type="number"
              className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={combinationsCount}
              onChange={(e) => setCombinationsCount(parseInt(e.target.value))}
              min="1"
              placeholder="Enter number of teams"
            />
          </div>
        </div>

        <div className="flex justify-center space-x-4">
          <button
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            onClick={handleGenerate}
          >
            Generate Teams
          </button>
          {combinations.length > 0 && (
            <>
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={handleDownloadPDF}
              >
                Download PDF
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
                onClick={handleDownloadExcel}
              >
                Download Excel
              </button>
            </>
          )}
        </div>

        {combinations.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
              Generated Teams
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {combinations.map((combo, idx) => (
                <div key={idx} className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 shadow-lg transform hover:scale-105 transition-all duration-200">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">Team {idx + 1}</h3>
                  <ul className="space-y-2">
                    {combo.team.map((player, i) => (
                      <li key={i} className="flex items-center space-x-2">
                        <span className="text-gray-400">{i + 1}.</span>
                        <span className="text-white">{player}</span>
                        {player === combo.captain && (
                          <span className="px-2 py-1 text-xs font-bold bg-blue-500 text-white rounded">C</span>
                        )}
                        {player === combo.viceCaptain && (
                          <span className="px-2 py-1 text-xs font-bold bg-purple-500 text-white rounded">VC</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
