/* Génère les CSV (éditables) + data.js (consommé par index.html) à partir d'une
 * source unique de vérité. Relancer après édition: `node build.js`.
 * Sources: Global Carbon Project / Our World in Data (CO2 fossile, comparaison pays),
 * SDES / INSEE (CO2eq tous gaz, France). Voir data/co2_sources.csv. */
const fs = require('fs');
const path = require('path');

const OUT = __dirname;
const DATA = path.join(OUT, 'data');
fs.mkdirSync(DATA, { recursive: true });

/* ---------- SOURCE UNIQUE DE VÉRITÉ ---------- */

// Comparaison pays — CO2 FOSSILE (+ciment), MtCO2, GCP/OWID (millésime GCB 2024)
const YEARS = [1995, 2000, 2005, 2010, 2015, 2018, 2020, 2021, 2022];
const PAYS = [
  { name: 'France',       group: 'UE',   perCap: 6.6,  terr: [387.0,407.4,416.3,377.1,332.1,323.1,281.5,307.3,295.3], cons: [499.6,513.5,545.5,511.1,434.7,456.1,399.0,440.2,437.4] },
  { name: 'Allemagne',    group: 'UE',   perCap: 9.98, terr: [833.6,838.12,844.58,821.36,799.67,762.7,644.26,681.92,645.82], cons: [1152,1100.67,1045.26,1027.08,899.51,892.14,777.62,834.07,838.81] },
  { name: 'Italie',       group: 'UE',   perCap: 7.75, terr: [439.82,465.37,486.54,416.09,391.17,369.2,331.98,360.63,360.24], cons: [559.67,576.93,605.54,624.46,460.77,466.81,402.24,451.81,461.8] },
  { name: 'Espagne',      group: 'UE',   perCap: 5.88, terr: [288.29,332.37,398.33,328.61,286.55,281.62,256.55,282.91,291.34], cons: [288.95,359.24,412.09,359.39,310.69,332.27,289.54,316.78,319.49] },
  { name: 'Pologne',      group: 'UE',   perCap: 7.8,  terr: [379.85,344.34,369.2,396.21,398.66,401.07,373.08,407.69,401.24], cons: [336.53,317.77,369.16,418.26,381.62,405.07,369.84,413.27,413.48] },
  { name: 'Pays-Bas',     group: 'UE',   perCap: 8.79, terr: [182.72,193.5,206.22,201.28,188.34,189.41,165.22,177.97,171.51], cons: [182.66,null,203.66,210.92,160.66,165.48,146.85,159.29,157.38] },
  { name: 'Belgique',     group: 'UE',   perCap: 17.79,terr: [125.97,126.78,125.66,114.56,101.33,100.26,91.25,94.93,88.91], cons: [125.97,195.34,213.45,207.06,201.64,211.91,182.34,201.82,207.1] },
  { name: 'Chine',        group: 'INTL', perCap: 7.63, terr: [3351.2,3643.8,5882,8610,9858,10346.8,10896.5,11284.4,11711.8], cons: [3036.6,3236,4646.6,7260.7,8789.7,9443.4,9798.9,10088,10427] },
  { name: 'États-Unis',   group: 'INTL', perCap: 16.3, terr: [5425.8,6023.2,6126.9,5669.3,5368.5,5361.2,4690,5020.1,5055.4], cons: [5386.5,6229.7,6656,5800,5650,5640,4830,5489,5541] },
  { name: 'Inde',         group: 'INTL', perCap: 1.77, terr: [760.5,987.1,1195.4,1678.5,2231.8,2595.2,2422.7,2675.8,2831.1], cons: [728.6,914.4,1104.5,1571.1,1961.1,2239.1,2085.1,2252,2340] },
  { name: 'Japon',        group: 'INTL', perCap: 9.18, terr: [1235.9,1260.2,1286.4,1211.1,1220,1138.5,1037.3,1058.5,1029.6], cons: [1560,1582.8,1512.4,1421.6,1320.9,1274.3,1183.8,1219.8,1201.5] },
  { name: 'Russie',       group: 'INTL', perCap: 9.67, terr: [1618.3,1480.6,1564,1633.1,1635.2,1709.9,1631.9,1674.5,1675.5], cons: [1256.3,1137.8,1464.1,1581.7,1464.7,1406.8,1351.1,1375.2,1299.2] },
  { name: 'Brésil',       group: 'INTL', perCap: 2.23, terr: [268.7,340.2,364.4,440.3,528.2,476.6,448,496.6,480.1], cons: [290.4,353.8,349.1,478.9,556.2,484.4,437.2,473.3,465.2] },
  { name: 'Royaume-Uni',  group: 'INTL', perCap: 7.09, terr: [566.2,569,570.3,511.9,422.5,379.7,326.3,342.4,365], cons: [612.3,656.5,651.9,655.2,592.4,548,449.3,495.3,475.2] },
];

