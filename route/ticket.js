const auth = require('../middleware/auth.js')
const express = require('express')
const Ticket = require('../model/ticket.js')
const Bus= require('../model/Bus.js')
const User= require('../model/user.js')

const {check,validationResult}=require("express-validator/check");
const user = require('../model/user.js')

const router=express.Router();

//update the ticket with login
router.put('/ticket/:busId',auth,[

    check('seatNo','please enter seatNo').not().isEmpty(),
    check('isBooked','please enter isBooked').not().isEmpty(),
    ],async(req,res)=>{
        const errors =validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors});
        }
    try{
        const {seatNo,isBooked}=req.body
        const busId = req.params.busId
        
        const businformation= await Ticket.find({busId})
        if(businformation.length===0){
            return res.status(400).json({msg:"Bus not exist"})
        }
        const seat=await Ticket.find({busId,seatNo})
        if(seat.length!==0){ 
            const ticket=await Ticket.find({busId,seatNo,isBooked:true})
            if(ticket.length!==0){    
                return res.status(404).json({msg:"seat is already booked,choose other seat "})
            }
            else{
               
                let user = await User.findById(req.user.id)
                const userId=user._id
                const newUser={seatNo,isBooked,userId}
                if(user)
                {
                    await Ticket.updateOne({busId,seatNo},{$set:newUser})
                    const bookedticket= await Ticket.find({busId,seatNo}).populate('busId',[]).populate('userId',['name','phoneNo','email'])
                    return res.status(200).json({msg:"Ticket Booked",bookedticket})
                }
                else{
                    return res.status(400).send("User not found in user data base,Enter the valid Token")
                    
                }
            }
        }
        else{
            return res.status(400).json({msg:"Enter valid seat number"})
        }
    }
    
    catch(err){
        res.status(404).json('server error')
        console.log(err)  
    }
})

// get list of all closed tickets
router.get('/closed/:busId', async(req, res) => {
     try{
        
        const  busId  = req.params.busId
        let bus=await Bus.findById(busId)
        if(!bus){
            return res.status(404).json({msg:"Bus not exist"})   
        }
        else{
        
            let tickets =await Ticket.find({busId,isBooked:true})
            return res.status(200).json({msg:"List of all closed ticket",tickets})
            
        }      
    }
    catch(err){
        console.log(err)
        res.status(404).json('server error')       
    }
}),






// get list of all open tickets
router.get('/open/:busId', async(req, res) => {
    try{
       
       const  busId  = req.params.busId
       const bus = await Bus.findById(busId)
       if(!bus){
           return res.status(404).json({msg:"Bus not exist"})   
       }
       else{
            const tickets =await Ticket.find({busId,isBooked:false})
            return res.status(200).json({msg:"List of all open tickets",tickets})
       }      
    }
    catch(err){
       console.log(err)
       res.status(404).json('server error')       
    }
}),
//view ticket status
router.get('/ticket/:busId/:_id',async(req,res)=>{

    try{
        const busId=req.params.busId
        const _id=req.params._id
    
        const bus= await Bus.findById(busId)
        if(!bus){
            return res.status(404).json('Bus not exist')
        }
        const tickets = await Ticket.find({busId})
        if(tickets.length===0){
            return res.status(404).json({msg:'Enter the valid BusId'})
        }
        const ticket =await Ticket.find({busId,_id})
        console.log(ticket)
        if(ticket.length===0){
            console.log('Ticket not found')
            return res.status(404).json({msg:'Ticket not found,Enter the valid information'})
        }
        const isBooked=ticket[0].isBooked
        console.log(isBooked)
        return res.status(200).json({msg:"ticket status is",isBooked})
    }catch(err){
        console.log("error",err)
        res.status(404).json("err")
    }
})



//View Details of person owning the ticket.
router.get('/detail/:busId/:_id',auth,async(req,res)=>{
    try{
        const busId = req.params.busId
        const  _id  = req.params._id
        const busNo= await Bus.findById(busId)
        if(!busNo){
            return res.status(404).json('bus not exist')
        }
        
        const tickets = await Ticket.find({busId})
        if(tickets.length===0){
            return res.status(404).json({msg:'Enter the valid BusId'})
        }
        const user=await User.findById(req.user.id)
        const isAdmin=user.isAdmin
        if(isAdmin===true)
        {
            const ticket =await Ticket.find({busId,_id}).populate('userId',[])
            if(ticket.length===0){
                console.log('Ticket not found')
                return res.status(404).json({msg:'Ticket not found,Enter the valid information'})
            }
            return res.status(200).json({msg:"Deatali of person owning the ticket",ticket})
        }
        else{
        const userid=user._id
        let userdata= await User.findById(userid)
        if(!userdata){
            return res.status(404).json('usre not exist')
        }
        const ticket =await Ticket.findById(_id)
        const userId=ticket.userId
        if(userId.toString()===userid.toString())
        {
            const ticketDetail= await Ticket.find(busId,_id).populate('userId',[])
            console.log(ticketDetail)
            return res.status(200).json({msg:"Deatali of person owning the ticket",ticketDetail})
        }
        else
        {
            return res.status(404).json("Enter the valid token")
        }
    }
    }   
    catch(err){
        console.log(err)
        res.status(404).send("server error")        
    }
}),


module.exports = router