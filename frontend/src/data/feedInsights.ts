import { communityPosts } from './communityPosts';

export const popularHighlights = communityPosts.slice(0, 3);

export const trendingNews = [
  { id: 'trend-usa', title: 'USA.gov libera calendario cívico 2025', community: 'usa/nacional', sentiment: '+19%', comments: 214 },
  { id: 'trend-ensu', title: 'API ENSU usada en mapas barriales', community: 'cdmx/iztapalapa', sentiment: '+11%', comments: 167 },
  { id: 'trend-ppef', title: 'Neza revisa PPEF 2025 para agua', community: 'edomex/nezahualcoyotl', sentiment: '+15%', comments: 138 },
];
