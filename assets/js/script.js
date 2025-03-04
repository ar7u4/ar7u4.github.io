document.addEventListener('DOMContentLoaded', function () {
    let lastUpdated = 'Loading...'; // Initial value
    document.getElementById('lastUpdated').textContent = `Last Updated: ${lastUpdated}`;

    // Fetch last modified time of data.json
    fetch('data/data.json', { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                const lastModified = response.headers.get('Last-Modified');
                if (lastModified) {
                    lastUpdated = new Date(lastModified).toISOString().replace('Z', ' GMT'); // Format to GMT
                } else {
                    lastUpdated = new Date().toISOString().replace('Z', ' GMT'); // Current time in GMT
                    console.warn('Last-Modified header not available, using current time');
                }
            } else {
                lastUpdated = new Date().toISOString().replace('Z', ' GMT'); // Current time in GMT
                console.warn('Failed to fetch last modified time, using current time');
            }
            document.getElementById('lastUpdated').textContent = `Last Updated: ${lastUpdated}`;
            console.log('Last Updated set to:', lastUpdated); // Debug log
        })
        .catch(error => {
            lastUpdated = new Date().toISOString().replace('Z', ' GMT'); // Current time in GMT
            document.getElementById('lastUpdated').textContent = `Last Updated: ${lastUpdated}`;
            console.error('Error fetching last modified time:', error);
        });

    // Fetch and process data for the table
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            // Ensure data is an array (handle the new structure)
            const tableData = Array.isArray(data) ? data : data.data || data;

            const table = new DataTable('#certTable', {
                data: tableData,
                columns: [
                    { data: 'environment', title: 'Environment' },
                    { data: 'ci', title: 'CI' },
                    { data: 'CN', title: 'CN' },
                    { data: 'email', title: 'Email' },
                    { data: 'expiry', title: 'Expiry' },
                    { data: 'remaining_days', title: 'Remaining Days', className: 'dt-center' }, // Keep for display
                    {
                        data: 'status',
                        title: 'Status',
                        render: function (data) {
                            return `<span class="status-${data.toLowerCase()}">${data}</span>`;
                        }
                    }
                ],
                ordering: true,
                order: [],
                searching: true,
                autoWidth: false,
                lengthMenu: [10, 20, 30, 50, 100],
                dom: 'lfrtip',
                initComplete: function () {
                    let api = this.api();

                    $('#certTable thead th').each(function (index) {
                        let title = $(this).text();

                        if (title === 'Environment') {
                            $(this).html(`
                                <select>
                                    <option value="">All</option>
                                    <option value="prod">prod</option>
                                    <option value="nonprod">nonprod</option>
                                </select>
                            `);
                            $('select', this).on('change', function (e) {
                                e.stopPropagation();
                                let value = this.value;
                                api.column(index).search(value ? `^${value}$` : '', true, false).draw();
                            });
                        }
                        else if (title === 'Status') {
                            $(this).html(`
                                <select>
                                    <option value="">All</option>
                                    <option value="OK">OK</option>
                                    <option value="WARN">Warn</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="EXPIRED">Expired</option>
                                    <option value="FATAL">Fatal</option>
                                </select>
                            `);
                            $('select', this).on('change', function (e) {
                                e.stopPropagation();
                                let value = this.value.toUpperCase().trim();
                                api.column(index).search(value ? `^${value}$` : '', true, false).draw();
                            });
                        }
                        else {
                            $(this).html(`<input type="text" placeholder="Search ${title}" />`);
                            $('input', this).on('keyup change', function (e) {
                                e.stopPropagation();
                                api.column(index).search(this.value).draw();
                            });
                        }

                        $('input, select', this).on('click', function (e) {
                            e.stopPropagation();
                        });
                    });

                    // Initialize export button in header
                    $('.export-btn').on('click', function () {
                        let exportData = table.rows({ search: 'applied' }).data().toArray();
                        let logContent = exportData.map(row => {
                            const timestamp = new Date().toISOString().split('T')[0] + ' 00:00:00';
                            const logLevel = row.status === 'CRITICAL' ? 'CRITICAL' : 'INFO';
                            return `${timestamp};LOG_LEVEL=${logLevel};ENV=${row.environment || ''};status=${row.status || ''};CN=${row.CN || ''};expiry=${row.expiry || ''};remaining_days=${row.remaining_days || ''};email='${row.email || ''}';ci=${row.ci || ''}`;
                        }).join('\n');

                        let blob = new Blob([logContent], { type: 'text/plain' });
                        let url = window.URL.createObjectURL(blob);
                        let a = document.createElement('a');
                        a.href = url;
                        a.download = `certificate_export_${new Date().toISOString().split('T')[0]}.log`;
                        a.click();
                        window.URL.revokeObjectURL(url);
                    });
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});