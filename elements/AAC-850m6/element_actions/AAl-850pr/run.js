function(instance, properties, context) {


  //Load any data 
  const get_displayname = instance.data.jitsiMeet.getDisplayName(properties.participant_id);


  //Do the operation
  instance.publishState('participant_displayname', get_displayname["displayName"]);


}