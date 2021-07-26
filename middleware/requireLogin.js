const jwt = require('jsonwebtoken')
const {JWT_SECRET} = require('../config/keys')
const mongoose = require('mongoose')
const User = mongoose.model("User")
module.exports = (req,res,next)=>{
    const {authorization} = req.headers
    /**The Bearer scheme is used by many APIs for its simplicity.
    The name Bearer implies that the application making the request is the bearer of the following pre-agreed token.
    In summary: you need to put Bearer up front to tell the server that what follows is an API token, and not something else.
    **/
    /** authorization === Bearer ewefwegwrherhe
    Jwt => Header(the type of the token, which is JWT, and the signing algorithm being used, such as HMAC SHA256 or RSA),
    Payload(also contains expiry time etc), Signature(The signature is used to verify the message wasn't changed along the way, and,
    in the case of tokens signed with a private key, it can also verify that the sender of the JWT is who it says it is)
    **/
    if(!authorization){
       return res.status(401).json({error:"you must be logged in"})
    }
    const token = authorization.replace("Bearer ","")
    jwt.verify(token,JWT_SECRET,(err,payload)=>{
        if(err){
         return   res.status(401).json({error:"you must be logged in"})
        }

        const {_id} = payload
        User.findById(_id).then(userdata=>{
            req.user = userdata
            next() // Only executed after User is found
        })
        
        
    })
}
