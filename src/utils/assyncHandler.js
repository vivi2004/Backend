
import { request } from "express"


//   this is what we calling the functiion using promises

const assyncHandler = (requestHandler) =>{
    (req,res, next) => {
        Promise.resolve(requestHandler(req,res, next)).
        catch((err) => next(err))
    }
}
 export { assyncHandler}
 
// const assyncHanler = () =>{}
// const assyncHanler= (func)=>()=>{}
// const assyncHanler = (func)=>async()={} 

//  const assyncHandler = (fn) => async(req,res,next )=>{
//   try {
//      await fn( req,res,next) 
//   } catch (error) {
//      res.status(err.code || 500).json({
//         success:false,
//         message:err.message
//      })
//  }    

// }