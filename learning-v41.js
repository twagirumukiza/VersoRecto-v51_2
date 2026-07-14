
const MOVES_TEXT = "1A → 1B, 2A, 1D\n1B → 1C, 1A, 2B, 2C\n1C → 1D, 1B, 2B, 2C, 2E, 1F\n1D → 1E, 1C, 2D, 2F, 1A\n1E → 1F, 1D, 2E, 2C, 1H\n1F → 1G, 1E, 2F, 2G, 2D, 1C\n1G → 1H, 1F, 2F, 2G, 2I, 1J\n1H → 1I, 1G, 2H, 2J, 1E\n1I → 1J, 1H, 2I, 2G, 1L\n1J → 1K, 1I, 2J, 2K, 2H, 1G\n1K → 1L, 1J, 2J, 2K\n1L → 1K, 2L, 1I\n2A → 2B, 1A, 3A, 3C, 2D\n2B → 2C, 1B, 1C, 2A, 3B, 3D\n2C → 2D, 1C, 1E, 2B, 3C, 1B, 3A, 2F\n2D → 2E, 1D, 1F, 2C, 3D, 3E, 3B, 2A\n2E → 2F, 1E, 1C, 2D, 3D, 3E, 3G, 2H\n2F → 2G, 1F, 1G, 1D, 2E, 3F, 3H, 2C\n2G → 2H, 1G, 1I, 2F, 3G, 1F, 3E, 2J\n2H → 2I, 1H, 1J, 2G, 3H, 3I, 3F, 2E\n2I → 2J, 1I, 1G, 2H, 3H, 3I, 3K, 2L\n2J → 2K, 1J, 1K, 1H, 2I, 3J, 3L, 2G\n2K → 2L, 1K, 2J, 3K, 1J, 3I\n2L → 1L, 2K, 3L, 3J, 2I\n3A → 3B, 2A, 2C, 4A, 3D\n3B → 3C, 2B, 2D, 3A, 4B, 4C\n3C → 3D, 2C, 2A, 3B, 4B, 4C, 4E, 3F\n3D → 3E, 2D, 2E, 2B, 3C, 4D, 4F, 3A\n3E → 3F, 2E, 2G, 3D, 4E, 2D, 4C, 3H\n3F → 3G, 2F, 2H, 3E, 4F, 4G, 4D, 3C\n3G → 3H, 2G, 2E, 3F, 4F, 4G, 4I, 3J\n3H → 3I, 2H, 2I, 2F, 3G, 4H, 4J, 3E\n3I → 3J, 2I, 2K, 3H, 4I, 2H, 4G, 3L\n3J → 3K, 2J, 2L, 3I, 4J, 4K, 4H, 3G\n3K → 3L, 2K, 2I, 3J, 4J, 4K\n3L → 2L, 2J, 3K, 4L, 3I\n4A → 4B, 3A, 5A, 5C, 4D\n4B → 4C, 3B, 3C, 4A, 5B, 5D\n4C → 4D, 3C, 3E, 4B, 5C, 3B, 5A, 4F\n4D → 4E, 3D, 3F, 4C, 5D, 5E, 5B, 4A\n4E → 4F, 3E, 3C, 4D, 5D, 5E, 5G, 4H\n4F → 4G, 3F, 3G, 3D, 4E, 5F, 5H, 4C\n4G → 4H, 3G, 3I, 4F, 5G, 3F, 5E, 4J\n4H → 4I, 3H, 3J, 4G, 5H, 5I, 5F, 4E\n4I → 4J, 3I, 3G, 4H, 5H, 5I, 5K, 4L\n4J → 4K, 3J, 3K, 3H, 4I, 5J, 5L, 4G\n4K → 4L, 3K, 4J, 5K, 3J, 5I\n4L → 3L, 4K, 5L, 5J, 4I\n5A → 5B, 4A, 4C, 6A, 5D\n5B → 5C, 4B, 4D, 5A, 6B, 6C\n5C → 5D, 4C, 4A, 5B, 6B, 6C, 6E, 5F\n5D → 5E, 4D, 4E, 4B, 5C, 6D, 6F, 5A\n5E → 5F, 4E, 4G, 5D, 6E, 4D, 6C, 5H\n5F → 5G, 4F, 4H, 5E, 6F, 6G, 6D, 5C\n5G → 5H, 4G, 4E, 5F, 6F, 6G, 6I, 5J\n5H → 5I, 4H, 4I, 4F, 5G, 6H, 6J, 5E\n5I → 5J, 4I, 4K, 5H, 6I, 4H, 6G, 5L\n5J → 5K, 4J, 4L, 5I, 6J, 6K, 6H, 5G\n5K → 5L, 4K, 4I, 5J, 6J, 6K\n5L → 4L, 4J, 5K, 6L, 5I\n6A → 6B, 5A, 6D\n6B → 6C, 5B, 5C, 6A\n6C → 6D, 5C, 5E, 6B, 5B, 6F\n6D → 6E, 5D, 5F, 6C, 6A\n6E → 6F, 5E, 5C, 6D, 6H\n6F → 6G, 5F, 5G, 5D, 6E, 6C\n6G → 6H, 5G, 5I, 6F, 5F, 6J\n6H → 6I, 5H, 5J, 6G, 6E\n6I → 6J, 5I, 5G, 6H, 6L\n6J → 6K, 5J, 5K, 5H, 6I, 6G\n6K → 6L, 5K, 6J, 5J\n6L → 5L, 6K, 6I";