// France — empreinte CO2eq TOUS GAZ, MtCO2eq, SDES/INSEE
const FRANCE = [
  { year: 1995, terr: 553, cons: 623, net: 70 },
  { year: 2005, terr: 545, cons: 700, net: 155 },
  { year: 2010, terr: 500, cons: 720, net: 220 },
  { year: 2015, terr: 458, cons: 720, net: 262 },
  { year: 2018, terr: 445, cons: 749, net: 304 },
  { year: 2019, terr: 423, cons: 625, net: 202 },
  { year: 2023, terr: 403, cons: 583, net: 180 },
  { year: 2024, terr: 404, cons: 563, net: 159 },
];

// Secteurs France — empreinte par poste de consommation, MtCO2eq, SDES éd. 1990-2023 (total 644)
const SECTEURS = [
  { name: 'Transport / Mobilité',        value: 155, share: 24, imported: 50, detail: 'Déplacements des ménages, carburants, véhicules' },
  { name: 'Alimentation',                value: 148, share: 23, imported: 30, detail: 'Agriculture, agroalimentaire, boissons' },
  { name: 'Logement / Habitat',          value: 135, share: 21, imported: 25, detail: 'Chauffage, énergie domestique, construction' },
  { name: "Biens d'équipement & divers", value: 122, share: 19, imported: 70, detail: 'Dont textile-habillement ~3%, numérique ~4,5%, biens de luxe/équipement, loisirs' },
  { name: 'Services',                    value: 84,  share: 13, imported: 20, detail: 'Surtout publics : administration, santé, éducation' },
];

// Commerce net du carbone 2022 — CO2 fossile, MtCO2, OWID/GCP
const COMMERCE = [
  { name: 'France',      group: 'UE',   prod: 295.3,   cons: 437.4, perCap: 6.6,  netPct: 48.1 },
  { name: 'Allemagne',   group: 'UE',   prod: 645.82,  cons: 838.8, perCap: 9.98, netPct: 29.9 },
  { name: 'Italie',      group: 'UE',   prod: 360.24,  cons: 461.8, perCap: 7.75, netPct: 28.2 },
  { name: 'Espagne',     group: 'UE',   prod: 291.34,  cons: 319.49,perCap: 5.88, netPct: 9.7 },
  { name: 'Pologne',     group: 'UE',   prod: 401.24,  cons: 413.48,perCap: 7.8,  netPct: 3.1 },
  { name: 'Pays-Bas',    group: 'UE',   prod: 171.51,  cons: 157.38,perCap: 8.79, netPct: -8.2 },
  { name: 'Belgique',    group: 'UE',   prod: 88.91,   cons: 207.1, perCap: 17.79,netPct: 132.9 },
  { name: 'Royaume-Uni', group: 'INTL', prod: 365,     cons: 475.2, perCap: 7.09, netPct: 30.2 },
  { name: 'Chine',       group: 'INTL', prod: 11711.8, cons: 10427, perCap: 7.63, netPct: -11 },
  { name: 'États-Unis',  group: 'INTL', prod: 5055.4,  cons: 5541,  perCap: 16.3, netPct: 9.6 },
  { name: 'Inde',        group: 'INTL', prod: 2831.1,  cons: 2340,  perCap: 1.77, netPct: -17.3 },
  { name: 'Japon',       group: 'INTL', prod: 1029.6,  cons: 1201.5,perCap: 9.18, netPct: 16.7 },
  { name: 'Russie',      group: 'INTL', prod: 1675.5,  cons: 1299.2,perCap: 9.67, netPct: -22.5 },
  { name: 'Brésil',      group: 'INTL', prod: 480.1,   cons: 465.2, perCap: 2.23, netPct: -3.1 },
];

