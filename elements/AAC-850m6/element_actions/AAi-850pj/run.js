function(instance, properties, context) {


  //Load any data 



  //Do the operation
  instance.publishState('jitsi_ready', false);
  instance.data.jitsiMeet.dispose();

}