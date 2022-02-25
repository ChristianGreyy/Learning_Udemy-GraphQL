const User = require('../models/user');
const bcrypt = require('bcryptjs');

module.exports = {
    createUser: async function({ userInput }, req) {    
        const existingUser = await User.findOne({email: userInput.email})
        if(existingUser) {
            const error = new Error('User exists already');
            throw error;
        }
        const hashedPw = await bcrypt.hash(userInput.password, 12);
        const user = new User({
            email: userInput.email,
            name: userInput.name,
            password: hashedPw
        })

        const createUser = await user.save();

        return {...createUser.toJSON(),_id: createUser._id.toString()}
    }
}