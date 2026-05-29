// Pure data functions — no DOM dependencies.

// Parses a TSV string into an array of objects keyed by the first-row headers.
export function parseTsv(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split('\t').map(h => h.trim());
    return lines.slice(1).map(line => {
        const parts = line.split('\t');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (parts[i] || '').trim(); });
        return obj;
    });
}

// Resolves column definitions, merging config with numeric-detection defaults.
export function inferColumns(data, configCols) {
    const base = configCols || Object.keys(data[0] || {}).map(key => ({ key }));
    return base.map((col, i) => {
        const isNumeric = data.every(item => !item[col.key] || !isNaN(Number(item[col.key])));
        return { filter: !isNumeric, label: capitalize(col.key), ...col, _i: i };
    });
}

// Returns the subset of data items that match all active filters and the search query.
export function getVisible(data, filterState, query, searchKeys) {
    const q = query.toLowerCase();
    return data.filter(item => {
        const matchFilters = Object.entries(filterState)
            .every(([key, selected]) => selected.has(item[key]));
        const matchSearch = !q || searchKeys.some(k => (item[k] || '').toLowerCase().includes(q));
        return matchFilters && matchSearch;
    });
}

// Returns per-filter value counts, where each filter is counted against all OTHER
// active filters + search (so the dropdown shows how many items each option would reveal).
export function computeCounts(data, filterState, query, searchKeys) {
    const q = query.toLowerCase();
    const counts = {};
    Object.keys(filterState).forEach(key => { counts[key] = {}; });

    data.forEach(item => {
        Object.keys(filterState).forEach(key => {
            const matchOthers = Object.entries(filterState)
                .filter(([k]) => k !== key)
                .every(([k, selected]) => selected.has(item[k]));
            const matchSearch = !q || searchKeys.some(k => (item[k] || '').toLowerCase().includes(q));
            if (matchOthers && matchSearch) {
                const val = item[key];
                counts[key][val] = (counts[key][val] || 0) + 1;
            }
        });
    });

    return counts;
}

// Returns a new sorted array, leaving the original untouched.
export function sortItems(data, key, dir) {
    return [...data].sort((a, b) => {
        const aVal = (a[key] || '').toLowerCase();
        const bVal = (b[key] || '').toLowerCase();
        if (aVal < bVal) return -dir;
        if (aVal > bVal) return dir;
        return 0;
    });
}

function capitalize(str) {
    return str ? str[0].toUpperCase() + str.slice(1) : '';
}
