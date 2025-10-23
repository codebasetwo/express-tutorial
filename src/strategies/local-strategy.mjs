import passport from "passport";
import { Strategy } from "passport-local";
import { mockUsers } from "../utils/constant.mjs";
import { User } from "../mongoose/schemas/user.mjs";
import { comparePassword } from "../utils/helpers.mjs";
import { request } from "express";

// calls first
passport.serializeUser((user, done) => {
    done(null, user.id)
});

// calls for subsequent request
// passport.deserializeUser((id, done) => {
// 	try {
// 		const findUser = mockUsers.find((user) => user.id === id);
// 		if (!findUser) throw new Error("User Not Found");
// 		done(null, findUser);
// 	} catch (err) {
// 		done(err, null);
// 	}
// })


// When we first login we call serialize user
// because we are basically taking a user object 
// and storing it in a session store and setting a 
// cookie and storing it in the browser so when the 
// browser has that cookie stored it is then going to 
// send the cookie upon subsequent request.that cookie 
// is then sent to the server and middleware suhc as 
// passport and express session will take care of the rest for us.
passport.deserializeUser(async (id, done) => {
	try {
		const findUser = await User.findById(id);
		if (!findUser) throw new Error("User Not Found");
		done(null, findUser);
	} catch (err) {
		done(err, null);
	}
})


// Mock database.
// export default passport.use(
//     new Strategy((username, password, done) => {
//         console.log(`Username: ${username}`)
//         console.log(`Password: ${password}`)
//         try
//         { const findUser = mockUsers.find((user) => user.username === username)
//             if (!findUser) throw new Error("User not found");
//             if(findUser.password !== password)
//                 throw new Error("Invalid credentials");
//             done(null, findUser);
//         }catch (err) {
//             done(err, null)
//         }
//     })
// )

export default passport.use(
    new Strategy(async (username, password, done) => {
        console.log(`Username: ${username}`)
        console.log(`Password: ${password}`)
        try
        { const findUser = await User.findOne({ username })
            if (!findUser) throw new Error("User not found");
            if (!comparePassword(password, findUser.password)) throw new Error("Invalid credentials");
            done(null, findUser);
        }catch (err) {
            done(err, null)
        }
    })
)