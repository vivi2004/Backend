import mongoose , {Schema} from 'mongoose' 
import jwt from 'jsonwebtoken'
import  bcrypt from 'bcrypt'

const  userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique:true,
    index: true,
    lowercase:true,
    trim: true,
  },
   email: {
     type: String,
     required: true,
     unique:true,
     lowercase: true,
     trim: true,
   },
   fullname: {
     type:String,
     required: true,
     trim: true,
     index: true

   },
   avatar: {
    type: String,
    required: true,

   },
   coverImage: {
    type: String
   },
   watchHistory: {
    type: Schema.Types.ObjectId,
    ref: "video"
   },

   password: {
    type: Number,
    required:  [true, " Password must be at least a valid number "]
   },
   referenceToken: {
     String: String
   }
  userSchema.pre('save', async function(next){
    if(! this.isModified == ' password') return next ();
    this.password = bcrypt.hash(this.password,10 )
    next();
  });
   userSchema.methods.isPasswordCorrect =  async function ( password) {
     return await  bcrypt.compare(password.this.password)
   }
 userSchema.generateAcessToken = function() {
  return jwt.sign (
    {
  
   _id: this.id;
   email:this.email,
   username:this.username,

 },
   process.env.ACESS_TOKEN_SECRET,
   {
    expireIn: process.env.ACESS_TOKEN_EXPIRY
   }
 
  )
}


userSchema.referenceToken = function() {
  return jwt.sign (
    {
  
   _id: this.id;
   email:this.email,
   username:this.username,

 },
   process.env.REFRESH_TOKEN_SECRENT,
   {
    expireIn: process.env.REFRESH_TOKEN_EXPIRY
   }
 
  )
}

export const User = mongoose.model('User', userSchema)



//   JWT  is a bearer token we can call it ..... means those have this token can access all .the data from it 