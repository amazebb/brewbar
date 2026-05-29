import { fetchData, initTreeTable } from './amazejs/index.js';

const data = await fetchData('data/c0.json');

initTreeTable(data, {
    tableId: 'worldTable',
    columns: [
        { key: 'name',      label: 'Name'      },
        { key: 'latitude',  label: 'Latitude'  },
        { key: 'longitude', label: 'Longitude' }
    ],
    levels: [
        {
            childrenKey: 'states',
            detail: [
                { key: 'iso2',       label: 'ISO'        },
                { key: 'capital',    label: 'Capital'    },
                { key: 'currency',   label: 'Currency'   },
                { key: 'population', label: 'Population' },
                { key: 'phonecode',  label: 'Phone'      }
            ]
        },
        {
            childrenKey: 'cities'
        }
    ]
});
