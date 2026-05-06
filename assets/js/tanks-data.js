
window.MTF_SCALES = ['1:160', '1:180', '1:200', '1:250', '1:285'];
window.MTF_FINISHES = ['Base coat', 'Unpainted'];

window.MTF_SCALE_PRICES = {
  '1:160': 0.0,
  '1:180': 0.0,
  '1:200': 0.0,
  '1:250': 0.0,
  '1:285': 0.0
};

window.MTF_FINISH_SURCHARGES = {
  'Base coat': 0.0,
  'Unpainted': 0.0
};

window.TANKS = [
 
  {
    slug: 'panzer-iv',
    name: 'Panzer IV (Pz.Kpfw. IV)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    featuredOrder: 1,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/pz-iv-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497166635/panzer-iv-german-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'One of the longest-serving German tanks, continuously upgraded throughout the war.',
    description: 'The Panzer IV works well as a flexible German medium tank for WW2 tabletop forces, especially when you want a familiar vehicle that fits early, mid, and late-war lineups. The model is useful as a core armor choice, support vehicle, or opponent for Allied and Soviet tanks across several scales.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'sherman-m4a3',
    name: 'Sherman M4A3 (Medium Tank M4A3 Sherman)',
    nation: 'USA',
    era: 'WW2',
    type: 'Medium tank',
    featured: true,
    disabled: false,
    featuredOrder: 2,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/sherman-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497153631/sherman-m4a3-american-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Produced in huge numbers, the Sherman became the backbone of Allied armored forces.',
    description: 'The Sherman M4A3 is a dependable Allied workhorse for USA forces, ideal for building platoons, scenario groups, and mixed support columns. Its recognizable shape makes it an easy anchor model for tabletop games, dioramas, and larger resin armor collections.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-34-85',
    name: 'T-34/85 (T-34-85)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    featuredOrder: 3,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/t34-85-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497643294/t-3485-soviet-tank-miniature-3d-printed',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Its sloped armor and mobility made it one of the most effective Soviet tank designs of WWII.',
    description: 'The T-34/85 gives Soviet forces a stronger late-war medium tank with a familiar silhouette and more presence than the earlier T-34. It is a natural pick for players building Eastern Front scenarios, balanced armor groups, or compact Soviet spearheads.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'tiger-i',
    name: 'Tiger I (Pz.Kpfw. VI Tiger Ausf. E)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Heavy tank',
    featured: true,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/tiger-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497158626/tiger-i-german-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Its reputation became so outsized that crews often reported Tigers even when facing other tanks.',
    description: 'The Tiger I is a centerpiece German heavy tank for WW2 miniature collections, with enough visual weight to stand out even in small scales. It works especially well as a scenario objective, elite armor threat, or dramatic opponent for Sherman, T-34, and tank destroyer forces.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'su-85',
    name: 'SU-85 (Samokhodnaya Ustanovka 85)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/su85-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497170193/su-85-soviet-tank-destroyer-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Built on the T-34 chassis, it traded a turret for a more powerful gun and lower silhouette.',
    description: 'The SU-85 is a clean, purposeful Soviet tank destroyer that brings a low profile and focused anti-armor role to the tabletop. It fits naturally beside T-34 formations when you want a force that feels practical, mobile, and purpose-built.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm18-hellcat',
    name: 'M18 Hellcat (76 mm Gun Motor Carriage M18)',
    nation: 'USA',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/m18-hellcat-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497171615/m18-hellcat-american-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Hellcat was one of the fastest tracked armored vehicles fielded during the war.',
    description: 'The M18 Hellcat is a fast-looking American tank destroyer that suits mobile ambushes, reconnaissance-heavy scenarios, and hit-and-run tabletop play. Its open-topped profile and compact hull give Allied forces a different visual rhythm from standard Sherman-based armor.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'e-100',
    name: 'E-100 (Entwicklung 100)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Super heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/e100-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497180844/e-100-german-super-heavy-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Designed as an enormous late-war super heavy tank, it remained one of the most famous unfinished paper panzers.',
    description: 'The E-100 is a what-if German super heavy tank for late-war and alternate-history games where imposing armor is the point of the scenario. On the table it brings scale drama, making it useful as a boss vehicle, objective piece, or rare experimental threat.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'e-25',
    name: 'E-25 (Entwicklung 25)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/e25-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497174199/e-25-german-tank-destroyer-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The E-25 was planned as a fast, low-profile tank destroyer in Germany\'s late-war E-series concept family.',
    description: 'The E-25 is a compact what-if German tank destroyer with a low, aggressive profile that suits ambush scenarios and late-war experimental forces. It is a good choice when you want something smaller than the heavy tank destroyers but still visually distinct from standard armor.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'e-50',
    name: 'E-50 (Entwicklung 50)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/e50-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497646912/e-50-german-medium-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Planned as a simplified standard medium tank, the E-50 was meant to replace several German armored types with one design.',
    description: 'The E-50 is a late-war German what-if medium tank that works well for players building E-series or alternate-history formations. It has enough Panther-like presence to feel plausible on the table while still offering something different from the standard German lineup.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'e-75',
    name: 'E-75 (Entwicklung 75)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/e75-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497639259/e-75-german-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The E-75 was intended as a standard heavy tank partner to the E-50 in the same late-war E-series program.',
    description: 'The E-75 gives the E-series concept a heavier tabletop anchor, pairing late-war German styling with a more imposing battlefield role. It is useful for alternate-history scenarios, experimental platoons, or collections that already include the E-50 and want a heavier partner.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'ferdinand',
    name: 'Ferdinand (Sd.Kfz. 184 Ferdinand)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/ferdinand-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497174627/ferdinand-german-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Built around an immensely powerful gun, the Ferdinand traded mobility and reliability for long-range firepower.',
    description: 'The Ferdinand is a heavy German tank destroyer with a long, slab-sided presence that reads clearly even at small scale. It suits Kursk-inspired scenarios, defensive gun lines, and collections focused on large armored vehicles with strong frontal firepower.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'hetzer',
    name: 'Hetzer (Jagdpanzer 38 Hetzer)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/hetzer-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497639705/hetzer-german-tank-destroyer-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Compact, cheap, and low to the ground, the Hetzer became one of Germany\'s most practical late-war tank destroyers.',
    description: 'The Hetzer is a small German tank destroyer with a compact footprint, making it useful for dense tables, ambush positions, and late-war defensive forces. Its low silhouette contrasts nicely with taller vehicles and helps mixed German armor groups feel more varied.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'is-3',
    name: 'IS-3 (Iosif Stalin-3)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/is3-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497661106/is-3-soviet-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Its distinctive pike nose and low turret gave the IS-3 one of the most recognizable silhouettes of any heavy tank.',
    description: 'The IS-3 brings a distinctive late-war Soviet heavy tank shape to the table, especially with its pike nose and low rounded turret. It is a strong visual choice for end-of-war displays, post-war scenarios, or collections that need a heavier Soviet centerpiece.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'isu-152',
    name: 'ISU-152 (ISU-152)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Assault gun',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/isu152-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497661554/isu-152-soviet-assault-gun-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The ISU-152 combined a heavy chassis with a huge gun, making it feared as both an assault gun and a bunker-breaker.',
    description: 'The ISU-152 is a large Soviet assault gun that feels at home in breakthrough, city-fight, and bunker-busting scenarios. Its heavy casemate shape gives Soviet forces a solid visual counterpoint to turreted tanks like the T-34 and IS series.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'jagdpanther',
    name: 'Jagdpanther (Sd.Kfz. 173 Jagdpanther)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/jagdpanther-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497654117/jagdpanther-german-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Built on the Panther chassis, the Jagdpanther paired strong mobility and armor with one of Germany\'s best anti-tank guns.',
    description: 'The Jagdpanther is a sleek German tank destroyer that combines Panther proportions with a dedicated casemate layout. It is a useful model for players who want a serious anti-tank threat that still looks mobile and refined beside heavier vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'jagdpz-iv',
    name: 'Jagdpz IV (Jagdpanzer IV)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/jgdpz-iv-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497654753/jagdpanzer-iv-german-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Jagdpanzer IV brought a low silhouette and sloped armor to the Panzer IV chassis in a dedicated anti-tank role.',
    description: 'The Jagdpanzer IV is a low-profile German tank destroyer that fits neatly into late-war formations built around Panzer IV chassis vehicles. It is especially useful for defensive scenarios, mixed armor groups, and tables where silhouette variety matters.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'jagdtiger',
    name: 'Jagdtiger (Sd.Kfz. 186 Jagdtiger)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/jagdtiger-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497663304/jagdtiger-german-heavy-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Mounting an enormous anti-tank gun on a massive chassis, the Jagdtiger was powerful but extremely demanding to use in practice.',
    description: 'The Jagdtiger is one of the most imposing German tank destroyers, making it a natural centerpiece for late-war defensive or what-if scenarios. Its size and long gun give it immediate table presence, especially when placed beside medium tanks and lighter vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'luchs',
    name: 'Luchs (Pz.Kpfw. II Ausf. L Luchs)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/luchs-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497663748/luchs-german-light-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Luchs was a fast scouting tank that tried to keep reconnaissance units mobile in increasingly dangerous conditions.',
    description: 'The Luchs is a compact German light tank for reconnaissance roles, scouting screens, and fast-moving scenario forces. Its smaller size helps show scale variety in a collection and gives German lineups more than just medium and heavy armor.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm3-lee',
    name: 'M3 Lee (Medium Tank M3 Lee)',
    nation: 'USA',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/m3-lee-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497693978/m3-lee-american-medium-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Its unusual multi-level gun layout gave the M3 Lee one of the most distinctive profiles of any Allied tank.',
    description: 'The M3 Lee adds an unusual Allied medium tank profile with its side-mounted main gun and tall superstructure. It is a strong pick for early-war, North Africa, lend-lease, or transitional force collections where visual variety is part of the appeal.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm5a1-stuart',
    name: 'M5A1 Stuart (Light Tank M5A1 Stuart)',
    nation: 'USA',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/m5a1-stuart-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497694782/m5a1-stuart-american-light-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Quick, reliable, and compact, the Stuart was valued for reconnaissance, screening, and fast support roles.',
    description: 'The M5A1 Stuart is a small Allied light tank that works well for scouting, flank security, and support roles in compact tabletop games. Its size makes it a good contrast piece next to Shermans, Pershings, and heavier enemy armor.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'maus',
    name: 'Maus (Panzer VIII Maus)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Super heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/maus-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497686723/maus-german-super-heavy-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Maus became famous as the heaviest fully enclosed armored fighting vehicle ever completed in prototype form.',
    description: 'The Maus is a massive German super heavy tank for collectors and players who enjoy experimental armor and unusual late-war scenarios. It gives any table an immediate focal point, especially when compared directly with standard medium and heavy tanks.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'nashorn',
    name: 'Nashorn (Sd.Kfz. 164 Nashorn)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/nashorn-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497687807/nashorn-german-tank-destroyer-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Lightly protected but strongly armed, the Nashorn relied on long-range firepower rather than armor to survive.',
    description: 'The Nashorn is a lightly protected German tank destroyer built around long-range firepower, making it useful for open-table ambushes and rear-line support. Its tall fighting compartment and exposed gun profile make it visually different from low casemate vehicles like the Hetzer.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'panther',
    name: 'Panther (Pz.Kpfw. V Panther)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/panther-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497697098/panther-german-medium-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Panther combined sloped armor, speed, and a powerful gun into one of Germany\'s most respected tank designs.',
    description: 'The Panther is a major German medium tank for late-war WW2 games, offering a strong middle ground between common Panzers and heavier Tigers. It is a natural collection staple for Normandy, Eastern Front, and balanced German armor lineups.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'panzer-iii',
    name: 'Panzer III (Pz.Kpfw. III)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/pz-iii-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497698170/panzer-iii-german-medium-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Originally intended as Germany\'s main battle tank, the Panzer III gradually shifted into other roles as the war progressed.',
    description: 'The Panzer III is a practical German medium tank for early and mid-war scenarios, especially before heavier vehicles dominate the table. It gives German forces a historically grounded core vehicle for campaigns, platoons, and mixed armor groups.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'panzer-vii-loewe',
    name: 'Panzer VII Loewe (Panzerkampfwagen VII Loewe)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Super heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/loewe-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497705925/panzer-vii-loewe-german-super-heavy-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Loewe remained a paper project, but it became one of the best-known examples of late-war German super-heavy concepts.',
    description: 'The Panzer VII Loewe is a German super-heavy what-if model for players who enjoy paper projects and alternate late-war armor. It works best as a rare centerpiece vehicle, scenario threat, or companion to other experimental German designs.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'panzer-35t',
    name: 'Panzer 35(t) (Lehký tank vz. 35)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/pz35t-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497706751/panzer-35t-german-light-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Originally a Czechoslovak design, the Panzer 35(t) gave Germany useful early-war light armor after annexation.',
    description: 'The Panzer 35(t) is a small early-war German light tank that helps fill out invasion-era and early campaign forces. Its compact profile makes it useful for showing how different early-war armor looked compared with later German vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'panzer-38t',
    name: 'Panzer 38(t) (Lehký tank vz. 38)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/pz38t-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497716434/panzer-38t-german-light-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Reliable and mechanically sound, the Panzer 38(t) became the basis for several later German tank destroyer designs.',
    description: 'The Panzer 38(t) is a reliable-looking early-war light tank that fits German, Czech-derived, and chassis-family collections. It is a useful bridge model for players who want to connect early tank forces with later Hetzer-style tank destroyers.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'pershing',
    name: 'Pershing (M26 Pershing)',
    nation: 'USA',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/pershing-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497708617/m26-pershing-american-heavy-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Arriving late in the war, the Pershing was one of the first American tanks designed to face heavier German armor on more equal terms.',
    description: 'The M26 Pershing gives late-war USA forces a heavier tank option with a different presence from the Sherman family. It is a good choice for end-of-war scenarios, stronger Allied armor groups, and collections that reach into the transition toward post-war tank design.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'sherman-firefly',
    name: 'Sherman Firefly (Sherman VC Firefly)',
    nation: 'UK',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/sherman-firefly-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497718336/sherman-firefly-british-tank-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'By mounting the 17-pounder gun, the Firefly turned the Sherman into one of the most effective Allied tank killers in Northwest Europe.',
    description: 'The Sherman Firefly is an Allied medium tank with a long-gun profile that immediately separates it from standard Shermans. It is useful for British and Commonwealth forces, tank-hunter roles, and scenarios where Allied armor needs a stronger answer to German heavies.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'stug-iv',
    name: 'StuG IV (Sturmgeschütz IV)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Assault gun',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/stug-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497710655/stug-iv-german-assault-gun-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The StuG IV used the Panzer IV chassis to keep assault-gun production going when StuG III manufacturing was disrupted.',
    description: 'The StuG IV is a German assault gun that fits well into late-war support roles and mixed defensive formations. Its Panzer IV-based hull makes it a good companion to Panzer IV and Jagdpanzer IV models while still adding a different battlefield purpose.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'sd-kfz-234',
    name: 'Sd.Kfz. 234 (Schwerer Panzerspaehwagen Sd.Kfz. 234)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Armored car',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/sdkfz-234-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497862193/sdkfz-234-german-armored-car-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Sd.Kfz. 234 family gave German units a fast, eight-wheeled armored car for reconnaissance and mobile support.',
    description: 'The Sd.Kfz. 234 adds fast German armored-car character to reconnaissance, screening, and mobile support scenarios. Its eight-wheeled layout gives a collection a different shape language from tracked vehicles and helps break up tank-heavy lineups.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-28',
    name: 'T-28 (T-28 Medium Tank)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/t28-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497873174/t-28-soviet-medium-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Soviet T-28 was an interwar multi-turret medium tank designed to support infantry and break fortified positions.',
    description: 'The T-28 is a distinctive Soviet medium tank for early-war and interwar-inspired scenarios, with a multi-turret layout that stands apart from later designs. It is a strong visual choice for players who want Soviet forces that feel older, heavier, and less standardized.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-34',
    name: 'T-34 (T-34 Model 1942)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Medium tank',
    featured: true,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/t34-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497119611/t-34-model-1942-soviet-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The original T-34 combined sloped armor, broad tracks, and good mobility into one of the defining tank designs of the war.',
    description: 'The T-34 Model 1942 is a core Soviet medium tank for Eastern Front tabletop forces and larger armor groups. It works well as the backbone of a collection, especially when paired with later T-34/85s, SU-series guns, and Soviet heavy tanks.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'tiger-ii',
    name: 'Tiger II (Pz.Kpfw. VI Tiger Ausf. B)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/tiger-ii-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497873992/tiger-ii-german-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Tiger II combined the sloped armor concept of the Panther with the heavy-gun philosophy of the Tiger I.',
    description: 'The Tiger II is a late-war German heavy tank with a large, angular profile that makes it a clear tabletop threat. It is a strong centerpiece for defensive scenarios, elite armor groups, and matchups against stronger late-war Allied or Soviet vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'hummel',
    name: 'Hummel (Sd.Kfz. 165 Hummel)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Self-propelled artillery',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/hummel-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497866981/hummel-german-self-propelled-artillery',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Hummel carried a 150 mm howitzer on a modified Panzer III/IV chassis to give German formations mobile artillery support.',
    description: 'The Hummel gives German forces a mobile artillery option, adding a support role that is visually different from tanks and tank destroyers. It is useful for scenario flavor, rear-area objectives, and collections that need more than direct-fire armor.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'is-1',
    name: 'IS-1 (Iosif Stalin-1)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/is1-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497876804/is-1-soviet-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The IS-1 helped bridge the gap between the KV heavy tanks and the later, more famous IS-2.',
    description: 'The IS-1 is a transitional Soviet heavy tank that sits neatly between the KV family and later IS-series vehicles. It is a useful model for players who want to show the development path of Soviet heavy armor without jumping straight to the IS-2 or IS-3.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'is-2',
    name: 'IS-2 (Iosif Stalin-2)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/is-2-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497868643/is-2-soviet-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The IS-2 paired heavy armor with a powerful 122 mm gun, making it useful against fortifications as well as armor.',
    description: 'The IS-2 is a heavy Soviet tank with strong presence and a powerful-gun look that suits late-war breakthrough forces. It pairs naturally with T-34s, ISU assault guns, and Berlin-era scenarios where Soviet armor should feel heavy and direct.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'isu-122',
    name: 'ISU-122 (ISU-122)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/isu122-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497954308/isu-122-soviet-tank-destroyer-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The ISU-122 used the heavy IS chassis with a 122 mm gun for long-range fire support and anti-armor work.',
    description: 'The ISU-122 is a Soviet heavy tank destroyer that brings the ISU casemate shape into a more anti-armor focused role. It is a good companion to the ISU-152 when building heavy Soviet support groups with different battlefield jobs.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'jagdpanzer-e100',
    name: 'Jagdpanzer E 100 (Jagdpanzer E 100)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/jagdpanzer-e100-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497946405/jagdpanzer-e-100-german-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'A paper-design tank destroyer concept based on the E 100 heavy chassis, useful for late-war and what-if scenarios.',
    description: 'The Jagdpanzer E 100 is a huge German what-if tank destroyer for alternate-history and experimental late-war games. It works as a dramatic objective or table centerpiece, especially beside Maus, E-100, and other super-heavy concepts.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'kv-2',
    name: 'KV-2 (Kliment Voroshilov-2)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/kv2-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497947397/kv-2-soviet-heavy-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Its towering turret and heavy howitzer made the KV-2 look almost unreal even among other heavy tanks.',
    description: 'The KV-2 is a Soviet heavy tank with an unmistakable tall turret, ideal for players who want a model that stands out immediately. It suits early-war scenarios, fortress-busting themes, and collections built around unusual armored silhouettes.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm10-wolverine',
    name: 'M10 Wolverine (3-inch Gun Motor Carriage M10)',
    nation: 'USA',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/m10-wolverine-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4497949541/m10-wolverine-american-tank-destroyer',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The M10 was one of the most common Allied tank destroyers, using an open-topped turret and a 3-inch gun.',
    description: 'The M10 Wolverine adds a dedicated American tank destroyer to Allied forces, with an open turret and a more specialized role than the Sherman. It is useful for ambush scenarios, mobile anti-armor screens, and mixed USA armored groups.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm3-half-track',
    name: 'M3 Half-track (M3 Half-track)',
    nation: 'USA',
    era: 'WW2',
    type: 'Half-track',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/m3-half-truck-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498110398/m3-half-track-american-vehicle-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The M3 half-track moved infantry and support teams while keeping better cross-country mobility than a standard truck.',
    description: 'The M3 Half-track is a support vehicle that helps tabletop forces feel like complete formations rather than only tanks. It is useful for infantry transport, scenario objectives, convoy tables, and game packs that need vehicles with a different battlefield job.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'opel-blitz',
    name: 'Opel Blitz Truck (Opel Blitz 3-ton Truck)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Truck',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/opel-blitz-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints?section_id=58368275',
    scalePrices: {
      '1:160': 0.0,
      '1:180': 0.0,
      '1:200': 0.0,
      '1:250': 0.0,
      '1:285': 0.0
    },
    finishSurcharges: {
      'Base coat': 0.0,
      'Unpainted': 0.0
    },
    fact: 'The Opel Blitz was one of Germany\'s most important wartime trucks, used for transport, supply, and support roles.',
    description: 'The Opel Blitz is a German truck model for supply columns, convoy scenarios, rear-area objectives, and support-heavy tables. It adds practical non-tank detail to a collection and helps make armored forces feel connected to the logistics behind them.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm60a1',
    name: 'M60A1 (M60A1 Patton)',
    nation: 'USA',
    era: 'Cold War',
    type: 'Main battle tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/m60a1-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498101025/m60a1-patton-american-main-battle-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The M60A1 introduced a redesigned turret and became a long-serving Cold War main battle tank.',
    description: 'The M60A1 brings the catalog into Cold War armor with a recognizable American main battle tank profile. It is useful for players who want post-war scenarios, modernizing USA forces, or a heavier vehicle that visually differs from WW2 designs.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm7-priest',
    name: 'M7 Priest (105 mm Howitzer Motor Carriage M7)',
    nation: 'USA',
    era: 'WW2',
    type: 'Self-propelled artillery',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/m7-priest-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498108421/m7-priest-american-self-propelled',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The M7 Priest mounted a 105 mm howitzer on a tank-derived chassis for mobile artillery support.',
    description: 'The M7 Priest adds American self-propelled artillery to Allied collections, giving USA forces a support vehicle with a distinctive open fighting compartment. It works well in artillery support roles, rear-line objectives, and scenarios built around combined arms.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm8-greyhound',
    name: 'M8 Greyhound (Light Armored Car M8)',
    nation: 'USA',
    era: 'WW2',
    type: 'Armored car',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/m8-greyhound-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498108893/m8-greyhound-american-armored-car',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'A fast six-wheeled reconnaissance vehicle, the M8 Greyhound is a useful scout for Allied tabletop forces.',
    description: 'The M8 Greyhound is a fast Allied armored car for reconnaissance, patrol, and road-column scenarios. Its wheeled shape adds welcome variety beside Shermans and tank destroyers, especially in compact games where scouts matter.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'su-76',
    name: 'SU-76 (Samokhodnaya Ustanovka 76)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Self-propelled gun',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/su76-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498119656/su-76-soviet-self-propelled-gun',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The SU-76 was a small and widely produced Soviet self-propelled gun used for infantry support.',
    description: 'The SU-76 is a small Soviet self-propelled gun that works well for infantry support, light assault roles, and economical Soviet formations. Its compact casemate profile gives Soviet lineups a useful middle point between light armor and heavier SU vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'su-100',
    name: 'SU-100 (Samokhodnaya Ustanovka 100)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/su100-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498120468/su-100-soviet-tank-destroyer-miniature',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The SU-100 mounted a powerful 100 mm gun and became one of the Soviet Union\'s most capable late-war tank destroyers.',
    description: 'The SU-100 is a late-war Soviet tank destroyer with a strong, purposeful silhouette and serious anti-armor role. It fits naturally into Eastern Front collections beside T-34s and IS-series vehicles when you want focused long-gun support.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'su-122',
    name: 'SU-122 (Samokhodnaya Ustanovka 122)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Self-propelled gun',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-medium',
    image: 'assets/img/tanks/su122-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498120964/su-122-soviet-self-propelled-gun',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The SU-122 used a 122 mm howitzer on a T-34-based chassis for close support and assault-gun work.',
    description: 'The SU-122 gives Soviet forces a close-support self-propelled gun with a heavier howitzer role than the SU-76. It is useful for assault scenarios, infantry support themes, and collections that show the range of T-34-based Soviet vehicles.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-34-minesweeper',
    name: 'T-34 Minesweeper (T-34 Mine Roller)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Engineering tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/t34-minesweeper-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498111409/t-34-minesweeper-soviet-engineering-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Mine-roller T-34 variants helped armored formations push through mined approaches and prepared defenses.',
    description: 'The T-34 Minesweeper adds engineering character to Soviet forces, making it useful for minefield, assault, and prepared-defense scenarios. It is a strong choice when you want the table to tell a mission story rather than only show tank-on-tank fighting.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'a-32',
    name: 'A-32 (A-32 Prototype)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/a32-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498273694/a-32-soviet-prototype-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The A-32 was an important Soviet prototype that helped lead toward the famous T-34 design.',
    description: 'The A-32 is a Soviet prototype model for collectors who enjoy development vehicles and the path toward the T-34. It works well in what-if scenarios, prototype displays, and comparison lineups beside early T-34 designs.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-70',
    name: 'T-70 (T-70 Light Tank)',
    nation: 'USSR',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/t70-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498276272/t-70-soviet-light-tank-miniature-3d',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The T-70 was a compact Soviet light tank used for reconnaissance, infantry support, and secondary armored roles.',
    description: 'The T-70 is a compact Soviet light tank for scouting, infantry support, and smaller battlefield roles. Its size makes it useful for showing the lighter end of Soviet armor next to T-34s, SU guns, and heavy tanks.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'wespe',
    name: 'Wespe (Sd.Kfz. 124 Wespe)',
    nation: 'Germany',
    era: 'WW2',
    type: 'Self-propelled artillery',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-small',
    image: 'assets/img/tanks/wespe-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498272035/wespe-german-self-propelled-artillery',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Wespe mounted a 105 mm howitzer on a light tank chassis, giving German units mobile artillery support.',
    description: 'The Wespe gives German forces a small self-propelled artillery vehicle with a clear support role. It is useful for rear-line fire support, scenario objectives, and collections that need lighter artillery vehicles alongside tanks and tank destroyers.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'type-95-ha-go',
    name: 'Type 95 Ha-Go (Type 95 Light Tank Ha-Go)',
    nation: 'Japan',
    era: 'WW2',
    type: 'Light tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'dark-small',
    image: 'assets/img/tanks/type95-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498284634/type-95-ha-go-japanese-light-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'Light, mobile, and widely used, the Ha-Go became one of Imperial Japan\'s best-known armored vehicles.',
    description: 'The Type 95 Ha-Go is a small Japanese light tank that suits Pacific, early-war, and island campaign scenarios. Its compact size and distinctive profile help Japanese armored forces feel different from German, Soviet, and American lineups.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'type-97-chi-ha',
    name: 'Type 97 Chi-Ha (Type 97 Medium Tank Chi-Ha)',
    nation: 'Japan',
    era: 'WW2',
    type: 'Medium tank',
    featured: false,
    disabled: false,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/type97-base-coat-side-detail.jpg',
    etsyUrl: 'https://www.etsy.com/listing/4498273679/type-97-chi-ha-japanese-medium-tank',
    scalePrices: {
      '1:160': 3.5,
      '1:180': 3.5,
      '1:200': 3.0,
      '1:250': 2.5,
      '1:285': 2.5
    },
    finishSurcharges: {
      'Base coat': 1.0,
      'Unpainted': 0.0
    },
    fact: 'The Chi-Ha was Japan\'s most important medium tank design of the war and appeared in several improved variants.',
    description: 'The Type 97 Chi-Ha is a key Japanese medium tank for Pacific and early-war tabletop collections. It works well as the central armored vehicle for Japanese forces, especially when paired with lighter Ha-Go tanks and infantry-heavy scenarios.',
    compatibility: 'Compact hex-based tabletop play',
  }
];
