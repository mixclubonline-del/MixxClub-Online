// Profile Identity System — Barrel export
export { ProfileCanvasEditor } from './ProfileCanvasEditor';
export { ColorSystemPicker } from './ColorSystemPicker';
export { GradientBuilder } from './GradientBuilder';
export { AvatarFrameSelector } from './AvatarFrameSelector';
export { LayoutModeSwitcher } from './LayoutModeSwitcher';
export { FontPicker } from './FontPicker';
export { BackgroundPatternSelector } from './BackgroundPatternSelector';
export {
    type ProfileConfig,
    type ProfileColors,
    type ProfileGradient,
    type ProfileBackground,
    type ProfileFont,
    type ProfileLayout,
    type AvatarFrame,
    DEFAULT_PROFILE_CONFIG,
    AVAILABLE_FONTS,
    GRADIENT_DIRECTIONS,
    AVATAR_FRAMES,
    LAYOUT_MODES,
    gradientToCSS,
    patternToCSS,
} from './types';
