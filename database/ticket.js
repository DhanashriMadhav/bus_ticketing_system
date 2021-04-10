const express=require("express")
const Ticket = require('../model/ticket.js')
const User = require('../model/user.js')
const Bus= require('../model/Bus.js')
const auth = require('../middleware/auth.js')
const validation=require("../validation/ticketvalidation.js")
const ticketValidation = validation.ticketValidation
const router=express.Router();

router.post('/tickets',auth,async(req,res)=>{

    let [result, data] = ticketValidation(req.body)
    if (!result) return res.status(404).json({data})
  
    try{
        const user=await User.findById(req.user.id)
        const isAdmin=user.isAdmin
        if(isAdmin===true)
        {
        const busId=req.body.busId
        let bus = await Bus.findById(busId)
        if(!bus){
            return res.status(400).json({msg:"bus not exist"})
        }
        let busid= await Ticket.findOne({busId})
        console.log(busid)
        if(busid)
        {
            return res.status(404).json({msg:"Tickets aleardy created for this bus"})
        }
        else{
                const numberOfseats=bus.numberOfseats
                    // console.log(numberOfseats)
                const ticketlist=[]
                    
                for(i=1;i<=numberOfseats;i++)
                {

                    const ticketObj={}
                    ticketObj.seatNo=i;
                    ticketObj.isBookedisBooked=false;
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
        res.status(500).json("sever error")
    }

})

module.exports=router