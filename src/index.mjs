import express from 'express'
import userRouter from './routes/users.mjs'
import productRouter from './routes/products.mjs'
import cookieParser from 'cookie-parser';
import session from 'express-session'; // represents the duration of a user in a website since http are stateless.
import mongoose from 'mongoose';
import MongoStore from 'connect-mongo';
// import routes from './routes/index.mjs
import { mockUsers } from './utils/constant.mjs';
import passport  from 'passport';
import './strategies/local-strategy.mjs'

mongoose.connect("mongodb://localhost:27017/express-tutorial").then(
    () => console.log("connected to database")
).catch((err) => console.log(`Error ${err}`))

const app = express();
// middleware
app.use(express.json())
app.use(cookieParser('helloworld'))// the string passed here is the secrete key
app.use(session({
    secret: "nnaemeka",
    saveUninitialized: false, // only saves when we modify the session state ourself if true stores a session for each request which can take up memory
    resave:false, // resaves the cookie if true.
    cookie: {
        maxAge: 60000 * 60
    },
    // session store so that if server restarts you do no lose cookies
    store: MongoStore.create({
        client: mongoose.connection.getClient()
    })
}))

// passport helps modify the session data for us
app.use(passport.initialize())
app.use(passport.session()) // helps to work with express session
app.use(userRouter)
app.use(productRouter)

// app.use(routes);

const loggingMiddleware = (req, res, next) => {
    console.log(`${req.method} - ${req.url}`)
    next();
}
// app.use(loggingMiddleware) register globally to all endpoints.
// register midddleware before declaring routes else it 
// applies only to routes that are after the regsitrations. 
// so, order matters
const PORT = process.env.PORT || 3000;

app.get('/', loggingMiddleware, (request, response) => {
    console.log(request.session);
    console.log(request.session.id);
    // we use passport so we do not have to modify the session state ourself.
    // also before we modify the session the session id changes for each request.
    // by creating the dynamic property in this case visited the session id stays same.
    // which is good because now we can track who logs in and who doesn't.
    request.session.visited = true; // now cookie is stored check save uninitialized in session cookie
    response.cookie("hello", "world", {maxAge: 300000, signed: true});
    response.send({message: 'Hello World!'});
});

// passport modifies the session for us thereby, creating the cookie
app.post('/api/auth', passport.authenticate('local'), (request, response) => {
    response.sendStatus(200);
});


app.get("/api/auth/status", (request, response) => {
	return request.user ? response.send(request.user) : response.sendStatus(401);
});

app.post("/api/auth/logout", (request, response) => {
	if (!request.user) return response.sendStatus(401);
	request.logout((err) => {
		if (err) return response.sendStatus(400);
		response.send(200);
	});
});

app.listen( PORT, () => {
    console.log(`Running on Port ${PORT}`)
})

/* Using sessions
app.post('/api/auth', (request, response) => {
    const { body: {username, password} } = request;
    const findUser = mockUsers.find(
        user => user.username === username
    )
    if (!findUser || findUser.password !=password) 
        return response.status(401).send({ msg: "Bad Credentials" });

    request.session.user = findUser;
    return response.status(200).send(findUser)
})

app.get('/api/auth/status', (request, response) => {
    request.sessionStore.get(request.sessionID, (err, session) => {
        console.log(session);
    })
    return request.session.user
    ? response.status(200).send(request.session.user)
    : response.status(401).send({ msg: "Not Authenticated" })
})

app.post('/api/cart', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    const { body: item } = req;
    const { cart } = req.session;
    if (cart){
        cart.push(item);
    }else {
        req.session.cart = [item]
    }
    return res.status(201).send(item);

})

app.get('/api/cart', (req, res) => {
    if (!req.session.user) return res.sendStatus(401);
    return res.send(req.session.cart ?? []);
})

*/

app.listen( PORT, () => {
    console.log(`Running on Port ${PORT}`)
})
