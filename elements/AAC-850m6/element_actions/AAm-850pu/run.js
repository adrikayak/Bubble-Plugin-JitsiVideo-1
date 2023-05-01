function(instance, properties, context) {


  //Load any data 
  const get_avatarurl = instance.data.jitsiMeet.getAvatarURL(properties.participant_id);
  const get_displayname = instance.data.jitsiMeet.getDisplayName(properties.participant_id);
  const get_email = instance.data.jitsiMeet.getEmail(properties.participant_id);


  //Do the operation
  instance.publishState('participant_avatarurl', get_avatarurl["avatarURL"]);
  instance.publishState('participant_displayname', get_displayname["displayName"]);
  instance.publishState('participant_email', get_email["email"]);

}