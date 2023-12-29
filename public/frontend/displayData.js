window.onload = function() {
    fetchData(); 
    document.getElementById('send-email-btn').addEventListener('click', sendEmail);
    document.getElementById('delete-data-btn').addEventListener('click', deleteSelectedData);
};

function fetchData() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/all-data', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var data = JSON.parse(xhr.responseText);
                displayData(data);
            } else {
                console.error('Error fetching data:', xhr.status);
            }
        }
    };
    xhr.send();
}

function displayData(data) {
    var dataContainer = document.getElementById('data-container');

    if (data.length === 0) {
        dataContainer.innerHTML = '<p>No data available</p>';
        return;
    }

    var table = '<table border="1"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Action</th></tr></thead><tbody>';

    data.forEach(function(obj, index) {
        table += '<tr><td>' + obj.Name + '</td><td>' + obj.Email + '</td><td>' + obj.Phone + '</td><td>' + obj.Address + '</td>' +
            '<td><input type="checkbox" id="checkbox-' + index + '" class="data-checkbox" value="' + obj._id + '"></td></tr>';
    });

    table += '</tbody></table>';
    dataContainer.innerHTML = table;
}

function sendEmail() {
   // var email = document.getElementById('email').value;
    var checkedCheckboxes = document.querySelectorAll('.data-checkbox:checked');

    // if (!email) {
    //     alert('Please enter an email address.');
    //     return;
    // }

    if (checkedCheckboxes.length === 0) {
        alert('Please select at least one data item.');
        return;
    }

    var dataToSend = [];
    checkedCheckboxes.forEach(function(checkbox) {
        dataToSend.push(checkbox.value);
    });

   // console.log('Send email to:', email);
    console.log('Selected data IDs to send mail:', dataToSend);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/mail-data', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert('Selected mail sent successfully.');
                location.reload(); 
            } else {
                alert('Error Sending mail:', xhr.status);
            }
        }
    };
    xhr.send(JSON.stringify({ ids: dataToSend }));
}

function deleteSelectedData() {
    var checkedCheckboxes = document.querySelectorAll('.data-checkbox:checked');

    if (checkedCheckboxes.length === 0) {
        alert('Please select at least one data item to delete.');
        return;
    }

    var dataToDelete = [];
    checkedCheckboxes.forEach(function(checkbox) {
        dataToDelete.push(checkbox.value);
    });

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/delete-data', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                alert('Selected data deleted successfully.');
                location.reload(); 
            } else {
                alert('Error deleting data:', xhr.status);
            }
        }
    };
    xhr.send(JSON.stringify({ ids: dataToDelete }));
}
