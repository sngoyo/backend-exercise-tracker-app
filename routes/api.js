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
    const id = req.params._id;
    const {description, duration, date } = req.body;

    //Converting  duration value from String to number 
    let parsedDuration  = Number(duration);

    //Capturing posted date if not posted enter current date
    const exerciseDate = date ? new Date(date).toDateString() : new Date().toDateString();
   
    
    //Checking if the id has been posted
    if (!id){
        return res.json({ error : 'Error has occured submitting information'});
     } 
     
    try {
        //Retrieving username by using given Id
        const { _id, username } = await User.findOne({_id : id });
        //Adding exercise details into the database
        await Exercise.create({ id: id, description: description, duration: parsedDuration, date: exerciseDate});
        return res.json({_id: id, username: username, date: exerciseDate, duration: parsedDuration, description: description});
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
    const id = req.params._id;
    const { from, to, limit } = req.query;
    let exerciseLogs = {};
    let logs;

   // const fromDate = new Date(from);
   // const toDate = new Date(to);
    //const logLimit = parseInt(limit, 10);
    

    //Checking "id" has value
    if (!id){
        return res.json({error : 'id is not provided'});
     } 

  
     try {
        //Counting Documents in exercise model by using given Id
        const count = await Exercise.countDocuments({ id : id});
    
        //Retrieving Username by using given Id
        const username = await User.findById({_id : id}).lean()
        if(!username) {
           return res.status(404).json({ error: 'Username not found' });
        }

       if(!from || !to || !limit){
           //Retrieving excercise information by using given Id
           logs = await Exercise.find({id: id}).lean();

        } else {
           //Validate and parse query parameters
           const fromDate = from ? new Date(from).toISOString() : new Date(0);
           const toDate = to ? new Date(to).toISOString() : new Date().toISOString();
           const logLimit = limit ? parseInt(limit, 10) : 0;
           

           if(isNaN(fromDate.getTime()) || isNaN(toDate.getTime()) || isNaN(logLimit)){
              return res.status(400).send('Invalid query parameters');
           } else {
               logs = await Exercise.find({id: id, date: {$gte: fromDate, $lte: toDate}})
                                                 
                if (logLimit > logs.length)  {
                   logs.limit(logLimit)
                       .lean()
                }   
           }
        }
  
        //Extracting only exercise details
        const newLogs = logs.map(({_id, id, __v, ...rest}) => rest);
       
        
        //Changing date format value in retrieved logs from database  from the mongodb date format to dateString
        const updatedNewLogs = newLogs.map((log)  => {
           return {'description': log.description, 'duration': log.duration, 'date': log.date.toDateString()}
        });
       /// console.log(`upadatednewLogs : ${updatedNewLogs.duration}`);
      
        //Putting All together
        exerciseLogs['username'] = username.username;
        exerciseLogs['count'] = count;
        exerciseLogs['_id'] = id;
        exerciseLogs['log'] = updatedNewLogs;
        return res.json(exerciseLogs);

     } catch (error) {
      console.log(`error ${error}`)
      return res.status(500).json({ error: 'Internal server error' })
     }

})


module.exports = router;