const SOURCES = [
  { name: 'Global Carbon Budget 2024', org: 'Global Carbon Project / Friedlingstein et al. (ESSD)', year: 2024, finding: 'Référence mondiale: émissions territoriales, basées consommation et transferts dans le commerce (méthode Peters et al. 2011). Pays riches importateurs nets, Chine/Asie exportateurs nets. CO2 fossile.', url: 'https://essd.copernicus.org/articles/17/965/2025/' },
  { name: 'Consumption-based CO2 emissions', org: 'Our World in Data (Ritchie, Rosado, Roser)', year: 2024, finding: 'Empreinte = émissions domestiques + importées − exportées. Offshoring: UK −27% territorial 1990-2014 mais −11% en consommation; USA +9% territorial mais +17% consommation.', url: 'https://ourworldindata.org/consumption-based-co2' },
  { name: 'Trade in Embodied CO2 (TECO2)', org: 'OCDE', year: 2021, finding: 'Indicateurs production vs demande dérivés des tables entrées-sorties ICIO. 76 économies, 45 industries, 1995-2019.', url: 'https://www.oecd.org/sti/ind/carbondioxideemissionsembodiedininternationaltrade.htm' },
  { name: 'Greenhouse gas emission footprints (FIGARO)', org: 'Eurostat', year: 2025, finding: 'Empreinte GES UE basée demande finale (tables FIGARO). ~10,7 t eq/hab (2023). Tous GES, modélisé.', url: 'https://ec.europa.eu/eurostat/statistics-explained/index.php?title=Greenhouse_gas_emission_footprints' },
  { name: "L'empreinte carbone de la France 1990-2024", org: 'SDES / INSEE', year: 2025, finding: 'Empreinte 2024 ~563 MtCO2eq (8,2 t/hab), ~50% importée; territorial ~404 Mt. Rupture méthode 2024 (FIGARO): empreinte 2023 révisée de 644 à 583 Mt.', url: 'https://www.statistiques.developpement-durable.gouv.fr/lempreinte-carbone-de-la-france-de-1990-2024' },
  { name: "Maîtriser l'empreinte carbone de la France", org: 'Haut Conseil pour le Climat', year: 2020, finding: 'Empreinte ~70% au-dessus des émissions territoriales. Moitié importée (UE dont Allemagne; Asie dont Chine). >3/4 pilotable depuis la France.', url: 'https://www.hautconseilclimat.fr/wp-content/uploads/2020/10/hcc_rapport_empreinte-carbone.pdf' },
  { name: 'Base Empreinte / ADEME', org: 'ADEME', year: 2023, finding: 'Empreinte France 2022 (provisoire) ~623 MtCO2eq, ~56% liée aux importations. Tous GES.', url: 'https://base-empreinte.ademe.fr/' },
  { name: 'EXIOBASE 3 (EE-MRIO)', org: 'Stadler, Wood et al.', year: 2018, finding: 'Base multirégionale entrées-sorties de référence pour les empreintes. Depuis 1995, 44 pays + 5 régions, 163 industries.', url: 'https://www.exiobase.eu/index.php/about-exiobase' },
  { name: 'Growth in emission transfers via international trade', org: 'Peters, Minx, Weber, Edenhofer (PNAS)', year: 2011, finding: 'Étude fondatrice des transferts d\'émissions. Commerce: 4,3 Gt CO2 (1990, 20%) → 7,8 Gt (2008, 26%). Les transferts annulent une partie des baisses affichées.', url: 'https://www.pnas.org/doi/10.1073/pnas.1006388108' },
  { name: "Mapped: world's largest CO2 importers/exporters", org: 'Carbon Brief', year: 2017, finding: 'Chine 1er exportateur net, USA 1er importateur net (~2x Japon). Baisses USA/UK en partie dues à la délocalisation.', url: 'https://www.carbonbrief.org/mapped-worlds-largest-co2-importers-exporters/' },
  { name: 'Convergence Eora/WIOD/EXIOBASE', org: 'Moran & Wood (Economic Systems Research)', year: 2014, finding: 'Incertitude des modèles MRIO: après harmonisation du compte satellite, les grandes économies divergent de <10%. Robuste pour la politique.', url: 'https://www.tandfonline.com/doi/abs/10.1080/09535314.2014.935298' },
];

