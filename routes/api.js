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
    const exerciseDate = date ? new Date(date) : new Date();
    console.log(`req.body: ${req.body}`)
    console.log(`id   : ${id}`)
    
    //Checking if the id has been posted
    if (!id){
        return res.json({ error : 'Error has occured submitting information'});
     } 
     
    try {
        //Retrieving username by using given Id
        const { _id, username } = await User.findOne({_id : id });
        //Adding exercise details into the database
        await Exercise.create({ id: id, description: description, duration: duration, date: exerciseDate});
        res.json({id: id, username: username, date: exerciseDate, duration: duration, description: description});
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
    let exerciseLogs = {};

    //Checking "id" has value
    if (!id){
        return res.json({error : 'id is not provided'});
     } 
    
     try {
        //Counting Documents in exercise model by using given Id
        const count = await Exercise.countDocuments({ id : id});
        console.log(`There are logs : ${count}`);

        //Retrieving Username by using given Id
        const username = await User.findById({_id : id}).lean();
        console.log(`username : ${username}`);

        //Retrieving excercise information by using given Id
        const logs = await Exercise.find({id: id}).lean();
        const newLogs = logs.map(({_id, id, __v, ...rest}) => rest);
        console.log(`newLogs : ${newLogs}`);

      
        //Putting All together
        exerciseLogs['username'] = username.username;
        exerciseLogs['count'] = count;
        exerciseLogs['_id'] = id;
        exerciseLogs['log'] = newLogs;
        res.json(exerciseLogs);

     } catch (error) {
      console.log(`error ${error}`)
     }

})


module.exports = router;