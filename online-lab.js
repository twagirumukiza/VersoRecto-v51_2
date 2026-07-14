
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyDHCtGz7_LqL4k-SCF9o-tIo6H-c1lSjXc",
  authDomain: "verso-recto-62d43.firebaseapp.com",
  databaseURL: "https://verso-recto-62d43-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "verso-recto-62d43",
  storageBucket: "verso-recto-62d43.firebasestorage.app",
  messagingSenderId: "232581591036",
  appId: "1:232581591036:web:54ee0d5c972f64d9378c79"
};

const MOVES_TEXT = "1A → 1B, 2A, 1D\n1B → 1C, 1A, 2B, 2C\n1C → 1D, 1B, 2B, 2C, 2E, 1F\n1D → 1E, 1C, 2D, 2F, 1A\n1E → 1F, 1D, 2E, 2C, 1H\n1F → 1G, 1E, 2F, 2G, 2D, 1C\n1G → 1H, 1F, 2F, 2G, 2I, 1J\n1H → 1I, 1G, 2H, 2J, 1E\n1I → 1J, 1H, 2I, 2G, 1L\n1J → 1K, 1I, 2J, 2K, 2H, 1G\n1K → 1L, 1J, 2J, 2K\n1L → 1K, 2L, 1I\n2A → 2B, 1A, 3A, 3C, 2D\n2B → 2C, 1B, 1C, 2A, 3B, 3D\n2C → 2D, 1C, 1E, 2B, 3C, 1B, 3A, 2F\n2D → 2E, 1D, 1F, 2C, 3D, 3E, 3B, 2A\n2E → 2F, 1E, 1C, 2D, 3D, 3E, 3G, 2H\n2F → 2G, 1F, 1G, 1D, 2E, 3F, 3H, 2C\n2G → 2H, 1G, 1I, 2F, 3G, 1F, 3E, 2J\n2H → 2I, 1H, 1J, 2G, 3H, 3I, 3F, 2E\n2I → 2J, 1I, 1G, 2H, 3H, 3I, 3K, 2L\n2J → 2K, 1J, 1K, 1H, 2I, 3J, 3L, 2G\n2K → 2L, 1K, 2J, 3K, 1J, 3I\n2L → 1L, 2K, 3L, 3J, 2I\n3A → 3B, 2A, 2C, 4A, 3D\n3B → 3C, 2B, 2D, 3A, 4B, 4C\n3C → 3D, 2C, 2A, 3B, 4B, 4C, 4E, 3F\n3D → 3E, 2D, 2E, 2B, 3C, 4D, 4F, 3A\n3E → 3F, 2E, 2G, 3D, 4E, 2D, 4C, 3H\n3F → 3G, 2F, 2H, 3E, 4F, 4G, 4D, 3C\n3G → 3H, 2G, 2E, 3F, 4F, 4G, 4I, 3J\n3H → 3I, 2H, 2I, 2F, 3G, 4H, 4J, 3E\n3I → 3J, 2I, 2K, 3H, 4I, 2H, 4G, 3L\n3J → 3K, 2J, 2L, 3I, 4J, 4K, 4H, 3G\n3K → 3L, 2K, 2I, 3J, 4J, 4K\n3L → 2L, 2J, 3K, 4L, 3I\n4A → 4B, 3A, 5A, 5C, 4D\n4B → 4C, 3B, 3C, 4A, 5B, 5D\n4C → 4D, 3C, 3E, 4B, 5C, 3B, 5A, 4F\n4D → 4E, 3D, 3F, 4C, 5D, 5E, 5B, 4A\n4E → 4F, 3E, 3C, 4D, 5D, 5E, 5G, 4H\n4F → 4G, 3F, 3G, 3D, 4E, 5F, 5H, 4C\n4G → 4H, 3G, 3I, 4F, 5G, 3F, 5E, 4J\n4H → 4I, 3H, 3J, 4G, 5H, 5I, 5F, 4E\n4I → 4J, 3I, 3G, 4H, 5H, 5I, 5K, 4L\n4J → 4K, 3J, 3K, 3H, 4I, 5J, 5L, 4G\n4K → 4L, 3K, 4J, 5K, 3J, 5I\n4L → 3L, 4K, 5L, 5J, 4I\n5A → 5B, 4A, 4C, 6A, 5D\n5B → 5C, 4B, 4D, 5A, 6B, 6C\n5C → 5D, 4C, 4A, 5B, 6B, 6C, 6E, 5F\n5D → 5E, 4D, 4E, 4B, 5C, 6D, 6F, 5A\n5E → 5F, 4E, 4G, 5D, 6E, 4D, 6C, 5H\n5F → 5G, 4F, 4H, 5E, 6F, 6G, 6D, 5C\n5G → 5H, 4G, 4E, 5F, 6F, 6G, 6I, 5J\n5H → 5I, 4H, 4I, 4F, 5G, 6H, 6J, 5E\n5I → 5J, 4I, 4K, 5H, 6I, 4H, 6G, 5L\n5J → 5K, 4J, 4L, 5I, 6J, 6K, 6H, 5G\n5K → 5L, 4K, 4I, 5J, 6J, 6K\n5L → 4L, 4J, 5K, 6L, 5I\n6A → 6B, 5A, 6D\n6B → 6C, 5B, 5C, 6A\n6C → 6D, 5C, 5E, 6B, 5B, 6F\n6D → 6E, 5D, 5F, 6C, 6A\n6E → 6F, 5E, 5C, 6D, 6H\n6F → 6G, 5F, 5G, 5D, 6E, 6C\n6G → 6H, 5G, 5I, 6F, 5F, 6J\n6H → 6I, 5H, 5J, 6G, 6E\n6I → 6J, 5I, 5G, 6H, 6L\n6J → 6K, 5J, 5K, 5H, 6I, 6G\n6K → 6L, 5K, 6J, 5J\n6L → 5L, 6K, 6I";

