var appRef = new Firebase('https://roll-werewolf.firebaseio.com/v1/');

appRef.onAuth(function(authData){
  if (authData=== null){
    person = null;
    setUserInfo(person);
    displayView('login');
    $('.u-auth').hide();
  } else{
    person = new Person(authData);
    setUserInfo(person);
    displayView('messageBox'); 
    $('.u-auth').show()
  }
});

function changeRoom(room){
  if (room === ''){
    room = 'General'
  }
  var cleanedRoomString = room.split('/').join('');
  var roomPath = 'custom-room/' + cleanedRoomString;
  console.log('roomPath is ' + roomPath);
  appRef.child(roomPath)
    .off('child_added');
  appRef.child(roomPath)
    .on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayChatMessage(message.name, message.text, message.profileUrl);
});
  $("#room").text(cleanedRoomString);
  return roomPath;  
}

function displayChatMessage(name, text, profileUrl) {
  var chip = $("<div/>").attr('class', 'chip')
      .append($('<img/>').attr('src', profileUrl ? profileUrl : ''))
      .append($('<em/>').text(name+': '));

  $('<div/>').text(text)
      .prepend(chip)
        .appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};

function displayView(id){
  var views = ['login', 'messageBox'];
  for (i in views){
    $('#'+views[i]).hide();
  }
  $('#'+id).fadeIn(1000);
}
function firebaseLoginEventBind(id, provider){
  $('#'+id).on('click', function(e){
  appRef.authWithOAuthPopup(provider, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
  }
  });
});
}


function Person(authData){
  var provider = authData.provider;
  this.name = authData[provider].displayName;
  this.profPicUrl = authData[provider].profileImageURL;
  this.uid = authData.uid;
};

function setUserInfo(person){
  person = person ? person : {name: '', profPicUrl: ''};
  $('#nameInput').text(person.name);
  $("#profile-pic").attr('src', person.profPicUrl).append(person.name);
  
}

var roomPath = '';


$('#messageInput').keypress(function (e) {
  if (e.keyCode == 13) {
    console.log('sent a message')
    var name = person ? person.name : 'Anonymous';
    var text = $('#messageInput').val();
    appRef.child(roomPath).push({name: name, text: text, profileUrl: person.profPicUrl});
    $('#messageInput').val('');
  }
});


$('#roomSelect').click(function(e){
  $("#messagesDiv").empty()
  var room =$('#roomInput').val();
  roomPath = changeRoom(room);
})


var cachedAuth = appRef.getAuth();
if (cachedAuth){
  // User is already logged in.
  console.log('Detected logged in user.');
  displayView('messageBox');
  person = new Person(cachedAuth);
} else{
  console.log('Detected user that is not logged in.');
  displayView('login');
}
setUserInfo(person);


$("#logOut").on('click', function(event){
    appRef.unauth();
    displayView('login');
});

firebaseLoginEventBind("gplus", "google");
firebaseLoginEventBind("facebook", "facebook");

$(window).load(function(e){
  roomPath = changeRoom($("#roomInput").val());
});