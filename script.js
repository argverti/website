$(document).ready(function(){
  //initialize the firebase app

    var config = {

          apiKey: "AIzaSyAew5ZkkImjhnt2ZRLh4KFVYtlGx2NxLyI",
          authDomain: "vertiarg-ner18.firebaseapp.com",
          databaseURL: "https://vertiarg-ner18.firebaseio.com",
          projectId: "vertiarg-ner18",
          storageBucket: "vertiarg-ner18.appspot.com",
          messagingSenderId: "980398706341"
  };
  firebase.initializeApp(config);


  //create firebase references
  var Auth = firebase.auth();
  var dbRef = firebase.database();
  var contactsRef = dbRef.ref('Farm_Desc')
  var usersRef = dbRef.ref('users')
  var auth = null;










  //Register
  $('#doRegister').on('click', function (e) {
    e.preventDefault();
    $('#registerModal').modal('hide');
    $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
    $('#messageModal').modal('show');
    var data = {
      email: $('#registerEmail').val(), //get the email from Form
      firstName: $('#registerFirstName').val(), // get firstName
      lastName: $('#registerLastName').val(), // get lastName
      Device_ID: $('#deviceid').val(),
      Farm_Details: {
        Plant_1: $('#plant1').val(),
        Plant_2: $('#plant2').val(),
        Soil_Desc: $('#soildesc').val(),

      }
    };
    var passwords = {
      password : $('#registerPassword').val(), //get the pass from Form
      cPassword : $('#registerConfirmPassword').val(), //get the confirmPass from Form
    }

    if( data.email != '' && passwords.password != ''  && passwords.cPassword != '' ){
      if( passwords.password == passwords.cPassword ){
        //create the user

        firebase.auth()
          .createUserWithEmailAndPassword(data.email, passwords.password)
          .then(function(user){
            //now user is needed to be logged in to save data
            console.log("Authenticated successfully with payload:", user);
            auth = user;
            //now saving the profile data
            usersRef
              .child(user.uid)
              .set(data)
              .then(function(){
                console.log("User Information Saved:", user.uid);


              })



            $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
            //hide the modal automatically
            setTimeout(function() {
              $('#messageModal').modal('hide');
              $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
              contactsRef.child(auth.uid)
                .on("child_added", function(snap) {
                  console.log("added", snap.key(), snap.val());
                  $('#contacts').append(contactHtmlFromObject(snap.val()));
                });
            }, 500);
            console.log("Successfully created user account with uid:", user.uid);
            $('#messageModalLabel').html(spanText('Successfully created user account!', ['success']))
          })
          .catch(function(error){
            console.log("Error creating user:", error);
            $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
          });
      } else {
        //password and confirm password didn't match
        $('#messageModalLabel').html(spanText("ERROR: Passwords didn't match", ['danger']))
      }
    }
  });







  $('#LogoutModal').on('click', location.reload());







  //Login
  $('#doLogin').on('click', function (e) {
    e.preventDefault();
    $('#loginModal').modal('hide');
    $('#messageModalLabel').html(spanText('<i class="fa fa-cog fa-spin"></i>', ['center', 'info']));
    $('#messageModal').modal('show');

    if( $('#loginEmail').val() != '' && $('#loginPassword').val() != '' ){
      //login the user
      var data = {
        email: $('#loginEmail').val(),
        password: $('#loginPassword').val()
      };
      firebase.auth().signInWithEmailAndPassword(data.email, data.password)
        .then(function(authData) {
          console.log("Authenticated successfully with payload:", authData);
          auth = authData;
          $('#messageModalLabel').html(spanText('Success!', ['center', 'success']))
          setTimeout(function () {
            $('#messageModal').modal('hide');
            $('.unauthenticated, .userAuth').toggleClass('unauthenticated').toggleClass('authenticated');
            contactsRef.child(auth.uid)
              .on("child_added", function(snap) {
                console.log("added", snap.key(), snap.val());
                $('#contacts').append(contactHtmlFromObject(snap.val()));
              });
          })
        })
        .catch(function(error) {
          console.log("Login Failed!", error);
          $('#messageModalLabel').html(spanText('ERROR: '+error.code, ['danger']))
        });
    }
  });






  //save details modal


  $('#adddetails').on("click", function( event ) {
    event.preventDefault();
    if( auth != null ){
      if( $('#deviceid').val() != '' || $('#plant1').val() != '' ){
        contactsRef.child(auth.uid)
          .push({
            Device_ID: $('#deviceid').val(),

            Farm_Details: {
              Plant_1: $('#plant1').val(),
              Plant_2: $('#plant2').val(),
              Soil_Desc: $('#soildesc').val(),

            }
          })
          document.contactForm.reset();
      } else {
        alert('Please fill at-lease Device or Plant_1!');
      }
    } else {
      alert('Please login!');
    }
  });
})

//prepare contact object's HTML
function contactHtmlFromObject(contact){
  console.log( contact );
  var html = '';
  html += '<li class="list-group-item contact">';
    html += '<div>';
      html += '<p class="lead">'+contact.name+'</p>';
      html += '<p>'+contact.email+'</p>';
      html += '<p><small title="' + contact.location.zip+'">'
            +contact.location.city + ', '
            +contact.location.state + '</small></p>';
    html += '</div>';
  html += '</li>';
  return html;
}

function spanText(textStr, textClasses) {
  var classNames = textClasses.map(c => 'text-'+c).join(' ');
  return '<span class="'+classNames+'">'+ textStr + '</span>';
}
