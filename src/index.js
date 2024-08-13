import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config();
connectDB()


/*
 import express from "express";
 const app  = express();

 ( async()  => {
         try {
           mongoose.connect(`{process.env.MONGODN_URI}/{DB_NAME}`)  
           app.on("error",(error) => {
             console.log("ERROR" ,error);
             throw error
           })  

    app.listen(process.env.PORT,()=>{
       console.log( `App is listening on port $
        {process.env.PORT}`);
       
    })


   } catch (error) {
      console.error("ERROR",error);
      
    }


 })
  */
 
//  export default connectDB;


