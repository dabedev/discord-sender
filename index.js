const Discord = require('discord.js');
const client = new Discord.Client();
const app = require('express')();
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('passport');
var configFile = require('./modules/configuration/configFile.json');
var db = require('./modules/database/db.json');
const fs = require('fs');
var DiscordStrategy = require('passport-discord').Strategy;
var scopes = ['identify'];
if (!db || !db.users) db = {users: []};

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
app.use(cors());
app.listen(2607)

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
 
passport.use(new DiscordStrategy({
    clientID: configFile.clientID,
    clientSecret: configFile.clientSecret,
    callbackURL: configFile.callbackURL,
    scope: scopes
}, function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
        return done(null, profile);
    });
}));
obj = {}
app.get('/', passport.authenticate('discord', { scope: scopes }), function(req, res) {});
app.get('/callback',
    passport.authenticate('discord', { failureRedirect: '/' }), function(req, res) { res.redirect('REDIRECT TO WEB PANEL') 
    
    obj[req.id] = {
        username: req.user.username,
        discriminator: req.user.discriminator,
        id: req.user.id
    }
});

app.post('POST ENDPOINT PATH', function(req, res){
if (!obj[req.id]) return res.json({error: true, msg: "", url: "/"});
if (!req.body.msg) return res.json({error: true, msg: "Complete all the fields.", url: false});
const embed = new Discord.MessageEmbed()
.addField("**Message:**", req.body.msg)
.addField("**Sent by:**", obj[req.id].username + "#" + obj[req.id].discriminator)
client.channels.resolve(configFile.channel).send(embed);
db.users.push(obj[req.id].id);
fs.writeFileSync('./modules/database/db.json', JSON.stringify(db));
res.json({error: false, msg: "Message sent.", url: false})
});
client.login(configFile.token);