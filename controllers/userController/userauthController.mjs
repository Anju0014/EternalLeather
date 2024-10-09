import User from "../../model/userModel.mjs";
import passport from 'passport';

export const googleauth = (req, res, next) => {
  try {
    passport.authenticate('google', {
      scope: ['email', 'profile']
    })(req, res, next);
  } catch (err) {
    console.log(`Error during Google authentication: ${err}`);

    // res.redirect('user/login');
    next(error)
  }
};

export const googleAuthCallback = (req, res, next) => {
  passport.authenticate('google', { failureRedirect: '/user/login' }, (err, user, info) => {
    if (err) {
      console.log(`Error in callback: ${err}`);
      return next(err); 
    }
    if (!user) {
      return res.redirect('user/login');
    }
    

    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.log(`Login error: ${loginErr}`);
        return next(loginErr);
      }
      req.session.isUser=user.email
      return res.redirect('/user/home'); 
    });
  })(req, res, next);
};