const LETTERS = "ABCDEFGHIJKL".split("");
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char]));
}
const CELL_IDS = Array.from({ length: 6 }, (_, r) => LETTERS.map(l => `${r + 1}${l}`)).flat();
const COLOR_KEYS = ["yellow", "red", "blue", "black"];
const COLORS = {
  yellow: { label: "Jaune", css: "#f4c430" },
  red: { label: "Rouge", css: "#d94b3d" },
  blue: { label: "Bleu", css: "#2f71d0" },
  black: { label: "Noir", css: "#2d2a26" },
};

const INITIAL_POSITIONS = {
  yellow: ["1B", "1F", "1J", "3F", "5B", "5F", "5J"],
  red: ["1C", "1G", "1K", "3G", "5C", "5G", "5K"],
  blue: ["2B", "2F", "2J", "4F", "6B", "6F", "6J"],
  black: ["2C", "2G", "2K", "4G", "6C", "6G", "6K"],
};

const els = {
  board: document.getElementById("board"),
  playerName: document.getElementById("playerName"),
  createGame: document.getElementById("createGame"),
  joinGame: document.getElementById("joinGame"),
  leaveGame: document.getElementById("leaveGame"),
  joinCode: document.getElementById("joinCode"),
  createdCode: document.getElementById("createdCode"),
  onlineStatus: document.getElementById("onlineStatus"),
  gameStatus: document.getElementById("gameStatus"),
  copyCode: document.getElementById("copyCode"),
  resetSelection: document.getElementById("resetSelection"),
  roomInfo: document.getElementById("roomInfo"),
  turnInfo: document.getElementById("turnInfo"),
  rankingList: document.getElementById("rankingList"),
  moveHistory: document.getElementById("moveHistory"),
};

let db = null;
let currentRef = null;
let roomCode = null;
let playerId = null;
let selectedPieceId = null;
let legalDestinations = [];
let gameState = emptyGame();

function emptyGame() {
  return {
    status: "idle",
    players: [],
    pieces: createPieces([]),
    turnOrder: [],
    currentTurnIndex: 0,
    ranking: [],
    history: [],
    winner: null,
  };
}

function initFirebase() {
  if (db) return db;
  if (typeof firebase === "undefined") {
    setOnlineStatus("Firebase n’est pas chargé. Recharge la page avec internet.");
    return null;
  }
  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.database();
    setOnlineStatus("Firebase connecté.");
    return db;
  } catch (error) {
    if (firebase.apps?.length) {
      db = firebase.database();
      return db;
    }
    console.error(error);
    setOnlineStatus("Erreur Firebase : connexion impossible.");
    return null;
  }
}

function setOnlineStatus(text) {
  els.onlineStatus.textContent = text;
}

function setGameStatus(text) {
  els.gameStatus.textContent = text;
}

