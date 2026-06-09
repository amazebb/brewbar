import { initTree } from './amazejs.js';

initTree({
    data: ['data/countries.json'],
    tableId: 'worldTable',
    exportFilename: 'countries.csv',
    levels: [
        { nameKey: 'name' },
        { nameKey: 'name' },
    ]
});
