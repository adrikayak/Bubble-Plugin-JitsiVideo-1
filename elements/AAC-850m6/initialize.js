function(instance, context) {
    
    // Generate a random ID for the element
 	var randomId = Math.floor((Math.random() * 100000) + 1);
    var elementId = 'jitsi_container_' + randomId;
    instance.canvas.append("<div style='width:100%;height:100%' id='" + elementId + "' class='jitsi_meet'></div>");

    instance.data.elementId = elementId;
    instance.data.parentNode = document.getElementById(elementId);

}