const LETTERS = "ABCDEFGHIJKL".split("");
const CELL_IDS = Array.from({ length: 6 }, (_, r) => LETTERS.map(l => `${r + 1}${l}`)).flat();
const COLORS = ["yellow", "red", "blue", "black"];
const INITIAL_POSITIONS = {
  yellow: ["1B", "1F", "1J", "3F", "5B", "5F", "5J"],
  red: ["1C", "1G", "1K", "3G", "5C", "5G", "5K"],
  blue: ["2B", "2F", "2J", "4F", "6B", "6F", "6J"],
  black: ["2C", "2G", "2K", "4G", "6C", "6G", "6K"]
};

const BASELINE_WEIGHTS = {
  groups: 1400,
  largestGroup: 900,
  sideAdjacency: 650,
  sameFace: 320,
  compactness: 1.25,
  mobility: 7,
  centerControl: 18,
  isolatedPenalty: 450,
  repetitionPenalty: 1200
};

const els = {
  generations: document.getElementById("generations"),
  populationSize: document.getElementById("populationSize"),
  gamesPerCandidate: document.getElementById("gamesPerCandidate"),
  maxTurns: document.getElementById("maxTurns"),
  mutationRate: document.getElementById("mutationRate"),
  startTraining: document.getElementById("startTraining"),
  stopTraining: document.getElementById("stopTraining"),
  runSample: document.getElementById("runSample"),
  exportDataset: document.getElementById("exportDataset"),
  exportWeights: document.getElementById("exportWeights"),
  clearData: document.getElementById("clearData"),
  labStatus: document.getElementById("labStatus"),
  generationMetric: document.getElementById("generationMetric"),
  gamesMetric: document.getElementById("gamesMetric"),
  positionsMetric: document.getElementById("positionsMetric"),
  bestScoreMetric: document.getElementById("bestScoreMetric"),
  progressBar: document.getElementById("progressBar"),
  bestWeights: document.getElementById("bestWeights"),
  generationHistory: document.getElementById("generationHistory"),
  sampleSummary: document.getElementById("sampleSummary"),
  decisionLog: document.getElementById("decisionLog")
};

let stopRequested = false;
let trainingData = [];
let trainingHistory = [];
let bestCandidate = null;
const V45_CHAMPION_KEY = "versoRectoV45Champion";
try {
  const savedChampion = JSON.parse(localStorage.getItem(V45_CHAMPION_KEY) || "null");
  if (savedChampion?.weights) bestCandidate = savedChampion;
} catch {}
let totalGames = 0;

const MOVES = parseMoves(MOVES_TEXT);
const ADJACENCY = buildAdjacency();
const CENTERS = buildCenters();

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

function squareDiag(c, r) {
  return c % 2 === r % 2 ? "/" : "\\";
}

