const mongoose = require('mongoose');
main().catch(err=> console.log("Error connecting to MongoDB"));
async function main() {
	await mongoose.connect("mongodb+srv://ukraiukr_db_user:M47KFkRJ8xkfbavV@cluster0.blsirrt.mongodb.net");
	console.log("Connected to MongoDB");
}

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 3,
        maxLength: 30
    },

    last_name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 30
    },

    username: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        minLength: 5,
        maxLength: 30
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },

    
});


const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    balance: {
        type: Number,
        required: true
    }
});

const Account = mongoose.model('Account', accountSchema);
const User = mongoose.model("User",userSchema);

module.exports= {
    User,
    Account
}