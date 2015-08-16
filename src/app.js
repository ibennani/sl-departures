// Required files
var UI = require('ui'); // Handles the user interface
var Vector2 = require('vector2'); // Handles the menu listings
var Vibe = require('ui/vibe'); // Handles the vibrations
//var ajax = require('ajax'); // Handles the data retrieval from external API:s



// VARIABLE DEFINITIONS
var valuated = 987;

// Sett variables and 
// use fake data (for now)
var hallplatslista = ['Farsta Strand','Farsta', 'Hökarängen','Gubbängen','Tallkrogen','Skogskyrkogården','Sandsborg','Blåsut','Skärmarbrink'];
var hallplatslistaData;

var avganglinje = [18,18,18,18,18,18,18,18,18];

var avgangdestination = ['Farsta Strand','Vällingby','Farsta Strand','Alvik','Farsta Strand','Alvik','Farsta Strand','Vällingby','Alvik'];

var avgangminuter = [3,7,13,17,23,29,33,33,37];


// SET COMMON VARIABLES
var URLdatatype = 'json';

var keyNarliggandeHallplatser = '1a1cab30894d4f109a8051475a6d929d';
var keyPlatsuppslag = '0af4870d39974a609dcc69d0748b2520';
var keyRealtidsinformation = 'b3cff3b5c99e4ac880265c725811ddf5';

var latitude = '59.23441';
var longitude = '18.09381';

var NarliggandeHallplatserAntal = 10; // Max number of stations to retrieve
var NarliggandeHallplatserAvstand = 2000; // Radius in meters.

var siteid = '300101923';
var timewindow = 60;

// DEFINE THE URL:S FOR RETIEVING DATA FROM API'S

// What stations are located nearby
var URLnarliggandeHallplatser = 'http://api.sl.se/api2/nearbystops.' + URLdatatype;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '?key=' + keyNarliggandeHallplatser;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&originCoordLat=' + latitude;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&originCoordLong=' + longitude;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&maxresults=' + NarliggandeHallplatserAntal;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&radius=' + NarliggandeHallplatserAvstand;

/*
// Get list of stations nearby
// Make the request
ajax(
  {
    url: URLnarliggandeHallplatser,
    type: URLdatatype
  },
  function(data) {
    // Success!
    console.log('Successfully fetched data!\n\n');
		//console.log('Hållplatsens namn: ' + data.LocationList.StopLocation[0].name + '\n\n');
		//hallplatslistaData = data;
		//valuated = 123456;
		
//		var namn = data.LocationList.StopLocation[0].name;
//		namn = namn.substring(0,(namn.indexOf('(') - 1));
//		console.log('Hållplatsens namn utan kommun: ' + namn + '\n\n');
		
//		var data2 = data.strreplace(';','\n');
//		console.log('the object:\n\n' + data + '\n\n');	
  },
  function(error) {
    // Failure!
    console.log('Failed fetching data: ' + error);
  }
);



*/

// FUNCTIONS


// This function creates the station list menu
// and puts the stations into the array "items".

function createStationsNearbyList(data) {
  var items = [];
  
  for (var i = 0; i < data.length; i++) {
   
    items.push({
      title: data[i],
      subtitle: '208 m'
    });
  }
  
  return items;
}




// THE SCRIPT

// Create a splash screen while waiting for data to inform the user
// that the pebble is retrieving a list of nearby stations
var splashWindow = new UI.Window();

// ...and set the design of that splash scrren 
var splashwindowText = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 168),
  text:'\n\nSöker efter\nhållplatser i närheten\n\nVänta lite...',
  font:'GOTHIC-14-bold',
  color:'white',
  textOverflow:'wrap',
  textAlign:'center',
  backgroundColor:'black'
});

// Add the design/content of the splash screen
splashWindow.add(splashwindowText);
// ...and finaly show the splash screen
splashWindow.show();

	// Just for debuging
	var main01 = new UI.Card({
  title: "Fungerar",
  //body: 'lite data\n' + hallplatslistaData.LocationList.StopLocation[1].name
});
// main01.show();







