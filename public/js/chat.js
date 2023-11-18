const socket=io();

//elements
const $messageform=document.querySelector('#submit');
const $messageforminput=$messageform.querySelector('input');
const $messageformbutton=$messageform.querySelector('button');
const $sendlocationbutton=document.querySelector('#send-location');
const $messages=document.querySelector('#messages');

//templates
const messagetemplate=document.querySelector('#message-template').innerHTML;
const locationmessagetemplate=document.querySelector('#locationmessage-template').innerHTML;
const sidebartemplate=document.querySelector('#sidebar-template').innerHTML;

//options
const {username, room}=Qs.parse(location.search,{ignoreQueryPrefix:true});

const autoscroll=()=>{

}

socket.on('message',(message)=>{
    console.log(message);
    const html=Mustache.render(messagetemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('locationmessage',(message)=>{
    console.log(message);
    const html=Mustache.render(locationmessagetemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on('roomdata',({room, users})=>{
    // console.log(room);
    // console.log(users);
    const html=Mustache.render(sidebartemplate,{
        users,
        room
    });
    document.querySelector('#sidebar').innerHTML=html;
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault();

    // disabeling button
    $messageformbutton.setAttribute('disabled','disabled');

    const inputvalue=e.target.elements.message.value;
    socket.emit('inputtext',inputvalue,(error)=>{
        $messageformbutton.removeAttribute('disabled');
        $messageforminput.value='';
        $messageforminput.focus();

        if(error) return console.log(error);
        console.log('message delivered !!');
    });
})

$sendlocationbutton.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('geolocation is not supported by your browser !!');
    }

    $sendlocationbutton.setAttribute('disabled','disabled');

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude:position.coords.latitude,
            longitude:position.coords.longitude
        },()=>{
            $sendlocationbutton.removeAttribute('disabled');
            console.log('location send !!');
        })
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error);
        location.href='/';
    }
});

 
 