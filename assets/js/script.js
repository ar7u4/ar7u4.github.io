document.addEventListener('DOMContentLoaded', function () {
    fetch('data/data.json')
        .then(response => response.json())
        .then(data => {
            const table = new DataTable('#certTable', {
                data: data,
                columns: [
                    { data: 'environment', title: "Environment" },
                    { data: 'ci' },
                    { data: 'CN' },
                    { data: 'email' },
                    { data: 'expiry' },
                    { data: 'days', className: 'dt-center' },
                    {
                        data: 'badge',
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
                        $(this).html(`<input type="text" placeholder="${title}" />`);

                        $('input', this).on('keyup change', function () {
                            api.column(index).search(this.value).draw();
                        });

                        // Prevent sorting when clicking inside input fields
                        $('input', this).on('click', function (e) {
                            e.stopPropagation();
                        });
                    });
                }
            });
        })
        .catch(error => console.error('Error loading data:', error));
});
