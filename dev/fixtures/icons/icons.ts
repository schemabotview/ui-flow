import type { Scene, SceneNode } from '../../../src'
import { AWS_ICONS } from '../../../src/awsIcons'
import { LUCIDE_ICONS } from '../../../src/lucideIcons'
import { AZURE_ICONS } from '../../../src/azureIcons'
import { BRAND_ICONS } from '../../../src/brandIcons'

const registry = (id: string, label: string, keys: object): SceneNode => ({
  id,
  label: `${label} — ${Object.keys(keys).length} keys`,
  pattern: 'group',
  cols: 10,
  children: Object.keys(keys).sort().map((key) => ({ id: `${id}-${key}`, label: key, pattern: 'service', variant: 'tile', icon: key })),
})

export const icons: Scene = {
  id: 'icon-gallery',
  title: 'Icons — resolution order and every registry',
  nodes: [
    {
      id: 'resolution', label: 'Resolution order', sub: 'AWS tile → Azure tile → brand mark → lucide glyph → the pattern default', pattern: 'group', cols: 3,
      children: [
        { id: 'ec2', label: 'EC2', sub: "icon: 'ec2' — AWS tile", pattern: 'service', icon: 'ec2' },
        { id: 's3', label: 'S3', sub: "icon: 's3' — AWS tile", pattern: 'storage', icon: 's3' },
        { id: 'vpc', label: 'VPC', sub: "icon: 'vpc' — AWS tile", pattern: 'network', icon: 'vpc' },
        { id: 'term', label: 'Shell', sub: "icon: 'terminal' — lucide", pattern: 'service', icon: 'terminal' },
        { id: 'zap', label: 'Engine', sub: "icon: 'zap' — lucide (spark set)", pattern: 'service', icon: 'zap' },
        { id: 'vm', label: 'Virtual Machine', sub: "icon: 'vm' — Azure tile", pattern: 'service', icon: 'vm' },
        { id: 'storageacct', label: 'Storage account', sub: "icon: 'storage' — Azure tile", pattern: 'storage', icon: 'storage' },
        { id: 'vnet', label: 'VNet', sub: "icon: 'vnet' — Azure tile", pattern: 'network', icon: 'vnet' },
        { id: 'kafka', label: 'Kafka', sub: "icon: 'kafka' — brand mark, ink on a dark surface", pattern: 'network', icon: 'kafka' },
        { id: 'spark', label: 'Spark', sub: "icon: 'spark' — brand mark in its own colour", pattern: 'service', icon: 'spark' },
        { id: 'none', label: 'Default', sub: 'no icon — pattern glyph', pattern: 'storage' },
        { id: 't1', label: 'lambda', pattern: 'service', variant: 'tile', icon: 'lambda' },
        { id: 't2', label: 'dynamodb', pattern: 'storage', variant: 'tile', icon: 'dynamodb' },
        { id: 't3', label: 'brain', pattern: 'service', variant: 'tile', icon: 'brain' },
        { id: 't4', label: 'aks', pattern: 'service', variant: 'tile', icon: 'aks' },
        { id: 't5', label: 'cosmos', pattern: 'storage', variant: 'tile', icon: 'cosmos' },
        { id: 't6', label: 'keyvault', pattern: 'service', variant: 'tile', icon: 'keyvault' },
      ],
    },
    registry('aws', 'AWS', AWS_ICONS),
    registry('lucide', 'Lucide', LUCIDE_ICONS),
    registry('azure', 'Azure', AZURE_ICONS),
    registry('brand', 'Brand', BRAND_ICONS),
  ],
  edges: [],
}
