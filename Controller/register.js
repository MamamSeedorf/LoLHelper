// Event listener gets user credentials entered by user on page 
document.getElementById('registrationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const riotId = document.getElementById('riotId').value;

    if (username === '' || password === '' || riotId === '' ) {
        window.alert('Please enter username, riotId and password.');
        return;
    }

    // Create an object with the form data
    const postData = {
        username: username,
        password: password,
        riotId: riotId
    };

// Make a POST request to the server
axios.post('http://localhost:3000/register', postData)
    .then(response =>{
        if (response.status === 200) {
            window.alert("Account succesfully created");
            window.location.href = '../Views/login.html';
        }
        if (response.status === 401) {
            window.alert("Username already taken");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.alert("An error occurred during account creation. Please try again later.");
    });
});
