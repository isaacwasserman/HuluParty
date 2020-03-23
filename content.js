var injectedCode = `
  var savedFBClient = null
  var clientIdentifier = null
  function Database(){
    if(savedFBClient != null){
      return savedFBClient
    }
    //Firebase configuration
    var firebaseConfig = {
      apiKey: "AIzaSyCiFAfPnH_BuAQwYf2iFVReO3E2ohJTD7c",
      authDomain: "huluparty-6644d.firebaseapp.com",
      databaseURL: "https://huluparty-6644d.firebaseio.com",
      projectId: "huluparty-6644d",
      storageBucket: "huluparty-6644d.appspot.com",
      messagingSenderId: "810553595068",
      appId: "1:810553595068:web:a41f73a1126abea178ecb9",
      measurementId: "G-LDV1FF2HZ8"
    };
    // Initialize Firebase
    console.log("initializing firebase")
    firebase.initializeApp(firebaseConfig)
    var db = firebase.firestore()
    savedFBClient = db
    return db
  }

  function toggleExtension(){
    var app = $("#HuluParty")
    var player = $('.Player__container')
    if(app.css("display") == "none"){
      player.css({
        "width": "70%"
      })
      app.css({
        "display": "block"
      })
      extensionStatus = "open"
    }
    else {
      player.css({
        "width": "100%"
      })
      app.css({
        "display": "none"
      })
      extensionStatus = "closed"
    }
  }

  var newParty = function(){
    var db = Database()
    if(document.getElementsByClassName("video-player")[0].paused == false){
      $(".controls__playback-button").click()
    }
    var videoID = window.location.pathname.split("/")[2].split("?")[0]
    var timecode = document.getElementsByClassName("video-player")[0].currentTime
    db.collection("parties").add({
      videoID: videoID,
      timecode: timecode,
      paused: true,
      mostRecentController: clientIdentifier,
      messages: []
    })
    .then(function(docRef) {
      var url = document.location.origin + document.location.pathname + "?huluParty="+docRef.id
      window.history.pushState({"partyID": docRef.id}, "Hulu Party", url)
    })
    .catch(function(error) {
        console.error("Error adding document: ", error);
    });
  }

  function updateRemoteTimecode(timecode){
    console.log("Updating Remote Timecode")
    var db = Database()
    var urlParams = new URLSearchParams(window.location.search)
    var partyID = urlParams.has("huluParty") ? urlParams.get("huluParty") : false
    if(partyID){
      db.collection("parties").doc(partyID).set({
        timecode: timecode,
        mostRecentController: clientIdentifier
      }, { merge: true })
    }
  }

  function updateRemotePaused(paused){
    console.log("Updating Remote Paused")
    var db = Database()
    var urlParams = new URLSearchParams(window.location.search)
    var partyID = urlParams.has("huluParty") ? urlParams.get("huluParty") : false
    if(partyID){
      db.collection("parties").doc(partyID).set({
        paused: paused,
        mostRecentController: clientIdentifier
      }, { merge: true })
    }
  }

  function updateLocalTimecode(timecode){
    console.log("Updating Local Timecode")
    $(".content-video-player")[0].currentTime = timecode
  }

  function updateLocalPaused(paused){
    console.log("Updating Local Paused")
    if($(".content-video-player")[0].paused != paused){
      $(".controls__playback-button").click()
    }
  }

  function addPauseListener(){
    console.log("Adding Pause Listener")
    $(document).on("click", ".controls__playback-button-playing, .controls__playback-button-paused", function(){
      setTimeout(function(){
        console.log("Playback Toggled")
        var timecode = $(".content-video-player")[0].currentTime
        var paused = $(".content-video-player")[0].paused
        console.log(paused)
        updateRemoteTimecode(timecode)
        updateRemotePaused(paused)
      }, 50)
    })
  }

  function addSkipListener(){
    return
  }

  function addPartyListener(){
    var db = Database()
    var urlParams = new URLSearchParams(window.location.search)
    var partyID = urlParams.has("huluParty") ? urlParams.get("huluParty") : false
    if(partyID){
      db.collection("parties").doc(partyID).onSnapshot(function(doc) {
          var remote = doc.data()
          if(remote.mostRecentController != clientIdentifier){
            console.log("change made by other user")
            updateLocalPaused(remote.paused)
            updateLocalTimecode(remote.timecode)
          }
      })
    }
  }

  // On Load
  function onLoad(method) {
    if (window.jQuery){
      clientIdentifier = Math.floor((Math.random() * 9999999) + 1);
      var urlParams = new URLSearchParams(window.location.search)
      if(urlParams.has("huluParty")){
        console.log('party in progress')
        if($("#HuluParty").css("display") == "none"){
          toggleExtension()
        }
      }
      addPauseListener()
      addPartyListener()
    }
    else {
      setTimeout(function() { onLoad(method) }, 50);
    }
  }
  onLoad()
`

// HTML Injection
var app = $(`
  <script type="text/javascript" src="https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js"></script>
  <script type="text/javascript" src="https://www.gstatic.com/firebasejs/7.12.0/firebase-firestore.js"></script>
  <script type="text/javascript" src="https://code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script>
  <script type="text/javascript" style="display: none">
    ${injectedCode}
  </script>
  <div id="HuluParty">
    <div id="startOptions">
      <button onclick="newParty()">New Party</button>
    </div>
  </div>
`)

app.css({
  "width": "30%",
  "height": "100%",
  "float": "right",
  "background-color": "red",
  "top": "0px",
  "right": "0px",
  "position": "fixed",
  "z-index": "2000",
  "display": "none"
})

var playerAndAppParent = $('.Player__container')
playerAndAppParent.append(app)

function toggleExtension(){
  var player = $('.Player__container')
  if(app.css("display") == "none"){
    console.log("Opening Extension")
    player.css({
      "width": "70%"
    })
    app.css({
      "display": "block"
    })
  }
  else {
    console.log("Closing Extension")
    player.css({
      "width": "100%"
    })
    app.css({
      "display": "none"
    })
  }
}

// Listen for messages
chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  console.log("Message Received")
  if(request.method == "toggle"){
    toggleExtension()
  }
});
