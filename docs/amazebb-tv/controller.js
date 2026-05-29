import { inferColumns, getVisible, computeCounts, sortItems } from './model.js';
import {
    buildHeader, buildRows, buildFilterOptions,
    syncCheckboxes, setRowVisibility,
    updateFilterCounts, filterOptionRows
} from './view.js';

export function initTable(data, config) {
    const {
        tableId,
        searchInputId,
        noResultsId,
        searchKeys,
        badgeAlwaysShow = false,
        onFilter
    } = config;

    const table       = document.getElementById(tableId);
    const tbody       = table.querySelector('tbody');
    const thead       = table.querySelector('thead');
    const searchInput = document.getElementById(searchInputId);
    const noResults   = document.getElementById(noResultsId);

    // --- Model: resolve columns ---
    const columns = inferColumns(data, config.columns);

    // --- View: build initial DOM ---
    const filterDefs = buildHeader(thead, columns, tableId);
    buildRows(tbody, data, columns);

    // --- State ---
    // filterState: data key → Set of selected values
    const filterState = {};
    // filterUI: data key → { values, rows, checkboxes }
    const filterUI = {};
    let sortedData  = [...data];
    const sortState = { key: null, dir: 1 };

    // Build filter option lists and initialise state
    filterDefs.forEach(def => {
        const values = [...new Set(data.map(d => d[def.key]))].filter(Boolean).sort();
        filterState[def.key] = new Set(values);

        const { rows, checkboxes } = buildFilterOptions(
            def.id, values,
            (v, checked) => {
                if (checked) filterState[def.key].add(v);
                else filterState[def.key].delete(v);
                refresh();
            },
            v => {
                filterState[def.key] = new Set([v]);
                syncCheckboxes(filterUI[def.key].checkboxes, filterState[def.key]);
                refresh();
            }
        );

        filterUI[def.key] = { values, rows, checkboxes };
    });

    // --- Refresh: apply filters, update all UI ---
    function refresh() {
        const query      = searchInput.value;
        const visibleSet = new Set(getVisible(sortedData, filterState, query, searchKeys));

        setRowVisibility(sortedData, visibleSet);
        noResults.classList.toggle('show', visibleSet.size === 0);
        if (onFilter) onFilter(visibleSet.size, data.length);

        const counts = computeCounts(data, filterState, query, searchKeys);
        filterDefs.forEach(def => {
            const ui = filterUI[def.key];
            updateFilterCounts(def, ui.values, counts[def.key] || {}, filterState[def.key], ui.rows, badgeAlwaysShow);
        });
    }

    searchInput.addEventListener('input', refresh);

    // --- Dropdown management ---
    const allDropdowns = filterDefs.map(def => ({
        dd:   document.getElementById(def.id),
        wrap: document.getElementById(def.btnId).parentElement
    }));

    function closeAll() {
        allDropdowns.forEach(({ dd }) => dd.classList.remove('show'));
    }

    function toggleDropdown(def) {
        const dd   = document.getElementById(def.id);
        const btn  = document.getElementById(def.btnId);
        const open = dd.classList.contains('show');
        closeAll();
        if (!open) {
            const rect = btn.parentElement.getBoundingClientRect();
            dd.style.top  = `${rect.bottom + 4}px`;
            dd.style.left = `${rect.left}px`;
            dd.classList.add('show');
            const r = dd.getBoundingClientRect();
            if (r.right > window.innerWidth - 8) {
                dd.style.left = `${Math.max(8, window.innerWidth - r.width - 8)}px`;
            }
            if (r.left < 8) dd.style.left = '8px';
            const search  = dd.querySelector('.filter-search');
            search.value  = '';
            filterOptionRows(filterUI[def.key].rows, filterUI[def.key].values, '');
            search.focus();
        }
    }

    filterDefs.forEach(def => {
        const btn = document.getElementById(def.btnId);
        const dd  = document.getElementById(def.id);

        btn.addEventListener('click', e => { e.preventDefault(); toggleDropdown(def); });

        dd.querySelector('.filter-search').addEventListener('input', function() {
            filterOptionRows(filterUI[def.key].rows, filterUI[def.key].values, this.value);
        });

        dd.querySelector('.sel-all').addEventListener('click', e => {
            e.preventDefault();
            filterState[def.key] = new Set(filterUI[def.key].values);
            syncCheckboxes(filterUI[def.key].checkboxes, filterState[def.key]);
            refresh();
        });

        dd.querySelector('.clr-all').addEventListener('click', e => {
            e.preventDefault();
            filterState[def.key] = new Set();
            syncCheckboxes(filterUI[def.key].checkboxes, filterState[def.key]);
            refresh();
        });
    });

    document.addEventListener('click', e => {
        allDropdowns.forEach(({ dd, wrap }) => {
            if (!wrap.contains(e.target) && !dd.contains(e.target)) {
                dd.classList.remove('show');
            }
        });
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    // --- Sorting ---
    function sortByCol(colIndex) {
        const col = columns.find(c => c._i === colIndex);
        if (!col) return;

        if (sortState.key === col.key) {
            sortState.dir *= -1;
        } else {
            sortState.key = col.key;
            sortState.dir = 1;
        }

        const dirClass = sortState.dir === 1 ? 'asc' : 'desc';
        table.querySelectorAll('th.sortable').forEach(th => th.classList.remove('asc', 'desc'));
        const activeTh = table.querySelector(`th[data-col="${colIndex}"]`);
        if (activeTh) activeTh.classList.add(dirClass);
        filterDefs.forEach(def => {
            if (def.col === colIndex) {
                document.getElementById(def.btnId).parentElement.parentElement.classList.add(dirClass);
            }
        });

        sortedData = sortItems(data, col.key, sortState.dir);
        sortedData.forEach(item => tbody.appendChild(item.tr));
        refresh();
    }

    table.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => sortByCol(parseInt(th.getAttribute('data-col'))));
    });

    filterDefs.forEach(def => {
        const th = document.getElementById(def.btnId).closest('th');
        th.classList.add('sortable');
        th.addEventListener('click', e => { if (e.target === th) sortByCol(def.col); });
    });

    refresh();
}
