function(instance, properties, context) {


  //Load any data 
  const get_avatarurl = instance.data.jitsiMeet.getAvatarURL(properties.participant_id);


  //Do the operation
  instance.publishState('participant_avatarurl', get_avatarurl["avatarURL"]);


}