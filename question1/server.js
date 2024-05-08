const http = require('http');
const axios = require('axios');

// Configuration
const WINDOW_SIZE = 10;
const SERVER_PORT = 9876;

// Array to store numbers
let numbers = [];

// Function to fetch numbers from the test server
async function fetchNumbers(numberid) {
    let url = '';
    switch (numberid) {
        case 'p':
            url = 'http://20.244.56.144/test/primes';
            break;
        case 'f':
            url = 'http://20.244.56.144/test/fibo';
            break;
        case 'e':
            url = 'http://20.244.56.144/test/even';
            break;
        case 'r':
            url = 'http://20.244.56.144/test/rand';
            break;
        default:
            return [];
    }
    try {
        const response = await axios.get(url);
        return response.data.numbers;
    } catch (error) {
        console.error('Error fetching numbers:', error.message);
        return [];
    }
}

// Function to calculate average of numbers
function calculateAverage(nums) {
    const sum = nums.reduce((acc, num) => acc + num, 0);
    return sum / nums.length;
}

// Function to handle incoming requests
async function handleRequest(req, res) {
    const { url } = req;
    const [, numberid] = url.split('/');
    
    // Fetch numbers from the test server
    const fetchedNumbers = await fetchNumbers(numberid);

    // Filter out duplicates and limit the array size to the window size
    const uniqueNumbers = [...new Set([...numbers, ...fetchedNumbers])].slice(-WINDOW_SIZE);

    // Calculate average if there are enough numbers
    let avg = null;
    if (uniqueNumbers.length === WINDOW_SIZE) {
        avg = calculateAverage(uniqueNumbers);
    }

    // Respond with the required data
    const responseData = {
        windowPrevState: [...numbers],
        windowCurrState: uniqueNumbers,
        numbers: fetchedNumbers,
        avg: avg ? avg.toFixed(2) : null
    };
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(responseData));

    // Update the numbers array
    numbers = uniqueNumbers;
}

// Create HTTP server
const server = http.createServer(handleRequest);

// Start listening on the specified port
server.listen(SERVER_PORT, () => {
    console.log(`Server running at http://localhost:${SERVER_PORT}/`);
});