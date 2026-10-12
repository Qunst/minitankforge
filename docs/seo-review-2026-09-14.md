# MiniTankForge SEO review — 14 September 2026

## Result

The fresh Seobility crawl shows substantial on-page improvement since 2 September, especially in content and page discovery. Google Search Console shows early gains in visibility and several promising page-level movements, but traffic volume remains too low to establish an increase in organic traffic or sales.

Source: [Seobility project audit](https://app.seobility.net/project/997874/site-audit). The previous crawl ran on 2 September, 16:53–16:55; the fresh crawl ran on 14 September, 16:54–17:00 (times as displayed by Seobility), taking 5 minutes 49 seconds. Both audits used the existing crawl configuration. Seobility still recommends JavaScript crawling; no paid feature or crawl-setting change was enabled.

| Measure | 2 September | 14 September | Change |
| --- | ---: | ---: | ---: |
| Overall on-page score | 69% | 79% | +10 percentage points |
| Technical and metadata | 95% | 88% | -7 points |
| Structure | 82% | 78% | -4 points |
| Content | 30% | 70% | +40 points |
| Crawled pages | 165 | 142 | -23 |
| Indexable pages | 139 | 140 | +1 |
| Reported problems | 677 | 672 | -5 |
| Title problems | 21 | 0 | Cleared |
| Meta-description problems | 3 | 0 | Cleared |
| Title terms absent from body text | 114 | 7 | -107 |
| H1 terms absent from body text | 65 | 4 | -61 |
| Pages found only in the sitemap | 40 | 0 | Cleared |
| Internal redirects | 24 | 0 | Cleared |
| Pages at least three clicks deep | 8 | 0 | Cleared |
| H1 warnings | 21 | 37 | +16 |
| Strong/bold warnings | 0 | 116 | +116 |
| Repeated text blocks across pages | 25 | 208 | +183 |
| Identical link labels for different targets | 0 | 18 | +18 |
| Pages below Seobility's 500-word threshold | 137 | 132 | -5 |
| External-link warnings | 103 | 100 | -3 |
| Average page response time | 0.12 s | 0.13 s | Essentially unchanged |

Counts describe Seobility's report categories, not necessarily unique defects. The smaller crawl with one more indexable page is consistent with cleaner URL discovery; it does not mean 23 product pages disappeared. Seobility also reports zero broken internal pages, canonical problems, full-page duplicate-content issues, duplicate titles, duplicate descriptions, and missing file sources. It reports zero pages blocking Googlebot, OAI-SearchBot or Claude-SearchBot.

Before the 2 September crawl, the overview's displayed score differences imply an earlier overall score of 49% and technical score of 39%. That earlier crawl was not independently reopened; use the dated two-crawl comparison above as the reliable baseline.

## What the remaining warnings actually mean

1. **H1 warnings are principally short headings.** The visible examples include “Browse Tanks”, “Browse Sets”, “Reviews”, “FAQ”, “T-34 Tank Miniature” and “IS-3 Tank Miniature”. These are not missing H1 headings. Make category headings more descriptive when useful, but do not lengthen every product name to satisfy an arbitrary threshold. [H1 report](https://app.seobility.net/project/997874/site-audit/reports/heading-h1-problems)
2. **Bold markup has increased with the product facts.** The report flags “Many tags” and “Duplicate” on 116 pages. The generated product template uses repeated `strong` elements for facts and scale-table labels. This is a shared-template cleanup opportunity, not evidence of a Google penalty. Preserve useful facts and visual readability. [Bold report](https://app.seobility.net/project/997874/site-audit/reports/strong-bold-problems)
3. **Generic internal links now appear in the report.** “View set” links to many different national sets, and “View pack” links to the four game packs. Consider descriptive linked card names or more specific link wording, with visual review to avoid long, cluttered buttons. [Anchor-text report](https://app.seobility.net/project/997874/site-audit/reports/link-anchor-text-duplicates-for-different-pages)
4. **Etsy is refusing crawler requests.** All 20 external-link entries examined on the first report page returned HTTP 403 from Etsy. This is consistent with automated-access restrictions; it does not establish that the listings are broken for customers. The report contains 100 affected pages; the remaining pages were not individually validated. Do not remove valid sales links just to clear the score. [External-link report](https://app.seobility.net/project/997874/site-audit/reports/external-link-target-problems)
5. **The repeated-text report includes necessary shared facts and catalog excerpts.** Examples include ordering instructions, scale options, game-counter coverage, and catalog descriptions repeated on their corresponding product pages. Similar SU-85/SU-100 introductory wording also appears. Review distinctiveness where useful, but preserve accurate shared facts; Seobility reports zero full-page duplicate-content issues. [Repeated-text report](https://app.seobility.net/project/997874/site-audit/reports/pages-with-duplicate-text-content)
6. **Keyword overlap is a hypothesis, not proven ranking cannibalization.** The visible groups include the homepage plus nation/scale/category landing pages around “WW2 tank miniatures”; national starter sets around “set”; and StuG III/IV around “Assault”, “StuG”, “Gun”. These pages can legitimately cover related subjects. Compare query-to-page data in Search Console before merging or redirecting them. The fourth group is hidden behind the plan limit. [Overlap report](https://app.seobility.net/project/997874/site-audit/reports/pages-with-keyword-cannibalization)
7. **One photo is worth optimizing.** `assets/img/painted/lone-sherman-painted-set/lone-sherman-painted-full-set-overview.jpg` returned HTTP 200 but took 1.52 seconds and was listed at 466.2 KB. A resized WebP/AVIF variant could reduce transfer without sacrificing detail. This is one crawler observation, not a Core Web Vitals measurement. [File-source report](https://app.seobility.net/project/997874/site-audit/reports/file-sources-problems)
8. **One homepage alt-attribute warning remains.** The report identifies the homepage; the exact offending element has not been isolated. [Alt-attribute report](https://app.seobility.net/project/997874/site-audit/reports/image-alt-attribute-problems)

Do not pad all 132 short pages to 500 words. Google's own guidance says there is no required minimum or maximum word count for ranking. Add details that help a buyer choose a model, scale, finish or compatible pack. [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)

## Ranking baseline before keyword changes

Source: [Seobility keyword tracking](https://app.seobility.net/project/997874/rankings/keywords), Google.com, desktop, displayed date 14 September 2026. The plan allows ten tracked keywords.

| Existing keyword | Recorded position | Change displayed | Estimated monthly search volume |
| --- | ---: | --- | ---: |
| minitankforge | 1 | Unchanged | <10 |
| model tanks | Not recorded | — | 1,000 |
| 3d printed tanks | Not recorded | — | 720 |
| miniature tanks | Not recorded | — | 2,400 |
| micro tanks | Not recorded | — | 390 |
| ww2 tank miniatures | Not recorded | — | 20 |
| 6mm ww2 tanks | Not recorded | — | 10 |
| micro armor tanks | Not recorded | — | <10 |
| 1:250 tank miniatures | Not recorded | OUT | <10 |
| 1:285 tank miniatures | 18 | NEW | <10 |

“NEW” and “OUT” refer to Seobility's selected comparison interval, not necessarily first-ever rankings or changes since our September work. The 1:285 detail page confirms the homepage ranking at position 18. The small estimated volume and mixed movement mean this is an encouraging signal, not proof of a traffic increase. “Not recorded” describes Seobility's display; do not infer an exact position or deindexing.

## Keyword changes

Keep the brand, the main WW2 phrase, both scale phrases, the WW2 6mm phrase, and two broad product benchmarks. Use three slots for more specific audience segments:

| Previous tracking term | Replacement | Purpose | Status |
| --- | --- | --- | --- |
| model tanks | 6mm tanks | A specific scale used by tabletop miniature buyers | Saved and verified |
| micro tanks | lone sherman miniatures | Test demand for the matching game pack | Saved and verified |
| micro armor tanks | hellcat tankers miniatures | Test demand for the matching game pack | Saved and verified |

The user explicitly approved both game-specific replacements, including the possible loss of old tracking history. A native Seobility confirmation temporarily blocked browser controls; it was resolved, and all replacements were saved. The final ranking table was checked: ten terms, the three old terms absent, and all three new terms present. The original baseline above preserves the observed results, not the removed terms' complete historical time series.

Keyword research in the existing Google.com market returned estimated monthly volumes of 70 for “6mm tanks”, 10 for “6mm ww2 tanks”, 40 for “lone sherman”, and 1,000 for “hellcat tankers”. These are Seobility estimates for those exact phrases, not verified traffic, and must not be attributed to the longer “... miniatures” phrases. After saving, the ranking table showed **<10** monthly searches for each new game-miniature phrase, with transactional intent among the labels and rankings still pending. Treat these as low-volume purchase-intent tests, not high-traffic opportunities. Three of the day's five included keyword-research checks were used; no paid upgrade was activated. [Seobility Keyword Research](https://app.seobility.net/tools/keyword-research)

The natural destination for “6mm tanks” is the existing 1:285 category; for the two game phrases, the matching Lone Sherman and Hellcat Tankers pack pages. These are intended content targets, not claimed rankings or target-URL settings changed in Seobility.

Changing tracked keywords changes measurement only; it does not tell Google to rank the website for those terms. New terms start a new comparison baseline. Keep the retained terms stable so subsequent changes can be assessed fairly.

## Google Search Console baseline

Source: the connected `sc-domain:minitankforge.com` Search Console property, Web search, last updated 14 September 2026 with complete data through 12 September.

The most relevant early comparison is **6–12 September versus 30 August–5 September**, because most of the SEO work was deployed around 2–4 September:

| Measure | 30 Aug–5 Sep | 6–12 Sep | Change |
| --- | ---: | ---: | ---: |
| Clicks | 1 | 1 | No change |
| Impressions | 61 | 70 | +9 (+14.8%) |
| CTR | 1.6% | 1.4% | -0.2 points |
| Average position | 26.3 | 25.6 | Improved 0.7 positions |

This is directionally encouraging, but 70 impressions and one click are much too small a sample for a traffic claim. The extra weekly visibility was concentrated in the homepage (+5 impressions), Tiger I (+8), Panzer 35(t) (+7), Ferdinand (+3), M18 Hellcat (+3), and Tortoise (+3). The E-100 page produced the only click in both weeks.

The broader **16 August–12 September versus 19 July–15 August** comparison is steadier but includes both pre-change and post-change days:

| Measure | 19 Jul–15 Aug | 16 Aug–12 Sep | Change |
| --- | ---: | ---: | ---: |
| Clicks | 10 | 8 | -2 (-20%) |
| Impressions | 288 | 275 | -13 (-4.5%) |
| CTR | 3.5% | 2.9% | -0.6 points |
| Average position | 26.3 | 26.1 | Improved 0.2 positions |

Page-level results in the later 28-day period are more useful than the aggregate:

| Page | Clicks | Impressions | Avg. position | Interpretation |
| --- | ---: | ---: | ---: | --- |
| Homepage | 3 | 109 (+15) | 27.0, improved from 29.7 | More visibility, but CTR fell from 7.4% to 2.8% |
| Lone Sherman pack | 2 (+2) | 7 (+4) | 5.0, improved from 9.0 | Strong early result, based on very little data |
| E-100 | 2 (+2) | 3 (+3) | 9.0 | Strong early result, based on very little data |
| IS-1 | 1 (+1) | 4 (-11) | 8.5, improved from 20.1 | Substantial ranking improvement, low volume |
| German Basic set | 0 | 23 (+13) | 20.9, improved from 21.7 | Best near-page-two content opportunity |
| Tiger I | 0 | 26 (+14) | 29.7, worsened from 23.9 | Visibility grew, but ranking/CTR need attention |
| Panzer 35(t) | 0 | 14 (+9) | 51.6, worsened from 48.4 | Growing discovery, still far from page one |

The latest 28-day query data separates into **2 branded clicks from “minitankforge” and 6 non-brand clicks**. The brand query reached average position 1, up from 6.9, but its sample is only 12 impressions. Non-brand generic phrases are gaining positions without clicks: “tank miniature” improved from 33 to 23, “miniature tank” from 40.7 to 26.6, and “miniature tanks” from 50.2 to 39.8. The most actionable query/page combination is the German Basic set around starter-pack and tank-miniature intent, followed by the homepage's generic miniature-tank snippet and Tiger I's growing impressions.

Across the full **13 June–12 September** report, Search Console recorded 20 clicks, 1.01K impressions, 2.0% CTR and average position 25.0. It recorded no query impressions for the two tracked scale phrases (`1:250 tank miniatures`, `1:285 tank miniatures`) or the new game-specific phrases (`lone sherman miniatures`, `hellcat tankers miniatures`). Those remain sensible experiments, but they are prospective targets rather than demonstrated Google demand for this site. The three-month query set is currently dominated by the brand, generic miniature-tank wording, and individual vehicle names.

This baseline does not show evidence of keyword cannibalization requiring page consolidation. No category or product page should be merged or redirected on the present data.

## Targeted changes implemented from Search Console evidence

The homepage, German Starter Set, and Tiger I were updated without changing their established H1 headings or page layouts:

- The homepage description now emphasizes fully assembled WW2 tank miniatures, the complete scale range, finishes, and both ordering routes. One visible feature sentence now states the ABS-like resin and fully assembled product format.
- The German Starter Set title now explicitly identifies it as a German WW2 tank miniature starter set. Its description names all six included vehicles and the available finish/scale choice.
- The Tiger I title and description now include the observed “tank model” language while retaining “tank miniature”, and state the five scales, fully assembled format, and finishes.

These changes target clearer relevance and click appeal. They do not guarantee that Google will display the supplied descriptions, and performance should be judged only after Google recrawls the pages and enough impressions accumulate.

## Next priorities

1. Retain the verified keyword list long enough to observe movement. Check initial ranks once Seobility finishes processing the new entries; do not treat today's blank values as completed ranking results.
2. Make a focused template cleanup for descriptive category H1s, useful internal links and excess semantic bold markup; retain the compact product presentation.
3. Optimize the flagged painted-set photo and investigate the homepage alt warning.
4. Re-run the 7-day comparison after at least two more complete weeks, and use the 28-day comparison for the more reliable trend. Continue separating brand from non-brand performance.

No website code or production settings were changed during this review. This file records the findings and the tracking-work status.
