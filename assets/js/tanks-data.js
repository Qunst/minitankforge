
window.MTF_SCALES = ['1:160', '1:180', '1:250', '1:285'];
window.MTF_FINISHES = ['Base coat', 'Unpainted'];

window.MTF_SCALE_PRICES = {
  '1:160': 4.0,
  '1:280': 4.0,
  '1:250': 3.0,
  '1:285': 3.0
};

window.MTF_FINISH_SURCHARGES = {
  'Base coat': 1.0,
  'Unpainted': 0.0
};

window.TANKS = [
  {
    slug: 'panzer-iv',
    name: 'Panzer IV',
    nation: 'Germany',
    era: 'WW2',
    type: 'Medium tank',
    featured: true,
    featuredOrder: 1,
    placeholderStyle: 'light-large',
    image: 'assets/img/tanks/pziv.jpg',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'One of the longest-serving German tanks, continuously upgraded throughout the war.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'sherman-m4a3',
    name: 'Sherman M4A3',
    nation: 'USA',
    era: 'WW2',
    type: 'Medium tank',
    featured: true,
    featuredOrder: 2,
    placeholderStyle: 'dark-large',
    image: 'assets/img/tanks/sherman.jpg',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'Produced in huge numbers, the Sherman became the backbone of Allied armored forces.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 't-34-85',
    name: 'T-34/85',
    nation: 'USSR',
    era: 'WW2',
    type: 'Medium tank',
    featured: true,
    featuredOrder: 3,
    placeholderStyle: 'light-medium',
    image: 'assets/img/tanks/t-34.jpg',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'Its sloped armor and mobility made it one of the most effective Soviet tank designs of WWII.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'tiger-i',
    name: 'Tiger I',
    nation: 'Germany',
    era: 'WW2',
    type: 'Heavy tank',
    featured: false,
    placeholderStyle: 'dark-medium',
    image: '',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'Its reputation became so outsized that crews often reported Tigers even when facing other tanks.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'su-85',
    name: 'SU-85',
    nation: 'USSR',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    placeholderStyle: 'light-small',
    image: '',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'Built on the T-34 chassis, it traded a turret for a more powerful gun and lower silhouette.',
    compatibility: 'Compact hex-based tabletop play',
  },
  {
    slug: 'm18-hellcat',
    name: 'M18 Hellcat',
    nation: 'USA',
    era: 'WW2',
    type: 'Tank destroyer',
    featured: false,
    placeholderStyle: 'dark-small',
    image: '',
    etsyUrl: 'https://www.etsy.com/shop/Quali3DPrints',
    fact: 'The Hellcat was one of the fastest tracked armored vehicles fielded during the war.',
    compatibility: 'Compact hex-based tabletop play',
  }
];
