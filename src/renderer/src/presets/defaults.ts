import type { PresetType, PresetCategoryType } from '../types/index.js'

export const PRESET_CATEGORIES: Record<PresetCategoryType, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  general: '일반'
}

export const BUILT_IN_PRESETS: PresetType[] = [
  // --- Instagram (6) ---
  {
    id: 'ig-feed-square',
    name: 'Feed Square',
    category: 'instagram',
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 85,
    description: '1080x1080 · 1:1',
    isCustom: false
  },
  {
    id: 'ig-feed-portrait',
    name: 'Feed Portrait',
    category: 'instagram',
    width: 1080,
    height: 1350,
    format: 'jpeg',
    quality: 85,
    description: '1080x1350 · 4:5',
    isCustom: false
  },
  {
    id: 'ig-feed-landscape',
    name: 'Feed Landscape',
    category: 'instagram',
    width: 1080,
    height: 566,
    format: 'jpeg',
    quality: 85,
    description: '1080x566 · 1.91:1',
    isCustom: false
  },
  {
    id: 'ig-story',
    name: 'Story / Reel',
    category: 'instagram',
    width: 1080,
    height: 1920,
    format: 'jpeg',
    quality: 85,
    description: '1080x1920 · 9:16',
    isCustom: false
  },
  {
    id: 'ig-carousel',
    name: 'Carousel',
    category: 'instagram',
    width: 1080,
    height: 1350,
    format: 'jpeg',
    quality: 85,
    description: '1080x1350 · 4:5',
    isCustom: false
  },

  // --- Facebook (6) ---
  {
    id: 'fb-post-link',
    name: 'Post (Link)',
    category: 'facebook',
    width: 1200,
    height: 630,
    format: 'jpeg',
    quality: 80,
    description: '1200x630 · 1.91:1',
    isCustom: false
  },
  {
    id: 'fb-post-photo',
    name: 'Post (Photo)',
    category: 'facebook',
    width: 1200,
    height: 1200,
    format: 'jpeg',
    quality: 80,
    description: '1200x1200 · 1:1',
    isCustom: false
  },
  {
    id: 'fb-post-portrait',
    name: 'Post (Portrait)',
    category: 'facebook',
    width: 1080,
    height: 1350,
    format: 'jpeg',
    quality: 80,
    description: '1080x1350 · 4:5',
    isCustom: false
  },
  {
    id: 'fb-cover',
    name: 'Cover Photo',
    category: 'facebook',
    width: 851,
    height: 315,
    format: 'jpeg',
    quality: 85,
    description: '851x315 · 2.7:1',
    isCustom: false
  },
  {
    id: 'fb-event',
    name: 'Event Cover',
    category: 'facebook',
    width: 1920,
    height: 1005,
    format: 'jpeg',
    quality: 85,
    description: '1920x1005 · 1.91:1',
    isCustom: false
  },
  {
    id: 'fb-profile',
    name: 'Profile',
    category: 'facebook',
    width: 400,
    height: 400,
    format: 'jpeg',
    quality: 90,
    description: '400x400 · 1:1',
    isCustom: false
  },

  // --- Twitter / X (4) ---
  {
    id: 'tw-post',
    name: 'Post',
    category: 'twitter',
    width: 1600,
    height: 900,
    format: 'jpeg',
    quality: 85,
    description: '1600x900 · 16:9',
    isCustom: false
  },
  {
    id: 'tw-post-alt',
    name: 'Post (Alt)',
    category: 'twitter',
    width: 1200,
    height: 675,
    format: 'jpeg',
    quality: 85,
    description: '1200x675 · 16:9',
    isCustom: false
  },
  {
    id: 'tw-header',
    name: 'Header',
    category: 'twitter',
    width: 1500,
    height: 500,
    format: 'jpeg',
    quality: 85,
    description: '1500x500 · 3:1',
    isCustom: false
  },
  {
    id: 'tw-profile',
    name: 'Profile',
    category: 'twitter',
    width: 800,
    height: 800,
    format: 'jpeg',
    quality: 90,
    description: '800x800 · 1:1',
    isCustom: false
  },

  // --- YouTube (5) ---
  {
    id: 'yt-thumbnail',
    name: 'Thumbnail',
    category: 'youtube',
    width: 1280,
    height: 720,
    format: 'jpeg',
    quality: 90,
    description: '1280x720 · 16:9',
    isCustom: false
  },
  {
    id: 'yt-thumbnail-hd',
    name: 'Thumbnail (HD)',
    category: 'youtube',
    width: 1920,
    height: 1080,
    format: 'jpeg',
    quality: 90,
    description: '1920x1080 · 16:9',
    isCustom: false
  },
  {
    id: 'yt-banner',
    name: 'Channel Banner',
    category: 'youtube',
    width: 2560,
    height: 1440,
    format: 'jpeg',
    quality: 85,
    description: '2560x1440 · 16:9',
    isCustom: false
  },
  {
    id: 'yt-shorts',
    name: 'Shorts Cover',
    category: 'youtube',
    width: 1080,
    height: 1920,
    format: 'jpeg',
    quality: 85,
    description: '1080x1920 · 9:16',
    isCustom: false
  },
  {
    id: 'yt-profile',
    name: 'Profile',
    category: 'youtube',
    width: 800,
    height: 800,
    format: 'jpeg',
    quality: 90,
    description: '800x800 · 1:1',
    isCustom: false
  },

  // --- TikTok (2) ---
  {
    id: 'tt-cover',
    name: 'Cover / Thumbnail',
    category: 'tiktok',
    width: 1080,
    height: 1920,
    format: 'jpeg',
    quality: 85,
    description: '1080x1920 · 9:16',
    isCustom: false
  },
  {
    id: 'tt-profile',
    name: 'Profile',
    category: 'tiktok',
    width: 200,
    height: 200,
    format: 'jpeg',
    quality: 90,
    description: '200x200 · 1:1',
    isCustom: false
  },

  // --- LinkedIn (5) ---
  {
    id: 'li-post-landscape',
    name: 'Post (Landscape)',
    category: 'linkedin',
    width: 1200,
    height: 627,
    format: 'jpeg',
    quality: 80,
    description: '1200x627 · 1.91:1',
    isCustom: false
  },
  {
    id: 'li-post-square',
    name: 'Post (Square)',
    category: 'linkedin',
    width: 1080,
    height: 1080,
    format: 'jpeg',
    quality: 80,
    description: '1080x1080 · 1:1',
    isCustom: false
  },
  {
    id: 'li-profile-banner',
    name: 'Profile Banner',
    category: 'linkedin',
    width: 1584,
    height: 396,
    format: 'jpeg',
    quality: 85,
    description: '1584x396 · 4:1',
    isCustom: false
  },
  {
    id: 'li-company-banner',
    name: 'Company Banner',
    category: 'linkedin',
    width: 1128,
    height: 191,
    format: 'jpeg',
    quality: 85,
    description: '1128x191 · ~6:1',
    isCustom: false
  },
  {
    id: 'li-profile',
    name: 'Profile',
    category: 'linkedin',
    width: 400,
    height: 400,
    format: 'jpeg',
    quality: 90,
    description: '400x400 · 1:1',
    isCustom: false
  },

  // --- 일반 (1) ---
  {
    id: 'general-original',
    name: '원본 비율',
    category: 'general',
    width: null,
    height: null,
    format: 'jpeg',
    quality: 90,
    description: '원본 크기 · 비율 유지',
    isCustom: false
  }
]

export const getGroupedPresets = (customPresets: PresetType[] = []) => {
  const allPresets = [...BUILT_IN_PRESETS, ...customPresets]
  return (Object.keys(PRESET_CATEGORIES) as PresetCategoryType[]).map((category) => ({
    category,
    label: PRESET_CATEGORIES[category],
    presets: allPresets.filter((p) => p.category === category)
  }))
}
