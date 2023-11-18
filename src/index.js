const express=require('express');
const path=require('path');
const http=require('http');
const socketio=require('socket.io');
const Filter=require('bad-words');
const { generatemessage, generatelocationmessage } = require('./utils/messages')
const { adduser,removeuser,getuser,getusersinroom }=require('./utils/users');

const app=express();
const server=http.createServer(app);
const io=socketio(server);             //mtlb ki iss server pr socket io jogdo

const public_directory_path=path.join(__dirname,'../public');
app.use(express.static(public_directory_path));

io.on('connection', (socket)=>{ 
    console.log('new websocket connections !!');      //when user connect ho isse toh yh chle

    
    socket.on('join',({username,room},callback)=>{
        const {user,error}=adduser({id:socket.id,username,room});
        if(error) return callback(error);

        socket.join(user.room);
        socket.emit('message',generatemessage('Admin','Welcome !!'));
        socket.broadcast.to(room).emit('message',generatemessage('Admin',`${user.username} has joined !!`));

        io.to(user.room).emit('roomdata',{   // side baar ko update krne ke liye
            room:user.room,
            users:getusersinroom(user.room)
        })
        callback();
    })

    socket.on('inputtext',(inputvalue,callback)=>{
        const filter=new Filter();
        if(filter.isProfane(inputvalue)){
            return callback('profanity is not allowed !!');
        }

        const user=getuser(socket.id);
        io.to(user.room).emit('message',generatemessage(user.username,inputvalue));
        callback('delivered !!');
    })

    socket.on('sendlocation',(location,callback)=>{
        const user=getuser(socket.id);
        io.to(user.room).emit('locationmessage',generatelocationmessage(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })

    socket.on('disconnect',()=>{
        const user = removeuser(socket.id);

        if(user){
            io.to(user.room).emit('message',generatemessage('Admin',`${user.username} has left !!`));
            io.to(user.room).emit('roomdata',{   // side baar ko update krne ke liye
                room:user.room,
                users:getusersinroom(user.room)
            })
        }
    })
})

const port=process.env.PORT || 3000;
server.listen(port,()=>{
    console.log(`server is on port ${port}`);
})