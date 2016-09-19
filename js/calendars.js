// modified from https://github.com/carlsednaoui/add-to-calendar-buttons
// event object should be:
/* event_object = {
                  'start': new Date('August 30, 2016 19:00 PDT'),
                  'end': new Date('August 30, 2016 20:00 PDT'),
                  'duration': 60,
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