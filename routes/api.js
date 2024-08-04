const express = require('express');
const router = express.Router();
const User = require('../models/usersModel.js');
const Exercise = require('../models/exerciseModel.js');


router.post('/users', async (req, res) => {
    const { username } = req.body;

    //Checking whether username has value
    if (!username){
       return res.json({error : 'Username is not provided'});
    } 

    try {
        //Adding user into the database
        await User.create({username})
        const userCreated =  await User.findOne({username: username});
        res.json({'_id': userCreated._id, 'username' : userCreated.username}) ;   
    } catch (error) {
        res.status(500).json({error: 'error occured when creating the user'});
    }

});


router.post('/users/:_id/exercises', async(req, res) => {
    const userId = req.params._id;
    const { description, duration, date } = req.body;
     
   
    //Converting  duration value from String to number 
    const parsedDuration  = Number(duration);

    //Capturing posted date if not posted enter current date
    const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
   
    
    //Checking if the id has been posted
    if (!userId){
        return res.json({ error : 'Error has occured submitting information'});
     } 
     
    try {
        //Retrieving username by using given Id
        const  user = await User.findOne({_id : userId });
      
 
        //Adding exercise details into the database
        await Exercise.create({ 'id': userId, 'username': user.username, 'date': exerciseDate, 'duration': parsedDuration, 'description': description });
      //  const excerciseData = await Exercise.findOne({'id': userId});
       // const newDate = new Date(excerciseData.date).toDateString();

        console.log(`_id : ${user._id} `)
        console.log(`username : ${user.username} `) 
        console.log(`date : ${exerciseDate} `)
        console.log(`duration : ${parsedDuration} `)
        console.log(`description : ${description} `)
        
        const userObject = {'_id':user._id, 'username': user.username};
        const exerciseObject = {'date': exerciseDate, 'duration': parsedDuration, 'description': description};  
        return res.json({...userObject, ...exerciseObject});
  

    } catch (error) {
        res.json({error : 'Information could not be saved, error occured'})
    }

})

//Getting the list of all users
router.get('/users', async (req, res) => {
    try {
       //Retrieving all users from the database
       const allUsers =  (await User.find());
       const newAllUsers = allUsers.filter((item) => item._v != 0);
       res.send(newAllUsers);
    } catch (error) {
       res.json({ error : 'Users were not found'})
    }

});


//retrieving a full exercise log of any user.
router.get('/users/:_id/logs', async (req, res) => {
    const userId = req.params._id;
    const { from, to, limit } = req.query;
    let exerciseLogs = {};
    let logs;
    const logLimit = parseInt(limit, 10);
    

    //Checking "id" has value
    if (!userId){
        return res.json({error : 'id is not provided'});
     } 

     try {
    
        //Retrieving Username by using given Id
        const user = await User.findById({_id : userId})
        if(!user) {
           return res.status(400).json({ error: 'Username not found' });
        } else {
            exerciseLogs['username'] = user.username;
        }
     
         logs = await Exercise.find({id: userId}).lean()
      

         if (from || to) {
             let fromDate = new Date(0).getTime()
             let toDate = new Date().getTime()
             if (from) fromDate = new Date(from).getTime()
             if (to) toDate = new Date(to).getTime()

             logs = logs.filter(logDate => {
                const updatedLogDate =  new Date(logDate.date).getTime()   
                return updatedLogDate >= fromDate && updatedLogDate <= toDate;        
            }) 
        }

        
      //  logs = logs.map (({ _id, userId, __v, ...rest } )=> rest)
        //Changing date format value in retrieved logs from database  from the mongodb date format to dateString
          logs = logs.map(log => ({
            description: log.description, 
            duration: log.duration, 
            date: new Date(log.date).toDateString()
         }))
           
        //Limiting the number of logs
        if(logLimit) {
          logs = logs.slice(0,logLimit);
        } 
         
        //Putting All together
       
        exerciseLogs['count'] = logs.length;
        exerciseLogs['_id'] = userId;      
        exerciseLogs['log'] = logs; 
        return res.send(exerciseLogs);
        
     } catch (error) {
      console.log(`error ${error}`)
      return res.status(500).json({ error: 'Internal server error' })
     }

})


module.exports = router;