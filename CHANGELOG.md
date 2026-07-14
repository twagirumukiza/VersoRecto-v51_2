# Changelog

## V51.2 — Correctif critique : la partie ne démarrait plus
- **Bug bloquant (déjà présent dans le zip v51 initial, avant même mes correctifs v51.1) :** les déclarations `const INITIAL_POSITIONS = {...}` et `const SYMMETRIC_MOVES = parseMoveTable(MOVES_TEXT);` (thread principal, utilisées par `createPieces()` et par la validation des coups côté page) avaient été supprimées par erreur — probablement lors d'un remplacement automatique trop large pendant un patch v50/v51 antérieur. Résultat : cliquer sur « Lancer la partie » levait `ReferenceError: Can't find variable: INITIAL_POSITIONS` et bloquait toute partie, en local comme en ligne. Restauré à l'identique de la v48/v50 (clés `YELLOW/RED/BLUE/BLACK`, cohérentes avec `COLOR_KEYS`). Vérifié par exécution réelle de `createPieces()` (28 pièces générées, positions correctes) et par `parseMoveTable(MOVES_TEXT)` (table de déplacements valide), pas seulement par relecture du code.
- Cette régression n'affectait pas le Worker IA (qui a sa propre copie interne de `SYMMETRIC_MOVES`, reçue via `postMessage`), ce qui explique qu'elle soit passée inaperçue pendant la revue du moteur de recherche en v51.1 : le jeu ne pouvait plus du tout démarrer, donc l'IA n'avait simplement jamais l'occasion de jouer.

## V51.1 — Corrections d'efficacité de l'IA
- **Bug critique corrigé (préexistant, hérité de la v50, indépendant du patch Path Planner) :** dans le Worker IA, `openingMovePool` référençait la constante globale `AI_OPENING_DISTINCT_PIECES`, absente de la portée isolée du Worker. À **chaque tour normal** (sans victoire/blocage immédiat à jouer), le Worker levait une `ReferenceError` silencieusement rattrapée, et le jeu retombait systématiquement sur l'IA de repli à 1 coup au lieu du Victory Planner/Path Planner. Corrigé (lecture de `CONFIG.openingDistinctPieces`), et vérifié par exécution réelle du moteur dans un bac à sable Node (pas seulement une vérification syntaxique).
- **Bug de double application de coup corrigé dans `tacticalMovePool` :** pour chaque coup candidat, `staticMoveScore` était appelé alors que ce même coup était déjà temporairement appliqué sur le plateau, ce qui provoquait un second déplacement vers la même case (« double bascule » de la face RECTO/VERSO) et faussait l'évaluation de position pour **chaque candidat, à chaque nœud de recherche**. `staticMoveScore` est désormais appelé avant toute application temporaire.
- **Complexité quadratique supprimée :** `tacticalMovePool` recalculait `countImmediateWinningMoves` (coûteux, lui-même en O(n)) pour chaque coup candidat — un coût O(n²) redondant avec la détection des coups gagnants déjà garantie par ailleurs. Supprimé. Le motif gagnant « avant » était également recalculé identiquement pour chaque candidat ; il est désormais calculé une seule fois. Le Path Planner et le Victory Planner disposent ainsi de plus de marge de calcul pour la même profondeur, à budget de temps égal.
- **Régression du budget de réflexion corrigée :** `AI_MAX_TURN_MS`/`AI_WORKER_DEADLINE_MS` étaient retombés à 7000/6500 ms (au lieu des ~10 s prévus), avec le garde-fou principal qui coupait 200 ms **avant** même le délai interne du Worker. Portés à 10000/10500 ms, avec une marge de sécurité correcte.
- **Config du Worker complétée :** les profondeurs/limites tactiques et critiques (`tacticalDepthTwoPlayers`, `criticalCandidateLimitMulti`, etc.) n'étaient jamais transmises par le thread principal — le Worker fonctionnait uniquement grâce à des valeurs de repli codées en dur. Elles sont désormais explicitement envoyées depuis `game.js`.
- **Régression de sécurité corrigée (hors périmètre IA) :** la protection contre l'injection de formule CSV (`csvCell`, ajoutée en v48.2) avait disparu dans cette branche ; rétablie.
- Correctifs déjà présents dans cette branche et vérifiés intacts : XSS (`escapeHtml`), bug `currentRoomCode` du multijoueur.
- Aucune régression : `tests/smoke-test.js` et `tests/v51-path-planner-test.js` passent ; le moteur a été exécuté réellement (pas seulement vérifié syntaxiquement) sur un plateau synthétique multi-pièces pour confirmer que `openingMovePool` et `tacticalMovePool` s'exécutent sans erreur.

## V51 — Path Planner stratégique
- navigation Dijkstra sur les déplacements légaux ;
- recherche de la meilleure porte d’entrée du groupe central ;
- détection et coût des barrières adverses ;
- mémoire locale des itinéraires échoués et des retours ;
- score de contournement fondé sur le coût réel, les alternatives et la progression ;
- Victory Planner et mémoire hybride V50 conservés.

# Changelog

## v51.0.0

- Ajout de `VR50Memory` et migration automatique de la mémoire v48.
- La mémoire ne choisit plus directement le coup avant le Victory Planner.
- Transmission des statistiques de la position courante au Web Worker IA.
- Intégration des résultats appris dans l'ordre des coups et le départage des scores.
- Pondération prudente par moyenne, variance, nombre d'essais et confiance.
- Influence mémoire plafonnée pour empêcher un ancien mauvais apprentissage de masquer une victoire ou une défense forcée.
- Ajout du compteur « Coups fiables (3+ essais) ».
- Préparation des profils IA stable/candidate et de la promotion Champion.
- Conservation des correctifs multijoueur de la v48.3 et du Victory Planner v49.
