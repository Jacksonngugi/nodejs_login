const localstrategy = require("passport-local").Strategy;
const db = require("./db_config");
const bcrypt = require("bcrypt");

function initialize(passport){
    const authenticateUser = (name,password,done) => {
        db.query("SELECT * FROM users WHERE name = ?" ,[name],async(err,result)=>{
            if(err) throw err;
            if (!result[0]){
                console.log("Found no user");
                return done(null,false,{massage: "No user found"});
            }
            
            try{
                if (await bcrypt.compare(password,result[0].pssword)){
                    return done(null,true,result);
                }else{
                    return done(null,false,{message:"Invalid credential"});
                }
            } catch(e){
                return(e);
            }

            

        });
        
    }

    passport.use(new localstrategy({usernameField:"name"},authenticateUser));
    passport.serializeUser((result, done) => done(null,{id:result.id,name:result.name}));
    passport.deserializeUser((result, done) => {
        return done(null,result);
     });
}

module.exports = initialize