// Create the station list (i.e. the menu items)
var stationslist = createStationsNearbyList(hallplatslista); // call the function defined above
var antalstationer = stationslist.length; // How many stations were retrieved



// Construct the station list object
// i.e. the menu listing all nearby stations
var stationListMenu = new UI.Menu({
  sections: [{
	title: "Hittade " + antalstationer +" hållplatser",
	items: stationslist // here is the station list
	}]
});


// Show the station list (that's actually a menu)
stationListMenu.show();
// Hide the initial spash screen
splashWindow.hide();


// Ad a click event to the station list menu
	stationListMenu.on('select', function(e) {
	console.log('Klicka på knappen och valde ' + [e.itemIndex]);
	Vibe.vibrate('short'); // Short vibration to confirm selection	

	// Find out what station the user chosed in the menu
	var selectedstation;
	selectedstation = hallplatslista[e.itemIndex];

	
	// Create the info showing depature info
	var stationinfoContent;
	// stationinfoContent = selectedstation + '\n';
	stationinfoContent = 'Linje ' + avganglinje[0] + ' mot\n';
	stationinfoContent = stationinfoContent + avgangdestination[0] + '\n';
	stationinfoContent = stationinfoContent + 'avgår om ' + avgangminuter[0] + ' min.';

	
	// Create the Window for detailed view
	var departureinfoWindow = new UI.Window();
	
	// Create the text object that shows the name of 
	// the selected station at the top of the window
	var departureinfoStationname = new UI.Text({
  position: new Vector2(0, 0),
  size: new Vector2(144, 18),
  text: hallplatslista[e.itemIndex],
  font: 'Gothic-14-bold',
	color: 'black',
	textAlign: 'center',
	backgroundColor: 'white'
	});
	
	// Create the text object containg type of viechle
	var departureinfoViechle = new UI.Text({
  position: new Vector2(0, 20),
  size: new Vector2(144, 20),
  textAlign: 'center',
	text: 'Tunnelbana',
  font: 'Gothic 14 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
	
	// Create the text object containg line number
	var departureinfoLinenumber = new UI.Text({
  position: new Vector2(0, 30),
  size: new Vector2(144, 44),
  textAlign: 'center',
	text: '18',
  font: 'Bitham 42 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
	
	
	// Create the text object containg destination
	var departureinfoDestination = new UI.Text({
  position: new Vector2(0, 70),
  size: new Vector2(144, 30),
  textAlign: 'center',
	text: 'Alvik',
  font: 'Gothic 28 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
			
	// Create the text object containg departure time
	var departureinfoDeparturetime = new UI.Text({
  position: new Vector2(64, 106),
  size: new Vector2(50, 40),
  textAlign: 'center',
	text: '28',
  font: 'Bitham 42 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
	
	// Create the text object containg departure time label "avgår"
	// This is visible only if the departure is later than 30 min
	var departureinfoTextLeft = new UI.Text({
  position: new Vector2(0, 134),
  size: new Vector2(70, 16),
  textAlign: 'left',
	text: 'avgår om',
  font: 'Gothic 14 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
	
	// Create the text object containg departure time label "min"
	// This is visible only if the departure is earlier than 30 min from now
	var departureinfoTextRight = new UI.Text({
  position: new Vector2(120, 134),
  size: new Vector2(22, 16),
  textAlign: 'Right',
	text: 'min',
  font: 'Gothic 14 Bold',
	color: 'white',
	backgroundColor: 'clear'	
	});
	
	departureinfoWindow.add(departureinfoStationname);
	departureinfoWindow.add(departureinfoLinenumber);
	departureinfoWindow.add(departureinfoViechle);
	departureinfoWindow.add(departureinfoDestination);
	departureinfoWindow.add(departureinfoTextLeft);
	departureinfoWindow.add(departureinfoDeparturetime);
	departureinfoWindow.add(departureinfoTextRight);
	departureinfoWindow.show();
	
	
	// Kill the current window when the user presses the back button
		departureinfoWindow.on('click', 'back', function(e) {
		console.log('adjöss - jag har backat');
		departureinfoWindow.hide();
	});
});