function trianglePolygonsForSquare(c, r) {
  const x = c * 100, y = r * 100;
  if (squareDiag(c, r) === "/") {
    return [
      [{x,y},{x:x+100,y},{x,y:y+100}],
      [{x:x+100,y},{x:x+100,y:y+100},{x,y:y+100}]
    ];
  }
  return [
    [{x,y},{x:x+100,y},{x:x+100,y:y+100}],
    [{x,y},{x,y:y+100},{x:x+100,y:y+100}]
  ];
}

function centroid(poly) {
  return {
    x: poly.reduce((s,p) => s + p.x, 0) / poly.length,
    y: poly.reduce((s,p) => s + p.y, 0) / poly.length
  };
}

function buildPolygons() {
  const map = {};
  for (let r = 0; r < 6; r++) {
    const row = [];
    for (let c = 0; c < 6; c++) {
      trianglePolygonsForSquare(c, r).forEach(poly => row.push({poly, center: centroid(poly)}));
    }
    row.sort((a,b) => a.center.x - b.center.x);
    row.forEach((item,i) => map[`${r+1}${LETTERS[i]}`] = item.poly);
  }
  return map;
}

function sharedVertices(a,b) {
  let n = 0;
  for (const p of a) {
    if (b.some(q => Math.abs(q.x-p.x) < .001 && Math.abs(q.y-p.y) < .001)) n++;
  }
  return n;
}

function buildAdjacency() {
  const polys = buildPolygons();
  const map = {};
  for (const a of CELL_IDS) {
    map[a] = CELL_IDS.filter(b => a !== b && sharedVertices(polys[a], polys[b]) >= 2);
  }
  return map;
}

function buildCenters() {
  const polys = buildPolygons();
  return Object.fromEntries(CELL_IDS.map(id => [id, centroid(polys[id])]));
}

function initialState() {
  const pieces = [];
  COLORS.forEach(color => {
    INITIAL_POSITIONS[color].forEach((position,index) => {
      pieces.push({ id:`${color}-${index+1}`, color, position, face:"VERSO" });
    });
  });
  return {
    pieces,
    players: [
      { id:"A", color:"yellow", name:"IA A" },
      { id:"B", color:"red", name:"IA B" }
    ],
    current: 0,
    turn: 0,
    recentHashes: [],
    winner: null
  };
}

function pieceAt(state, cell) {
  return state.pieces.find(p => p.position === cell);
}

function legalMovesFor(state, player) {
  const moves = [];
  for (const piece of state.pieces.filter(p => p.color === player.color)) {
    for (const to of MOVES[piece.position] || []) {
      if (!pieceAt(state, to)) moves.push({ pieceId:piece.id, from:piece.position, to });
    }
  }
  return moves;
}

function cloneState(state) {
  return {
    ...state,
    pieces: state.pieces.map(p => ({...p})),
    players: state.players.map(p => ({...p})),
    recentHashes: [...state.recentHashes]
  };
}

function applyMove(state, move) {
  const piece = state.pieces.find(p => p.id === move.pieceId);
  piece.position = move.to;
  piece.face = piece.face === "RECTO" ? "VERSO" : "RECTO";
  state.turn++;
  state.current = (state.current + 1) % state.players.length;
  const hash = positionHash(state);
  state.recentHashes.push(hash);
  if (state.recentHashes.length > 20) state.recentHashes.shift();
}

function positionHash(state) {
  return state.pieces
    .map(p => `${p.id}:${p.position}:${p.face}`)
    .sort()
    .join("|") + `;turn=${state.current}`;
}

function piecesFor(state, player) {
  return state.pieces.filter(p => p.color === player.color);
}

