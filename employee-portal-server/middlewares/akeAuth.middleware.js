// Temporary middleware to simulate authentication
module.exports = (req, res, next) => {
    // Simulate a logged-in user
    req.user = {
      id: 5, // ID of an existing user from your database
      full_name: 'Fake User',
      email: 'fakeuser@example.com',
      role: 'admin'
    };
    
    next();
  };
  