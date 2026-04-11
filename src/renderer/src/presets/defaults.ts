import type { PresetType, PresetCategoryType } from '../types/index.js'

export const PRESET_CATEGORIES: Record<PresetCategoryType, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  twitter: 'Twitter / X',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  web: 'Web',
  print: 'Print'
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
    id: 'ig-profile',
    name: 'Profile',
    category: 'instagram',
    width: 320,
    height: 320,
    format: 'jpeg',
    quality: 90,
    description: '320x320 · 1:1',
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

  // --- Web (2) ---
  {
    id: 'web-standard',
    name: 'Web Standard',
    category: 'web',
    width: 1920,
    height: null,
    format: 'webp',
    quality: 80,
    description: 'max 1920px · 원본 비율',
    isCustom: false
  },
  {
    id: 'web-retina',
    name: 'Web Retina 2x',
    category: 'web',
    width: 3840,
    height: null,
    format: 'webp',
    quality: 75,
    description: 'max 3840px · 원본 비율',
    isCustom: false
  },

  // --- Print (2) ---
  {
    id: 'print-a4',
    name: 'A4 (300dpi)',
    category: 'print',
    width: 3508,
    height: 2480,
    format: 'jpeg',
    quality: 95,
    description: '3508x2480 · 210x297mm',
    isCustom: false
  },
  {
    id: 'print-card',
    name: '명함 (300dpi)',
    category: 'print',
    width: 1050,
    height: 600,
    format: 'jpeg',
    quality: 95,
    description: '1050x600 · 90x50mm',
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
