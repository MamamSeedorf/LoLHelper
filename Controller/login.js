// Event listener gets user credentials entered by user on page 
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Get form data
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === '' || password === '') {
        window.alert('Please enter both username and password.');
        return;
    }

    // Create an object with the form data
    const postData = {
        username: username,
        password: password
    };
    
// Make a POST request to the server
axios.post('http://localhost:3000/login', postData)
    .then(response => {
        if (response.status === 200) {
            window.alert("Succesful login");
            window.location.href = '../Views/frontpage.html';
        }
        if (response.status === 401) {
            window.alert("Invalid username or password");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        window.alert("An error occurred during login. Please try again later.");
    });
});