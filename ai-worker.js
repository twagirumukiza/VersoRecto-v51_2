
let state = null;
let PLAYER_ID = null;
let SYMMETRIC_MOVES = null;
let SIDE_ADJACENCY_MAP = null;
let CELL_CENTROIDS = null;
let CONFIG = null;
let SEARCH_DEADLINE = Infinity;
let SEARCH_NODES = 0;
let SEARCH_REACHED_DEPTH = 0;
let MEMORY_PRIORS = {};

self.onmessage = function(event) {
  try {
    state = event.data.state;
    PLAYER_ID = event.data.playerId;
    SYMMETRIC_MOVES = event.data.symmetricMoves;
    SIDE_ADJACENCY_MAP = event.data.sideAdjacencyMap;
    CELL_CENTROIDS = event.data.cellCentroids;
    CONFIG = event.data.config;
    MEMORY_PRIORS = event.data.memoryPriors || {};
    SEARCH_DEADLINE = Date.now() + Math.max(250, (CONFIG.maxDecisionMs || 6000) - 300);
    SEARCH_NODES = 0;
    SEARCH_REACHED_DEPTH = 0;

    const player = state.players.find(p => p.id === PLAYER_ID);
    const choice = chooseAIMove(player);

    if (!choice) {
      self.postMessage({ ok: false, choice: null });
      return;
    }

    self.postMessage({
      ok: true,
      choice: {
        pieceId: choice.piece.id,
        to: choice.to,
        destinations: legalMovesForPiece(choice.piece),
      },
      stats: { nodes: SEARCH_NODES, depth: SEARCH_REACHED_DEPTH, mode: tacticalSearchLevel(player) }
    });
  } catch (error) {
    self.postMessage({ ok: false, error: String(error && error.message ? error.message : error) });
  }
};

function pieceAt(cellId) {
  return state.pieces.find(p => p.position === cellId);
}

function rankingIndexForPlayer(playerId) {
  return state.ranking.findIndex(entry => entry.playerId === playerId);
}

function isPlayerRanked(playerId) {
  return rankingIndexForPlayer(playerId) >= 0;
}

function ownerOfPiece(piece) {
  return state.players.find(player => player.color === piece.color);
}

function isPieceInactive(piece) {
  const owner = ownerOfPiece(piece);
  return piece.isNeutral || (owner && isPlayerRanked(owner.id));
}

function activePlayers() {
  return state.players.filter(p => !isPlayerRanked(p.id));
}

function alternatingStreakLength(piece, to) {
  const owner = ownerOfPiece(piece);
  if (!owner) return 1;

  const pieceMoves = state.moveHistory.filter(move =>
    !move.pass &&
    !move.system &&
    move.playerId === owner.id &&
    move.pieceId === piece.id
  );

  let streak = 1;
  let from = piece.position;
  let dest = to;

  for (let i = pieceMoves.length - 1; i >= 0; i--) {
    const previous = pieceMoves[i];

    if (previous.from === dest && previous.to === from) {
      streak++;
      from = previous.from;
      dest = previous.to;
    } else {
      break;
    }
  }

  return streak;
}

function moveWinsImmediately(piece, to) {
  const owner = ownerOfPiece(piece);
  if (!owner) return false;
  const previousPosition = piece.position;
  const previousFace = piece.face;
  piece.position = to;
  piece.face = piece.face === "RECTO" ? "VERSO" : "RECTO";
  const wins = checkVictory(owner);
  piece.position = previousPosition;
  piece.face = previousFace;
  return wins;
}

function violatesRepetitionRule(piece, to) {
  const owner = ownerOfPiece(piece);
  const streak = alternatingStreakLength(piece, to);
  // V45 : une IA ne peut pas prolonger plus de deux aller-retour complets
  // entre les mêmes cases, sauf si le coup donne immédiatement la victoire.
  if (owner?.isAI && streak > 4) return !moveWinsImmediately(piece, to);
  return streak > CONFIG.maxBackAndForthStreak;
}

function legalMovesForPiece(piece) {
  if (!piece || isPieceInactive(piece)) return [];
  return (SYMMETRIC_MOVES[piece.position] || [])
    .filter(dest => !pieceAt(dest))
    .filter(dest => !violatesRepetitionRule(piece, dest));
}

function legalMovesForPlayer(player) {
  if (!player || isPlayerRanked(player.id)) return [];
  return state.pieces
    .filter(p => p.color === player.color && !isPieceInactive(p))
    .flatMap(piece => legalMovesForPiece(piece).map(to => ({ piece, to })));
}

