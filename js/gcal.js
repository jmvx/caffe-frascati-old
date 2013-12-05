/*******************************************************************************
 * gcal.js
 *
 * Copyright (c) 2013 Julia Van Cleve
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 ******************************************************************************/


// from StackOverflow user "Scott",
// http://stackoverflow.com/questions/12192491/jquery-sort-array-by-iso-8601-date
Date.prototype.setISO8601 = function(string) {
  var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
  "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
  "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
  var d = string.match(new RegExp(regexp));

  var offset = 0;
  var date = new Date(d[1], 0, 1);

  if (d[3]) { date.setMonth(d[3] - 1); }
  if (d[5]) { date.setDate(d[5]); }
  if (d[7]) { date.setHours(d[7]); }
  if (d[8]) { date.setMinutes(d[8]); }
  if (d[10]) { date.setSeconds(d[10]); }
  if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
  if (d[14]) {
    offset = (Number(d[16]) * 60) + Number(d[17]);
    offset *= ((d[15] == '-') ? 1 : -1);
  }

  offset -= date.getTimezoneOffset();
  time = (Number(date) + (offset * 60 * 1000));
  this.setTime(Number(time));

  return this;
}

Date.prototype.rewindToMidnight = function() {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
  this.setMilliseconds(0);
  return this;
}

Date.prototype.addDays = function(days) {
  this.setTime(this.getTime() + days * 24 * 60 * 60 * 1000);
  return this;
}

Date.prototype.fallsOnDay = function(d) {
  // Get midnight of both dates, are they the same?
  var dMidnight = new Date(d).rewindToMidnight();
  var tMidnight = new Date(this).rewindToMidnight();
  return (dMidnight.getTime() == tMidnight.getTime());
}

Date.prototype.fallsBetweenDates = function(start, end) {
  return (this >= start && this <= end);
}

Date.prototype.toJuliaString = function() {
  var str = "";
  
  str += [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ][this.getDay()];
  str += ", ";
  str += [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ][this.getMonth()];
  str += " ";
  str += this.getDate().toString();
  // str += ", ";
  // str += this.getFullYear().toString();
  
  var isMidnight = (this.getHours() == 0 && this.getMinutes() == 0);
  var isNoon = (this.getHours() == 12 && this.getMinutes() == 0);
  var isNoonOrMidnight = (isMidnight || isNoon);
  var isAM = (this.getHours() < 12);
  
  str += " at ";
  if (isMidnight)
    str += "midnight"
  else if (isNoon)
    str += "noon"
  else
    str += (this.getHours() % 12).toString();
  
  if (this.getMinutes() > 0)
  {
    var paddedMins = (this.getMinutes() + 100).toString().slice(-2);
    str += ":" + paddedMins;
  }
  
  if (!isNoonOrMidnight)
    str += " " + (isAM ? "AM" : "PM");
  
  return str;
}

function GCalEvents(calendar_json_url, target) {
  // get list of upcoming events
  $.getJSON(calendar_json_url, function(data) {
    // Distill events down to the information we care about
    var events = new Array();
    $.each(data.feed.entry, function(i, item) {
      console.log(item);
      var ev = {};
      ev.title = item.title.$t;
      ev.content = item.content.$t;
      ev.date = (new Date()).setISO8601(item.gd$when[0].startTime);
      events.push(ev);
    });
  
    // Sort events by date, ascending
    events.sort(function (a, b) {
      return b.date < a.date ? 1 : -1;
    });
  
    // Date objects representing our range
    var today = new Date().rewindToMidnight();
    var lastday = new Date(today).addDays(180);
    
    // Filter to just events within our range
    var upcoming = $.grep(events, function(event, i) {
      return event.date.fallsBetweenDates(today, lastday);
    });
  
    // Output
    $.each(upcoming, function(i, event) {
      var el_title = $("<div>");
      el_title.addClass("event-title");
      el_title.text(event.title);
      
      var el_date = $("<div>");
      el_date.addClass("event-date");
      el_date.text(event.date.toJuliaString());
      
      var el_content = $("<div>");
      el_content.addClass("event-content");
      el_content.text(event.content);
      
      var el = $("<div>").append(el_title)
                         .append(el_date)
                         .append(el_content);
      el.addClass("event");
      target.append(el);
    });
  });
}
