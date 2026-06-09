import { initTreeTable } from './amazejs.js';

initTreeTable({
    data: ['data/c2.json'],
    tableId: 'worldTable',
    exportFilename: 'countries.csv',
    levels: [
        { nameKey: 'name' },
        { nameKey: 'name' },
    ]
});
