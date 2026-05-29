// Generic filterable/sortable table module.
// Call initTable(data, config) after fetching data and updating any app-specific UI.
//
// config shape:
// {
//   tableId:       string,
//   searchInputId: string,
//   noResultsId:   string,
//   searchKeys:    string[],          // data keys to match against search query
//   badgeAlwaysShow: boolean,         // show selected/total badge even when all selected
//   columns: [{ key, col, sortable?, render? }],
//   filters: [{ id, key, col, btnId }],
//   onFilter: (visibleCount, total) => void   // optional, for app-specific stat updates
// }

export function initTable(data, config) {
    const {
        tableId,
        searchInputId,
        noResultsId,
        searchKeys,
        columns,
        filters: filterDefs,
        badgeAlwaysShow = false,
        onFilter
    } = config;

    const table = document.getElementById(tableId);
    const tbody = table.querySelector('tbody');
    const searchInput = document.getElementById(searchInputId);
    const noResults = document.getElementById(noResultsId);

    // col index → data key lookup for sorting
    const colKeys = {};
    columns.forEach(col => { colKeys[col.col] = col.key; });

    // Build rows — single reflow via DocumentFragment
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

    // Build filter state
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

    // Populate filter dropdowns
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

    // Dropdown positioning — portalled to <body> so table-wrap overflow never clips it
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
        document.body.appendChild(dd);

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

    // Sorting
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

    table.querySelectorAll('th.sortable').forEach(th => {
        th.addEventListener('click', () => sortByColumn(parseInt(th.getAttribute('data-col'))));
    });

    filterDefs.forEach(def => {
        const th = filters[def.id].btn.closest('th');
        th.classList.add('sortable');
        th.setAttribute('data-col', def.col);
        th.addEventListener('click', e => { if (e.target === th) sortByColumn(def.col); });
    });

    applyFilters();
}
