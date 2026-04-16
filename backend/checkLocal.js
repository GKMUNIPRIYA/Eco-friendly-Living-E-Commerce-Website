async function testLocal() {
    try {
        const response = await fetch('http://localhost:3000/api/auth/wishlist', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5YTk1OTZkOTJiMTc0NjU1YjA4MzQ4MiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc3NDQxOTY5NSwiZXhwIjoxNzc0NDIzMjk1fQ.ZcseO-xtY9ShItZJCPbI0eJOCQ1-1IYXWzXfPassPYs',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ productId: 'p1' })
        });
        console.log('STATUS:', response.status);
    } catch (err) {
        console.error('ERROR REACHING LOCALHOST:', err.message);
    }
}
testLocal();