function showCode(code) {
  els.createdCode.hidden = !code;
  els.createdCode.querySelector("strong").textContent = code || "—";
  els.copyCode.disabled = !code;
}

function generateCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "VR-";
  for (let i = 0; i < 4; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)];
  return code;
}

function normalizeCode(raw) {
  const txt = (raw || "").trim().toUpperCase();
  return txt.startsWith("VR-") ? txt : `VR-${txt}`;
}

function refFor(code) {
  const database = initFirebase();
  return database ? database.ref(`onlineLabGames/${code}`) : null;
}

function createPieces(players) {
  const controlled = new Set(players.map(p => p.color));
  const pieces = [];
  for (const color of COLOR_KEYS) {
    INITIAL_POSITIONS[color].forEach((position, index) => {
      pieces.push({
        id: `${color}-${index + 1}`,
        color,
        position,
        face: "VERSO",
        isNeutral: !controlled.has(color),
      });
    });
  }
  return pieces;
}

function parseMoves(text) {
  const map = {};
  text.split(/\n+/).forEach(line => {
    const clean = line.trim();
    if (!clean || !clean.includes("→")) return;
    const [from, rest] = clean.split("→").map(part => part.trim());
    map[from] = rest.split(",").map(x => x.trim()).filter(Boolean);
  });
  return map;
}

const MOVES = parseMoves(MOVES_TEXT);

function squareDiag(squareCol, rowIndex) {
  return squareCol % 2 === rowIndex % 2 ? "/" : "\\";
}

function trianglePolygonsForSquare(squareCol, rowIndex) {
  const x = squareCol * 100;
  const y = rowIndex * 100;
  const w = 100;
  const h = 100;

  if (squareDiag(squareCol, rowIndex) === "/") {
    return [
      [{ x, y }, { x: x + w, y }, { x, y: y + h }],
      [{ x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }],
    ];
  }

  return [
    [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }],
    [{ x, y }, { x, y: y + h }, { x: x + w, y: y + h }],
  ];
}

function centroid(poly) {
  return {
    x: poly.reduce((sum, p) => sum + p.x, 0) / poly.length,
    y: poly.reduce((sum, p) => sum + p.y, 0) / poly.length,
  };
}

function buildCellPolygons() {
  const map = {};
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 6; c++) {
      trianglePolygonsForSquare(c, r).forEach(poly => row.push({ poly, centroid: centroid(poly) }));
    }
    row.sort((a, b) => a.centroid.x - b.centroid.x);
    row.forEach((item, i) => map[`${r + 1}${LETTERS[i]}`] = item.poly);
  }
  return map;
}

const CELL_POLYGONS = buildCellPolygons();
const CENTROIDS = Object.fromEntries(CELL_IDS.map(id => [id, centroid(CELL_POLYGONS[id])]));
const ADJACENCY = buildAdjacency();

function buildAdjacency() {
  const map = {};
  for (const a of CELL_IDS) {
    map[a] = CELL_IDS.filter(b => a !== b && sharedVertices(CELL_POLYGONS[a], CELL_POLYGONS[b]) >= 2);
  }
  return map;
}

function sharedVertices(a, b) {
  let count = 0;
  for (const p of a) {
    if (b.some(q => Math.abs(q.x - p.x) < 0.001 && Math.abs(q.y - p.y) < 0.001)) count++;
  }
  return count;
}

function points(poly) {
  return poly.map(p => `${p.x},${p.y}`).join(" ");
}

function activePlayer() {
  if (gameState.status !== "playing") return null;
  const id = gameState.turnOrder[gameState.currentTurnIndex];
  return gameState.players.find(p => p.id === id) || null;
}

function myPlayer() {
  return gameState.players.find(p => p.id === playerId) || null;
}

function pieceAt(cell) {
  return gameState.pieces.find(p => p.position === cell);
}

function legalMoves(piece) {
  if (!piece || piece.isNeutral) return [];
  return (MOVES[piece.position] || []).filter(to => !pieceAt(to));
}

function isMyTurn() {
  return activePlayer()?.id === playerId;
}

function selectPiece(id) {
  if (gameState.status !== "playing" || !isMyTurn()) return;
  const piece = gameState.pieces.find(p => p.id === id);
  const me = myPlayer();
  if (!piece || !me || piece.color !== me.color) return;

  selectedPieceId = id;
  legalDestinations = legalMoves(piece);
  render();
}

