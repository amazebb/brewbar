import { fetchData, initTable, linkCell } from './amazebb-tv/index.js';

const data = await fetchData('data/packages.json', 'data/packages.tsv');

initTable(data, {
    tableId: 'pkgTable',
    searchKeys: ['name', 'desc'],
    searchPlaceholder: 'Search by name or description...',
    badgeAlwaysShow: true,
    exportFilename: 'packages.csv',
    striped: true,
    rowNumbers: true,
    bordered: true,
    columns: [
        { key: 'name', label: 'Name', render: linkCell('name', 'url', { wrap: 'code' }) },
        { key: 'type', label: 'Type', filter: 'category' },
        { key: 'desc', label: 'Description' },
        { key: 'cat', label: 'Category', filter: 'category' }
    ]
});

document.getElementById('brewBtn').addEventListener('click', () => {
    const formulas = [], casks = [];
    data.forEach(item => {
        if (item.tr.classList.contains('hidden')) return;
        if (item.type === 'cask') casks.push(item.name); else formulas.push(item.name);
    });
    const parts = [];
    if (formulas.length) parts.push(`brew install ${formulas.join(' ')}`);
    if (casks.length) parts.push(`brew install --cask ${casks.join(' ')}`);
    const btn = document.getElementById('brewBtn');
    navigator.clipboard.writeText(parts.join('\n')).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
    });
});
