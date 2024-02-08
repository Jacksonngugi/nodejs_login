const localstrategy = require("passport-local").Strategy;
const db = require("./db_config");
const bcrypt = require("bcrypt");

function initialize(passport){
    const authenticateUser = (name,password,done) => {
        db.query("SELECT * FROM users WHERE name = ?" ,[name],async(err,result)=>{
            if(err) throw err;
            if (!result[0]){
                // console.log("Found no user");
                return done(null,false,{massage: "No user found"});
            }
            
            try{
                if (await bcrypt.compare(password,result[0].pssword)){
                    // console.log("done bcrypt");
                    return done(null,result);
                }else{
                    // console.log("error")
                    return done(null,false,{message:"Invalid credential"});
                }
            } catch(e){
                return(e);
            }

            

        });
        
    }

    passport.use(new localstrategy({usernameField:"name"},authenticateUser));
    passport.serializeUser((result, done) => { });
    passport.deserializeUser((id, done) => { });
}

module.exports = initialize