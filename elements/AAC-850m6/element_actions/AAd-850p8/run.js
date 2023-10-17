function(instance, properties, context) {


  //Load any data 



  //Do the operation
  if (properties.role == "moderator") {
        toolbar = ['desktop', 'chat', 'fullscreen','raisehand','tileview','settings']
    }
    else {
        toolbar = [ 'closedcaptions', 'desktop', 'fullscreen',
        'fodeviceselection', 'hangup', 'profile', 'settings', 'raisehand',
        'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
        'tileview', 'videobackgroundblur', 'help' ]
    }
        
	
    if (properties.jitsiServerURL == null) {
    	var domain = 'meet.jit.si';
	} else {
    	var domain = properties.jitsiServerURL;
	}
    
    const options = {
    	roomName: properties.room_name,
        parentNode: instance.data.parentNode,
   		configOverwrite: { 
            startWithAudioMuted: properties.startWithAudioMuted,
            startWithVideoMuted: properties.startWithVideoMuted,
            enableUserRolesBasedOnToken: true,
            enableFeaturesBasedOnToken: true,
            prejoinPageEnabled: properties.prejoin_page_enabled,
            disableDeepLinking: true
        },
    	interfaceConfigOverwrite: {
            filmStripOnly: properties.filmStripOnly,
            TOOLBAR_BUTTONS: toolbar
        },
        userInfo: { 
            email: context.currentUser.get("email"),
        	displayName: properties.participant_name
        }
    };
    
    instance.data.room_name = properties.room_name;
    instance.data.room_password = properties.room_password;
    
	// Create a client
    var jitsiMeetObject = new JitsiMeetExternalAPI(domain, options);
    
    // Trigger events
    jitsiMeetObject.on('participantJoined', function(participant) {
        instance.triggerEvent('participant_joined');
        instance.publishState('number_of_participants', jitsiMeetObject.getNumberOfParticipants());
		instance.publishState('participant_id', participant["id"]);
		instance.publishState('participant_displayname', participant["displayName"]);
        const get_email = jitsiMeetObject.getEmail(participant["id"]);
        const get_avatarURL = jitsiMeetObject.getAvatarURL(participant["id"])
        instance.publishState('participant_email', get_email["email"]);
		instance.publishState('participant_avatarurl', get_avatarURL["avatarURL"]);
    });
    jitsiMeetObject.on('participantLeft', function(participant) {
        instance.triggerEvent('participant_left');
        instance.publishState('number_of_participants', jitsiMeetObject.getNumberOfParticipants());
        instance.publishState('participant_id', participant["id"]);
    });
    
    jitsiMeetObject.on('videoConferenceLeft', function(conference) {
        instance.triggerEvent('videoconference_left');
        instance.publishState('room_name', conference["roomName"]);
        instance.publishState('on_meeting', false);
    });
    jitsiMeetObject.on('videoConferenceJoined', function(conference) {
        instance.triggerEvent('videoconference_joined');
        instance.publishState('number_of_participants', jitsiMeetObject.getNumberOfParticipants());
        instance.publishState('room_name', conference["roomName"]);
        instance.publishState('user_id', conference["id"]);
        instance.publishState('on_meeting', true);
    });
    
    jitsiMeetObject.on('participantRoleChanged', function(user_role) {
    	if (user_role.role == 'moderator') {
            jitsiMeetObject.executeCommand('password', properties.room_password);
        }
        instance.publishState('local_role', user_role["role"]);
    });
    
    jitsiMeetObject.on('passwordRequired', function() {
        jitsiMeetObject.executeCommand('password', properties.room_password);
        instance.triggerEvent('password_required');
    });
    
    jitsiMeetObject.on('readyToClose', function() {
        instance.triggerEvent('ready_to_close');
    });
    jitsiMeetObject.on('emailChange', function(participant) {
        instance.triggerEvent('email_change');
        instance.publishState('participant_id', participant["id"]);
        instance.publishState('participant_email', participant["email"]);
    });
    jitsiMeetObject.on('displayNameChange', function(participant) {
        instance.triggerEvent('displayname_change');
        instance.publishState('participant_id', participant["id"]);
        instance.publishState('participant_displayname', participant["displayName"]);
    });
    jitsiMeetObject.on('avatarChanged', function(participant) {
        instance.triggerEvent('avatarurl_change');
        instance.publishState('participant_id', participant["id"]);
        instance.publishState('participant_avatarurl', participant["avatarURL"]);
    });    
    jitsiMeetObject.on('audioMuteStatusChanged', function(status){
       instance.triggerEvent('audiomute_status_changed');
       instance.publishState('audio_muted', status["muted"]);
    });
    jitsiMeetObject.on('videoMuteStatusChanged', function(status){
       instance.triggerEvent('videomute_status_changed');
       instance.publishState('video_muted', status["muted"]);
    });
    
    // Add the object
    instance.data.jitsiMeet = jitsiMeetObject;
    instance.publishState('jitsi_ready', true);

}