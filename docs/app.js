import { fetchData, initTable, linkCell } from './amazejs/index.js';

function copyBrewInstall(visibleItems, btn) {
    const formulas = [], casks = [];
    visibleItems.forEach(item => {
        if (item.type === 'cask') casks.push(item.name);
        else formulas.push(item.name);
    });
    const parts = [];
    if (formulas.length) parts.push(`brew install ${formulas.join(' ')}`);
    if (casks.length) parts.push(`brew install --cask ${casks.join(' ')}`);
    navigator.clipboard.writeText(parts.join('\n')).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy brew install'; }, 2000);
    });
}

const data = await fetchData('data/packages.json', 'data/packages.tsv');

initTable(data, {
    tableId: 'pkgTable',
    title: 'Homebrew Packages',
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
    ],
    buttons: [
        { label: 'Copy brew install', onClick: copyBrewInstall }
    ]
});
