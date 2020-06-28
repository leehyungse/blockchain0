var express = require('express')
var path  = require('path')
var app = express();
var bodyParser = require('body-parser')
var passport = require("passport");
require('ejs')
var mongoose = require(`mongoose`)
mongoose.Promise = global.Promise
var User = require('./models/user')
var Ex = require('./models/ex')
var dotenv = require('dotenv')
var apiRouter = require('./routes/routes')
const flash = require("express-flash-messages");
var cookieParser = require("cookie-parser");
var session = require("express-session");

dotenv.config()
var password = process.env.PASSWORD
// const var = mongodb+srv://root:1234@cluster0-tecvg.mongodb.net/my_db_1?retryWrites=true&w=majority
const MONGO_URL = `mongodb+srv://root:${password}@cluster0-lg46t.mongodb.net/mydb?retryWrites=true&w=majority`
// app.use((req, res, next) => {
//     if (mongoose.connection.readyState) next();
//     else {
//       const mongoUrl = MONGO_URL
//       mongoose
//         .connect(mongoUrl, {useUnifiedTopology: true ,useNewUrlParser: true })
//         .then(() => next())
//         .catch(err => console.error(`Mongoose Error: ${err.stack}`));
//     }
//   });

mongoose.connect(MONGO_URL,{ useNewUrlParser: true,useUnifiedTopology: true  })
app.set('views',path.resolve(__dirname+'/views') )
app.set('view engine' ,'ejs')

// console.log(path.resolve(`${__dirname}/views`) )
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({
  secret:"TKRvOIJs=HyqrvagQ#&!f!%V]Ww/4KiVs$s,<<MX",//임의의 문자
  resave:true,
  saveUninitialized:true
}));

//정적파일 등록
// app.use(express.static(__dirname+'/public'))
/*secret : 각 세션이 클라이언트에서 암호화되도록함. 쿠키해킹방지
resave : 미들웨어 옵션, true하면 세션이 수정되지 않은 경우에도 세션 업데이트
saveUninitialized : 미들웨어 옵션, 초기화되지 않은 세션 재설정*/
app.use(express.static(__dirname+'/public'))
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(function(user, done) {
    done(null, user._id);
  });
  
  passport.deserializeUser(function(userId, done) {
    User.findById(userId, (err, user) => done(err, user));
  });
  
  // Passport Local
  const LocalStrategy = require("passport-local").Strategy;
  const local = new LocalStrategy((username, password, done) => {
    User.findOne({ username })
      .then(user => {
        if (!user || !user.validPassword(password)) {
          done(null, false, { message: "Invalid username/password" });
        } else {
          done(null, user);
        }
      })
      .catch(e => done(e));
  });
  passport.use("local", local);

app.use('/', apiRouter(passport))

var port = process.env.PORT || 3000
//listen(port , url , backlog , callback)
app.listen(port, function(){
    
    console.log(`Server is runing at http://localhost:${port}`)
})
