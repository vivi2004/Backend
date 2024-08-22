import { Router }  from  "express" ;
<<<<<<< HEAD
import {
     loginUser,
    logOutUser,
     registerUser,
     refreshAcessToken

} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )


    router.route("/login").post(loginUser) 

// secure  routes
 router.route("/logout").post(verifyJWT,logOutUser)
 router.route("/refresh-token").post(refreshAcessToken)
=======
import { registerUser} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.model.js";
const router =  Router()

router.route("/register").post( 
    upload.fields([
     {  name: "avatar" , 
        maxcount:1
     },
     {  name: "coverImage" ,
        maxCount: 1
      
      }
    ]),
    registerUser
)
>>>>>>> 6aae463a50485f51bb67ad3ce417dc74067fba97

export default  router 
  