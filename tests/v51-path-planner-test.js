const fs = require('fs');
const worker = fs.readFileSync('ai-worker.js', 'utf8');
const game = fs.readFileSync('game.js', 'utf8');
const required = [
  'function v51EntryCells',
  'function v51RoutePlan',
  'function v51FailedRoutePenalty',
  'function v51PathPlannerScore',
  'return geometricScore + v51PathPlannerScore'
];
for (const token of required) {
  if (!worker.includes(token)) throw new Error(`ai-worker.js: élément V51 absent: ${token}`);
  if (!game.includes(token)) throw new Error(`game.js: élément V51 absent: ${token}`);
}
if (!worker.includes('barrierEscape') || !worker.includes('followsPath')) {
  throw new Error('Les bonus de contournement/barrière sont absents.');
}
console.log('OK V51: Path Planner, portes d’entrée, barrières, mémoire des échecs et contournement présents.');
