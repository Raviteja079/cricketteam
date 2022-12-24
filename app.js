const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

const express = require("express");

const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
let db = null;
const initializeDBANdServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBANdServer();

app.get("/players/", async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team ORDER BY player_id`;
  const players = await db.all(getPlayers);

  let DBobjects_array = [];
  for (let object of players) {
    const DBobject = convertDbObjectToResponseObject(object);
    DBobjects_array.push(DBobject);
  }
  response.send(DBobjects_array);
});

//get player

app.get("/players/:Id/", async (request, response) => {
  const { Id } = request.params;
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${Id};`;
  const player = await db.get(getPlayerQuery);
  response.send(convertDbObjectToResponseObject(player));
});

//add using post player

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `
  
    INSERT INTO 

       cricket_team(player_id, player_name, jersey_number, role)
    VALUES
    (
    ${14},
    '${playerName}',
    ${jerseyNumber},
    '${role}'
    );`;

  const addPlayerResponse = await db.run(addPlayerQuery);
  response.send("Player Added to Team");
});

// update player
app.put("players/:Id", async (request, response) => {
  const { Id } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayerQuery = `
        UPDATE 
           cricket_team
        SET 
            player_id = ${Id},
           
        WHERE 
           player_id = ${Id};`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//delete player
app.delete("/players/:Id/", async (request, response) => {
  const { Id } = request.params;
  const deletePlayerQuery = `
    DELETE FROM 
     cricket_team
    WHERE
    player_id = ${Id};`;

  const updateQueryAfterDelete = `
   UPDATE cricket_team
   SET 
      player_id = ${Id},
      player_name = '${playerName}',
      jersey_number = '${jerseyNumber},
      role = '${role}';`;

  await db.run(deletePlayerQuery);
  response.send("Player Removed");
  await db.run(updateQueryAfterDelete);
});

module.exports = app;
