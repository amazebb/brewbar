import { initTreeTable } from './amazejs/index.js';

initTreeTable({
    data: ['data/c0.json'],
    tableId: 'worldTable',
    levels: [
        { nameKey: 'name' },
        { nameKey: 'name' },
    ]
});
