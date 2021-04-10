const express = require('express')
const Bus = require('../model/Bus.js')
const User = require('../model/user.js')
const auth = require('../middleware/auth.js')
const validation=require("../validation/busvalidation.js")
const busValidation = validation.busValidation


const router = express.Router()

router.post('/bus',auth,async(req,res)=>{
    
    let [result, data] = busValidation(req.body)
    if (!result) return res.status(404).json({data})
    try{ 
        // const user=req.user.id
        const user=await User.findById(req.user.id)
        const isAdmin=user.isAdmin
        console.log(isAdmin)
        if(isAdmin===true){ 
            const bus =new Bus(req.body)
            const newbus =await bus.save()
            if(newbus){
                return res.send(bus.id);
            }else{
                return res.send({"error":"something went wrong"})
            }
        }
        else{
            return res.status(400).json({msg:"enter the valid admin token"})
        }
       
    }
    catch(err) {
        console.log(err)
        res.status(404).send('some server error')
    }
       
}),



module.exports = router