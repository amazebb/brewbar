import { initTable } from './amazejs.js';

initTable({
    data: ['data/countries.json'],
    tableId: 'worldTable',
    exportFilename: 'countries.csv',
});