function moveSelected(to) {
  if (!selectedPieceId || !legalDestinations.includes(to) || !isMyTurn()) return;
  const piece = gameState.pieces.find(p => p.id === selectedPieceId);
  const player = activePlayer();
  const from = piece.position;

  piece.position = to;
  piece.face = piece.face === "RECTO" ? "VERSO" : "RECTO";

  gameState.history.unshift(`${player.name} : ${piece.id} ${from} → ${to}`);
  selectedPieceId = null;
  legalDestinations = [];

  if (checkVictory(player)) {
    gameState.status = "finished";
    gameState.winner = player.id;
    gameState.ranking = [{ playerId: player.id, playerName: player.name, color: player.color }];
    gameState.history.unshift(`${player.name} gagne la partie.`);
  } else {
    gameState.currentTurnIndex = (gameState.currentTurnIndex + 1) % gameState.turnOrder.length;
  }

  syncState();
  render();
}

function checkVictory(player) {
  const pieces = gameState.pieces.filter(p => p.color === player.color);
  if (pieces.length !== 7) return false;
  const face = pieces[0].face;
  if (!pieces.every(p => p.face === face)) return false;

  const positions = new Set(pieces.map(p => p.position));
  const visited = new Set([pieces[0].position]);
  const stack = [pieces[0].position];

  while (stack.length) {
    const current = stack.pop();
    for (const next of ADJACENCY[current] || []) {
      if (positions.has(next) && !visited.has(next)) {
        visited.add(next);
        stack.push(next);
      }
    }
  }

  return visited.size === pieces.length;
}

function detachRoom() {
  if (currentRef) {
    currentRef.off();
    currentRef = null;
  }
}

async function createGame() {
  const database = initFirebase();
  if (!database) return;

  leaveGame(false);

  const code = generateCode();
  const name = (els.playerName.value || "Joueur 1").trim() || "Joueur 1";
  const players = [{ id: "P1", name, color: "yellow" }];

  const room = {
    status: "waiting",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    players,
    state: {
      ...emptyGame(),
      status: "waiting",
      players,
      pieces: createPieces(players),
      history: [`Partie ${code} créée. En attente du joueur 2.`],
    },
  };

  roomCode = code;
  playerId = "P1";
  currentRef = database.ref(`onlineLabGames/${code}`);

  try {
    await currentRef.set(room);
    showCode(code);
    els.joinCode.value = code;
    setOnlineStatus(`Code de partie : ${code}. Partage-le avec le joueur 2.`);
    listenRoom(code);
  } catch (error) {
    console.error(error);
    setOnlineStatus("Impossible de créer la partie. Vérifie les règles Firebase.");
  }
}

async function joinGame() {
  const database = initFirebase();
  if (!database) return;

  const code = normalizeCode(els.joinCode.value);
  if (!/^VR-[A-Z0-9]{4}$/.test(code)) {
    setOnlineStatus("Code invalide. Exemple : VR-4821.");
    return;
  }

  leaveGame(false);

  const ref = database.ref(`onlineLabGames/${code}`);
  try {
    const snap = await ref.once("value");
    const room = snap.val();

    if (!room || room.status !== "waiting" || !room.players || room.players.length !== 1) {
      setOnlineStatus("Partie introuvable ou déjà commencée.");
      return;
    }

    const name = (els.playerName.value || "Joueur 2").trim() || "Joueur 2";
    const players = [room.players[0], { id: "P2", name, color: "red" }];
    const state = {
      status: "playing",
      players,
      pieces: createPieces(players),
      turnOrder: ["P1", "P2"],
      currentTurnIndex: 0,
      ranking: [],
      history: [`${name} a rejoint. Partie démarrée.`],
      winner: null,
    };

    roomCode = code;
    playerId = "P2";
    currentRef = ref;

    await ref.update({
      status: "playing",
      updatedAt: Date.now(),
      players,
      state,
    });

    showCode(code);
    listenRoom(code);
  } catch (error) {
    console.error(error);
    setOnlineStatus("Impossible de rejoindre la partie.");
  }
}

function listenRoom(code) {
  const ref = refFor(code);
  if (!ref) return;

  detachRoom();
  currentRef = ref;
  els.leaveGame.disabled = false;

  ref.on("value", snap => {
    const room = snap.val();
    if (!room || !room.state) {
      setOnlineStatus("Partie introuvable.");
      return;
    }
    gameState = room.state;
    setOnlineStatus(room.status === "waiting"
      ? `Code ${code} actif. En attente du joueur 2.`
      : `Connecté à ${code}. Tu es ${playerId === "P1" ? "Joueur 1 / jaune" : "Joueur 2 / rouge"}.`);
    render();
  });
}

