const express = require("express");
const app = express();
const jwt = require("jsonwebtoken")
app.use(express.json())

const users = [
    {
        id: "1",
        username: "John",
        password: "John0908",
        isAdmin: true
    },
    {
        id: "2",
        username: "Jane",
        password: "Jane0908",
        isAdmin: false
    }
]

let refreshTokens = []

const generateAccessToken = (user) =>{
    jwt.sign({id: user.id, isAdmin: user.isAdmin}, "mySecretKey", {expiresIn: "15m"})
}

const generateRefreshToken = (user) =>{
    jwt.sign({id: user.id, isAdmin: user.isAdmin}, "myRefreshSecretKey", {expiresIn: "15m"})
}


app.post("/api/refresh", (req,res)=>{
    //take the resfresh token from user
    const refreshToken = req.body.token

    //send error if there is not token or it is invalid
    if(!refreshToken) return res.status(401).json("You are not authonticated")
    if(!refreshTokens.includes(refreshToken)) return res.status(403).json("Token is expired")
    //if everything is ok, create a new access token, refresh token and send to user

    jwt.verify(refreshTokena, "myRefreshSecretKey", (err, user)=>{
        err & console.log(err);
        refreshTokens = refreshTokens.filter(token => token !== refreshToken)

        const newAccessToken = generateAccessToken(user)
        const newRefreshToken = generateRefreshToken(user)

        refreshTokens.push(newRefreshToken)

        res.status(200).json({
            accesToken: newAccessToken, refreshToken: newRefreshToken
        })
    })
})

app.post("/api/login", (req,res) => {
    const { username, password } = req.body; 
    //res.json("hey it works!")
    const user = users.find(user => user.username === username && user.password === password)

    if (user) {
        //Generate access token
        const accesToken = jwt.sign({id: user.id, isAdmin: user.isAdmin}, "mySecretKey", {expiresIn: "15m"})
        
        const refreshToken = jwt.sign({id: user.id, isAdmin: user.isAdmin}, "myRefreshSecretKey", {expiresIn: "15m"})

        refreshTokens.push(refreshToken)

        res.json({
            username:user.username, 
            isAdmin: user.isAdmin,
            accesToken
        })
    } else {
        res.status(400).json("Username or password are incorrect")
    }
})




const verify = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if(authHeader) {
        const token = authHeader.split(" ")[1]

        jwt.verify(token, "mySecretKey", (err, user) => {
            if(err){
                res.status(403).json("Token is not valid")
            } 

            req.user = user 
            next()
        }) 

    } else {
        res.status(401).json("Some error, not auth")
    }
} 


app.delete('/api/users/:userId', verify, (req,res)=>{
    if(req.user.id === req.params.userId || req.user.isAdmin) {
        res.status(200).json("User has been deleted")
    } else {
        res.status(403).json("You are not allowed to delete this user")
    }
})


app.post("/api/logout", verify, (req,res)=>{
    const refreshToken = req.body.token;
    refreshTokens = refreshTokens.filter(token => token !== refreshToken)
    res.status(200).json("You logged out successfully")

})

app.listen(4000, ()=> console.log("Backend is running on PORT 4000"));