function cellDistance(a, b) {
  const ca = CELL_CENTROIDS?.[a];
  const cb = CELL_CENTROIDS?.[b];
  if (!ca || !cb) return 999;
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

function aiMovedPieceIds(player) {
  return new Set(
    state.moveHistory
      .filter(move =>
        !move.pass &&
        !move.system &&
        !move.simulation &&
        move.playerId === player.id &&
        move.pieceId
      )
      .map(move => move.pieceId)
  );
}

function ownPiecesForPlayer(player) {
  return state.pieces
    .filter(piece => piece.color === player.color)
    .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
}

function isPieceAssembledWithOwnGroup(player, piece) {
  if (!piece) return false;
  return (SIDE_ADJACENCY_MAP[piece.position] || []).some(cellId => {
    const neighbour = pieceAt(cellId);
    return neighbour &&
      neighbour.color === player.color &&
      neighbour.id !== piece.id &&
      neighbour.face === piece.face;
  });
}



function nextRequiredAIPiece(player, moves) {
  if (!player?.isAI) return null;

  const pieces = ownPiecesForPlayer(player);
  if (!pieces.length) return null;

  const legalPieceIds = new Set(moves.map(move => move.piece.id));
  let cursor = state.aiRotationCursor?.[player.id] || 0;

  for (let offset = 0; offset < pieces.length; offset++) {
    const piece = pieces[(cursor + offset) % pieces.length];

    if (!legalPieceIds.has(piece.id)) continue;
    if (isPieceAssembledWithOwnGroup(player, piece)) continue;

    return piece;
  }

  return null;
}

function ownFaceConnectedGroups(player) {
  const pieces = ownPiecesForPlayer(player);
  const pieceById = new Map(pieces.map(piece => [piece.id, piece]));
  const visited = new Set();
  const groups = [];

  for (const piece of pieces) {
    if (visited.has(piece.id)) continue;

    const stack = [piece];
    const group = [];
    visited.add(piece.id);

    while (stack.length) {
      const current = stack.pop();
      group.push(current);

      for (const cellId of SIDE_ADJACENCY_MAP[current.position] || []) {
        const neighbour = pieceAt(cellId);
        if (
          neighbour &&
          neighbour.color === player.color &&
          neighbour.face === current.face &&
          pieceById.has(neighbour.id) &&
          !visited.has(neighbour.id)
        ) {
          visited.add(neighbour.id);
          stack.push(neighbour);
        }
      }
    }

    groups.push(group);
  }

  return groups;
}

function groupCentroid(group) {
  if (!group?.length) return { x: 300, y: 300 };
  const points = group.map(piece => CELL_CENTROIDS[piece.position]).filter(Boolean);
  if (!points.length) return { x: 300, y: 300 };
  return {
    x: points.reduce((sum, p) => sum + p.x, 0) / points.length,
    y: points.reduce((sum, p) => sum + p.y, 0) / points.length,
  };
}

function distanceToPoint(cellId, point) {
  const c = CELL_CENTROIDS[cellId];
  if (!c || !point) return 999;
  return Math.hypot(c.x - point.x, c.y - point.y);
}

function centralGroupForAI(player) {
  const groups = ownFaceConnectedGroups(player);
  if (!groups.length) return null;

  const bestPattern = closestWinningPatternForPlayer(player, state.pieces);
  const targetCells = bestPattern?.pattern || [];
  const targetSet = new Set(targetCells);
  const targetCenter = targetCells.length
    ? groupCentroid(targetCells.map(position => ({ position })))
    : { x: 300, y: 300 };

  let best = null;
  let bestScore = -Infinity;

  for (const group of groups) {
    const centroid = groupCentroid(group);
    const sameFaceBonus = group.length * 850;
    const inPattern = group.filter(piece => targetSet.has(piece.position)).length;
    const adjacency = sideAdjacencyScore(group);
    const centerDistance = Math.hypot(centroid.x - targetCenter.x, centroid.y - targetCenter.y);

    const score =
      group.length * 1700 +
      sameFaceBonus +
      inPattern * 1200 +
      adjacency * 600 -
      centerDistance * 3;

    if (score > bestScore) {
      bestScore = score;
      best = { group, ids: new Set(group.map(piece => piece.id)), centroid, score };
    }
  }

  return best;
}

function secondaryPiecesInRotation(player, moves) {
  const central = centralGroupForAI(player);
  if (!central) return [];

  const legalPieceIds = new Set(moves.map(move => move.piece.id));

  // Tous les pions hors du groupe central entrent dans la même file :
  // pions isolés + pions appartenant à des groupements secondaires.
  return ownPiecesForPlayer(player)
    .filter(piece => legalPieceIds.has(piece.id))
    .filter(piece => !central.ids.has(piece.id));
}

function nextSecondaryPieceInRotation(player, moves) {
  const secondaryPieces = secondaryPiecesInRotation(player, moves);
  if (!secondaryPieces.length) return null;

  const pieces = ownPiecesForPlayer(player);
  let cursor = state.aiRotationCursor?.[player.id] || 0;

  // V33 : on parcourt la liste complète des 7 pions, mais on ne retient
  // que ceux qui sont hors regroupement central. Un pion isolé est donc traité
  // comme un groupe secondaire d’un seul pion.
  for (let offset = 0; offset < pieces.length; offset++) {
    const piece = pieces[(cursor + offset) % pieces.length];
    if (secondaryPieces.some(candidate => candidate.id === piece.id)) {
      return piece;
    }
  }

  return secondaryPieces[0] || null;
}

function secondaryPieceToConnect(player, moves) {
  const central = centralGroupForAI(player);
  if (!central) return null;

  const required = nextSecondaryPieceInRotation(player, moves);
  if (required) return required;

  // Si aucun pion secondaire n’est légalement jouable, retour à la stratégie globale.
  return null;
}




// V51 — Path Planner : navigation réelle des pions isolés autour des barrières.
function v51EntryCells(player, central) {
  const entries = new Set();
  for (const member of central?.group || []) {
    for (const cellId of SIDE_ADJACENCY_MAP[member.position] || []) {
      const occupant = pieceAt(cellId);
      if (!occupant) entries.add(cellId);
    }
  }
  return [...entries];
}

function v51CellTraversalCost(cellId, player, movingPiece) {
  const occupant = pieceAt(cellId);
  if (occupant && occupant.id !== movingPiece.id) return Infinity;
  let cost = 1;
  let enemyNeighbours = 0;
  let neutralNeighbours = 0;
  for (const neighbourId of SIDE_ADJACENCY_MAP[cellId] || []) {
    const neighbour = pieceAt(neighbourId);
    if (!neighbour || neighbour.id === movingPiece.id) continue;
    if (neighbour.isNeutral) neutralNeighbours++;
    else if (neighbour.color !== player.color) enemyNeighbours++;
  }
  cost += enemyNeighbours * 2.4 + neutralNeighbours * 0.8;
  if ((SYMMETRIC_MOVES[cellId] || []).filter(dest => !pieceAt(dest)).length <= 1) cost += 1.6;
  return cost;
}

function v51RoutePlan(player, piece, startCell, central) {
  const targets = new Set(v51EntryCells(player, central));
  if (!targets.size) return { cost: Infinity, path: [], alternatives: 0, barrier: 10 };
  if (targets.has(startCell)) return { cost: 0, path: [startCell], alternatives: 1, barrier: 0 };

  const distances = new Map([[startCell, 0]]);
  const previous = new Map();
  const queue = [{ cell: startCell, cost: 0 }];
  let reached = null;
  while (queue.length) {
    queue.sort((a,b) => a.cost-b.cost);
    const current = queue.shift();
    if (current.cost !== distances.get(current.cell)) continue;
    if (targets.has(current.cell)) { reached = current.cell; break; }
    for (const next of SYMMETRIC_MOVES[current.cell] || []) {
      const step = v51CellTraversalCost(next, player, piece);
      if (!Number.isFinite(step)) continue;
      const nextCost = current.cost + step;
      if (nextCost < (distances.get(next) ?? Infinity)) {
        distances.set(next, nextCost); previous.set(next, current.cell);
        queue.push({ cell: next, cost: nextCost });
      }
    }
  }
  if (!reached) return { cost: Infinity, path: [], alternatives: 0, barrier: 10 };
  const path=[]; let cursor=reached;
  while (cursor) { path.push(cursor); cursor=previous.get(cursor); }
  path.reverse();
  const alternatives=(SYMMETRIC_MOVES[startCell]||[]).filter(next => Number.isFinite(v51CellTraversalCost(next,player,piece))).length;
  const direct=Math.max(1, Math.min(...[...targets].map(t=>cellDistance(startCell,t)))/85);
  const barrier=Math.max(0, (distances.get(reached)||0)-direct);
  return { cost: distances.get(reached), path, alternatives, barrier, target: reached };
}

function v51FailedRoutePenalty(player, move) {
  const history=(state.moveHistory||[]).filter(m=>!m.pass&&!m.system&&m.playerId===player.id&&m.pieceId===move.piece.id).slice(-18);
  let penalty=0;
  for (let i=0;i<history.length;i++) {
    const old=history[i]; const age=history.length-i;
    if (old.to===move.to) penalty += Math.max(120, 900-age*35);
    if (old.from===move.to && old.to===move.piece.position) penalty += 1500;
  }
  return penalty;
}

function v51PathPlannerScore(player, move, central) {
  if (!central || central.ids.has(move.piece.id)) return 0;
  const before=v51RoutePlan(player, move.piece, move.piece.position, central);
  const originalPosition=move.piece.position;
  const originalFace=move.piece.face;
  move.piece.position=move.to;
  move.piece.face=move.piece.face === "RECTO" ? "VERSO" : "RECTO";
  const afterCentral=centralGroupForAI(player) || central;
  const after=v51RoutePlan(player, move.piece, move.to, afterCentral);
  move.piece.position=originalPosition; move.piece.face=originalFace;

  const beforeCost=Number.isFinite(before.cost)?before.cost:60;
  const afterCost=Number.isFinite(after.cost)?after.cost:60;
  const routeProgress=(beforeCost-afterCost)*1150;
  const viableBonus=Number.isFinite(after.cost)?1100:-9000;
  const detourBonus=Math.max(0,after.alternatives-1)*260;
  const barrierEscape=Math.max(0,before.barrier-after.barrier)*620;
  const followsPath=before.path?.[1]===move.to ? 2600 : 0;
  return routeProgress+viableBonus+detourBonus+barrierEscape+followsPath-v51FailedRoutePenalty(player,move);
}

function centralConnectionScore(player, move) {
  const central = centralGroupForAI(player);
  if (!central) return 0;

  const centralPositions = central.group.map(piece => piece.position);

  const minDistanceToCentral = cellId => {
    if (!centralPositions.length) return distanceToPoint(cellId, central.centroid);
    return Math.min(...centralPositions.map(position => cellDistance(cellId, position)));
  };

  const beforeDistance = minDistanceToCentral(move.piece.position);
  const beforeCentroidDistance = distanceToPoint(move.piece.position, central.centroid);
  const beforeCentralSize = central.group.length;

  const undo = applyTemporaryMove(player, move.piece, move.to);
  const afterCentral = centralGroupForAI(player);
  const afterDistance = Math.min(
    ...(afterCentral?.group || central.group).map(piece => cellDistance(move.to, piece.position))
  );
  const afterCentroidDistance = distanceToPoint(move.to, afterCentral?.centroid || central.centroid);
  const sameFaceCentralNeighbours = (SIDE_ADJACENCY_MAP[move.to] || []).reduce((sum, cellId) => {
    const neighbour = pieceAt(cellId);
    return sum + (neighbour && neighbour.color === player.color && neighbour.face === move.piece.face ? 1 : 0);
  }, 0);
  const sizeGain = (afterCentral?.group?.length || 0) - beforeCentralSize;
  undoTemporaryMove(undo);

  const geometricScore = (
    (beforeDistance - afterDistance) * 18 +
    (beforeCentroidDistance - afterCentroidDistance) * 6 +
    sameFaceCentralNeighbours * 1800 +
    sizeGain * 2600
  );
  return geometricScore + v51PathPlannerScore(player, move, central);
}



function openingMovePool(player, moves) {
  if (!player?.isAI) return moves;

  const movedIds = aiMovedPieceIds(player);
  const targetDistinct = (CONFIG && CONFIG.openingDistinctPieces) || 7;

  // Phase 1 : mobiliser les 7 pions différents en cherchant déjà le rapprochement.
  if (movedIds.size < targetDistinct) {
    const freshMoves = moves.filter(move => !movedIds.has(move.piece.id));
    const pool = freshMoves.length ? freshMoves : moves;

    return [...pool].sort((a, b) =>
      openingDevelopmentScore(player, b) + centralConnectionScore(player, b) -
      (openingDevelopmentScore(player, a) + centralConnectionScore(player, a))
    );
  }

  // Phase 2 : choisir un regroupement central et raccorder les groupes secondaires.
  // Exception : la défense immédiate reste autorisée dans chooseAIMove/minimax.
  const requiredPiece = secondaryPieceToConnect(player, moves);
  if (requiredPiece) {
    const forcedMoves = moves.filter(move => move.piece.id === requiredPiece.id);
    if (forcedMoves.length) {
      return [...forcedMoves].sort((a, b) =>
        openingDevelopmentScore(player, b) + centralConnectionScore(player, b) -
        (openingDevelopmentScore(player, a) + centralConnectionScore(player, a))
      );
    }
  }

  return moves;
}





function openingDevelopmentScore(player, move) {
  const beforePattern = winningPatternScore(player);
  const beforeZone = gatheringZoneScore(player);
  const beforePosition = evaluatePlayerPosition(player);

  const undo = applyTemporaryMove(player, move.piece, move.to);

  const afterPattern = winningPatternScore(player);
  const afterZone = gatheringZoneScore(player);
  const afterPosition = evaluatePlayerPosition(player);
  const repeated = recentBoardRepeatCount(boardSignature());

  let score = 0;
  score += (afterPattern - beforePattern) * 1.15;
  score += (afterZone - beforeZone) * 0.65;
  score += (afterPosition - beforePosition) * 0.55;
  score -= repeated * CONFIG.stagnation.repeatedBoardPenalty;

  if (countImmediateWinningMoves(player) > 0) score += 180000;
  if (checkVictory(player)) score += CONFIG.winScore;

  undoTemporaryMove(undo);

  return score;
}



function gatheringZoneScore(player) {
  if (!player?.isAI || !player.aiTargetZone) return 0;

  const zone = player.aiTargetZone;
  const pieces = state.pieces.filter(piece => piece.color === player.color);
  if (!pieces.length) return 0;

  const weights = CONFIG.zoneWeights || { distance: 26, close: 520, adjacent: 820 };
  const averageDistance = pieces.reduce((sum, piece) => sum + cellDistance(piece.position, zone), 0) / pieces.length;
  const closeCount = pieces.filter(piece => cellDistance(piece.position, zone) <= 155).length;
  const adjacentToZone = pieces.filter(piece => (SIDE_ADJACENCY_MAP[zone] || []).includes(piece.position)).length;

  return (
    -averageDistance * weights.distance +
    closeCount * weights.close +
    adjacentToZone * weights.adjacent
  );
}

function closestWinningPatternForPlayer(player, pieces = state.pieces) {
  const ownPieces = pieces.filter(piece => piece.color === player.color);
  const patterns = CONFIG.winningPatterns || [];
  if (!ownPieces.length || !patterns.length) return null;

  const occupiedByOthers = new Set(
    pieces
      .filter(piece => piece.color !== player.color)
      .map(piece => piece.position)
  );

  let best = null;
  let bestScore = -Infinity;

  for (const pattern of patterns) {
    const patternSet = new Set(pattern);

    let occupiedInPattern = 0;
    let blocked = 0;
    let distance = 0;

    for (const piece of ownPieces) {
      if (patternSet.has(piece.position)) {
        occupiedInPattern += 1;
        continue;
      }

      let nearest = Infinity;
      for (const cell of pattern) {
        nearest = Math.min(nearest, cellDistance(piece.position, cell));
      }
      distance += nearest;
    }

    for (const cell of pattern) {
      if (occupiedByOthers.has(cell)) blocked += 1;
    }

    const weights = CONFIG.zoneWeights || {};
    const score =
      occupiedInPattern * (weights.winningPattern || 950) -
      distance * 0.55 -
      blocked * 2600 -
      (7 - occupiedInPattern) * (weights.missingPatternPenalty || 55);

    if (score > bestScore) {
      bestScore = score;
      best = { pattern, score, occupiedInPattern, blocked };
    }
  }

  return best;
}

function winningPatternScore(player) {
  if (!player?.isAI) return 0;

  const best = closestWinningPatternForPlayer(player, state.pieces);
  if (!best) return 0;

  const faceCount = Math.max(
    state.pieces.filter(piece => piece.color === player.color && piece.face === "RECTO").length,
    state.pieces.filter(piece => piece.color === player.color && piece.face === "VERSO").length
  );

  return best.score + best.occupiedInPattern * best.occupiedInPattern * 420 + faceCount * 90;
}

function opponentImmediateThreatCount(player) {
  return state.players
    .filter(p => p.id !== player.id && !isPlayerRanked(p.id))
    .reduce((sum, opponent) => sum + countImmediateWinningMoves(opponent), 0);
}

function immediateBlockMoves(player, moves) {
  const beforeThreats = opponentImmediateThreatCount(player);
  if (beforeThreats <= 0) return [];

  return moves.filter(move => {
    const undo = applyTemporaryMove(player, move.piece, move.to);
    const afterThreats = opponentImmediateThreatCount(player);
    undoTemporaryMove(undo);
    return afterThreats < beforeThreats;
  });
}

function tacticalSearchLevel(player) {
  const opponents = state.players.filter(p => p.id !== player.id && !isPlayerRanked(p.id));
  const ownImmediate = countImmediateWinningMoves(player);
  const enemyImmediate = opponents.reduce((sum, p) => sum + countImmediateWinningMoves(p), 0);
  if (ownImmediate || enemyImmediate) return "critical";

  const ownPattern = closestWinningPatternForPlayer(player, state.pieces);
  const enemyNear = opponents.some(opponent => {
    const pattern = closestWinningPatternForPlayer(opponent, state.pieces);
    return pattern && pattern.occupiedInPattern >= 5;
  });
  if ((ownPattern && ownPattern.occupiedInPattern >= 5) || enemyNear) return "tactical";
  return "normal";
}

function adaptiveSearchProfile(player) {
  const duel = activePlayers().length <= 2;
  const level = tacticalSearchLevel(player);
  if ((CONFIG.rankedCount || 0) > 0) {
    return { depth: CONFIG.postWinnerDepth || 2, limit: CONFIG.postWinnerCandidateLimit || 6, level: "post-winner" };
  }
  if (duel) {
    if (level === "critical") return { depth: CONFIG.criticalDepthTwoPlayers || 9, limit: CONFIG.criticalCandidateLimitTwoPlayers || 26, level };
    if (level === "tactical") return { depth: CONFIG.tacticalDepthTwoPlayers || 7, limit: CONFIG.tacticalCandidateLimitTwoPlayers || 18, level };
    return { depth: CONFIG.depthTwoPlayers || 5, limit: CONFIG.candidateLimitTwoPlayers || 12, level };
  }
  if (level === "critical") return { depth: CONFIG.criticalDepthMulti || 5, limit: CONFIG.criticalCandidateLimitMulti || 14, level };
  if (level === "tactical") return { depth: CONFIG.tacticalDepthMulti || 4, limit: CONFIG.tacticalCandidateLimitMulti || 11, level };
  return { depth: CONFIG.depthMulti || 3, limit: CONFIG.candidateLimitMulti || 8, level };
}

function tacticalMovePool(player, moves, aiPlayer) {
  const mandatory = [];
  const seen = new Set();
  const add = move => {
    const key = `${move.piece.id}>${move.to}`;
    if (!seen.has(key)) { seen.add(key); mandatory.push(move); }
  };

  for (const move of moves) {
    if (wouldWinAfterMove(player, move.piece, move.to)) add(move);
  }
  for (const move of immediateBlockMoves(player, moves)) add(move);

  // Conserve obligatoirement les coups qui créent une menace immédiate ou
  // font progresser fortement vers l'une des 5 816 configurations gagnantes.
  const scored = moves.map(move => {
    const before = closestWinningPatternForPlayer(player, state.pieces);
    const undo = applyTemporaryMove(player, move.piece, move.to);
    const after = closestWinningPatternForPlayer(player, state.pieces);
    const threats = countImmediateWinningMoves(player);
    const boardScore = staticMoveScore(player, move.piece, move.to, aiPlayer);
    undoTemporaryMove(undo);
    const patternGain = (after?.occupiedInPattern || 0) - (before?.occupiedInPattern || 0);
    return { move, priority: threats * 1e8 + patternGain * 1e6 + boardScore };
  }).sort((a,b) => b.priority-a.priority);

  for (const item of scored.slice(0, Math.min(10, scored.length))) add(item.move);
  return { mandatory, ordered: orderMovesForSearch(player, moves, aiPlayer) };
}

function mergeAndLimitMoves(player, moves, aiPlayer, limit) {
  const { mandatory, ordered } = tacticalMovePool(player, moves, aiPlayer);
  const result = [];
  const seen = new Set();
  for (const move of [...mandatory, ...ordered]) {
    const key = `${move.piece.id}>${move.to}`;
    if (seen.has(key)) continue;
    seen.add(key); result.push(move);
    if (result.length >= Math.max(limit, mandatory.length)) break;
  }
  return result;
}


function memoryPriorFor(move) {
  const key = `${move.piece.id}>${move.to}`;
  const prior = MEMORY_PRIORS[key];
  if (!prior || !Number.isFinite(prior.score)) return 0;
  const confidence = Math.max(0, Math.min(1, Number(prior.confidence || 0)));
  // V50 : la mémoire oriente les coups proches, sans jamais dépasser la tactique.
  return prior.score * confidence * Math.min(CONFIG.winScore * 0.04, 180000);
}

function chooseAIMove(player) {
  const moves = legalMovesForPlayer(player);
  if (!moves.length) return null;

  const winningMove = moves.find(move => wouldWinAfterMove(player, move.piece, move.to));
  if (winningMove) { SEARCH_REACHED_DEPTH = 1; return winningMove; }

  const blockers = immediateBlockMoves(player, moves);
  const strategicBase = blockers.length ? blockers : openingMovePool(player, moves);
  const profile = adaptiveSearchProfile(player);
  const orderedRoot = mergeAndLimitMoves(player, strategicBase, player, profile.limit);
  if (!orderedRoot.length) return moves[0];

  let completedBest = orderedRoot[0];
  const cache = new Map();

  for (let depth = 1; depth <= profile.depth; depth++) {
    let depthBest = completedBest;
    let depthScore = -Infinity;
    let alpha = -Infinity;
    let completed = true;

    // Principal-variation ordering: le meilleur coup de la profondeur précédente passe en premier.
    const roots = [completedBest, ...orderedRoot.filter(m => m.piece.id !== completedBest.piece.id || m.to !== completedBest.to)];
    for (const move of roots) {
      if (searchTimeExpired()) { completed = false; break; }
      const undo = applyTemporaryMove(player, move.piece, move.to);
      const score = minimax(nextSearchPlayer(player), depth - 1, alpha, Infinity, player, cache, profile);
      undoTemporaryMove(undo);
      if (searchTimeExpired()) { completed = false; break; }

      const tieBreak = staticMoveScore(player, move.piece, move.to, player) + centralConnectionScore(player, move) + memoryPriorFor(move);
      const bestTieBreak = staticMoveScore(player, depthBest.piece, depthBest.to, player) + centralConnectionScore(player, depthBest) + memoryPriorFor(depthBest);
      if (score > depthScore || (score === depthScore && tieBreak > bestTieBreak)) {
        depthScore = score; depthBest = move;
      }
      alpha = Math.max(alpha, depthScore);
    }
    if (!completed) break;
    completedBest = depthBest;
    SEARCH_REACHED_DEPTH = depth;
    if (depthScore >= CONFIG.winScore * 0.9) break;
  }
  return completedBest;
}

function aiSearchDepth() { return adaptiveSearchProfile(state.players.find(p => p.id === PLAYER_ID)).depth; }
function aiCandidateLimit() { return adaptiveSearchProfile(state.players.find(p => p.id === PLAYER_ID)).limit; }
function limitMovesForSearch(moves) { return moves.slice(0, aiCandidateLimit()); }
function searchTimeExpired() { return Date.now() >= SEARCH_DEADLINE; }

function quiescenceValue(aiPlayer) {
  let value = evaluateBoardForAI(aiPlayer);
  if (searchTimeExpired()) return value;
  const opponents = state.players.filter(p => p.id !== aiPlayer.id && !isPlayerRanked(p.id));
  const unstable = countImmediateWinningMoves(aiPlayer) > 0 || opponents.some(p => countImmediateWinningMoves(p) > 0);
  if (!unstable) return value;
  for (const move of legalMovesForPlayer(aiPlayer).filter(m => wouldWinAfterMove(aiPlayer, m.piece, m.to)).slice(0, 4)) {
    const undo = applyTemporaryMove(aiPlayer, move.piece, move.to);
    value = Math.max(value, evaluateBoardForAI(aiPlayer) + CONFIG.winScore / 2);
    undoTemporaryMove(undo);
  }
  return value;
}

function minimax(playerToMove, depth, alpha, beta, aiPlayer, cache, profile) {
  SEARCH_NODES++;
  if ((SEARCH_NODES & 63) === 0 && searchTimeExpired()) return evaluateBoardForAI(aiPlayer);
  const cacheKey = boardHash(playerToMove, depth, aiPlayer);
  const cached = cache.get(cacheKey);
  if (cached && cached.depth >= depth) return cached.score;
  if (checkVictory(aiPlayer)) return CONFIG.winScore + depth;
  const opponents = state.players.filter(p => p.id !== aiPlayer.id && !isPlayerRanked(p.id));
  if (opponents.some(opponent => checkVictory(opponent))) return -CONFIG.winScore - depth;
  if (depth <= 0) {
    const value = quiescenceValue(aiPlayer); cache.set(cacheKey, { depth, score: value }); return value;
  }
  if (!playerToMove || isPlayerRanked(playerToMove.id)) return minimax(nextSearchPlayer(playerToMove), depth - 1, alpha, beta, aiPlayer, cache, profile);
  const moves = legalMovesForPlayer(playerToMove);
  if (!moves.length) return minimax(nextSearchPlayer(playerToMove), depth - 1, alpha, beta, aiPlayer, cache, profile);

  const branchLimit = Math.max(4, profile.limit - Math.floor((profile.depth - depth) * 1.5));
  const ordered = mergeAndLimitMoves(playerToMove, moves, aiPlayer, branchLimit);
  const maximizing = playerToMove.id === aiPlayer.id;
  let value = maximizing ? -Infinity : Infinity;
  for (const move of ordered) {
    if (searchTimeExpired()) break;
    const undo = applyTemporaryMove(playerToMove, move.piece, move.to);
    const child = minimax(nextSearchPlayer(playerToMove), depth - 1, alpha, beta, aiPlayer, cache, profile);
    undoTemporaryMove(undo);
    if (maximizing) { value = Math.max(value, child); alpha = Math.max(alpha, value); }
    else { value = Math.min(value, child); beta = Math.min(beta, value); }
    if (alpha >= beta) break;
  }
  if (!Number.isFinite(value)) value = evaluateBoardForAI(aiPlayer);
  cache.set(cacheKey, { depth, score: value });
  return value;
}

function boardHash(playerToMove, depth, aiPlayer) {
  const pieces = state.pieces
    .map(p => `${p.id}:${p.position}:${p.face}`)
    .sort()
    .join("|");
  const ranking = (state.ranking || []).map(r => r.playerId).join(",");
  return `${aiPlayer.id}|turn=${playerToMove?.id || "none"}|rank=${ranking}|depth=${depth}|${pieces}`;
}

function nextSearchPlayer(currentPlayer) {
  const orderedIds = state.turnOrder.filter(id => {
    const player = state.players.find(p => p.id === id);
    return player && !isPlayerRanked(player.id);
  });

  if (!orderedIds.length) return null;
  if (!currentPlayer) return state.players.find(p => p.id === orderedIds[0]);

  const index = orderedIds.findIndex(id => id === currentPlayer.id);
  const nextId = orderedIds[(index + 1 + orderedIds.length) % orderedIds.length];
  return state.players.find(p => p.id === nextId);
}

function orderMovesForSearch(player, moves, aiPlayer) {
  const ordered = [...moves].sort((a, b) => {
    const scoreA = staticMoveScore(player, a.piece, a.to, aiPlayer) + (player.id === aiPlayer.id ? memoryPriorFor(a) : 0);
    const scoreB = staticMoveScore(player, b.piece, b.to, aiPlayer) + (player.id === aiPlayer.id ? memoryPriorFor(b) : 0);

    // Pour l'IA elle-même : meilleurs scores d'abord.
    // Pour un adversaire simulé : coups les plus dangereux pour l'IA d'abord.
    return player.id === aiPlayer.id ? scoreB - scoreA : scoreA - scoreB;
  });

  return ordered;
}



function applyTemporaryMove(player, piece, to) {
  const undo = {
    piece,
    previousPosition: piece.position,
    previousFace: piece.face,
  };

  const previousFace = piece.face;
  const from = piece.position;

  piece.position = to;
  piece.face = piece.face === "RECTO" ? "VERSO" : "RECTO";

  state.moveHistory.push({
    playerId: player.id,
    playerName: player.name,
    color: player.color,
    pieceId: piece.id,
    from,
    to,
    previousFace,
    newFace: piece.face,
    afterSignature: boardSignature(),
    simulation: true,
  });

  return undo;
}

function undoTemporaryMove(undo) {
  state.moveHistory.pop();
  undo.piece.position = undo.previousPosition;
  undo.piece.face = undo.previousFace;
}

function boardSignature() {
  return state.pieces
    .map(piece => `${piece.id}:${piece.position}:${piece.face}`)
    .sort()
    .join("|");
}

function recentBoardRepeatCount(signature) {
  const recentMoves = state.moveHistory
    .filter(move => !move.pass && !move.system && !move.simulation && move.afterSignature)
    .slice(-CONFIG.stagnation.recentBoardLookback);

  return recentMoves.filter(move => move.afterSignature === signature).length;
}

function isImmediateReturn(piece, to) {
  const owner = ownerOfPiece(piece);
  if (!owner) return false;

  const lastMove = [...state.moveHistory]
    .reverse()
    .find(move =>
      !move.pass &&
      !move.system &&
      !move.simulation &&
      move.playerId === owner.id &&
      move.pieceId === piece.id
    );

  return Boolean(lastMove && lastMove.from === to && lastMove.to === piece.position);
}


function recentNoProgressStreak(playerId) {
  const moves = (state.moveHistory || [])
    .filter(move => !move.pass && !move.system && !move.simulation && move.playerId === playerId)
    .slice(-10)
    .reverse();

  let streak = 0;
  for (const move of moves) {
    if ((move.progressDelta || 0) > (CONFIG.stagnation.progressThreshold || 30)) break;
    streak++;
  }
  return streak;
}

function staticMoveScore(player, piece, to, aiPlayer) {
  const beforeConstructiveScore = evaluatePlayerPosition(player);
  const undo = applyTemporaryMove(player, piece, to);
  let score = evaluateBoardForAI(aiPlayer);

  const afterConstructiveScore = evaluatePlayerPosition(player);
  const progressDelta = afterConstructiveScore - beforeConstructiveScore;
  const repeatedBoards = recentBoardRepeatCount(boardSignature());
  const playerCreatesThreat = countImmediateWinningMoves(player);
  const winsNow = checkVictory(player);

  if (checkVictory(aiPlayer)) score += CONFIG.winScore;

  const opponents = state.players.filter(p => p.id !== aiPlayer.id && !isPlayerRanked(p.id));
  const immediateThreats = opponents.reduce((sum, opponent) => sum + countImmediateWinningMoves(opponent), 0);
  score -= immediateThreats * CONFIG.weights.dangerPenalty;

  if (!winsNow) {
    if (repeatedBoards >= 3) score -= CONFIG.stagnation.thirdRepeatPenalty;
    else if (repeatedBoards === 2) score -= CONFIG.stagnation.secondRepeatPenalty;
    else if (repeatedBoards === 1) score -= CONFIG.stagnation.firstRepeatPenalty;

    if (progressDelta < -80) {
      score -= CONFIG.stagnation.regressionPenalty + Math.abs(progressDelta) * CONFIG.stagnation.regressionMultiplier;
    } else if (progressDelta < (CONFIG.stagnation.progressThreshold || 30) &&
               playerCreatesThreat === 0 && immediateThreats === 0) {
      const streak = recentNoProgressStreak(player.id);
      score -= CONFIG.stagnation.noProgressPenalty * (1 + Math.min(4, streak) * 0.35);
    }
  }

  undoTemporaryMove(undo);
  return score;
}





function evaluateBoardForAI(aiPlayer) {
  const opponents = state.players.filter(p => p.id !== aiPlayer.id && !isPlayerRanked(p.id));
  let score = evaluatePlayerPosition(aiPlayer) * 1.65;

  for (const opponent of opponents) {
    const threat = countImmediateWinningMoves(opponent);
    const opponentStrength = evaluatePlayerPosition(opponent);

    score -= opponentStrength * 0.45;
    score -= threat * CONFIG.weights.immediateThreatPenalty;
  }

  score += countImmediateWinningMoves(aiPlayer) * 420000;

  return score;
}

function evaluatePlayerPosition(player) {
  const pieces = state.pieces.filter(p => p.color === player.color);
  const groups = connectedGroupCount(pieces);
  const sameFaceCount = Math.max(
    pieces.filter(p => p.face === "RECTO").length,
    pieces.filter(p => p.face === "VERSO").length
  );
  const adjacency = sideAdjacencyScore(pieces);
  const compactness = averagePairDistance(pieces);
  const mobility = legalMovesForPlayer(player).length;
  const largestGroup = largestConnectedGroupSize(pieces);
  const centerControl = centerControlScore(pieces);

  let score = 0;
  score += (10 - groups) * CONFIG.weights.groups;
  score += largestGroup * CONFIG.weights.largestGroup;
  score -= compactness * CONFIG.weights.compactness;
  score += adjacency * CONFIG.weights.sideAdjacency;
  score += sameFaceCount * CONFIG.weights.sameFace;

  if (groups === 1) score += 6200;
  if (largestGroup >= 5) score += 1800;
  if (largestGroup >= 6) score += 3200;

  if (sameFaceCount >= 5) score += 900;
  if (sameFaceCount >= 6) score += 2200;
  if (sameFaceCount === 7) score += 3600;

  score += mobility * 7;
  score += centerControl * 18;
  score += gatheringZoneScore(player);
  score += winningPatternScore(player);

  return score;
}

function centerControlScore(pieces) {
  const center = { x: 300, y: 300 };
  return pieces.reduce((score, piece) => {
    const c = CELL_CENTROIDS[piece.position];
    return score + Math.max(0, 350 - (Math.abs(c.x - center.x) + Math.abs(c.y - center.y)));
  }, 0) / 100;
}

function averagePairDistance(pieces) {
  if (pieces.length <= 1) return 0;

  let total = 0;
  let count = 0;

  for (let i = 0; i < pieces.length; i++) {
    for (let j = i + 1; j < pieces.length; j++) {
      const a = CELL_CENTROIDS[pieces[i].position];
      const b = CELL_CENTROIDS[pieces[j].position];
      total += Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
      count++;
    }
  }

  return total / count;
}

function wouldWinAfterMove(player, piece, to) {
  const undo = applyTemporaryMove(player, piece, to);
  const result = checkVictory(player);
  undoTemporaryMove(undo);
  return result;
}

function countImmediateWinningMoves(player) {
  return legalMovesForPlayer(player)
    .filter(move => wouldWinAfterMove(player, move.piece, move.to))
    .length;
}

function connectedGroupCount(pieces) {
  const remaining = new Set(pieces.map(p => p.position));
  let groups = 0;

  while (remaining.size) {
    groups++;
    const start = remaining.values().next().value;
    const stack = [start];

    while (stack.length) {
      const current = stack.pop();
      if (!remaining.has(current)) continue;
      remaining.delete(current);

      for (const neighbor of sideAdjacentCells(current)) {
        if (remaining.has(neighbor)) stack.push(neighbor);
      }
    }
  }

  return groups;
}

function largestConnectedGroupSize(pieces) {
  const remaining = new Set(pieces.map(p => p.position));
  let largest = 0;

  while (remaining.size) {
    const start = remaining.values().next().value;
    const stack = [start];
    let size = 0;

    while (stack.length) {
      const current = stack.pop();
      if (!remaining.has(current)) continue;
      remaining.delete(current);
      size++;

      for (const neighbor of sideAdjacentCells(current)) {
        if (remaining.has(neighbor)) stack.push(neighbor);
      }
    }

    largest = Math.max(largest, size);
  }

  return largest;
}

function sideAdjacencyScore(pieces) {
  const positions = new Set(pieces.map(p => p.position));
  let score = 0;

  for (const piece of pieces) {
    for (const neighbor of sideAdjacentCells(piece.position)) {
      if (positions.has(neighbor)) score++;
    }
  }

  return score / 2;
}

function checkVictory(player) {
  const pieces = state.pieces.filter(p => p.color === player.color);
  if (pieces.length !== 7) return false;

  const firstFace = pieces[0].face;
  if (!pieces.every(p => p.face === firstFace)) return false;

  return areConnectedBySide(pieces);
}

function areConnectedBySide(pieces) {
  const positions = new Set(pieces.map(p => p.position));
  const start = pieces[0].position;
  const visited = new Set();
  const stack = [start];

  while (stack.length) {
    const current = stack.pop();

    if (visited.has(current)) continue;
    visited.add(current);

    for (const neighbor of sideAdjacentCells(current)) {
      if (positions.has(neighbor) && !visited.has(neighbor)) {
        stack.push(neighbor);
      }
    }
  }

  return visited.size === pieces.length;
}

function sideAdjacentCells(cellId) {
  return SIDE_ADJACENCY_MAP[cellId] || [];
}
