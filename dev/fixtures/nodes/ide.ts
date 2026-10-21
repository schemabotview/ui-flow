import type { Scene } from '../../../src'

const pricing = "from decimal import Decimal, ROUND_HALF_UP\n\nfrom roastery.catalogue import CATALOGUE\n\nCENT = Decimal(\"0.01\")\n\n\ndef line_total(sku: str, quantity: int) -> Decimal:\n    \"\"\"Price of one order line, before any discount.\"\"\"\n    return CATALOGUE[sku][\"price\"] * quantity\n\n\ndef subtotal(order: dict[str, int]) -> Decimal:\n    \"\"\"Sum of every line in the order.\"\"\"\n    return sum((line_total(sku, qty) for sku, qty in order.items()), Decimal(\"0\"))\n\n\ndef apply_discount(amount: Decimal, order: dict[str, int]) -> Decimal:\n    \"\"\"10% off when the order holds 3 or more bags.\"\"\"\n    bags = sum(order.values())\n    if bags >= 3:\n        amount = amount * Decimal(\"0.90\")\n    return amount.quantize(CENT, rounding=ROUND_HALF_UP)"

export const ide: Scene = {
  id: 'ide',
  title: 'IDE panes — tree, folded and highlighted code, terminal',
  cols: 3,
  align: 'start',
  nodes: [
    {
      id: 'deep-tree',
      kind: 'tree',
      label: 'a-project-with-a-long-name',
      tree: [
        { name: '.venv', folder: true, state: 'muted', note: 'isolated Python' },
        { name: '.gitignore' },
        {
          name: 'src',
          children: [
            {
              name: 'roastery',
              children: [
                { name: '__init__.py' },
                { name: 'checkout_session_repository.py', state: 'new' },
                { name: 'pricing.py', state: 'active' },
                { name: 'suppliers', folder: true },
              ],
            },
          ],
        },
        { name: 'tests', children: [{ name: 'test_pricing.py', state: 'new', note: 'pytest' }] },
        { name: 'pyproject.toml' },
      ],
    },
    {
      id: 'folds',
      kind: 'code',
      filename: 'roastery/pricing.py',
      label: pricing,
      show: [[8, 10], [13, 15]],
      highlight: [10],
    },
    {
      id: 'traceback',
      kind: 'terminal',
      label: [
        '$ python bad.py',
        'Traceback (most recent call last):',
        '  File "/tmp/shop/bad.py", line 3, in <module>',
        '    print(subtotal({"ETH-250": 2, "KEN-250": 1}))',
        '          ~~~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^',
        '  File "/tmp/shop/roastery/pricing.py", line 10, in line_total',
        '    return CATALOGUE[sku]["price"] * quantity',
        '           ~~~~~~~~~^^^^^',
        "KeyError: 'KEN-250'",
      ].join('\n'),
    },
    { id: 'unfolded', kind: 'code', filename: 'no show: every line, numbered from 1', label: 'while True:\n    if done:\n        break\n    elif retry:\n        continue\nraise ValueError(None)', hug: true },
    { id: 'fold-one', kind: 'code', filename: 'a fold of exactly one line', label: 'a = 1\nb = 2\nc = 3', show: [[1, 1], [3, 3]], highlight: [3], pattern: 'warn', hug: true },
    { id: 'tiny-tree', kind: 'tree', label: 'x', tree: [{ name: 'main.py', state: 'active' }] },
  ],
  edges: [],
}
