function updateModal(title, titleFixed,  author, callNumber, location, available, recordnum, image, errorImage, showFindIt, showCatalogLink, showSendAsText) {
  const formattedCallNumber = callNumber.toUpperCase().replace(/\s/g, '');
  const formattedLocation = location.replace(/[']/gi, '\\\'').replace(/["]/gi, '\\"');
  const formattedTitle = title.replace(/[']/gi, '\\\'').replace(/["]/gi, '\\"');
  const findItUrl = `https://findit.libapps.uncw.edu/stacks?callNumber=${formattedCallNumber}&collection=${formattedLocation}`
  const sendTextUrl = `https://twilio.libapps.uncw.edu/sendCallNumber?bookLocation=${formattedLocation}&bookCallNumber=${formattedCallNumber}&bookTitle=${formattedTitle}`

  $('#sendAsTextIframe').html('');
  $('#findItIframe').html('');
  $('#modalBodyImage').html('');
  $('#modalBodyInfo').html('');
  $('#modalBodyDescription').html('');
  $('#sendAsText').html('');
  $('#catalogLink').html('');
  $('#findIt').html('');
  
  $('#modalTitle').html(`${title} - ${author}`);
  $('#modalBodyImage').html(`
    <div class="col-auto">
      <img class="img img-thumbnail" onerror="this.src='${errorImage}'" src="${image}">
      <div class="overlay-modal">
        <div class="text-modal">${titleFixed} -- ${author}</div>
      </div>
    </div>
  `);

  if (callNumber && location) {
    $('#modalBodyInfo').html(`
      <div class="col-auto" style="text-align:center;">
        <strong>Call Number</strong>: ${formattedCallNumber}
        <br/>
        <strong>Location</strong>: ${location}
        <br/>
        <strong>Availability</strong>: ${available}
      </div>
    `);
  } else {
    $('#modalBodyInfo').html(`
      <div class="col-auto" style="text-align:center;">
        <strong>Click on button "See Catalog Record" to access Electronic Resource</strong>: ${formattedCallNumber}
      </div>
    `);
  }
  if (showSendAsText) {
    $('#sendAsText').html(` 
      <img style="margin:10px;" onclick="sendAsText('${sendTextUrl}');" src="/images/sendAsTxt.gif"/>
    `);
  };
  if (showCatalogLink) {
    $('#catalogLink').html(`
      <a target="blank" href="https://libcat.uncw.edu/record=b${recordnum}">
        <img style="margin:10px;" src="/images/catalogRecord.gif"/>
      </a>
    `);
  };
  if (showFindIt) {
    $('#findIt').html(`
      <img style="margin:10px;" onclick="findIt('${findItUrl}', '${formattedCallNumber}');" src="/images/FindIT2-Button.png"/>
    `);
  };
 
  $('#modalBodyDescription').html(`<p><div id="syn_summary"></div></p>`)
  
  syn_get_plus();
}

function sendAsText(url) {
  $('#sendAsTextIframe').html('');
  $('#findItIframe').html('');
  $('#modalBodyImage').html('');
  $('#modalBodyInfo').html('');
  $('#modalBodyDescription').html('');
  $('#sendAsText').html('');
  $('#catalogLink').html('');
  $('#findIt').html('');

  $('#sendAsTextIframe').html(`
      <iframe src="${url}" width="450" height="550" style="margin-bottom:-90px;" frameborder="0"/>
  `);
}

function findIt(url, callNumber) {
  $('#sendAsTextIframe').html('');
  $('#findItIframe').html('');
  $('#modalBodyImage').html('');
  $('#modalBodyInfo').html('');
  $('#modalBodyDescription').html('');
  $('#sendAsText').html('');
  $('#catalogLink').html('');
  $('#findIt').html('');
  
  $('#findItIframe').html(` 
    <div style="padding:20px;"><strong>Call Number</strong>: ${callNumber}</div>
    <br/>
    <iframe src="${url}" width="600" height="880" style="margin-bottom:-90px;" frameborder="0"/>
  `);

}