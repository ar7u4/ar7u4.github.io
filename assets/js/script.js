document.addEventListener('DOMContentLoaded', function () {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const table = new DataTable('#certTable', {
                data: data,
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
                            return `<span class="status-${data.toLowerCase()}">${data}</span>`; // Add a CSS class
                        }
                    }

                ],
                ordering: true,
                order: [],
                searching: true,
                autoWidth: false,
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
                                api.column(index).search(value ? `^${value}$` : '', true, false).draw(); // Exact match
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
                                let value = this.value.toUpperCase().trim(); // Normalize input

                                api.column(index).search(value ? `^${value}$` : '', true, false).draw(); // Exact match
                            });
                        }
                        else {
                            $(this).html(`<input type="text" placeholder="${title}" />`);

                            $('input', this).on('keyup change', function (e) {
                                e.stopPropagation();
                                api.column(index).search(this.value).draw();
                            });
                        }

                        $('input, select', this).on('click', function (e) {
                            e.stopPropagation();
                        });
                    });
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
