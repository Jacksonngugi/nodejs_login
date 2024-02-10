const path = require("path");
const bcrypt = require("bcrypt");
const express = require("express");
const db = require("./db_config");
const passport = require("passport");
const session = require("express-session");
const flash = require("express-flash");
const app = express();
if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const initializePassport = require("./passport_config");
initializePassport(passport);

app.set('view engine','ejs');
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(flash());

app.use(session({
    secret:process.env.SECRET_KEY,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())


db.connect((err) => {
    if(err) throw err;
    console.log("Connected to Database");
})

app.get("/",(req,res) => {{
    res.render("index.ejs");
}})

app.get("/login",(req,res) =>{
    res.render("login.ejs");
})

app.post("/login",passport.authenticate('local', {
    successRedirect: ("/"),
    failureRedirect: "/login",
    failureFlash: true
}))

// app.post("/login",(req,res) => {
//     const name = req.body.name;
//     const password = req.body.password;

//     if(!name || !password) return req.json({status:"error",error:"Fill the fields first"});
//     else {
//         db.query("SELECT * FROM users WHERE name = ?",[name],async(err,result) =>{
//             if(err) throw err;

//             try{
//                 if(await bcrypt.compare(result[0].pssword,password)){
//                     req.redirect("/");
//                 }
//                 else{
//                     return req.json({status:"err",err:"Invalid credential"});
//                     req.redirect("/login");
//                 }
//             }catch(e){
//                return (e);
//             }
//         })
//     }
// })

app.get("/register", (req,res) => {
    res.render("register.ejs");
})

app.post("/register",async (req,res) =>{
    try{
        const password = req.body.password;
        const password2 = req.body.password2;
        const hashedpasswrd = await bcrypt.hash(password,10);
        const user_name = req.body.name;
        const email = req.body.email;

        if (!email || !password || !user_name || !password2) {
            return res.json({status: "error" ,error : "FILL ALL THE FIELDS!!"});
            req.redirect("/register");
        }

        else{
            db.query("SELECT email FROM users WHERE email = ?",[email],async (err,result) => {
                if (err) throw err;
                if (result[0])  return res.json({status: "error", error:"Email Already Taken"});

                else{
                    if(password == password2) {
                        db.query("INSERT INTO users SET ?" ,{name:user_name,email:email,pssword:hashedpasswrd},(err,result) =>{
                            if(err) throw err;
                            console.log("User created successfully");
                            res.redirect("/login");
                        });
                    }
                    else{
                        return res.json({status:"error",error:"Password and confirm password not the same"});
                    }
                }
            })
        }
    } catch{
        res.redirect("/register");
    }
})

app.listen(3000 ,() => {
    console.log("Listerning on port 3000");
})