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
                        data: 'badge',
                        title: "Status",
                        render: data => `<img src="${data}" alt="status badge">`
                    }
                ],
                ordering: true,
                order: [],
                searching: true,
                autoWidth: false,
                initComplete: function () {
                    let api = this.api();

                    // Add search input fields to table headers
                    $('#certTable thead th').each(function (index) {
                        let title = $(this).text();

                        if (title === "Environment") {
                            // Replace text input with a dropdown for the "Environment" column
                            $(this).html(`
                                <select>
                                    <option value="">All</option>
                                    <option value="prod">prod</option>
                                    <option value="nonprod">nonprod</option>
                                </select>
                            `);

                            $('select', this).on('change', function (e) {
                                e.stopPropagation(); // Prevent sorting when changing dropdown

                                let value = this.value;
                                if (value) {
                                    api.column(index).search(`^${value}$`, true, false).draw(); // Exact match search
                                } else {
                                    api.column(index).search('', false, false).draw(); // Reset search when "All" is selected
                                }
                            });
                        } else {
                            // Add text input for other columns
                            $(this).html(`<input type="text" placeholder="${title}" />`);

                            $('input', this).on('keyup change', function (e) {
                                e.stopPropagation();
                                api.column(index).search(this.value).draw();
                            });
                        }

                        // Prevent sorting when clicking inside search fields
                        $('input, select', this).on('click', function (e) {
                            e.stopPropagation();
                        });
                    });
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
