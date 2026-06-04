import { initTreeTable } from 'https://cdn.jsdelivr.net/gh/amazebb/amazejs@master/index.js';

initTreeTable({
    data: ['data/c2.json'],
    tableId: 'worldTable',
    exportFilename: 'countries.csv',
    levels: [
        { nameKey: 'name' },
        { nameKey: 'name' },
    ]
});
