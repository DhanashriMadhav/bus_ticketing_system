const express = require('express')
const Bus = require('../model/Bus.js')
const User = require('../model/user.js')
const Ticket = require('../model/ticket.js')
const auth = require('../middleware/auth.js')
const validation=require("../validation/busvalidation.js")
const busValidation = validation.busValidation
const validations=require("../validation/ticketvalidation.js")
const ticketValidation = validations.ticketValidation

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
            }
          
        }
        else{
            return res.status(400).json({msg:"enter the valid admin token"})
        }
       
    }
    catch(err) {
        console.log(err)
        return res.status(401).send({"error":"Bus number has to be unique"})

    }
       
}),

//create ticket
router.post('/tickets',auth,async(req,res)=>{

    let [result, data] = ticketValidation(req.body)
    if (!result) return res.status(400).json({data})
  
    try{
        const user=await User.findById(req.user.id)
        const isAdmin=user.isAdmin
        if(isAdmin===true)
        {
        const busId=req.body.busId
        let bus = await Bus.findById(busId)
        if(!bus){
            return res.status(404).json({msg:"bus not found"})
        }
        let busid= await Ticket.findOne({busId})
        if(busid)
        {
            return res.status(404).json({msg:"Tickets aleardy created for this bus"})
        }
        else{
                const numberOfseats=bus.numberOfseats
                const ticketlist=[]   
                for(i=1;i<=numberOfseats;i++)
                {
                    const ticketObj={}
                    ticketObj.seatNo=i;
                    ticketObj.isBooked=false;
                    ticketObj.costOfticket=req.body.costOfticket;
                    ticketObj.busId=req.body.busId;
                    ticketlist.push(ticketObj)
                }
                await Ticket.insertMany(ticketlist)
                return res.status(200).json({msg:"Ticket created succesfully"}) 
            }            
        }
        else{
            return res.status(400).json({msg:"Enter the valid token"})
        }            
    }catch(err){
        console.log(err)
        res.status(400).json("sever error")
    }

})

//reset the ticket using ticketId
router.put('/reset/:busId/:_id',auth,async(req,res)=>{
    try
    {
        const user=await User.findById(req.user.id)
        const isAdmin=user.isAdmin
        if(isAdmin===true)
        {
            const _id=req.params._id
            // console.log(_id)
            const busId=req.params.busId
            let busid= await Ticket.find({busId})
            if(busid.length===0)
            {
                return res.status(404).json({msg:"Tickets not found for this bus"})
            }
            const ticket =await Ticket.find({busId,_id})
            const isBooked=ticket[0].isBooked
            const userId=ticket[0].userId
            if(isBooked===true && userId)
            {
                await Ticket.updateOne({busId,_id},{$unset:{userId:""}})
                await Ticket.updateOne({busId,_id},{$set:{isBooked:false}})
                return res.status(200).json({msg:"ticket is open "})
            }
            else
            {
                return res.status(200).json({msg:"Ticket is aleardy open,No need to do reset"})
            }
 
        }
        else
        {
            return res.status(400).json({msg:"Enter the valid token"})
        }



    }
    catch(err)
    {
        console.log(err)
        res.status(404).json("sever error")
    }


})

module.exports = router