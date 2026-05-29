// DOM rendering functions — no business logic or mutable state.

// Builds the thead row from column definitions.
// Filter columns get a button + portalled dropdown; all others get a plain sortable th.
// Returns filterDefs: [{ id, btnId, key, col }] for each filterable column.
export function buildHeader(thead, columns, tableId) {
    const tr = document.createElement('tr');
    const filterDefs = [];

    columns.forEach(col => {
        const th = document.createElement('th');
        th.setAttribute('data-col', col._i);

        if (col.filter) {
            const filterId = `${tableId}_filter_${col.key}`;
            const btnId    = `${tableId}_btn_${col.key}`;
            filterDefs.push({ id: filterId, btnId, key: col.key, col: col._i });

            const wrap = document.createElement('span');
            wrap.className = 'filter-wrap';

            const btn = document.createElement('button');
            btn.className   = 'filter-btn';
            btn.id          = btnId;
            btn.textContent = col.label;
            wrap.appendChild(btn);
            th.appendChild(wrap);

            document.body.appendChild(buildDropdown(filterId));
        } else {
            th.className   = 'sortable';
            th.textContent = col.label;
        }

        tr.appendChild(th);
    });

    thead.appendChild(tr);
    return filterDefs;
}

function buildDropdown(id) {
    const dd = document.createElement('div');
    dd.className = 'filter-dropdown';
    dd.id        = id;

    const fsearch         = document.createElement('input');
    fsearch.className     = 'filter-search';
    fsearch.type          = 'text';
    fsearch.placeholder   = 'Search...';

    const foptions        = document.createElement('div');
    foptions.className    = 'filter-options';

    const factions        = document.createElement('div');
    factions.className    = 'filter-actions';

    const selAll          = document.createElement('button');
    selAll.className      = 'sel-all';
    selAll.textContent    = 'Show All';

    const badge           = document.createElement('span');
    badge.className       = 'filter-actions-badge';

    const clrAll          = document.createElement('button');
    clrAll.className      = 'clr-all';
    clrAll.textContent    = 'Clear All';

    factions.appendChild(selAll);
    factions.appendChild(badge);
    factions.appendChild(clrAll);
    dd.appendChild(fsearch);
    dd.appendChild(foptions);
    dd.appendChild(factions);
    return dd;
}

// Builds tbody rows via DocumentFragment (single reflow).
// Attaches item.tr to each data item for later visibility toggling.
export function buildRows(tbody, data, columns) {
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
}

// Builds the checkbox option rows inside a filter dropdown.
// onCheck(value, checked) and onOnly(value) are controller-provided callbacks.
// Returns { rows, checkboxes } for later updates.
export function buildFilterOptions(filterId, values, onCheck, onOnly) {
    const container = document.querySelector(`#${filterId} .filter-options`);
    const rows = {}, checkboxes = {};

    values.forEach(v => {
        const row = document.createElement('div');
        row.className = 'filter-row';
        row.setAttribute('data-value', v.toLowerCase());

        const label = document.createElement('label');
        const cb    = document.createElement('input');
        cb.type    = 'checkbox';
        cb.checked = true;
        cb.addEventListener('change', function() { onCheck(v, this.checked); });
        label.appendChild(cb);
        label.appendChild(document.createTextNode(v));

        const onlyBtn       = document.createElement('button');
        onlyBtn.className   = 'only-btn';
        onlyBtn.textContent = 'Only';
        onlyBtn.addEventListener('click', e => { e.preventDefault(); onOnly(v); });

        row.appendChild(label);
        row.appendChild(onlyBtn);
        container.appendChild(row);

        rows[v]       = row;
        checkboxes[v] = cb;
    });

    return { rows, checkboxes };
}

// Syncs checkbox checked state to match the current selected Set.
export function syncCheckboxes(checkboxes, selected) {
    Object.entries(checkboxes).forEach(([v, cb]) => { cb.checked = selected.has(v); });
}

// Shows/hides rows based on the visible set returned by model.getVisible.
export function setRowVisibility(data, visibleSet) {
    data.forEach(item => item.tr.classList.toggle('hidden', !visibleSet.has(item)));
}

// Updates count labels, hides zero-count options, and refreshes the badge.
export function updateFilterCounts(filterDef, values, counts, selected, rows, badgeAlwaysShow) {
    values.forEach(v => {
        const row   = rows[v];
        const count = counts[v] || 0;
        let countEl = row.querySelector('.filter-count');
        if (!countEl) {
            countEl           = document.createElement('span');
            countEl.className = 'filter-count';
            row.insertBefore(countEl, row.querySelector('.only-btn'));
        }
        countEl.textContent = count;
        row.dataset.empty   = count === 0 ? 'true' : '';
        row.style.display   = count === 0 ? 'none' : '';
    });

    const visibleTotal    = values.filter(v => (counts[v] || 0) > 0).length;
    const visibleSelected = values.filter(v => (counts[v] || 0) > 0 && selected.has(v)).length;
    const isFiltered      = visibleSelected < visibleTotal;
    const btn             = document.getElementById(filterDef.btnId);
    const badgeEl         = document.querySelector(`#${filterDef.id} .filter-actions-badge`);
    btn.classList.toggle('active', isFiltered);
    if (isFiltered || badgeAlwaysShow) {
        badgeEl.innerHTML = `<span class="filter-badge">${visibleSelected}/${visibleTotal}</span>`;
    } else {
        badgeEl.innerHTML = '';
    }
}

// Shows/hides option rows inside an open dropdown based on the search query.
export function filterOptionRows(rows, values, query) {
    const q = query.toLowerCase();
    values.forEach(v => {
        const row   = rows[v];
        const match = (!q || v.toLowerCase().includes(q)) && row.dataset.empty !== 'true';
        row.style.display = match ? '' : 'none';
    });
}