async function syncState() {
  if (!currentRef || !roomCode) return;
  await currentRef.update({
    status: gameState.status === "waiting" ? "waiting" : (gameState.status === "finished" ? "finished" : "playing"),
    updatedAt: Date.now(),
    state: gameState,
  });
}

function leaveGame(reset = true) {
  detachRoom();
  if (reset) {
    roomCode = null;
    playerId = null;
    selectedPieceId = null;
    legalDestinations = [];
    gameState = emptyGame();
    showCode(null);
    els.leaveGame.disabled = true;
    setOnlineStatus("Déconnecté du labo en ligne.");
    render();
  }
}

function copyCode() {
  if (!roomCode) return;
  navigator.clipboard?.writeText(roomCode);
  setOnlineStatus(`Code copié : ${roomCode}`);
}

function render() {
  renderBoard();
  renderInfo();
}

function renderBoard() {
  els.board.innerHTML = "";

  for (const id of CELL_IDS) {
    const poly = CELL_POLYGONS[id];
    const cell = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    cell.setAttribute("points", points(poly));
    cell.setAttribute("class", `cell empty ${legalDestinations.includes(id) ? "legal remote-legal" : ""}`);
    if (legalDestinations.includes(id)) cell.addEventListener("click", () => moveSelected(id));
    els.board.appendChild(cell);

    const c = CENTROIDS[id];
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", c.x);
    label.setAttribute("y", c.y + 5);
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("class", "cell-label");
    label.textContent = id;
    els.board.appendChild(label);
  }

  for (const piece of gameState.pieces) {
    const poly = CELL_POLYGONS[piece.position];
    const p = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    p.setAttribute("points", points(poly));
    p.setAttribute("fill", piece.isNeutral ? "#cfcfcf" : COLORS[piece.color].css);
    p.setAttribute("class", `piece ${piece.isNeutral ? "neutral" : ""} ${selectedPieceId === piece.id ? "selected" : ""} ${isMyTurn() ? "my-turn" : ""}`);
    if (!piece.isNeutral) p.addEventListener("click", () => selectPiece(piece.id));
    els.board.appendChild(p);

    if (piece.face === "VERSO") {
      const c = CENTROIDS[piece.position];
      const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dot.setAttribute("cx", c.x);
      dot.setAttribute("cy", c.y);
      dot.setAttribute("r", 7);
      dot.setAttribute("class", "verso-dot");
      els.board.appendChild(dot);
    }
  }
}

function renderInfo() {
  const player = activePlayer();
  if (gameState.status === "idle") setGameStatus("Aucune partie en ligne.");
  else if (gameState.status === "waiting") setGameStatus(`Partie ${roomCode} créée. En attente du joueur 2.`);
  else if (gameState.status === "finished") setGameStatus(`Partie terminée. Victoire de ${gameState.ranking[0]?.playerName || "—"}.`);
  else if (player) setGameStatus(isMyTurn() ? "À toi de jouer." : `En attente de ${player.name}.`);

  els.roomInfo.innerHTML = roomCode
    ? `<strong>${roomCode}</strong><br>Tu es : ${playerId || "—"}`
    : "Aucune partie.";

  els.turnInfo.innerHTML = player
    ? `${escapeHtml(player.name)} — ${COLORS[player.color].label}`
    : "—";

  els.rankingList.innerHTML = gameState.ranking?.length
    ? gameState.ranking.map(r => `<li>${escapeHtml(r.playerName)} — ${COLORS[r.color].label}</li>`).join("")
    : '<li class="muted">Aucun gagnant pour l’instant.</li>';

  els.moveHistory.innerHTML = (gameState.history || []).slice(0, 20)
    .map(item => `<li>${escapeHtml(item)}</li>`)
    .join("");
}

els.createGame.addEventListener("click", createGame);
els.joinGame.addEventListener("click", joinGame);
els.leaveGame.addEventListener("click", () => leaveGame(true));
els.copyCode.addEventListener("click", copyCode);
els.resetSelection.addEventListener("click", () => {
  selectedPieceId = null;
  legalDestinations = [];
  render();
});

initFirebase();
render();
