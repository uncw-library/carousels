function syn_get_unbound() {
  if(typeof LibraryThingConnector === "undefined") {
    var head = document.getElementsByTagName("head")[0];
    var script = document.createElement("script");
    script.src = 'https://ltfl.librarything.com/syndeticsunbound/connector/initiator.php?client=uncwh&pq_domain=secure.syndetics.com';
    head.appendChild(script);
  }
}

function syn_get_plus() {
  var t = new Date();
  var head = document.getElementsByTagName("head")[0];
  var script = document.createElement("script");
  script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js';

  // Attach handlers for all browsers
  var done = false;
  script.onload = script.onreadystatechange = function() {
    if( !done && ( !this.readyState 
                   || this.readyState == "loaded" 
                   || this.readyState == "complete") 
      ) {
      done = true;
      
      // Ensure jQuery doesn't conflict with the $ object of other JavaScript
      // libraries or with other versions of jQuery
      $syndetics.jQuery = jQuery.noConflict(true);

      // Now that jQuery has been loaded, load connector
      var js = document.createElement("script");
      js.src = "https://secure.syndetics.com/widget_connector.php?id=uncwh&css=css/styles_syndetics.css&t="+t.getTime();
      js.type = "text/javascript";
      head.appendChild(js);
 
      // Handle memory leak in IE
      script.onload = script.onreadystatechange = null;
      if ( head && script.parentNode ) { 
        head.removeChild( script ); 
      } 

    }
  };
  head.appendChild(script);
}

if(typeof(syn_loaded)=="undefined") {
  if(document.readyState == "complete" 
    || document.readyState == "loaded"
    || document.readyState == "interactive"
  ) {
    syn_get_unbound();
  }
  else if(document.addEventListener) { 
    document.addEventListener("DOMContentLoaded",syn_get_unbound,false);
  }
  else if(window.addEventListener) {
    window.addEventListener("load",syn_get_unbound,false);
  }
  else if(window.attachEvent) {
    window.attachEvent("onload",syn_get_unbound);
  }
}
var syn_loaded=1;