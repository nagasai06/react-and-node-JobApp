const protect = (req,res, next)=>{
    if(req.oidc.isAuthenticated()){
        return next();
    }else{
        return res.status(401).json({message: "not authorized"})
    }
};

export default protect;