const CAVEATS = [
  "Deux périmètres NON comparables sur un même axe : France (SDES/INSEE) = tous GES en CO2eq ; comparaison pays (OWID/GCP) = CO2 fossile seul. Ne pas comparer 563/644 (CO2eq) avec 437/407 (fossile), ni 8,2 t/hab (CO2eq) avec 6,6 t/hab (fossile).",
  "Les émissions basées consommation ne sont pas observées mais MODÉLISÉES (EXIOBASE, FIGARO, ICIO/OCDE, GTAP). Incertitude < ~10% pour les grandes économies, plus élevée pour petits pays et secteurs fins.",
  "Rupture méthodologique France 2024 (passage aux tables FIGARO) : l'empreinte 2023 a été révisée de 644 à 583 Mt. La ventilation sectorielle (total 644) est sur l'édition 1990-2023 et n'est pas homogène avec le total 2024 (563).",
  "Corrections appliquées au dataset brut : consommation USA ramenée de ~6566 à ~5541 Mt (2022) ; production territoriale UK portée de 311 à 365 Mt (2022). Valeur Pays-Bas 2000 (133,63, artefact OWID) retirée de la série.",
  "netImportedPct = (consommation − production) / production × 100 (émissions nettes importées rapportées à la production), à ne pas confondre avec la part importée de l'empreinte (~50% pour la France).",
  "Données consommation disponibles pour ~119 pays. Les émissions territoriales restent la base officielle des inventaires CCNUCC et des engagements (NDC) ; l'empreinte consommation est un indicateur complémentaire non officiel.",
  "Répartition sectorielle par pays = TOUS GES (CO2eq), 2023, source Climate Watch/CAIT via OWID, hors UTCATF. Périmètre différent du CO2 fossile des autres onglets : à utiliser pour comparer la STRUCTURE des émissions (où chaque pays émet), pas les niveaux absolus.",
  "Intensité carbone de l'électricité = gCO2/kWh, moyenne 2024, OWID/Ember. France ~40 (nucléaire+hydraulique), Pologne ~608 et Inde ~705 (charbon). Mais l'électricité ne pèse qu'~1/4 du CO2 total : l'avantage du mix ne joue que sur cette tranche.",
  "Transport France : il n'existe PAS de répartition officielle en tonnes par MOTIF (l'inventaire ventile par type de véhicule). Le découpage quotidien/voyages/fret est un ordre de grandeur (The Shift Project) ; les parts par motif viennent de l'EMP 2019 (en nombre de déplacements/km, pré-Covid) et de l'ENPA 2023 (passagers aériens). L'aviation internationale (soutes, ~18,7 Mt) est HORS inventaire territorial.",
];

/* ---------- DONNÉES SECTEUR / ÉLECTRICITÉ / TRANSPORT ---------- */

// Intensité carbone de l'électricité — gCO2/kWh, 2024 (OWID/Ember)
const ELEC = [
  { name:'France', val:40 }, { name:'Belgique', val:127 }, { name:'Brésil', val:106 },
  { name:'Espagne', val:146 }, { name:'Royaume-Uni', val:217 }, { name:'Pays-Bas', val:251 },
  { name:'Italie', val:281 }, { name:'Allemagne', val:336 }, { name:'États-Unis', val:384 },
  { name:'Russie', val:446 }, { name:'Japon', val:483 }, { name:'Chine', val:555 },
  { name:'Pologne', val:608 }, { name:'Inde', val:705 },
];

