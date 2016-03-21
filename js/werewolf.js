var appPrefix = 'https://roll-werewolf.firebaseio.com/v1/'
$('#messageInput').keypress(function (e) {
  if (e.keyCode == 13) {
    console.log('sent a message')
    var name = person ? person.name : 'Anonymous';
    var text = $('#messageInput').val();
    firebaseDataRef.push({name: name, text: text, profileUrl: person.profPicUrl});
    $('#messageInput').val('');
  }
});
function initDataRef(room){
  if (room === ''){
    var firebaseDataRef = new Firebase(appPrefix + 'custom-room/General');
  }
  else{
    var firebaseDataRef = new Firebase(appPrefix + 'custom-room/'+room);
  }
  firebaseDataRef.off('child_added');
  firebaseDataRef.on('child_added', function(snapshot) {
    var message = snapshot.val();
    displayChatMessage(message.name, message.text, message.profileUrl); 
});
  return firebaseDataRef
}

var roomRef = initDataRef('');


function displayChatMessage(name, text, profileUrl) {

  var chip = $("<div/>").attr('class', 'chip')
      .append($('<img/>').attr('src', profileUrl ? profileUrl : ''))
      .append($('<em/>').text(name+': '));

  $('<div/>').text(text)
      .prepend(chip)
        .appendTo($('#messagesDiv'));
  $('#messagesDiv')[0].scrollTop = $('#messagesDiv')[0].scrollHeight;
};  



$('#roomSelect').click(function(e){
  $("#messagesDiv").empty()
  var room =$('#roomInput').val();
  firebaseDataRef = initDataRef(room);
})



var Person = function(authData){
  var provider = authData.provider;
  this.name = authData[provider].displayName;
  this.profPicUrl = authData[provider].profileImageURL;
  this.uid = authData.uid;
};

function setUserInfo(person){
  $('#nameInput').val(person.name);
}
userRef = new Firebase( appPrefix + 'user/')

var cachedAuth = firebaseDataRef.getAuth();
if (cachedAuth){
  // User is already logged in.
  console.log('Detected logged in user.');
  displayView('messageBox');
  console.log($('#login'));
  person = new Person(cachedAuth);
  setUserInfo(person);
} else{
  console.log('Detected user that is not logged in.');
  displayView('login');
}

function displayView(id){
  var views = ['login', 'messageBox'];
  for (i in views){
    $('#'+views[i]).hide();
  }
  $('#'+id).fadeIn(1000);
}
function firebaseLoginEventBind(id, provider){
  $('#'+id).on('click', function(e){
  firebaseDataRef.authWithOAuthPopup(provider, function(error, authData) {
  if (error) {
    console.log("Login Failed!", error);
  } else {
    console.log("Authenticated successfully with payload:", authData);
    displayView('messageBox');    
    person = new Person(authData);
    setUserInfo(person);
  }

  });
});
}

$("#logOut").on('click', function(event){
    firebaseDataRef.unauth();
    displayView('login');
});

firebaseLoginEventBind("gplus", "google");
firebaseLoginEventBind("facebook", "facebook");