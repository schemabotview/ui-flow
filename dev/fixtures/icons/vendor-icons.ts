// Fixture: the three icon registries side by side. `icon: 'ec2'` hits AWS_ICONS and renders the official
// full-colour service tile in a rounded frame; `icon: 'terminal'` hits LUCIDE_ICONS and renders a line
// glyph tinted in the pattern accent; a node with no `icon` falls through to the pattern's own glyph.
// `icon: 'vm'` hits AZURE_ICONS and renders the Azure tile, which is drawn on a smaller art board and
// so is framed without the AWS bleed. The registries share no keys, so this is a fallback chain, not a
// precedence puzzle — but the four paths look different enough that a regression in NodeIcon shows up
// here immediately.
import type { Scene } from '../../../src'

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
    { id: 'vm', label: 'Virtual Machine', sub: "icon: 'vm' — Azure tile", pattern: 'service', icon: 'vm' },
    { id: 'storageacct', label: 'Storage account', sub: "icon: 'storage' — Azure tile", pattern: 'storage', icon: 'storage' },
    { id: 'vnet', label: 'VNet', sub: "icon: 'vnet' — Azure tile", pattern: 'network', icon: 'vnet' },
    { id: 'none', label: 'Default', sub: 'no icon — pattern glyph', pattern: 'storage' },
    { id: 't1', label: 'lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
    { id: 't2', label: 'dynamodb', pattern: 'storage', variant: 'tile', icon: 'dynamodb' },
    { id: 't3', label: 'brain', pattern: 'service', variant: 'tile', icon: 'brain' },
    { id: 't4', label: 'aks', pattern: 'service', variant: 'tile', icon: 'aks' },
    { id: 't5', label: 'cosmos', pattern: 'storage', variant: 'tile', icon: 'cosmos' },
    { id: 't6', label: 'keyvault', pattern: 'service', variant: 'tile', icon: 'keyvault' },
  ],
  edges: [],
}
