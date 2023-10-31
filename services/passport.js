import {configDotenv} from 'dotenv';
configDotenv('../.env');
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    console.log('passport callback function fired');
    console.log(profile);
}));
passport.serializeUser((user, done) => {
    console.log('serializing user');
    done(null, user);
}   );

passport.deserializeUser((id, done) => {
    console.log('deserializing user');
    done(null, id);
});

export default passport;