var ds = new Miso.Dataset({
  importer : Miso.Dataset.Importers.GoogleSpreadsheet,
  parser : Miso.Dataset.Parsers.GoogleSpreadsheet,
  key : "1frLQzcNLahwziOdXjWAPuRdqKIklTjYbBm0iMFktaZU",
  worksheet : "1"
});

ds.fetch({ 
  success : function() {
    // if successfully fetch data from gsheet
    var d = new Date(); // get current datetime
    var approvedEvents = this.where({
      // copy over columns with event info
      columns: ["title", "host", "location","date","starttime","endtime","timezone", "description", "link"],
      // and only where an admin has approved
      rows: function(row) {
        return row.approved == 1 && new Date(row.date+" "+row.starttime+" "+row.timezone) > d;
      }
    });
    // sort most recent to top
    approvedEvents.sort(function(rowA, rowB) {
      var rowAdate = new Date(rowA.date+" "+rowA.starttime+" "+rowA.timezone);
      var rowBdate = new Date(rowB.date+" "+rowB.starttime+" "+rowB.timezone);
      if (rowAdate < rowBdate) {
        return -1;
      }
      if (rowAdate > rowBdate) {
        return 1;
     }
      return 0;
    });
    // loop over each row of data and call loadEvent
    approvedEvents.each(function(row){
      row.link = addhttp(row.link);
      loadEvent(row);
    });
    // upgrade DOM for mdl components
    componentHandler.upgradeDom();
    $('.mdl-layout__content').scroll(function(){ $(window).trigger('resize');});
  },
  error : function() {
    console.log("Are you sure you are connected to the internet?");
  }
});

// generate HTML from template, where data is a row of spreadsheet data
function loadEvent(data) {
  var template = $('#event-template').html();
  Mustache.parse(template);
  var rendered = Mustache.render(template, data);
  var calLinkData = makeCalendarEventObject(data);
  var cal_links = generateCalendars(calLinkData);
  $('#event-grid').append(rendered);
  // set each event to have a random background color
  $('#event-'+data._id).css('background-color',randomColor({luminosity: 'dark'}));
  // set href for calendar links
  $('#gcal-'+data._id).attr("href",cal_links.google);
};

// make event object for calendar links where data is a row of spreadsheet data
function makeCalendarEventObject(data){
  var event_object = {
                      'start': new Date(data.date+" "+data.starttime+" "+data.timezone),
                      'end': new Date(data.date+" "+data.endtime+" "+data.timezone),
                      'title': data.title,
                      'description': 'Organizado Por: '+data.host+'\nLink para o Evento: '+data.link+'\n\n'+data.description,
                      'address': data.location,
                      'link': data.link,
                      'host': data.host
                    };
  return event_object;
};

// format links so they work properly in HTML even if they were input with out a http:// in the form
function addhttp(url) {
    if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
        url = "http://" + url;
    }
    return url;
};

// below code modified from https://github.com/carlsednaoui/add-to-calendar-buttons
// event object should be:
/* event_object = {
                  'start': new Date('August 30, 2016 19:00 PDT'),
                  'end': new Date('August 30, 2016 20:00 PDT'),
                  'title': 'Event Title',
                  'description': 'Event Description is an event description for your event.',
                  'address': 'This is the location of the event',
                  'link': 'http://example.com',
                  'host': 'Event host'
                };*/
var formatTime = function(date) {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
};

var calendarGenerators = {
  google: function(event) {
    var startTime = formatTime(event.start);
    var endTime = formatTime(event.end);

    var href = encodeURI([
      'https://www.google.com/calendar/render',
      '?action=TEMPLATE',
      '&text=' + (event.title || ''),
      '&dates=' + (startTime || ''),
      '/' + (endTime || ''),
      '&details=' + (event.description || ''),
      '&location=' + (event.address || ''),
      '&sprop=&sprop=name:'
    ].join(''));
    return href;
  }
};

var generateCalendars = function(event) {
  return {
    google: calendarGenerators.google(event)
  };
};
