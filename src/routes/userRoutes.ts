import express, { Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import { createUser, deleteUser, getAllUsers, getUserById, updateUser } from '../controllers/userController';
import { create } from 'domain';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default.secret';


const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token){
            res.status(401).json({error: "Unauthorized"});
            return;
        }

        jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
            if(err){
                res.status(403).json({error: "Forbidden"})
                return;
            }
        
            next();
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({error: "Internal server error"});
    }

};

router.get('/', authenticateToken, getAllUsers);

router.get('/:id', authenticateToken, getUserById);


router.post('/', authenticateToken, createUser);

router.put('/:id', authenticateToken, updateUser); 

router.delete('/:id', authenticateToken, deleteUser);


export default router