function groupSizes(state, player) {
  const positions = new Set(piecesFor(state, player).map(p => p.position));
  const visited = new Set();
  const sizes = [];
  for (const start of positions) {
    if (visited.has(start)) continue;
    let size = 0;
    const stack = [start];
    visited.add(start);
    while (stack.length) {
      const cell = stack.pop();
      size++;
      for (const next of ADJACENCY[cell] || []) {
        if (positions.has(next) && !visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }
    sizes.push(size);
  }
  return sizes.sort((a,b) => b-a);
}

function adjacencyCount(state, player) {
  const positions = new Set(piecesFor(state, player).map(p => p.position));
  let total = 0;
  positions.forEach(cell => {
    total += (ADJACENCY[cell] || []).filter(next => positions.has(next)).length;
  });
  return total / 2;
}

function averageDistance(state, player) {
  const pieces = piecesFor(state, player);
  let total = 0, count = 0;
  for (let i=0;i<pieces.length;i++) {
    for (let j=i+1;j<pieces.length;j++) {
      const a = CENTERS[pieces[i].position], b = CENTERS[pieces[j].position];
      total += Math.abs(a.x-b.x) + Math.abs(a.y-b.y);
      count++;
    }
  }
  return count ? total/count : 0;
}

function centerControl(state, player) {
  return piecesFor(state, player).reduce((sum,p) => {
    const c = CENTERS[p.position];
    return sum + Math.max(0, 400 - Math.abs(c.x-300) - Math.abs(c.y-300));
  },0) / 100;
}

function features(state, player) {
  const pieces = piecesFor(state, player);
  const sizes = groupSizes(state, player);
  const recto = pieces.filter(p => p.face === "RECTO").length;
  const verso = pieces.length - recto;
  const isolated = sizes.filter(s => s === 1).length;
  return {
    groups: sizes.length,
    largestGroup: sizes[0] || 0,
    sideAdjacency: adjacencyCount(state, player),
    sameFace: Math.max(recto, verso),
    compactness: averageDistance(state, player),
    mobility: legalMovesFor(state, player).length,
    centerControl: centerControl(state, player),
    isolated
  };
}

function evaluate(state, player, weights) {
  const f = features(state, player);
  const repeatCount = state.recentHashes.filter(h => h === positionHash(state)).length;
  return (
    (10 - f.groups) * weights.groups +
    f.largestGroup * weights.largestGroup +
    f.sideAdjacency * weights.sideAdjacency +
    f.sameFace * weights.sameFace -
    f.compactness * weights.compactness +
    f.mobility * weights.mobility +
    f.centerControl * weights.centerControl -
    f.isolated * weights.isolatedPenalty -
    repeatCount * weights.repetitionPenalty
  );
}

function isVictory(state, player) {
  const pieces = piecesFor(state, player);
  if (pieces.length !== 7) return false;
  if (!pieces.every(p => p.face === pieces[0].face)) return false;
  return (groupSizes(state, player)[0] || 0) === 7;
}

function chooseMove(state, player, weights, collect = true) {
  const moves = legalMovesFor(state, player);
  if (!moves.length) return null;

  let best = moves[0];
  let bestScore = -Infinity;
  let bestAfterFeatures = null;

  for (const move of moves) {
    const copy = cloneState(state);
    applyMove(copy, move);
    const score = isVictory(copy, player) ? 1e9 : evaluate(copy, player, weights);
    if (score > bestScore) {
      bestScore = score;
      best = move;
      bestAfterFeatures = features(copy, player);
    }
  }

  if (collect) {
    trainingData.push({
      positionHash: positionHash(state),
      turn: state.turn,
      player: player.id,
      color: player.color,
      featuresBefore: features(state, player),
      legalMoveCount: moves.length,
      chosenMove: {...best},
      predictedScore: bestScore,
      featuresAfter: bestAfterFeatures,
      result: null
    });
  }
  return best;
}

function playGame(weightsA, weightsB, maxTurns, collect = true) {
  const state = initialState();
  const weightsById = { A:weightsA, B:weightsB };
  const dataStart = trainingData.length;

  while (state.turn < maxTurns && !state.winner) {
    const player = state.players[state.current];
    const move = chooseMove(state, player, weightsById[player.id], collect);
    if (!move) {
      state.current = (state.current + 1) % state.players.length;
      state.turn++;
      continue;
    }
    applyMove(state, move);
    if (isVictory(state, player)) state.winner = player.id;
  }

  if (collect) {
    for (let i=dataStart;i<trainingData.length;i++) {
      trainingData[i].result = state.winner === null ? 0 : (trainingData[i].player === state.winner ? 1 : -1);
      trainingData[i].finalTurns = state.turn;
    }
  }

  return {
    winner: state.winner,
    turns: state.turn,
    draw: state.winner === null,
    finalFeaturesA: features(state, state.players[0]),
    finalFeaturesB: features(state, state.players[1])
  };
}

function mutate(weights, rate) {
  const next = {};
  for (const [key,value] of Object.entries(weights)) {
    const factor = 1 + (Math.random()*2-1)*rate;
    next[key] = Math.max(key === "compactness" ? .05 : 1, value * factor);
  }
  return next;
}

function candidate(weights) {
  return { weights, score:0, wins:0, losses:0, draws:0, turns:0, games:0 };
}

function createPopulation(size, base, rate) {
  const pop = [candidate({...base})];
  while (pop.length < size) pop.push(candidate(mutate(base, rate)));
  return pop;
}

function scoreGame(result, candidateIsA) {
  if (result.draw) return 80;
  const won = (candidateIsA && result.winner === "A") || (!candidateIsA && result.winner === "B");
  return won ? 1000 + Math.max(0, 300-result.turns) : -250;
}

async function train() {
  stopRequested = false;
  els.startTraining.disabled = true;
  els.stopTraining.disabled = false;

  const generations = clampInt(els.generations.value,1,30);
  const populationSize = clampInt(els.populationSize.value,4,30);
  const gamesPerCandidate = clampInt(els.gamesPerCandidate.value,2,30);
  const maxTurns = clampInt(els.maxTurns.value,40,600);
  const mutationRate = clampNumber(els.mutationRate.value,.01,.8);

  const championWeights = bestCandidate?.weights || BASELINE_WEIGHTS;
  let population = createPopulation(populationSize, championWeights, mutationRate);
  const totalPlanned = generations * populationSize * gamesPerCandidate;
  let completed = 0;

  for (let generation=1; generation<=generations && !stopRequested; generation++) {
    for (const cand of population) {
      cand.score=0; cand.wins=0; cand.losses=0; cand.draws=0; cand.turns=0; cand.games=0;

      for (let game=0; game<gamesPerCandidate && !stopRequested; game++) {
        const asA = game % 2 === 0;
        const result = asA
          ? playGame(cand.weights, championWeights, maxTurns, true)
          : playGame(championWeights, cand.weights, maxTurns, true);

        const won = !result.draw && ((asA && result.winner==="A") || (!asA && result.winner==="B"));
        cand.score += scoreGame(result, asA);
        cand.games++;
        cand.turns += result.turns;
        if (result.draw) cand.draws++;
        else if (won) cand.wins++;
        else cand.losses++;

        totalGames++;
        completed++;
        updateProgress(generation, totalGames, completed/totalPlanned);
        await yieldToBrowser();
      }
    }

    population.sort((a,b) => b.score-a.score);
    const best = population[0];
    // V45 : le champion n'est remplacé que par une variante au score supérieur.
    if (!bestCandidate || best.score > bestCandidate.score) {
      bestCandidate = JSON.parse(JSON.stringify(best));
      try { localStorage.setItem(V45_CHAMPION_KEY, JSON.stringify(bestCandidate)); } catch {}
    }
    const displayedBest = bestCandidate || best;
    const avgTurns = best.games ? best.turns/best.games : 0;

    trainingHistory.push({
      generation: trainingHistory.length+1,
      score: best.score,
      wins: best.wins,
      draws: best.draws,
      averageTurns: avgTurns
    });
    renderBest();
    renderHistory();

    const eliteCount = Math.max(2, Math.ceil(populationSize*.25));
    const elites = population.slice(0,eliteCount);
    const next = elites.map(c => candidate({...c.weights}));
    while (next.length < populationSize) {
      const parent = elites[Math.floor(Math.random()*elites.length)];
      next.push(candidate(mutate(parent.weights, mutationRate)));
    }
    population = next;
  }

  els.startTraining.disabled = false;
  els.stopTraining.disabled = true;
  els.exportDataset.disabled = trainingData.length === 0;
  els.exportWeights.disabled = !bestCandidate;
  els.labStatus.textContent = stopRequested ? "Entraînement arrêté. Champion conservé." : "Entraînement terminé. Champion V45 conservé dans ce navigateur.";
}

function runSample() {
  const weights = bestCandidate?.weights || BASELINE_WEIGHTS;
  const start = trainingData.length;
  const result = playGame(weights, BASELINE_WEIGHTS, clampInt(els.maxTurns.value,40,600), true);
  totalGames++;
  els.sampleSummary.innerHTML = `
    <strong>${result.draw ? "Partie nulle" : `Victoire de ${result.winner}`}</strong><br>
    ${result.turns} coups simulés.<br>
    Plus grand groupe A : ${result.finalFeaturesA.largestGroup}/7.<br>
    Plus grand groupe B : ${result.finalFeaturesB.largestGroup}/7.
  `;
  const decisions = trainingData.slice(start).slice(-12).reverse();
  els.decisionLog.innerHTML = decisions.map(d =>
    `<li>${d.color} : ${d.chosenMove.from} → ${d.chosenMove.to} — score ${Math.round(d.predictedScore)}</li>`
  ).join("");
  updateProgress(Number(els.generationMetric.textContent)||0,totalGames,1);
  els.exportDataset.disabled = false;
}

function updateProgress(generation,games,ratio) {
  els.generationMetric.textContent = generation;
  els.gamesMetric.textContent = games;
  els.positionsMetric.textContent = trainingData.length;
  els.progressBar.style.width = `${Math.max(0,Math.min(1,ratio))*100}%`;
  if (bestCandidate) els.bestScoreMetric.textContent = Math.round(bestCandidate.score);
  els.labStatus.textContent = `Simulation en cours — génération ${generation}, ${games} partie(s).`;
}

function renderBest() {
  if (!bestCandidate) return;
  els.bestScoreMetric.textContent = Math.round(bestCandidate.score);
  els.bestWeights.textContent = JSON.stringify(bestCandidate.weights,null,2);
  els.exportWeights.disabled = false;
}

function renderHistory() {
  els.generationHistory.innerHTML = trainingHistory.map(row => `
    <tr>
      <td>${row.generation}</td>
      <td>${Math.round(row.score)}</td>
      <td>${row.wins}</td>
      <td>${row.draws}</td>
      <td>${row.averageTurns.toFixed(1)}</td>
    </tr>
  `).join("");
}

function exportJson(filename,data) {
  const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href=url; a.download=filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function clearData() {
  if (!confirm("Effacer toutes les données d’apprentissage de cette session ?")) return;
  trainingData=[]; trainingHistory=[]; bestCandidate=null; totalGames=0;
  els.generationMetric.textContent="0";
  els.gamesMetric.textContent="0";
  els.positionsMetric.textContent="0";
  els.bestScoreMetric.textContent="—";
  els.progressBar.style.width="0";
  els.bestWeights.textContent="Aucun résultat.";
  els.generationHistory.innerHTML='<tr><td colspan="5" class="muted">Aucune donnée.</td></tr>';
  els.decisionLog.innerHTML="";
  els.sampleSummary.textContent="Aucune partie témoin.";
  els.exportDataset.disabled=true;
  els.exportWeights.disabled=true;
  els.labStatus.textContent="Données effacées.";
}

function clampInt(value,min,max){return Math.max(min,Math.min(max,parseInt(value,10)||min));}
function clampNumber(value,min,max){return Math.max(min,Math.min(max,Number(value)||min));}
function yieldToBrowser(){return new Promise(resolve=>setTimeout(resolve,0));}

els.startTraining.addEventListener("click",train);
els.stopTraining.addEventListener("click",()=>{stopRequested=true;});
els.runSample.addEventListener("click",runSample);
els.exportDataset.addEventListener("click",()=>exportJson("verso-recto-v41-training-data.json",trainingData));
els.exportWeights.addEventListener("click",()=>exportJson("verso-recto-v41-best-weights.json",{
  generatedAt:new Date().toISOString(),
  baseline:BASELINE_WEIGHTS,
  best:bestCandidate,
  history:trainingHistory
}));
els.clearData.addEventListener("click",clearData);
