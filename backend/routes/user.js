const express = require("express");
const router = express.Router();


const { User, Account } = require("../db");


const {z} = require("zod");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");



const signupBody = z.object({
    username: z.string().email(),
    firstName: z.string(),
    lastName: z.string(),
    password: z.string()
})

router.post("/signup", async(req,res) => {
    const {success} = signupBody.safeParse(req.body)

    if(!success) {
        return res.status(411).json({
            message: "Incorrect inputs"
        });
    }
    const existingUser = await User.findOne({
        username: req.body.username
    });

    if (existingUser) {
        return res.status(411).json({
            message: "Email already taken"
        });
    }

    const user = await User.create({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.first_name,
        lastName: req.body.last_name
    });

    const userId = user._id;


    await Account.create({
        userId,
        balance: 1 + Math.random() * 10000
    });

    const token = jwt.sign({
        userId
    }, JWT_SECRET);

    res.json({
        message: "User created successfully",
    token: token
    });
});


const signinBody = z.object({
    username: z.string().email(),
    password: z.string()
});

router.post("/signin", async (req, res) => {
    const {success} = signinBody.safeParse(req.body)

    if(!success) {
        return res.status(411).json({
            message: "Incorrect Inputs"
        });
    }

    const user = await User.findOne({
        username: req.body.username,
        password: req.body.password
    });
    
    if (user){
        const token = jwt.sign({
            userId: user._id
        }, JWT_SECRET);

        res.json({
            token: token
        })
        return;
    }

    res.status(411).json({
        message: "Error while logging in"
    });
});


const updateBody = z.object({
    password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional()
});


router.put("/", authMiddleware, async (req, res) => {
    const {success} = updateBody.safeParse(req.body);

    if(!success) {
        res.status(411).json({
            message: "Error while updating information"
        });
    }
    
    await User.updateOne({_id:req.userId}, req.body);

    res.json({
        message: "User information updated successfully"
    });
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: user.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    });
});


router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });
    
    res.json({
        balance: account.balance
    });
});



module.exports = router;