# Verso Recto v51 — IA hybride

Version construite sur la v49 avec conservation du Victory Planner adaptatif et ajout d'une mémoire statistique réellement intégrée à la recherche.

## Nouveautés v51

- migration automatique des données de mémoire v48 vers le schéma v51 ;
- score d'expérience prudent tenant compte du résultat, du nombre d'essais et de l'incertitude ;
- la mémoire fournit des *priors* au Victory Planner au lieu de court-circuiter son calcul ;
- bonus mémoire plafonné à 4 % du score de victoire afin de préserver les priorités tactiques ;
- victoires immédiates et blocages obligatoires toujours prioritaires ;
- distinction des coups fiables ayant au moins trois essais ;
- stockage de profils `stable` et `candidate` préparant les tests Champion ;
- import compatible avec les exports v48 et v51 ;
- profondeur adaptative v49 conservée : jusqu'à 9 demi-coups en situation critique.

## Déploiement GitHub Pages

Copier tout le contenu de ce dossier à la racine du dépôt GitHub Pages, puis forcer le rechargement du navigateur.
