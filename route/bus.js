const express = require('express')
const Bus = require('../model/Bus.js')
const User = require('../model/user.js')
const auth = require('../middleware/auth.js')
const validation=require("../validation/busvalidation.js")
const busValidation = validation.busValidation

const router = express.Router()

router.post('/bus',auth,async(req,res)=>{
    
    let [result, data] = busValidation(req.body)
    if (!result) return res.status(400).json({data})
    try{ 

        const user=await User.findById(req.user.id)
        let isAdmin=user.isAdmin
        if(isAdmin===true){ 
            const bus =new Bus(req.body)
            const newbus =await bus.save()
            if(newbus)
            {
                const busId=bus.id
                return res.status(200).json({msg:"Bus Id is",busId})
            }else{
                return res.status(401).send({"error":"Bus number has to be unique"})
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