

const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    return jwt.sign({id : user._id , role : user.role} , process.env.TOKEN , {expiresIn : '1d'});
}


exports.register = async ( req , res )=> {

const { name , email , role , password } = req.body;

try{

const existingUser = await User.findOne({email})

if(existingUser){

    return res.status(409).json({ message : 'User alredy exist'})

}

const newUser = await new User({ name , email , role , password })
    
await newUser.save();

return res.status(201).json({ message : 'User registred successfully' , user : newUser})

}catch(err){

    res.status(500).json({ message : 'Failed to register' , error : err.message});
    
}

}


exports.login = async ( req , res )=> {

const { password , email} = req.body;

try{

    if( !email || !password){
        return res.status(401).json({ message : 'All fields are required'})
    }

    const user = await User.findOne({email});

    if( user && await user.matchPassword(password)){

        return res.status(200).json( { _id : user._id , name : user.name , email : user.email , role : user.role , token : generateToken(user) , message : 'Login successfully' });

    } else {

        return res.status(401).json({ message : 'Invalid email or password'});

    }

} catch(err){

    res.status(500).json({ message : 'Login failed' , error : err.message})
    
}

} 

