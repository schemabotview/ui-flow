import type { Scene } from '../../../src'

// The sample IDE frame for python-ct: explorer | editor, with the terminal docked under the editor. Every line of code and output
// below was run (Python 3.13, fresh venv) before it was pasted — the output is real.

const pricing = "from decimal import Decimal, ROUND_HALF_UP\n\nfrom roastery.catalogue import CATALOGUE\n\nCENT = Decimal(\"0.01\")\n\n\ndef line_total(sku: str, quantity: int) -> Decimal:\n    \"\"\"Price of one order line, before any discount.\"\"\"\n    return CATALOGUE[sku][\"price\"] * quantity\n\n\ndef subtotal(order: dict[str, int]) -> Decimal:\n    \"\"\"Sum of every line in the order.\"\"\"\n    return sum((line_total(sku, qty) for sku, qty in order.items()), Decimal(\"0\"))\n\n\ndef apply_discount(amount: Decimal, order: dict[str, int]) -> Decimal:\n    \"\"\"10% off when the order holds 3 or more bags.\"\"\"\n    bags = sum(order.values())\n    if bags >= 3:\n        amount = amount * Decimal(\"0.90\")\n    return amount.quantize(CENT, rounding=ROUND_HALF_UP)"

export const ideFrame: Scene = {
  id: 'ide-frame',
  title: 'Study — an IDE frame: explorer, editor and terminal',
  flow: 'LR',
  align: 'start',
  stretch: true,
  gap: 'tight',
  nodes: [
    {
      id: 'explorer',
      kind: 'tree',
      label: 'roastery-shop',
      tree: [
        { name: '.venv', folder: true, state: 'muted', note: "this project's own Python" },
        {
          name: 'roastery',
          children: [
            { name: '__init__.py' },
            { name: 'catalogue.py' },
            { name: 'pricing.py', state: 'active' },
          ],
        },
        { name: 'main.py' },
        { name: 'pyproject.toml' },
      ],
    },
    {
      id: 'workbench',
      label: 'workbench',
      bare: true,
      gap: 'tight',
      children: [
        {
          id: 'editor',
          kind: 'code',
          filename: 'roastery/pricing.py',
          pattern: 'storage',
          label: pricing,
          show: [[1, 5], [18, 23]],
          highlight: [18, 19, 20, 21, 22, 23],
        },
        {
          id: 'terminal',
          kind: 'terminal',
          filename: 'Terminal — roastery-shop',
          label: [
            '$ python main.py',
            'bags      3',
            'subtotal   35.00',
            'to pay     31.50',
          ].join('\n'),
          span: 'all',
        },
      ],
    },
  ],
  edges: [],
}

