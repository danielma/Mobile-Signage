// get some stuff from calparse and insert it into the page
var mealtimes = {
  0: {
    breakfast : "7:30 - 8:15 AM",
    dinner : "5:00 - 6:30 PM"
  },
  1: { // Monday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  2: { // Tuesday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  3: { // Wednesday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  4: { // Thursday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "4:30 - 5:30 PM"
  },
  5: { // Friday
    breakfast : "6:15 - 7:15 AM",
    lunch: "11:30 - 1:00 PM", 
    dinner: "5:00 - 6:30 PM"
  },
  6: { // Saturday
    breakfast : "8:00 - 8:45 AM",
    dinner: "5:00 - 6:30 PM"
  }
};

var queue = {
  events: [],
  // callback: function() {},
  
  addEvent: function(title) {
    this.events.push(title);
    // console.log("addEvent: " + title);
  }, 
  
  finishEvent: function(title) {
    this.events.splice(queue.events.indexOf(title), 1)
    // console.log("finishEvent: " + title);
    // console.log("queue size is " + this.events.length);
    if (this.events.length === 0) {
      // console.log("load from local!")
      $(".refreshBtn").removeClass("spinning");
      // console.log("finished getting data");
      loadDataFromStore();
    };
  }
};

function get_menu(range, list) {
  queue.addEvent(list);
  YConnect.get_calendar(range, function(data) {
    var to_append = "";
    var day = data[0].start_time.getDay();
    if (day == 0 || day == 6) {
      // Saturday or sunday
    } else {
      // Weekday. Add in a breakfast item
      data.unshift(
        new Event({
          title: "breakfast",
          description: "Cereal And Stuff"
        })
      );
    }
    $(data).each(function(idx, meal) {
      to_append += "<li>"
        + meal.description.capitalize()
        + "<span class='ui-li-count'>"
        + mealtimes[meal.start_time.getDay()][meal.title.toLowerCase()]
        + "</span>"
        + "</li>";
    });
    localStorage[list] = to_append;
    queue.finishEvent(list);
    // $(list).append(to_append).listview('refresh');
  });
};

function get_events(range, cal, list) {
  queue.addEvent(list);
  GCal.get_calendar(cal, range, function(data) {
    var to_append = "";
    $(data).each(function(idx, evt) {
      to_append += "<li>"
        + "<h3>" + evt.title + "</h3>"
        + "<p>" + evt.start_time.toString("dddd &#97;&#116; h:mm tt") + "</p>";
        if (evt.description.length > 0) {
          to_append += "<ul class='nested'><li>"
            + "<p><strong>" + evt.start_time.toString("dddd &#97;&#116; h:mm tt") + "</strong></p>"
            + "<p>" + evt.description + "</p>"
            + "</li></ul>";
        }
      to_append += "</li>";
    });
    localStorage[list] = to_append;
    queue.finishEvent(list);
    // $(list).append(to_append).listview('refresh');
  });
};


$(document).ready(function() {
  // console.log("document.ready")
  loadDataFromStore();
  if (navigator.onLine) {
    // console.log("ah yes... the navigator is online")
    loadDataToLocal(); // executes a chain that fires loadDataToLocal at end of queue
  } else {
    // queue.finishEvent(); // manually finishes the queue and executes the queue finish callback (loadDataFromStore)
  }
});

function loadDataToLocal() {
  // console.log("loaddatatolocal")
  get_menu(0, "#menu-today");
  get_menu(1, "#menu-tomorrow");
  GCal.init();
  get_events("week", GCal.kona_events, "#campus-events");
  get_events("week", GCal.mauka_theater, "#mauka-events");
  get_events(2, "prayerroom@uofnkona.edu", "#prayerroom-events");  
}

function loadDataFromStore () {
  // console.log("loadDataFromStore");
  $.each(localStorage, function(l) {
    var name = localStorage.key(l);
    var div = $(name);
    div.html(localStorage[name]);
    if (div.hasClass("ui-listview")) {
      // console.log("refresh listivew!")
      div.listview('refresh');
    };
  });
  // put stuff in places and call listview('refresh')
}

$(".refreshBtn").live("click", function() {
  $(".refreshBtn").addClass("spinning");
  loadDataToLocal();
});

window.addEventListener('load', function(e) {

  window.applicationCache.addEventListener('updateready', function(e) {
    console.log("so i think the cache is working");
    if (window.applicationCache.status == window.applicationCache.UPDATEREADY) {
      // Browser downloaded a new app cache.
      // Swap it in and reload the page to get the new hotness.
      window.applicationCache.swapCache();
      if (confirm('A new version of this site is available. Load it?')) {
        window.location.reload();
      }
    } else {
      // Manifest didn't changed. Nothing new to server.
    }
  }, false);
  
}, false);


function checkCache() {
  var appCache = window.applicationCache;

  switch (appCache.status) {
    case appCache.UNCACHED: // UNCACHED == 0
      return 'UNCACHED';
      break;
    case appCache.IDLE: // IDLE == 1
      return 'IDLE';
      break;
    case appCache.CHECKING: // CHECKING == 2
      return 'CHECKING';
      break;
    case appCache.DOWNLOADING: // DOWNLOADING == 3
      return 'DOWNLOADING';
      break;
    case appCache.UPDATEREADY:  // UPDATEREADY == 4
      return 'UPDATEREADY';
      break;
    case appCache.OBSOLETE: // OBSOLETE == 5
      return 'OBSOLETE';
      break;
    default:
      return 'UKNOWN CACHE STATUS';
      break;
  };
}

// alert(checkCache());