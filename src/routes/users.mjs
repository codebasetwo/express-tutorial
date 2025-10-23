import { Router } from "express";
import { query, validationResult, checkSchema, matchedData } from "express-validator";
import { mockUsers } from "../utils/constant.mjs";
import { createUserValidationSchema } from "../utils/validationSchema.mjs";
import { resolveIndexUserById } from "../utils/middleware.mjs";
import { User } from "../mongoose/schemas/user.mjs"
import { hashPassword } from "../utils/helpers.mjs";

const router = Router();

router.get('/api/users/', 
    query('filter')
     .isString()
     .notEmpty()
     .withMessage('Must not be empty')
     .isLength({ min: 3, max: 10 })
     .withMessage('Must be between 3 and 10'), 
    (req, res) => {
    console.log(req.session)
    console.log(req.session.id)
    req.sessionStore.get(req.session.id, (err, sessionData) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log(sessionData)
    })
    const result = validationResult(req)
    console.log(result)
    if (!result){    
        const { query: {filter, value} } = req;
        if (filter && value) {
            return res.send( 
                mockUsers.filter((user) => user[filter].includes(value)))
        }
        return res.send(mockUsers);
    }
    return res.sendStatus(403);
});

router.post('/api/users', 
    checkSchema(createUserValidationSchema), 
    (req, res) =>{
    const result = validationResult(req)
    if (!result.isEmpty()) return res.status(400).send({ errors: result.array() });
    const data = matchedData(req) // recommended although you can de-ref the req to get the body also.
    const newUser = { id: mockUsers[mockUsers.length - 1].id + 1, ...data };
    mockUsers.push(newUser);
    return res.status(201).send(newUser);
});

router.post('/api/users/db', 
    checkSchema(createUserValidationSchema), 
    async (req, res) =>{
    const result = validationResult(req)
    if (!result.isEmpty()) return res.status(400).send({ errors: result.array() });
    const data = matchedData(req) // recommended although you can de-ref the req to get the body also.
    data.password = hashPassword(data.password)
    const newUser = new User(data);
    try{
        const savedUser = await newUser.save();
        return res.status(201).send(savedUser);
    }catch (err){
        console.log(err);
        return res.sendStatus(400)
    }

    
});

router.get('/api/users/:id', (req, res) => {
    console.log(req.params)
    const parsedId = parseInt(req.params.id);
    if (isNaN(parsedId)) return res.status(400).send('Bad Request: Invalid ID');
    const findUser = mockUsers.find((user) => user.id === parsedId);
    if (!findUser) return res.sendStatus(404);
    return res.send(findUser);
})

// add middleware to do some repeated logic
router.put('/api/users/:id', resolveIndexUserById, (req, res) => {
    const { body, findUserIndex } = req;
    mockUsers[findUserIndex] = { id: mockUsers[findUserIndex].id, ...body };
    return res.sendStatus(200);

})

router.patch('/api/users/:id', (req, res) => {
    const { body, params: { id } } = req;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)){
        return res.status(400).send('Bad Request: Invalid ID');
    }
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
    if (findUserIndex === -1) res.sendStatus(404);
    mockUsers[findUserIndex] = { ...mockUsers[findUserIndex], ...body };
    return res.sendStatus(200);

})

router.delete('/api/users/:id', resolveIndexUserById, (req, res) => {
    const {findUserIndex } = req;
    mockUsers.splice(findUserIndex, 1)
    return res.sendStatus(200);
})


export default router