// Répartition sectorielle — % des émissions (tous GES CO2eq, 2023, Climate Watch/OWID, hors UTCATF)
const SECT_ORDER = ['Électricité & chaleur','Transport','Industrie & construction','Bâtiments','Agriculture','Autres / fugitives'];
// imp = CO2 net importé en % de la production (CO2 fossile, OWID/GCP 2022). Positif = importateur net.
// pop = population 2023 en millions (Banque mondiale / Eurostat).
// parts = [Électricité&chaleur, Transport, Industrie&construction, Bâtiments, Agriculture, Autres/fugitives]
// Tous GES CO2eq, 2023, Climate Watch via OWID, hors UTCATF (mêmes extraction/méthode pour les 15).
const SECT_PAYS = [
  { name:'France',      total:393,   imp:48,  pop:68.2,  parts:[11.2,31.5,15.0,12.6,17.1,12.5] },
  { name:'Allemagne',   total:673,   imp:30,  pop:84.5,  parts:[31.8,20.9,16.5,15.9,8.1,6.8] },
  { name:'Italie',      total:387,   imp:28,  pop:58.9,  parts:[22.4,27.7,16.3,13.4,8.1,12.2] },
  { name:'Espagne',     total:309,   imp:10,  pop:48.4,  parts:[17.4,29.8,13.7,7.1,12.3,19.6] },
  { name:'Pologne',     total:339,   imp:3,   pop:36.8,  parts:[36.4,20.1,11.6,10.7,10.1,11.1] },
  { name:'Pays-Bas',    total:182,   imp:-8,  pop:17.9,  parts:[23.9,14.6,13.0,9.6,10.2,28.6] },
  { name:'Belgique',    total:122,   imp:133, pop:11.7,  parts:[14.7,19.8,18.8,14.3,7.3,25.1] },
  { name:'UE (27)',     total:3260,  imp:30,  pop:449,   parts:[23.8,24.3,15.4,11.3,11.4,13.8] },
  { name:'Royaume-Uni', total:421,   imp:30,  pop:67.7,  parts:[18.6,25.9,11.1,16.9,11.9,15.5] },
  { name:'États-Unis',  total:5897,  imp:10,  pop:335,   parts:[29.6,29.3,11.5,8.8,6.2,14.5] },
  { name:'Japon',       total:1095,  imp:17,  pop:124.5, parts:[43.8,17.4,22.8,8.3,2.1,5.6] },
  { name:'Chine',       total:14050, imp:-11, pop:1411,  parts:[48.7,7.7,27.4,3.4,4.9,7.9] },
  { name:'Inde',        total:4137,  imp:-17, pop:1429,  parts:[37.5,8.8,21.7,5.8,19.5,6.7] },
  { name:'Russie',      total:2440,  imp:-23, pop:143.8, parts:[37.7,11.6,15.2,8.4,4.2,23.0] },
  { name:'Brésil',      total:1225,  imp:-3,  pop:216.4, parts:[5.7,18.5,12.0,2.4,47.5,13.9] },
];

// Transport France par mode — MtCO2eq, 2023 (Citepa SECTEN / SDES)
const TR_MODES = [
  { mode:'Voitures particulières', mt:67.4, share:53.0, perim:'territorial' },
  { mode:'Poids lourds (fret routier)', mt:27.9, share:22.0, perim:'territorial' },
  { mode:'Véhicules utilitaires légers', mt:19.5, share:15.4, perim:'territorial' },
  { mode:'Aviation domestique', mt:4.5, share:3.5, perim:'territorial' },
  { mode:'Autobus & autocars', mt:2.8, share:2.3, perim:'territorial' },
  { mode:'Maritime & fluvial national', mt:2.8, share:2.2, perim:'territorial' },
  { mode:'Deux-roues', mt:1.3, share:1.0, perim:'territorial' },
  { mode:'Ferroviaire', mt:0.5, share:0.5, perim:'territorial' },
  { mode:'Aviation internationale (soutes)', mt:18.7, share:null, perim:'hors-inventaire' },
  { mode:'Maritime international (soutes)', mt:5.5, share:null, perim:'hors-inventaire' },
];

// Transport France par usage — % du transport (ordre de grandeur The Shift Project : 14% quotidien + 9% LD + 9% fret sur 32% national)
const TR_USAGE = [
  { usage:'Mobilité du quotidien', share:44, note:'Domicile-travail, courses, accompagnement — trajets locaux' },
  { usage:'Voyages longue distance', share:28, note:'>100 km : vacances, visites, week-ends (dont avion)' },
  { usage:'Fret (marchandises)', share:28, note:'Poids lourds + utilitaires de livraison' },
];

// Paradoxe longue distance (EMP 2019) — poids des trajets > 100 km
const TR_LD = [
  { ind:'Part des déplacements', share:1.5 },
  { ind:'Part des distances parcourues', share:47 },
  { ind:'Part des émissions (mobilité des personnes)', share:45 },
];

// Aviation France — motifs des passagers (ENPA 2023, en % de passagers)
const AVIATION_MOTIFS = [
  { motif:'Loisirs / tourisme', share:51 },
  { motif:'Visites familiales (affinitaire)', share:25 },
  { motif:'Professionnel / affaires', share:19 },
  { motif:'Autres', share:5 },
];

