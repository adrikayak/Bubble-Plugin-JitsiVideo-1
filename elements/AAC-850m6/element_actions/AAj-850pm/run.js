function(instance, properties, context) {


  //Load any data 
  const get_email = instance.data.jitsiMeet.getEmail(properties.participant_id);


  //Do the operation
  instance.publishState('participant_email', get_email["email"]);


}