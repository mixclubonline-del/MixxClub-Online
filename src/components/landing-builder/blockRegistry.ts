/**
 * Block Registry — defines all available block types, their default props,
 * and the schema for the admin builder form.
 */

export interface BlockFieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'color' | 'select' | 'number' | 'toggle' | 'image';
  options?: { label: string; value: string }[];
  defaultValue: any;
}

export interface BlockTypeDef {
  type: string;
  label: string;
  icon: string; // lucide icon name
  description: string;
  fields: BlockFieldDef[];
}

export const BLOCK_TYPES: BlockTypeDef[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    icon: 'Sparkles',
    description: 'Full-width hero with headline, subtitle, and CTA',
    fields: [
      { key: 'badge', label: 'Badge Text', type: 'text', defaultValue: '' },
      { key: 'title', label: 'Headline', type: 'textarea', defaultValue: 'Your Headline Here' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'A compelling subtitle that draws visitors in.' },
      { key: 'ctaText', label: 'CTA Button Text', type: 'text', defaultValue: 'Get Started' },
      { key: 'ctaHref', label: 'CTA Link', type: 'text', defaultValue: '/auth?mode=signup' },
      { key: 'secondaryCtaText', label: 'Secondary CTA Text', type: 'text', defaultValue: '' },
      { key: 'secondaryCtaHref', label: 'Secondary CTA Link', type: 'text', defaultValue: '' },
      { key: 'backgroundImage', label: 'Background Image', type: 'image', defaultValue: '' },
      { key: 'alignment', label: 'Text Alignment', type: 'select', defaultValue: 'center', options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
      ]},
      { key: 'overlay', label: 'Dark Overlay', type: 'toggle', defaultValue: true },
      { key: 'fullHeight', label: 'Full Screen Height', type: 'toggle', defaultValue: true },
    ],
  },
  {
    type: 'features_grid',
    label: 'Features Grid',
    icon: 'LayoutGrid',
    description: '3-column feature cards with icons',
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', defaultValue: 'Why Choose Us' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Everything you need in one platform.' },
      { key: 'columns', label: 'Columns', type: 'select', defaultValue: '3', options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ]},
      { key: 'features', label: 'Features (JSON array)', type: 'textarea', defaultValue: JSON.stringify([
        { icon: 'Zap', title: 'Lightning Fast', description: 'Built for speed and performance.' },
        { icon: 'Shield', title: 'Secure', description: 'Enterprise-grade security built in.' },
        { icon: 'Users', title: 'Collaborative', description: 'Work together in real-time.' },
      ], null, 2) },
    ],
  },
  {
    type: 'stats_bar',
    label: 'Stats Bar',
    icon: 'BarChart3',
    description: 'Horizontal stat counters',
    fields: [
      { key: 'stats', label: 'Stats (JSON array)', type: 'textarea', defaultValue: JSON.stringify([
        { value: '10,000+', label: 'Active Users' },
        { value: '98%', label: 'Satisfaction' },
        { value: '24/7', label: 'Support' },
        { value: '$0', label: 'To Start' },
      ], null, 2) },
      { key: 'glassEffect', label: 'Glass Effect', type: 'toggle', defaultValue: true },
    ],
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    icon: 'MessageCircle',
    description: 'Social proof section with quote cards',
    fields: [
      { key: 'title', label: 'Section Title', type: 'text', defaultValue: 'What People Say' },
      { key: 'subtitle', label: 'Section Subtitle', type: 'textarea', defaultValue: 'Real stories from our community.' },
      { key: 'testimonials', label: 'Testimonials (JSON array)', type: 'textarea', defaultValue: JSON.stringify([
        { quote: 'This platform changed my workflow completely.', name: 'Alex Rivera', role: 'Artist', avatar: '' },
        { quote: 'Finally a tool built for professionals.', name: 'Jordan Chen', role: 'Engineer', avatar: '' },
        { quote: 'The community is incredible.', name: 'Sam Taylor', role: 'Producer', avatar: '' },
      ], null, 2) },
    ],
  },
  {
    type: 'cta_banner',
    label: 'CTA Banner',
    icon: 'Megaphone',
    description: 'Full-width call-to-action section',
    fields: [
      { key: 'title', label: 'Headline', type: 'text', defaultValue: 'Ready to Get Started?' },
      { key: 'subtitle', label: 'Subtitle', type: 'textarea', defaultValue: 'Join thousands already on the platform.' },
      { key: 'ctaText', label: 'Button Text', type: 'text', defaultValue: 'Sign Up Free' },
      { key: 'ctaHref', label: 'Button Link', type: 'text', defaultValue: '/auth?mode=signup' },
      { key: 'disclaimer', label: 'Disclaimer Text', type: 'text', defaultValue: 'No credit card required' },
      { key: 'variant', label: 'Variant', type: 'select', defaultValue: 'primary', options: [
        { label: 'Primary', value: 'primary' },
        { label: 'Glass', value: 'glass' },
        { label: 'Gradient', value: 'gradient' },
      ]},
    ],
  },
  {
    type: 'image_text',
    label: 'Image + Text',
    icon: 'Columns',
    description: 'Side-by-side image and text content',
    fields: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: 'Feature Highlight' },
      { key: 'body', label: 'Body Text', type: 'textarea', defaultValue: 'Describe a key feature or value proposition in detail.' },
      { key: 'image', label: 'Image', type: 'image', defaultValue: '' },
      { key: 'imagePosition', label: 'Image Position', type: 'select', defaultValue: 'right', options: [
        { label: 'Left', value: 'left' },
        { label: 'Right', value: 'right' },
      ]},
      { key: 'ctaText', label: 'CTA Text (optional)', type: 'text', defaultValue: '' },
      { key: 'ctaHref', label: 'CTA Link', type: 'text', defaultValue: '' },
    ],
  },
  {
    type: 'text_section',
    label: 'Text Section',
    icon: 'Type',
    description: 'Rich text block for body copy',
    fields: [
      { key: 'title', label: 'Title', type: 'text', defaultValue: '' },
      { key: 'body', label: 'Body', type: 'textarea', defaultValue: 'Write your content here...' },
      { key: 'alignment', label: 'Alignment', type: 'select', defaultValue: 'center', options: [
        { label: 'Center', value: 'center' },
        { label: 'Left', value: 'left' },
      ]},
      { key: 'maxWidth', label: 'Max Width', type: 'select', defaultValue: '3xl', options: [
        { label: 'Narrow', value: '2xl' },
        { label: 'Medium', value: '3xl' },
        { label: 'Wide', value: '5xl' },
        { label: 'Full', value: '7xl' },
      ]},
    ],
  },
  {
    type: 'spacer',
    label: 'Spacer',
    icon: 'Minus',
    description: 'Vertical spacing between sections',
    fields: [
      { key: 'height', label: 'Height (px)', type: 'number', defaultValue: 64 },
      { key: 'showDivider', label: 'Show Divider Line', type: 'toggle', defaultValue: false },
    ],
  },
];

export function getBlockDef(type: string): BlockTypeDef | undefined {
  return BLOCK_TYPES.find(b => b.type === type);
}

export function getDefaultProps(type: string): Record<string, any> {
  const def = getBlockDef(type);
  if (!def) return {};
  return Object.fromEntries(def.fields.map(f => [f.key, f.defaultValue]));
}
