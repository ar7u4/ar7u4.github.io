document.addEventListener('DOMContentLoaded', function () {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            // Extract last_updated from the root of the JSON
            const lastUpdated = data.last_updated || new Date().toLocaleString();
            document.getElementById('lastUpdated').textContent = `Last Updated: ${lastUpdated}`;

            // Ensure data is an array (handle the new structure)
            const tableData = Array.isArray(data) ? data : data.data || data;

            const table = new DataTable('#certTable', {
                data: tableData,
                columns: [
                    { data: 'environment', title: "Environment" },
                    { data: 'ci', title: "CI" },
                    { data: 'CN', title: "CN" },
                    { data: 'email', title: "Email" },
                    { data: 'expiry', title: "Expiry" },
                    { data: 'days', title: "Remaining Days", className: 'dt-center' },
                    {
                        data: 'status',
                        title: "Status",
                        render: function (data, type, row) {
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

                        if (title === "Environment") {
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
                        else if (title === "Remaining Days") {
                            $(this).html(`
                                <select>
                                    <option value="">All</option>
                                    <option value="week">This Week (≤7 days)</option>
                                    <option value="month">This Month (≤30 days)</option>
                                </select>
                            `);

                            $('select', this).on('change', function (e) {
                                e.stopPropagation();
                                let value = this.value;

                                if (value === "week") {
                                    api.column(index).search('^([0-7])$', true, false).draw();
                                } else if (value === "month") {
                                    api.column(index).search('^(?:[0-9]|[12][0-9]|30)$', true, false).draw();
                                } else {
                                    api.column(index).search('', false, false).draw();
                                }
                            });
                        }
                        else if (title === "Status") {
                            $(this).html(`
                                <select>
                                    <option value="">All</option>
                                    <option value="OK">OK</option>
                                    <option value="WARN">Warn</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="EXPIRED">Expired</option>
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
                            return `${timestamp};LOG_LEVEL=${logLevel};ENV=${row.environment || ''};status=${row.status || ''};CN=${row.CN || ''};expiry=${row.expiry || ''};remaining_days=${row.days || ''};email='${row.email || ''}';ci=${row.ci || ''}`;
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