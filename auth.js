const jwtSecret = 'your_jwt_secret'; 
// has to be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport');

require('./passport'); 
// Your local passport file


let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.username, // This is the username you’re encoding in the JWT
    expiresIn: '7d', // This specifies that the token will expire in 7 days
    algorithm: 'HS256' // This is the algorithm used to “sign” or encode the values of the JWT
  });
}


/* POST login. */
module.exports = (router) => {
  router.post('/login', (req, res) => {
    console.log('Login request received with body:', req.body);
    passport.authenticate('local', { session: false }, (error, user, info) => {
      if (error || !user) {
        console.log('Authentication failed:', error || info.message);
        return res.status(400).json({
          message: 'Something is not right here.',
          user: user
        });
      }

      console.log('User authenticated successfully:', user.username);

      req.login(user, { session: false }, (error) => {
        if (error) {
          console.error('Error in req.login:', error);
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        console.log('JWT token generated for user:', user.username);
        return res.json({ user, token });
      });
    })(req, res);
  });
}


// app.post('/login', (req, res) => {
//   // ... authentication logic ...
//   if (user) {
//     let token = generateJWTToken(user);
//     return res.json({ user: user, token: token });
//   } else {
//     return res.status(400).json({ message: "Incorrect username or password" });
//   }
// });