/* ---------- CSV ---------- */
const esc = (v) => {
  if (v === null || v === undefined) return '';
  const s = String(v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
};
const toCSV = (headers, rows) => [headers.join(','), ...rows.map(r => r.map(esc).join(','))].join('\n') + '\n';

// 1. Pays — séries (format long)
const paysRows = [];
PAYS.forEach(p => YEARS.forEach((y, i) => {
  paysRows.push([p.name, p.group, y, p.terr[i], p.cons[i]]);
}));
const csvPays = toCSV(['pays', 'groupe', 'annee', 'co2_territorial_mt', 'co2_consommation_mt'], paysRows);

// 2. France overview
const csvFrance = toCSV(
  ['annee', 'territorial_mtco2eq', 'consommation_mtco2eq', 'imports_nets_mtco2eq'],
  FRANCE.map(d => [d.year, d.terr, d.cons, d.net])
);

// 3. Secteurs France
const csvSecteurs = toCSV(
  ['secteur', 'valeur_mtco2eq', 'part_pct', 'part_importee_pct', 'detail'],
  SECTEURS.map(s => [s.name, s.value, s.share, s.imported, s.detail])
);

// 4. Commerce net 2022
const csvCommerce = toCSV(
  ['pays', 'groupe', 'production_mtco2', 'consommation_mtco2', 'conso_par_hab_tco2', 'imports_nets_pct'],
  COMMERCE.map(c => [c.name, c.group, c.prod, c.cons, c.perCap, c.netPct])
);

// 5. Sources
const csvSources = toCSV(
  ['etude', 'organisme', 'annee', 'resultat', 'url'],
  SOURCES.map(s => [s.name, s.org, s.year, s.finding, s.url])
);

// 6. Intensité électricité
const csvElec = toCSV(['pays', 'gco2_kwh', 'annee'], ELEC.map(e => [e.name, e.val, 2024]));
// 7. Secteurs par pays (format long)
const sectRows = [];
SECT_PAYS.forEach(c => SECT_ORDER.forEach((s, i) => sectRows.push([c.name, s, c.parts[i], c.total, c.imp, c.pop])));
const csvSectPays = toCSV(['pays', 'secteur', 'part_pct', 'total_mtco2eq', 'import_net_pct', 'population_m'], sectRows);
// 8. Transport France — modes
const csvTrModes = toCSV(['mode', 'mtco2eq', 'part_pct', 'perimetre'], TR_MODES.map(m => [m.mode, m.mt, m.share, m.perim]));
// 9. Transport France — usage
const csvTrUsage = toCSV(['usage', 'part_pct_transport', 'detail'], TR_USAGE.map(u => [u.usage, u.share, u.note]));
// 10. Transport France — paradoxe longue distance
const csvTrLD = toCSV(['indicateur', 'part_pct'], TR_LD.map(d => [d.ind, d.share]));
// 11. Aviation — motifs
const csvAviation = toCSV(['motif', 'part_pct_passagers'], AVIATION_MOTIFS.map(m => [m.motif, m.share]));

fs.writeFileSync(path.join(DATA, 'co2_pays_series.csv'), csvPays);
fs.writeFileSync(path.join(DATA, 'co2_france_overview.csv'), csvFrance);
fs.writeFileSync(path.join(DATA, 'co2_france_secteurs.csv'), csvSecteurs);
fs.writeFileSync(path.join(DATA, 'co2_commerce_net.csv'), csvCommerce);
fs.writeFileSync(path.join(DATA, 'co2_sources.csv'), csvSources);
fs.writeFileSync(path.join(DATA, 'co2_elec_intensite.csv'), csvElec);
fs.writeFileSync(path.join(DATA, 'co2_secteurs_pays.csv'), csvSectPays);
fs.writeFileSync(path.join(DATA, 'co2_transport_modes.csv'), csvTrModes);
fs.writeFileSync(path.join(DATA, 'co2_transport_usage.csv'), csvTrUsage);
fs.writeFileSync(path.join(DATA, 'co2_transport_longue_distance.csv'), csvTrLD);
fs.writeFileSync(path.join(DATA, 'co2_aviation_motifs.csv'), csvAviation);

// data.js — consommé par index.html (fonctionne en double-clic, sans serveur)
const payload = {
  pays: csvPays,
  france: csvFrance,
  secteurs: csvSecteurs,
  commerce: csvCommerce,
  sources: csvSources,
  elec: csvElec,
  sectPays: csvSectPays,
  trModes: csvTrModes,
  trUsage: csvTrUsage,
  trLD: csvTrLD,
  aviationMotifs: csvAviation,
  caveats: CAVEATS,
};
fs.writeFileSync(path.join(OUT, 'data.js'), 'window.CO2_CSV = ' + JSON.stringify(payload) + ';\n');

console.log('OK — CSV + data.js générés dans', OUT);
