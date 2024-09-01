import jwt from 'jsonwebtoken';
import Users from '../models/user.js'

const auth = async (req, res, next) => {
    try {
        console.log(req.headers, 'headers');

        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).send('Authorization header is missing');
        }

        const [bearer, token] = authHeader.split(' ');
        if (bearer !== 'Bearer' || !token) {
            return res.status(401).json('Invalid Token');
        }

        const verifyToken = jwt.verify(token, 'hehe_a_random_secret_key_lol_so_secure_no_one_can_guess_it');
        const user = await Users.findOne({ _id: verifyToken.id });

        if (!user) {
            return res.status(401).json('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json('Token expired');
        }
        console.error('Error in auth middleware:', error.message);
        return res.status(500).json(`Error: ${error.message}`);
    }
};

export default auth;
