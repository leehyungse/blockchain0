//모듈 포함
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
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

//하이퍼레저 conection.json 가져오기
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

//서버설정
/*
const PORT = 8080;
const HOST = '0.0.0.0';
*/
// must .env file create
dotenv.config()
var password = process.env.PASSWORD
//mongo db
const MONGO_URL = `mongodb+srv://root:${password}@cluster0-lg46t.mongodb.net/mydb?retryWrites=true&w=majority`
mongoose.connect(MONGO_URL,{ useNewUrlParser: true,useUnifiedTopology: true  })
//app use라우팅
app.set('view engine' ,'ejs')
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
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


//페이지라우팅
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})
app.get('/createHDat', (req, res)=>{
    res.sendFile(__dirname + '/createHDat.html');
})
app.get('/queryAllHDat', (req, res)=>{
    res.sendFile(__dirname + '/queryAllHDat.html');
})

//REST라우팅
/*
app.post('/www', async(req, res)=>{
    const name = req.body.name;
    const content = req.body.content;

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('hdat');
    await contract.submitTransaction('createHDat', name, content);
    console.log('Transaction has been submitted');
    await gateway.disconnect();

    res.status(200).send('Transaction has been submitted');
})
app.get('/www', async(req, res)=>{
    const name = req.query.name;
        
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('hdat');
    const result = await contract.evaluateTransaction('queryAllHDat',name);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    var obj = JSON.parse(result);
    res.status(200).json(obj);
})
*/
app.use('/', apiRouter(passport))
//서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);