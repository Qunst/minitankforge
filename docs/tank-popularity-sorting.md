# Tank Popularity Sorting

This note documents the `Featured first` browse sort on `tanks.html`.

## Goal

The default browse order should feel like a tank enthusiast's natural shelf order:

1. The universally recognizable tanks first.
2. Strong hobby/game/collector favorites next.
3. Historically useful but less famous vehicles after that.
4. Support vehicles, niche variants, and obscure prototypes lower unless they are especially famous.

This is not a strict historical-performance ranking. It is a buyer/browsing popularity ranking.

## Implementation

The browser sort lives in `assets/js/app.js`.

- `tankEnthusiastPopularityOrder` gives the researched order for every current catalog tank.
- `tankEnthusiastPopularityScores` is generated from that list, with higher values sorting first.
- `browsePriority` can be added to a tank in `assets/js/tanks-data.js` to override the researched score.
- `getEstimatedTankPopularity()` gives new tanks an automatic fallback score from tags, type, historical status, and Etsy availability.
- The `featured` flag still controls the homepage featured strip, but no longer dominates the browse-page default order.

When adding a new tank:

1. Add normal tank data.
2. If it is an obvious famous vehicle, add `browsePriority`.
3. If unsure, let the fallback score place it and revisit after comparing the browse page.
4. Keep the first page balanced toward what shoppers and enthusiasts recognize quickly.

## Research Signals Used

The score list was calibrated from several popularity proxies:

- Public-interest pageview spot check from the Wikimedia Pageviews API for 2025. The largest sampled pages were M4 Sherman, Tiger I, T-34, Tiger II, Panzer IV, Panther, and Maus.
- Broad historical recognition: high-production or core-war vehicles rise because enthusiasts, modelers, and casual buyers recognize them quickly.
- Museum and pop-culture fame: Tiger I / Tiger 131, Sherman, T-34, Panther, Maus, Tiger II, and similar vehicles get a strong boost.
- Wargame/model-kit familiarity: vehicles that are common in tabletop, model, and tank-game conversations rank above equally historical but quieter support vehicles.
- Catalog/business fit: Etsy-listed vehicles and normal service vehicles get a slight practical boost over request-only paper/prototype vehicles.

Useful source anchors:

- Wikimedia Pageviews API: `https://wikimedia.org/api/rest_v1/metrics/pageviews/`
- M4 Sherman overview: `https://en.wikipedia.org/wiki/M4_Sherman`
- T-34 overview: `https://en.wikipedia.org/wiki/T-34`
- Tiger I / Tiger 131 context: `https://en.wikipedia.org/wiki/Tiger_I` and `https://en.wikipedia.org/wiki/Tiger_131`
- Panzer IV overview: `https://en.wikipedia.org/wiki/Panzer_IV`
- German tanks in WW2 overview: `https://en.wikipedia.org/wiki/German_tanks_in_World_War_II`

## Current Full Order

This is the current researched order for every tank in the catalog:

