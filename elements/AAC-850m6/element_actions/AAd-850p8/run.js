function(instance, properties, context) {

  //Load any data 


  //Do the operation
  //toolbar = ['camera','chat','closedcaptions','desktop','download','embedmeeting','etherpad','feedback','filmstrip',                   'fullscreen','fodeviceselection','hangup','help','highlight','invite','linktosalesforce','livestreaming','localrecording','microphone','noisesuppression','participants-pane','profile','raisehand','recording','security','select-background','settings','shareaudio','sharedvideo','shortcuts','stats','tileview','toggle-camera','videobackgroundblur','videoquality','whiteboard']
    
    if (properties.role == "moderator") {
        toolbar = ['chat','desktop','fullscreen','localrecording','raisehand','tileview','settings','whiteboard','noisesuppression','select-background','videoquality']
    }
    else {
        toolbar = ['chat','desktop','fullscreen','localrecording','raisehand','tileview','settings','whiteboard','noisesuppression','select-background','videoquality']
    }
    
   
    if (properties.hangUpEnabled == true) {
        toolbar.push('hangup');
    }
    
        if (properties.micEnabled == true) {
        toolbar.push('microphone');
    }
    
        if (properties.camEnabled == true) {
        toolbar.push('camera');
    }
        
	
    if (properties.jitsiServerURL == null) {
    	var domain = 'meet.jit.si';
	} else {
    	var domain = properties.jitsiServerURL;
	}
    
    instance.publishState('audio_muted', properties.startWithAudioMuted);
    instance.publishState('video_muted', properties.startWithVideoMuted);
    
    const options = {
    	roomName: properties.room_name,
        parentNode: instance.data.parentNode,
   		configOverwrite: { 
            startWithAudioMuted: properties.startWithAudioMuted,
            startWithVideoMuted: properties.startWithVideoMuted,
            enableUserRolesBasedOnToken: true,
            enableFeaturesBasedOnToken: true,
            prejoinPageEnabled: properties.prejoin_page_enabled,
            disableDeepLinking: true,
            whiteboard: {
                enabled: true,
                collabServerBaseUrl: 'ec2-13-39-82-226.eu-west-3.compute.amazonaws.com'
            },
            buttonsWithNotifyClick: [
				{
                    key: 'end-conference',
                    preventExecution: true
                },
            	'__end'
            ]
        },
    	interfaceConfigOverwrite: {
            filmStripOnly: properties.filmStripOnly,
            TOOLBAR_BUTTONS: toolbar,
            SHOW_CHROME_EXTENSION_BANNER: false,
            buttonsWithNotifyClick: [
				{
                    key: 'end-conference',
                    preventExecution: true
                },
            	'__end'
            ]
        },
        userInfo: { 
            email: context.currentUser.get("email"),
        	displayName: properties.participant_name,
            //moderator: false,
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
        instance.publishState('audio_muted', status["muted"]);
        instance.triggerEvent('audiomute_status_changed');

    });
    jitsiMeetObject.on('videoMuteStatusChanged', function(status){
        instance.publishState('video_muted', status["muted"]);
        instance.triggerEvent('videomute_status_changed');
    });
    
    // Add the object
    instance.data.jitsiMeet = jitsiMeetObject;
    instance.publishState('jitsi_ready', true);

}