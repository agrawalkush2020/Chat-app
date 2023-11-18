const users=[];

//adduser,removeuser,setuser, getusersinroom

const adduser=({ id, username, room})=>{

    //clean the data
    username=username.trim().toLowerCase();
    room=room.trim().toLowerCase();

    //validate the data
    if(!username || !room){
        return {
            error:'username and room are required !!'
        }
    }

    //check for the existing user
    const existinguser=users.find((user)=>{
        return user.room===room && user.username===username;
    })
    if(existinguser) return {
        error:'this username is in use'
    }

    //store user

    const user={id,username,room};
    users.push(user);
    return {user};
}

const removeuser=(id)=>{
    const index=users.findIndex((user)=>{
        return user.id===id
    })

    if(index!==-1) return users.splice(index, 1)[0];
}

const getuser=(id)=>{
    return users.find((user)=>{
        return user.id===id;
    })
}

const getusersinroom=(room)=>{
    room=room.trim().toLowerCase();
    return users.filter((user)=> user.room===room);
}

module.exports={
    adduser,
    removeuser,
    getuser,
    getusersinroom
}

 