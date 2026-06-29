# Empreinte carbone CO2 — France & comparaison internationale

Tableau de bord interactif comparant les **émissions territoriales** (produites sur le sol national)
et l'**empreinte basée consommation** (qui inclut le CO2 importé via les biens et services consommés),
pour la France, les grands pays de l'UE et du monde.

Comparaison neutre à partir des études existantes. Page HTML autonome (aucune dépendance externe,
aucun serveur requis).

## Utilisation

Ouvre simplement **`index.html`** dans un navigateur (double-clic). Les données sont chargées
depuis `data.js`.

Onglets :
- **France** : territorial vs empreinte de consommation vs imports nets (CO2eq, SDES/INSEE)
- **Comparaison par pays** : 14 pays, métrique au choix, courbes décochables (CO2 fossile, GCP/OWID)
- **Imports nets** : importateurs vs exportateurs nets de CO2 + empreinte par habitant
- **Détail sectoriel (France)** : alimentation, transport, logement, textile/luxe, services…
- **Par secteur & électricité** : structure / volume absolu / par habitant, + CO2 importé ; intensité élec.
- **Transport (France)** : par mode, par usage (quotidien/voyages/fret), focus aviation
- **Sources & méthode** : études de référence + limites méthodologiques

## Données

Les CSV éditables sont dans **`/data`**. Pour modifier les chiffres :
1. édite un CSV, puis dans la page → bouton **« Charger mes CSV… »** (glisser-déposer aussi possible),
2. ou modifie `build.js` et relance `node build.js` (régénère les CSV **et** `data.js`).

### Périmètres (important)
Deux périmètres de gaz, **à ne pas mélanger sur un même axe** :
- **CO2 fossile** (Global Carbon Project / Our World in Data) → comparaison internationale.
- **CO2eq tous gaz** (SDES/INSEE, Climate Watch) → focus France et structure sectorielle.

## Sources principales

Global Carbon Project · Our World in Data · OCDE (TECO2) · Eurostat (FIGARO) ·
SDES / INSEE (empreinte carbone de la France) · Haut Conseil pour le Climat · ADEME ·
Citepa/SECTEN · DGAC (ENPA) · EMP 2019 · The Shift Project · Carbone 4 · Ember · EXIOBASE ·
Peters et al. 2011 (PNAS). Détail dans l'onglet « Sources & méthode » et `data/co2_sources.csv`.

## Hébergement (GitHub Pages)

```bash
# une fois le dépôt poussé sur GitHub :
# Settings → Pages → Source : branche "main", dossier "/ (root)"
# le site sera servi sur https://<utilisateur>.github.io/<repo>/
```

Pour l'intégrer dans Notion : héberger d'abord sur GitHub Pages, puis dans Notion
`/embed` + l'URL de la page.
