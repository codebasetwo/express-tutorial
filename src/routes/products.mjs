import { Router } from "express";
const router = Router()

router.get('/api/products', (req, res) => {
    if (req.signedCookies.hello && req.signedCookies.hello === "world")
        {
        return res.send([
        {id: 123, name: 'Chicken Breast', price: 34},
        {id: 124, name: 'milk shake', price: 10}
    ])
    }
    return res
		.status(403)
		.send({ msg: "Sorry. You need the correct cookie" });
});

export default router;