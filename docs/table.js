// Generic filterable/sortable table module.
// Call initTable(data, config) after fetching data and updating any app-specific UI.
//
// config shape:
// {
//   tableId:         string,
//   searchInputId:   string,
//   noResultsId:     string,
//   searchKeys:      string[],
//   badgeAlwaysShow: boolean,
//   columns: [{ key, label?, filter?, render? }],
//   // columns is optional — if omitted, all data keys are shown, none filtered
//   // key:    data property to read from each row object
//   // label:  column header display name — overrides auto-capitalized key
//   // filter: true → adds a dropdown filter for this column
//   // render: fn(item) → Element — custom cell renderer, overrides default text
//   onFilter: (visibleCount, total) => void
// }
//
// All columns are sortable by default.
// Columns with filter:true get a dropdown filter in the header.
// The thead and all filter dropdowns are built dynamically — no markup needed beyond
// an empty <thead> and <tbody>.

export function initTable(data, config) {
    const {
        tableId,
        searchInputId,
        noResultsId,
        searchKeys,
        badgeAlwaysShow = false,
        onFilter
    } = config;

    // Resolve columns — auto-detect from data keys if not provided.
    // Default filter: true for non-numeric columns, false for numeric.
    // Explicit filter in column config or data attributes overrides this.
    const columns = (config.columns || Object.keys(data[0] || {}).map(key => ({ key })))
        .map((col, i) => {
            const isNumeric = data.every(item => !item[col.key] || !isNaN(Number(item[col.key])));
            return { filter: !isNumeric, label: capitalize(col.key), ...col, _i: i };
        });

    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const thead = table.querySelector('thead');
    const searchInput = document.getElementById(searchInputId);
    const noResults = document.getElementById(noResultsId);

    // col index → data key (for sorting)
    const colKeys = {};
    columns.forEach(col => { colKeys[col._i] = col.key; });

    // --- Build thead ---
    const headerRow = document.createElement('tr');
    columns.forEach(col => {
        const th = document.createElement('th');
        th.setAttribute('data-col', col._i);

        if (col.filter) {
            const filterId = `${tableId}_filter_${col.key}`;
            const btnId = `${tableId}_btn_${col.key}`;

            const wrap = document.createElement('span');
            wrap.className = 'filter-wrap';

            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.id = btnId;
            btn.textContent = col.label;
            wrap.appendChild(btn);
            th.appendChild(wrap);

            // Build dropdown and portal immediately to body
            const dd = document.createElement('div');
            dd.className = 'filter-dropdown';
            dd.id = filterId;

            const fsearch = document.createElement('input');
            fsearch.className = 'filter-search';
            fsearch.type = 'text';
            fsearch.placeholder = 'Search...';

            const foptions = document.createElement('div');
            foptions.className = 'filter-options';

            const factions = document.createElement('div');
            factions.className = 'filter-actions';

            const selAll = document.createElement('button');
            selAll.className = 'sel-all';
            selAll.textContent = 'Show All';

            const badge = document.createElement('span');
            badge.className = 'filter-actions-badge';

            const clrAll = document.createElement('button');
            clrAll.className = 'clr-all';
            clrAll.textContent = 'Clear All';

            factions.appendChild(selAll);
            factions.appendChild(badge);
            factions.appendChild(clrAll);
            dd.appendChild(fsearch);
            dd.appendChild(foptions);
            dd.appendChild(factions);
            document.body.appendChild(dd);
        } else {
            th.className = 'sortable';
            th.textContent = col.label;
        }

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);

    // Derive filter defs from columns with filter:true
    const filterDefs = columns.filter(col => col.filter).map(col => ({
        id: `${tableId}_filter_${col.key}`,
        btnId: `${tableId}_btn_${col.key}`,
        key: col.key,
        col: col._i
    }));

    // --- Build rows — single reflow via DocumentFragment ---
    const fragment = document.createDocumentFragment();
    data.forEach(item => {
        const tr = document.createElement('tr');
        columns.forEach(col => {
            const td = document.createElement('td');
            if (col.render) {
                td.appendChild(col.render(item));
            } else {
                td.textContent = item[col.key] || '';
            }
            tr.appendChild(td);
        });
        fragment.appendChild(tr);
        item.tr = tr;
    });
    tbody.appendChild(fragment);

    // --- Filter state ---
    const filters = {};
    filterDefs.forEach(def => {
        filters[def.id] = {
            key: def.key,
            col: def.col,
            selected: new Set(),
            all: [],
            btn: document.getElementById(def.btnId),
            rows: {},
            checkboxes: {}
        };
    });

    Object.keys(filters).forEach(id => {
        const f = filters[id];
        f.all = [...new Set(data.map(d => d[f.key]))].filter(Boolean).sort();
        f.selected = new Set(f.all);

        const container = document.querySelector(`#${id} .filter-options`);
        f.all.forEach(v => {
            const row = document.createElement('div');
            row.className = 'filter-row';
            row.setAttribute('data-value', v.toLowerCase());

            const label = document.createElement('label');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.checked = true;
            cb.addEventListener('change', function() {
                if (this.checked) f.selected.add(v); else f.selected.delete(v);
                applyFilters();
            });
            label.appendChild(cb);
            label.appendChild(document.createTextNode(v));

            const onlyBtn = document.createElement('button');
            onlyBtn.className = 'only-btn';
            onlyBtn.textContent = 'Only';
            onlyBtn.addEventListener('click', e => {
                e.preventDefault();
                f.selected = new Set([v]);
                syncCheckboxes(id);
                applyFilters();
            });

            row.appendChild(label);
            row.appendChild(onlyBtn);
            container.appendChild(row);

            f.checkboxes[v] = cb;
            f.rows[v] = row;
        });
    });

    function syncCheckboxes(id) {
        const f = filters[id];
        f.all.forEach(v => { f.checkboxes[v].checked = f.selected.has(v); });
    }

    function filterOptionRows(id, query) {
        const f = filters[id];
        const q = query.toLowerCase();
        f.all.forEach(v => {
            const match = (!q || v.toLowerCase().includes(q)) && f.rows[v].dataset.empty !== 'true';
            f.rows[v].style.display = match ? '' : 'none';
        });
    }

    function updateFilterCounts() {
        const query = searchInput.value.toLowerCase();
        Object.keys(filters).forEach(id => {
            const f = filters[id];
            const counts = {};
            f.all.forEach(v => { counts[v] = 0; });

            data.forEach(item => {
                const matchOthers = Object.keys(filters)
                    .filter(fid => fid !== id)
                    .every(fid => filters[fid].selected.has(item[filters[fid].key]));
                const matchSearch = !query || searchKeys.some(k => (item[k] || '').toLowerCase().includes(query));
                if (matchOthers && matchSearch) counts[item[f.key]]++;
            });

            f.all.forEach(v => {
                const row = f.rows[v];
                let countEl = row.querySelector('.filter-count');
                if (!countEl) {
                    countEl = document.createElement('span');
                    countEl.className = 'filter-count';
                    row.insertBefore(countEl, row.querySelector('.only-btn'));
                }
                countEl.textContent = counts[v];
                row.dataset.empty = counts[v] === 0 ? 'true' : '';
                row.style.display = counts[v] === 0 ? 'none' : '';
            });

            const visibleTotal = f.all.filter(v => counts[v] > 0).length;
            const visibleSelected = f.all.filter(v => counts[v] > 0 && f.selected.has(v)).length;
            const isFiltered = visibleSelected < visibleTotal;
            const badgeEl = document.querySelector(`#${id} .filter-actions-badge`);
            f.btn.classList.toggle('active', isFiltered);
            if (isFiltered || badgeAlwaysShow) {
                badgeEl.innerHTML = `<span class="filter-badge">${visibleSelected}/${visibleTotal}</span>`;
            } else {
                badgeEl.innerHTML = '';
            }
        });
    }

    function applyFilters() {
        const query = searchInput.value.toLowerCase();
        let visible = 0;
        data.forEach(item => {
            const matchFilters = Object.keys(filters)
                .every(id => filters[id].selected.has(item[filters[id].key]));
            const matchSearch = !query || searchKeys.some(k => (item[k] || '').toLowerCase().includes(query));
            const show = matchFilters && matchSearch;
            item.tr.classList.toggle('hidden', !show);
            if (show) visible++;
        });
        noResults.classList.toggle('show', visible === 0);
        if (onFilter) onFilter(visible, data.length);
        updateFilterCounts();
    }

    searchInput.addEventListener('input', applyFilters);

    // --- Dropdown positioning ---
    function toggleDropdown(id) {
        const dd = document.getElementById(id);
        const isOpen = dd.classList.contains('show');
        closeAll();
        if (!isOpen) {
            const rect = filters[id].btn.parentElement.getBoundingClientRect();
            dd.style.top = `${rect.bottom + 4}px`;
            dd.style.left = `${rect.left}px`;
            dd.classList.add('show');
            const ddRect = dd.getBoundingClientRect();
            if (ddRect.right > window.innerWidth - 8) {
                dd.style.left = `${Math.max(8, window.innerWidth - ddRect.width - 8)}px`;
            }
            if (ddRect.left < 8) dd.style.left = '8px';
            const search = dd.querySelector('.filter-search');
            search.value = '';
            filterOptionRows(id, '');
            search.focus();
        }
    }

    function closeAll() {
        document.querySelectorAll('.filter-dropdown').forEach(d => d.classList.remove('show'));
    }

    const allDropdowns = [];
    Object.keys(filters).forEach(id => {
        const f = filters[id];
        const dd = document.getElementById(id);
        const anchor = f.btn.parentElement;
        allDropdowns.push({ dd, wrap: anchor });

        f.btn.addEventListener('click', e => { e.preventDefault(); toggleDropdown(id); });

        dd.querySelector('.filter-search').addEventListener('input', function() {
            filterOptionRows(id, this.value);
        });

        dd.querySelector('.sel-all').addEventListener('click', e => {
            e.preventDefault();
            f.selected = new Set(f.all);
            syncCheckboxes(id);
            applyFilters();
        });

        dd.querySelector('.clr-all').addEventListener('click', e => {
            e.preventDefault();
            f.selected = new Set();
            syncCheckboxes(id);
            applyFilters();
        });
    });

    document.addEventListener('click', e => {
        allDropdowns.forEach(item => {
            if (!item.wrap.contains(e.target) && !item.dd.contains(e.target)) {
                item.dd.classList.remove('show');
            }
        });
    });

    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });

    // --- Sorting ---
    const currentSort = { col: -1, dir: 'asc' };

    function sortByColumn(colIndex) {
        const allTh = table.querySelectorAll('th.sortable');
        if (currentSort.col === colIndex) {
            currentSort.dir = currentSort.dir === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.col = colIndex;
            currentSort.dir = 'asc';
        }
        allTh.forEach(th => th.classList.remove('asc', 'desc'));
        const activeTh = table.querySelector(`th[data-col="${colIndex}"]`);
        if (activeTh) activeTh.classList.add(currentSort.dir);
        filterDefs.forEach(def => {
            if (def.col === colIndex) {
                document.getElementById(def.btnId).parentElement.parentElement.classList.add(currentSort.dir);
            }
        });

        const key = colKeys[colIndex];
        const dir = currentSort.dir === 'asc' ? 1 : -1;
        data.sort((a, b) => {
            const aVal = (a[key] || '').toLowerCase();
            const bVal = (b[key] || '').toLowerCase();
            if (aVal < bVal) return -1 * dir;
            if (aVal > bVal) return 1 * dir;
            return 0;
        });
        data.forEach(item => tbody.appendChild(item.tr));
    }

    // Wire sort on plain sortable headers
    table.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => sortByColumn(parseInt(th.getAttribute('data-col'))));
    });

    // Filter column headers: also sortable on direct th click
    filterDefs.forEach(def => {
        const th = filters[def.id].btn.closest('th');
        th.classList.add('sortable');
        th.addEventListener('click', e => { if (e.target === th) sortByColumn(def.col); });
    });

    applyFilters();
}

function capitalize(str) {
    return str ? str.charAt(0).toUpperCase() + str.slice(1) : '';
}