1. Sherman M4A3 (Medium Tank M4A3 Sherman) (`sherman-m4a3`)
2. Tiger I (Pz.Kpfw. VI Tiger Ausf. E) (`tiger-i`)
3. T-34 (T-34 Model 1942) (`t-34`)
4. Panther (Pz.Kpfw. V Panther) (`panther`)
5. Panzer IV (Pz.Kpfw. IV) (`panzer-iv`)
6. Tiger II (Pz.Kpfw. VI Tiger Ausf. B) (`tiger-ii`)
7. T-34/85 (T-34-85) (`t-34-85`)
8. Maus (Panzer VIII Maus) (`maus`)
9. KV-2 (Kliment Voroshilov-2) (`kv-2`)
10. Sherman Firefly (Sherman VC Firefly) (`sherman-firefly`)
11. Churchill IV (Infantry Tank Mk IV Churchill IV) (`churchill-iv`)
12. StuG III (Sturmgeschütz III) (`stug-iii`)
13. Pershing (M26 Pershing) (`pershing`)
14. Panzer III (Pz.Kpfw. III) (`panzer-iii`)
15. IS-2 (Iosif Stalin-2) (`is-2`)
16. KV-1 (Kliment Voroshilov-1) (`kv-1`)
17. Jagdpanther (Sd.Kfz. 173 Jagdpanther) (`jagdpanther`)
18. M60A1 (M60A1 Patton) (`m60a1`)
19. M18 Hellcat (76 mm Gun Motor Carriage M18) (`m18-hellcat`)
20. M10 Wolverine (3-inch Gun Motor Carriage M10) (`m10-wolverine`)
21. Hetzer (Jagdpanzer 38 Hetzer) (`hetzer`)
22. Jagdtiger (Sd.Kfz. 186 Jagdtiger) (`jagdtiger`)
23. Ferdinand (Sd.Kfz. 184 Ferdinand) (`ferdinand`)
24. M3 Lee (Medium Tank M3 Lee) (`m3-lee`)
25. M5A1 Stuart (Light Tank M5A1 Stuart) (`m5a1-stuart`)
26. M24 Chaffee (Light Tank M24) (`m24-chaffee`)
27. Cromwell IV (Cruiser Tank Mk VIII Cromwell IV) (`cromwell`)
28. Matilda II (Infantry Tank Mk II Matilda II) (`matilda-ii`)
29. Valentine (Infantry Tank Mk III Valentine) (`valentine`)
30. IS-3 (Iosif Stalin-3) (`is-3`)
31. IS-7 (Object 260) (`is-7`)
32. ISU-152 (ISU-152) (`isu-152`)
33. SU-100 (Samokhodnaya Ustanovka 100) (`su-100`)
34. SU-85 (Samokhodnaya Ustanovka 85) (`su-85`)
35. Jagdpz IV (Jagdpanzer IV) (`jagdpz-iv`)
36. T28/T95 Combat Configuration (Super Heavy Tank T28) (`t28-t95-combat`)
37. A39 Tortoise (Tank, Heavy Assault, Tortoise) (`tortoise`)
38. E-100 (Entwicklung 100) (`e-100`)
39. E-25 (Entwicklung 25) (`e-25`)
40. E-50 (Entwicklung 50) (`e-50`)
41. E-75 (Entwicklung 75) (`e-75`)
42. Jagdpanzer E 100 (Jagdpanzer E 100) (`jagdpanzer-e100`)
43. Panzer VII Loewe (Panzerkampfwagen VII Loewe) (`panzer-vii-loewe`)
44. Jagdpanther II (Jagdpanther 2) (`jagdpanther-ii`)
45. T-35 (T-35 Heavy Tank) (`t-35`)
46. T28/T95 Transport Configuration (Super Heavy Tank T28) (`t28-t95-transport`)
47. Type 97 Chi-Ha (Type 97 Medium Tank Chi-Ha) (`type-97-chi-ha`)
48. Type 95 Ha-Go (Type 95 Light Tank Ha-Go) (`type-95-ha-go`)
49. M8 Greyhound (Light Armored Car M8) (`m8-greyhound`)
50. Sd.Kfz. 234 (Schwerer Panzerspaehwagen Sd.Kfz. 234) (`sd-kfz-234`)
51. M7 Priest (105 mm Howitzer Motor Carriage M7) (`m7-priest`)
52. M3 Half-track (M3 Half-track) (`m3-half-track`)
53. Luchs (Pz.Kpfw. II Ausf. L Luchs) (`luchs`)
54. Panzer 38(t) (Lehký tank vz. 38) (`panzer-38t`)
55. Panzer 35(t) (Lehký tank vz. 35) (`panzer-35t`)
56. T-34 Minesweeper (T-34 Mine Roller) (`t-34-minesweeper`)
57. SU-76 (Samokhodnaya Ustanovka 76) (`su-76`)
58. Nashorn (Sd.Kfz. 164 Nashorn) (`nashorn`)
59. Hummel (Sd.Kfz. 165 Hummel) (`hummel`)
60. Wespe (Sd.Kfz. 124 Wespe) (`wespe`)
61. Archer (Self-Propelled 17-pdr, Valentine, Mk I) (`archer`)
62. M10 Achilles (17-pounder SP Achilles) (`m10-achilles`)
63. Churchill IV Fascine (Churchill fascine carrier) (`churchill-iv-fascine`)
64. M13/40 (Carro Armato M13/40) (`m13-40`)
65. M14/41 (Carro Armato M14/41) (`m14-41`)
66. SU-122 (Samokhodnaya Ustanovka 122) (`su-122`)
67. ISU-122 (ISU-122) (`isu-122`)
68. KV-1S (Kliment Voroshilov-1S) (`kv-1s`)
69. T-70 (T-70 Light Tank) (`t-70`)
70. T-26 (T-26 Light Tank) (`t-26`)
71. T-28 (T-28 Medium Tank) (`t-28`)
72. T-26 Twin-Turret (T-26 Model 1931) (`t-26-twin-turret`)
73. FCM F1 (Char de Forteresse FCM F1) (`fcm-f1`)
74. Centaur IV (Cruiser Tank Mk VIII Centaur IV) (`centaur`)
75. Bishop (Carrier Valentine 25-pdr Gun Mk I) (`bishop`)
76. BA-64 (BA-64 Armored Car) (`ba-64`)
77. BA-6 (BA-6 Armored Car) (`ba-6`)
78. GAZ-AA Truck (GAZ-AA) (`gaz-aa`)
79. Opel Blitz Truck (Opel Blitz 3-ton Truck) (`opel-blitz`)
80. ZiS-42 (ZiS-42 Half-track Truck) (`zis-42`)
81. STZ-5 (STZ-5 Artillery Tractor) (`stz-5`)
82. B-4 Howitzer (203 mm Howitzer M1931 B-4) (`b-4-howitzer`)
83. T-38 (T-38 Amphibious Scout Tank) (`t-38`)
84. A-32 (A-32 Prototype) (`a-32`)
85. IS-1 (Iosif Stalin-1) (`is-1`)
