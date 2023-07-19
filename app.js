const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running");
    });
  } catch (e) {
    console.log(`Error found:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const query = `SELECT * FROM cricket_team;`;
  const arr = await db.all(query);
  response.send(
    arr.map((eachPlayer) => convertDbObjectToResponseObject(eachPlayer))
  );
});

app.post("/players/", async (request, response) => {
  try {
    const details = request.body;
    const { playerName, jerseyNumber, role } = details;
    const addPlayer = `INSERT INTO cricket_team(player_name,jersey_number,role)
     VALUES(${"playerName"},${jerseyNumber},${"role"});`;
    const dbResponse = await db.run(addPlayer);
    response.send("Player Added to Team");
  } catch (e) {
    console.log(`Error found:${e.message}`);
  }
});

app.get(`/players/:playerId/`, async (request, response) => {
  try {
    const { playerId } = request.params;
    const query = `SELECT * FROM cricket_team WHERE player_id=${playerId};`;
    const dbResponse = await db.get(query);
    response.send(convertDbObjectToResponseObject(dbResponse));
  } catch (e) {
    console.log(`Error found:${e.message}`);
  }
});

app.put(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const details = request.body;
  const { playerName, jerseyNumber, role } = details;
  const query = `UPDATE cricket_team SET 
player_name='${playerName}',
jersey_number='${jerseyNumber}',
role='${role}' WHERE player_id=${playerId}; `;
  await db.run(query);
  response.send("Player Details Updated");
});

app.delete(`/players/:playerId/`, async (request, response) => {
  const { playerId } = request.params;
  const query = `DELETE FROM cricket_team WHERE player_id=${playerId};`;
  await db.run(query);
  response.send("Player Removed");
});

module.exports = app;
