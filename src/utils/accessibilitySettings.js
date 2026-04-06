const ROOT_ACCESSIBILITY_CLASSES = [
  'large-font',
  'high-contrast',
  'dyslexia-font',
  'reduced-motion',
  'link-spacing',
  'font-level-1',
  'font-level-2',
  'font-level-3',
  'line-spacing-1',
  'line-spacing-2',
  'line-spacing-3'
];

const STORAGE_KEYS = {
  fontSize: 'fontSize',
  fontSizeLevel: 'fontSizeLevel',
  dyslexiaFont: 'dyslexiaFont',
  highContrast: 'highContrast',
  reducedMotion: 'reducedMotion',
  linkSpacing: 'linkSpacing',
  lineSpacingLevel: 'lineSpacingLevel'
};

const parseLevel = (value) => {
  const parsedValue = parseInt(value || '0', 10);

  if (Number.isNaN(parsedValue)) {
    return 0;
  }

  return Math.min(Math.max(parsedValue, 0), 3);
};

const migrateLegacyFontSetting = (storage) => {
  const hasFontLevel = storage.getItem(STORAGE_KEYS.fontSizeLevel) !== null;
  const usesLegacyLargeFont = storage.getItem(STORAGE_KEYS.fontSize) === 'large';

  if (!hasFontLevel && usesLegacyLargeFont) {
    storage.setItem(STORAGE_KEYS.fontSizeLevel, '1');
  }

  if (usesLegacyLargeFont) {
    storage.removeItem(STORAGE_KEYS.fontSize);
  }
};

export const getAccessibilitySettings = (storage = window.localStorage) => {
  migrateLegacyFontSetting(storage);

  return {
    fontSizeLevel: parseLevel(storage.getItem(STORAGE_KEYS.fontSizeLevel)),
    dyslexiaFont: storage.getItem(STORAGE_KEYS.dyslexiaFont) === 'on',
    highContrast: storage.getItem(STORAGE_KEYS.highContrast) === 'on',
    reducedMotion: storage.getItem(STORAGE_KEYS.reducedMotion) === 'on',
    linkSpacing: storage.getItem(STORAGE_KEYS.linkSpacing) === 'on',
    lineSpacingLevel: parseLevel(storage.getItem(STORAGE_KEYS.lineSpacingLevel))
  };
};

export const syncAccessibilityRootClasses = (
  root = document.documentElement,
  storage = window.localStorage
) => {
  const settings = getAccessibilitySettings(storage);

  root.classList.remove(...ROOT_ACCESSIBILITY_CLASSES);

  if (settings.fontSizeLevel > 0) {
    root.classList.add(`font-level-${settings.fontSizeLevel}`);
  }

  if (settings.dyslexiaFont) {
    root.classList.add('dyslexia-font');
  }

  if (settings.highContrast) {
    root.classList.add('high-contrast');
  }

  if (settings.reducedMotion) {
    root.classList.add('reduced-motion');
  }

  if (settings.linkSpacing) {
    root.classList.add('link-spacing');
  }

  if (settings.lineSpacingLevel > 0) {
    root.classList.add(`line-spacing-${settings.lineSpacingLevel}`);
  }

  return settings;
};

export const resetAccessibilitySettings = (
  root = document.documentElement,
  storage = window.localStorage
) => {
  Object.values(STORAGE_KEYS).forEach((key) => storage.removeItem(key));
  root.classList.remove(...ROOT_ACCESSIBILITY_CLASSES);

  return getAccessibilitySettings(storage);
};
