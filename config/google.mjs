import User from '../model/userModel.mjs'
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv'
dotenv.config()

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:process.env.GOOGLE_CALLBACK_URL,

    },
    async (accessToken, refreshToken, profile, done) => {
        

        try {
           const email = profile.emails[0].value;
           let user = await User.findOne({ email })
           if (!user) {
               user = new User({
               name: profile.displayName,
               email : profile.emails[0].value,
               googleID: profile.id
           })
               await user.save()
           }
               done(null, user)
           } catch (err) {
               console.log(`error during google authentication: ${err}`)
               done(err, null)
           }
       }
   )
)
        
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id)
        done(null, user)
    } catch (err) {
        done(err, null)
    }
});

export default passport;