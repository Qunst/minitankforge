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
13. Sturmtiger (Sturmmorser Tiger) (`sturmtiger`)
14. Pershing (M26 Pershing) (`pershing`)
15. Panzer III (Pz.Kpfw. III) (`panzer-iii`)
16. IS-2 (Iosif Stalin-2) (`is-2`)
17. KV-1 (Kliment Voroshilov-1) (`kv-1`)
18. Jagdpanther (Sd.Kfz. 173 Jagdpanther) (`jagdpanther`)
19. M60A1 (M60A1 Patton) (`m60a1`)
20. M18 Hellcat (76 mm Gun Motor Carriage M18) (`m18-hellcat`)
21. M10 Wolverine (3-inch Gun Motor Carriage M10) (`m10-wolverine`)
22. Hetzer (Jagdpanzer 38 Hetzer) (`hetzer`)
23. Jagdtiger (Sd.Kfz. 186 Jagdtiger) (`jagdtiger`)
24. Ferdinand (Sd.Kfz. 184 Ferdinand) (`ferdinand`)
25. M3 Lee (Medium Tank M3 Lee) (`m3-lee`)
26. M5A1 Stuart (Light Tank M5A1 Stuart) (`m5a1-stuart`)
27. M24 Chaffee (Light Tank M24) (`m24-chaffee`)
28. Cromwell IV (Cruiser Tank Mk VIII Cromwell IV) (`cromwell`)
29. Matilda II (Infantry Tank Mk II Matilda II) (`matilda-ii`)
30. Valentine (Infantry Tank Mk III Valentine) (`valentine`)
31. IS-3 (Iosif Stalin-3) (`is-3`)
32. IS-7 (Object 260) (`is-7`)
33. T29 (Heavy Tank T29) (`t29`)
34. T30 (Heavy Tank T30) (`t30`)
35. T34 Heavy Tank (Heavy Tank T34) (`t34-heavy-tank`)
36. ISU-152 (ISU-152) (`isu-152`)
37. KV-85 (Kliment Voroshilov-85) (`kv-85`)
38. SU-100 (Samokhodnaya Ustanovka 100) (`su-100`)
39. SU-85 (Samokhodnaya Ustanovka 85) (`su-85`)
40. Jagdpz IV (Jagdpanzer IV) (`jagdpz-iv`)
41. T28/T95 Combat Configuration (Super Heavy Tank T28) (`t28-t95-combat`)
42. A39 Tortoise (Tank, Heavy Assault, Tortoise) (`tortoise`)
43. E-100 (Entwicklung 100) (`e-100`)
44. KV-5 (KV-5 Heavy Tank Project) (`kv-5`)
45. E-25 (Entwicklung 25) (`e-25`)
46. E-50 (Entwicklung 50) (`e-50`)
47. E-75 (Entwicklung 75) (`e-75`)
48. Jagdpanzer E 100 (Jagdpanzer E 100) (`jagdpanzer-e100`)
49. Panzer VII Loewe (Panzerkampfwagen VII Loewe) (`panzer-vii-loewe`)
50. Jagdpanther II (Jagdpanther 2) (`jagdpanther-ii`)
51. T-35 (T-35 Heavy Tank) (`t-35`)
52. T28/T95 Transport Configuration (Super Heavy Tank T28) (`t28-t95-transport`)
53. Type 97 Chi-Ha (Type 97 Medium Tank Chi-Ha) (`type-97-chi-ha`)
54. Type 95 Ha-Go (Type 95 Light Tank Ha-Go) (`type-95-ha-go`)
55. M8 Greyhound (Light Armored Car M8) (`m8-greyhound`)
56. Sd.Kfz. 234 (Schwerer Panzerspaehwagen Sd.Kfz. 234) (`sd-kfz-234`)
57. M7 Priest (105 mm Howitzer Motor Carriage M7) (`m7-priest`)
58. M3 Half-track (M3 Half-track) (`m3-half-track`)
59. Luchs (Pz.Kpfw. II Ausf. L Luchs) (`luchs`)
60. Panzer 38(t) (Lehký tank vz. 38) (`panzer-38t`)
61. Panzer 35(t) (Lehký tank vz. 35) (`panzer-35t`)
62. T-34 Minesweeper (T-34 Mine Roller) (`t-34-minesweeper`)
63. SU-76 (Samokhodnaya Ustanovka 76) (`su-76`)
64. Nashorn (Sd.Kfz. 164 Nashorn) (`nashorn`)
65. Hummel (Sd.Kfz. 165 Hummel) (`hummel`)
66. Wespe (Sd.Kfz. 124 Wespe) (`wespe`)
67. Archer (Self-Propelled 17-pdr, Valentine, Mk I) (`archer`)
68. M10 Achilles (17-pounder SP Achilles) (`m10-achilles`)
69. Churchill IV Fascine (Churchill fascine carrier) (`churchill-iv-fascine`)
70. M13/40 (Carro Armato M13/40) (`m13-40`)
71. M14/41 (Carro Armato M14/41) (`m14-41`)
72. SU-122 (Samokhodnaya Ustanovka 122) (`su-122`)
73. ISU-122 (ISU-122) (`isu-122`)
74. KV-1S (Kliment Voroshilov-1S) (`kv-1s`)
75. T-70 (T-70 Light Tank) (`t-70`)
76. T-26 (T-26 Light Tank) (`t-26`)
77. T-28 (T-28 Medium Tank) (`t-28`)
78. T-26 Twin-Turret (T-26 Model 1931) (`t-26-twin-turret`)
79. FCM F1 (Char de Forteresse FCM F1) (`fcm-f1`)
80. Centaur IV (Cruiser Tank Mk VIII Centaur IV) (`centaur`)
81. Bishop (Carrier Valentine 25-pdr Gun Mk I) (`bishop`)
82. BA-64 (BA-64 Armored Car) (`ba-64`)
83. BA-6 (BA-6 Armored Car) (`ba-6`)
84. GAZ-AA Truck (GAZ-AA) (`gaz-aa`)
85. Opel Blitz Truck (Opel Blitz 3-ton Truck) (`opel-blitz`)
86. ZiS-42 (ZiS-42 Half-track Truck) (`zis-42`)
87. STZ-5 (STZ-5 Artillery Tractor) (`stz-5`)
88. B-4 Howitzer (203 mm Howitzer M1931 B-4) (`b-4-howitzer`)
89. T-38 (T-38 Amphibious Scout Tank) (`t-38`)
90. A-32 (A-32 Prototype) (`a-32`)
91. IS-1 (Iosif Stalin-1) (`is-1`)
