import { initTreeTable } from './amazejs/index.js';

initTreeTable({
    data: ['data/c0.json'],
    tableId: 'worldTable',
    columns: [
        { key: 'name',       label: 'Country'    },
        { key: 'capital',    label: 'Capital'    },
        { key: 'population', label: 'Population' },
        { key: 'currency',   label: 'Currency'   }
    ],
    levels: [
        {
            childrenKey: 'states',
            columns: [
                { key: 'name',      label: 'State'     },
                { key: 'latitude',  label: 'Latitude'  },
                { key: 'longitude', label: 'Longitude' }
            ],
            detail: [
                { key: 'iso2',       label: 'ISO'        },
                { key: 'capital',    label: 'Capital'    },
                { key: 'currency',   label: 'Currency'   },
                { key: 'population', label: 'Population' },
                { key: 'phonecode',  label: 'Phone'      }
            ]
        },
        {
            childrenKey: 'cities',
            columns: [
                { key: 'name',      label: 'City'      },
                { key: 'latitude',  label: 'Latitude'  },
                { key: 'longitude', label: 'Longitude' }
            ]
        }
    ]
});
