import { mockUsers } from "./constant.mjs";

export const resolveIndexUserById = (request, response, next) => {
    const { params: { id } } = request;
    const parsedId = parseInt(id);
    if (isNaN(parsedId)){
        return response.status(400).send('Bad Request: Invalid ID');
    }
    const findUserIndex = mockUsers.findIndex((user) => user.id === parsedId);
    if (findUserIndex === -1) response.sendStatus(404);
    request.findUserIndex = findUserIndex;
    next();
}