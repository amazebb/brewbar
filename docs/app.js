import { initTable, parseTsv, linkCell } from './amazebb-tv/index.js';

const tbl = document.getElementById('pkgTable');

// Read column config from data-col-{key} attributes on the table element.
// Format: "Label" or "Label,true|false"
// Element 0: display label — overrides auto-capitalized key
// Element 1: filter toggle — omit to let table.js decide based on numeric detection
const colConfig = key => {
    const attr = tbl.dataset[`col${key[0].toUpperCase()}${key.slice(1)}`];
    if (!attr) return {};
    const [labelPart, filterPart] = attr.split(',').map(s => s.trim());
    const result = {};
    if (labelPart) result.label = labelPart;
    if (filterPart !== undefined) result.filter = filterPart.toLowerCase() !== 'false';
    return result;
};

fetch('packages.json')
    .then(r => { if (!r.ok) throw new Error(); return r.json(); })
    .catch(() => fetch('packages.tsv').then(r => r.text()).then(parseTsv))
    .then(data => {
        initTable(data, {
            tableId:           'pkgTable',
            searchKeys:        ['name', 'desc'],
            searchPlaceholder: 'Search by name or description...',
            badgeAlwaysShow:   true,
            exportFilename:    'packages.csv',
            columns: [
                { key: 'name', ...colConfig('name'), render: linkCell('name', 'url', { wrap: 'code' }) },
                { key: 'type', ...colConfig('type') },
                { key: 'desc', ...colConfig('desc') },
                { key: 'cat',  ...colConfig('cat')  }
            ]
        });

        // Copy brew install command for current filtered view
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
    });
