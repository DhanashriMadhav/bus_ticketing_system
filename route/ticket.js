const auth = require('../middleware/auth.js')
const express = require('express')
const Ticket = require('../model/ticket.js')
const Bus= require('../model/Bus.js')
const User= require('../model/user.js')
const {body}=require("express-validator/check");

const router=express.Router();
//Book the ticket
router.put('/book/:busId',auth,[
    body('setaNo').not().isEmpty()
    .withMessage('seatNo is required'),
    
    body('isBooked').not().isEmpty()
    .withMessage('isBooeed is required')
    ],async(req,res)=>{
    try{
            const data=req.body
            const newUser=data
            const busId = req.params.busId
            const businformation= await Ticket.find({busId})
            if(businformation.length===0)
            {
                return res.status(400).json({msg:"Bus not exist"})
            }
            const dataLength=(newUser.data.length)
            const seat=[]
            for(i=0;i<dataLength;i++)
            {
                seat.push(newUser.data[i].seatNo)
            }
            for(i=0;i<seat.length;i++)
            {    
                const seats =await Ticket.find({busId,seatNo:seat[i]})
                if(seats.length===0)
                {
                    return res.status(400).json({msg:"Enter valid seat number"})
                }
            }
            for(i=0;i<seat.length;i++)
            {
                const ticket=await Ticket.find({busId,seatNo:seat[i],isBooked:true})
                if(ticket.length!==0)
                {    
                    return res.status(404).json({msg:"seat is already booked,choose other seat "})
                }
            }
            
            let userData = await User.findById(req.user.id)
            if(userData)
            {
                const ticketList=[]
                for(i=0;i<seat.length;i++)
                {
                    const newData=newUser.data[i]

                    if(newData.name)
                    {
                        const passenger=[]
                        const user={}
                        user.name=newUser.data[i].name;
                        user.gender=newUser.data[i].gender;
                        user.phoneNo=newUser.data[i].phoneNo;
                        user.email=newUser.data[i].email;
                        passenger.push(user)
                        const userInfo={seatNo:newUser.data[i].seatNo,isBooked:newUser.data[i].isBooked,passenger:passenger}
                        await Ticket.updateOne({busId,seatNo:newUser.data[i].seatNo},{$set:userInfo})
                    
                    }
                    else
                    {
                        const userId=userData._id
                        const userInformation={seatNo:newUser.data[i].seatNo,isBooked:newUser.data[i].isBooked,userId}
                        await Ticket.updateOne({busId,seatNo:newUser.data[i].seatNo},{$set:userInformation})
                    }
                    
                    const bookedticket= await Ticket.find({busId,seatNo:newUser.data[i].seatNo}).populate('busId',[]).populate('userId',['name','phoneNo','email'])
                    ticketList.push(bookedticket)
                }
                res.status(200).json({msg:"Ticket Booked",ticketList})
            }
            else
            {
                return res.status(400).send("User not found in user data base,Enter the valid Token")

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
            if(ticket.length===0)
            {
                console.log('Ticket not found')
                return res.status(404).json({msg:'Ticket not found,Enter the valid information'})
            }
            return res.status(200).json({msg:"Deatali of person owning the ticket",ticket})
        }
        else{
            const userid=user._id
            let userdata= await User.findById(userid)
            if(!userdata)
            {
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