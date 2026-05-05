
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
    compatibility: 'Compact hex-based tabletop play',
  }
];
