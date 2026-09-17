// Fixture: the two icon registries side by side. `icon: 'ec2'` hits AWS_ICONS and renders the official
// full-colour service tile in a rounded frame; `icon: 'terminal'` hits LUCIDE_ICONS and renders a line
// glyph tinted in the pattern accent; a node with no `icon` falls through to the pattern's own glyph.
// The registries share no keys, so this is a fallback chain, not a precedence puzzle — but the three
// paths look different enough that a regression in NodeIcon shows up here immediately.
import type { Scene } from '../../src'

export const vendorIcons: Scene = {
  id: 'vendor-icons',
  title: 'Icons — vendor, lucide, default',
  cols: 3,
  nodes: [
    { id: 'ec2', label: 'EC2', sub: "icon: 'ec2' — AWS tile", pattern: 'service', icon: 'ec2' },
    { id: 's3', label: 'S3', sub: "icon: 's3' — AWS tile", pattern: 'storage', icon: 's3' },
    { id: 'vpc', label: 'VPC', sub: "icon: 'vpc' — AWS tile", pattern: 'network', icon: 'vpc' },
    { id: 'term', label: 'Shell', sub: "icon: 'terminal' — lucide", pattern: 'service', icon: 'terminal' },
    { id: 'zap', label: 'Engine', sub: "icon: 'zap' — lucide (spark set)", pattern: 'service', icon: 'zap' },
    { id: 'none', label: 'Default', sub: 'no icon — pattern glyph', pattern: 'storage' },
    { id: 't1', label: 'lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
    { id: 't2', label: 'dynamodb', pattern: 'storage', variant: 'tile', icon: 'dynamodb' },
    { id: 't3', label: 'brain', pattern: 'service', variant: 'tile', icon: 'brain' },
  ],
  edges: [],
}
