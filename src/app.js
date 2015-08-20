// Required files
var UI = require('ui'); // Handles the user interface
var Vector2 = require('vector2'); // Handles the menu listings
var Vibe = require('ui/vibe'); // Handles the vibrations
var ajax = require('ajax'); // Handles the data retrieval from external API:s



// VARIABLE DEFINITIONS ************************************************

var locationOptions = {
  enableHighAccuracy: true, 
  maximumAge: 10000, 
  timeout: 10000
};

// SET COMMON VARIABLES
var URLdatatype = 'json';

var keyNarliggandeHallplatser = '1a1cab30894d4f109a8051475a6d929d';
var keyRealtidsinformation = 'b3cff3b5c99e4ac880265c725811ddf5';

// These variabled will be replaced by real GPS locations
// var latitude = '59.23441';
// var longitude = '18.093774';
var NarliggandeHallplatserAntal = 20; // Max number of stations to retrieve
var NarliggandeHallplatserAvstand = 2000; // Radius in meters.

var timewindow = 60;

// DEFINE THE URL:S FOR RETIEVING DATA FROM API'S



// console.log('Närliggande URL:\n'+ URLnarliggandeHallplatser);

// Get the departure information for a certain station
// THe URL must be completed in the code belowe since we do not have 
// all the required information yet
var URLStationDepartures = 'http://api.sl.se/api2/realtimedepartures.' + URLdatatype;
URLStationDepartures = URLStationDepartures + '?key=' + keyRealtidsinformation;

var depatureItemsAmmount;

// FUNCTIONS **********************************************************

var parseFeedStations = function(data) {
	var ammountOfStations = jsonListCounter(data.LocationList.StopLocation);
	
	// Create the menu array
	var items = [];
  for(var i = 0; i < ammountOfStations; i++) 
	{
		// Get the station name
		var name =  data.LocationList.StopLocation[i].name;
		name = name.substring(0, name.indexOf(' (')); // remove unnecerecy part of the name
		
		// Get the distance to the station
		var distance = data.LocationList.StopLocation[i].dist;
		
    // Add to menu items array
    items.push({
      title:name,
      subtitle: distance + ' m'
    });
  }

  // Finally return whole array
  return items;
};


// This function takes a part of a Json object and
// returns the ammount of elements in that list
var jsonListCounter = function(indata)
{				
	var myObject = indata;
	var indataAntal = Object.keys(myObject).length; 
	return indataAntal;	
};


// This funktion alters information in depatureItems depending of it's contents
// We need different ways to handle the data since Trafiklab API provides different 
// Json-keys, depending on the type of viechle.
var depatureItemsShapeUp = function(depatureItems,TypeOfViechle)
{
	console.log('inifrån depatureItemsShapeUp: TypeOfViechle = '+TypeOfViechle);
	
	// Shape upp the BUSS data 
	if (TypeOfViechle == 'Buses')
	{
	// Sort the data on departure time accending (First depature comes first etc)
		depatureItems.sort(function(a, b){
 			var dateA=new Date(a.ExpectedDateTime), dateB=new Date(b.ExpectedDateTime);
 			return dateA-dateB; //sort by departure time ascending
		});
	
	// Loop trough all the departures and fix all data once and for all
	// This is to reduce the need of calling this function to often
		for (var i = 0 ; i < Object.keys(depatureItems).length ; i++)  
		{
		// Set the name of the viechle type to be displayed
			depatureItems[i].TransportModeText = 'Buss';	
			console.log(depatureItems[i].TransportModeText + ' ' + depatureItems[i].LineNumber + ' mot ' + depatureItems[i].Destination + ' avgår '+ depatureItems[i].DisplayTime);
			
		// Se the textsize of the destination depending of the ammount of letters in the destination name
			if (depatureItems[i].Destination.length > 14) {
  		  depatureItems[i].DestinationFont = 'Gothic-14-Bold';	
			} else {
		    depatureItems[i].DestinationFont = 'Gothic-28-Bold';	
			}				
		}		
	}
	
	// Shape upp the METRO data 
	if (TypeOfViechle == 'Metros')
	{
	// Sort the data on departure time accending (First depature comes first etc)
		depatureItems.sort(function(a, b)
		{
			var dateA=new Date(a.DisplayTime), 	dateB=new Date(b.DisplayTime);
 			return dateA-dateB; //sort by departure time ascending
		});
	
	// Loop trough all the departures and fix all data once and for all
	// This is to reduce the need of calling this function to often
		for (var i = 0 ; i < Object.keys(depatureItems).length ; i++)  
		{
		// Set the name of the viechle type to be displayed
			depatureItems[i].TransportModeText = 'Tunnelbana';	
			console.log(depatureItems[i].TransportModeText + ' ' + depatureItems[i].LineNumber + ' mot ' + depatureItems[i].Destination + ' avgår '+ depatureItems[i].DisplayTime);
			
		// Set the textsize of the destination depending of the ammount of letters in the destination name
			if (depatureItems[i].Destination.length > 14) {
  		  depatureItems[i].DestinationFont = 'Gothic-14-Bold';	
			} else {
		    depatureItems[i].DestinationFont = 'Gothic-28-Bold';	
			}				
		}		
	}

	// And finally return the data
		return depatureItems;
};






// THE SCRIPT **********************************************************

// Show a spash screen when the app is loaded to inform the user
// that the pebble is retrieving a list of nearby stations
var splashWindow = new UI.Window();

// ...and set the design of that splash scrren 
var text = new UI.Text({
	position: new Vector2(0, 0),
	size: new Vector2(144, 168),
	text: '\n\nSöker efter\nhållplatser i närheten\n\nVänta lite...',
	font:'GOTHIC-14-bold',
	color:'white',
	textOverflow:'wrap',
	textAlign:'center',
	backgroundColor:'black'	
});	

// Add to splashWindow and show
splashWindow.add(text);
splashWindow.show();



// Get GPS cords
function locationSuccess(gpspos) 
{
  console.log('lat= ' + gpspos.coords.latitude + ' lon= ' + gpspos.coords.longitude);
	var latitude = gpspos.coords.latitude;
	var longitude = gpspos.coords.longitude;
//	var latitude = 59.238657;
//	var longitude = 18.095166;
	console.log('latitude= ' + latitude + ' lon= ' + longitude);






// URL used to lookup nearby stations
var URLnarliggandeHallplatser = 'http://api.sl.se/api2/nearbystops.' + URLdatatype;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '?key=' + keyNarliggandeHallplatser;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&originCoordLat=' + latitude;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&originCoordLong=' + longitude;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&maxresults=' + NarliggandeHallplatserAntal;
URLnarliggandeHallplatser = URLnarliggandeHallplatser + '&radius=' + NarliggandeHallplatserAvstand;



// Get stations nearby
ajax(
  {
    url: URLnarliggandeHallplatser,
    type: URLdatatype
  },
  function(stationdata) // Found some stations nearby
		{
    // Create an array of Menu items
    var menuItems = parseFeedStations(stationdata);	
		
    // Construct Menu to show to user
		var stationsMenu = new UI.Menu({
      sections: [{
        title: 'Välj en station',
        items: menuItems
      }]
    });		
		
    // Add an action for SELECT
		stationsMenu.on('select', function(e)
		{
		// Get station ID for the selected station
			var stationID =  stationdata.LocationList.StopLocation[e.itemIndex].id;	
			stationID = stationID.substring(4, 9); // Remove unneccerary information
			
			// complete the URL 
			var stationURL = URLStationDepartures + '&siteid=' + stationID + '&timewindow=' + timewindow;
			console.log('stationURL\n' + stationURL);
			// Get data from the selected station
				ajax(
				{
					url: stationURL , 
					type: URLdatatype
				},
				function(departureData) // There are some departures from the selected station
				{
					stationURL = ''; // Empty the URL in order to avoid problems next time the user selects a station
					
					// Create the select vehicle menu object 
					// The user must select what kind of vehicle the user will jump on
					// (Comming soon) but only if there's more than one type av vehicle
					var viechleType = [] ;
					
						
					// Find out if any busses will depart from this station
					if (Object.keys(departureData.ResponseData.Buses).length > 0)
					{
						// Add to menu items array
						viechleType.push ({
							title: 'Buss',
							type: 'Buses'
						});	
						
					// Parse the DepartureData object and extact only the information about the busses
						var DepartureDataBuses = [];
						// DepartureDataBuses = JSON.parse(departureData).ResponseData.Buses; 
						DepartureDataBuses = departureData.ResponseData.Buses;
						
					// Sort the buss info according to departure time
						console.log('Det går '+ Object.keys(departureData.ResponseData.Buses).length + ' bussar ifrån '+stationdata.LocationList.StopLocation[e.itemIndex].name);
					}
					// Find out if any metros will depart from this station
					if (Object.keys(departureData.ResponseData.Metros).length > 0)
					{
					// Add to menu items array
						viechleType.push ({
							title: 'Tunnelbana',
							type: 'Metros'
						});	
						
					// Parse the DepartureData object and extact only the information about the metros
					//	var DepartureDataMetros = JSON.parse(departureData).ResponseData.Buses; 

						console.log('Det går '+ Object.keys(departureData.ResponseData.Metros).length + ' tunnelbanor ifrån '+stationdata.LocationList.StopLocation[e.itemIndex].name);
					}
					
					// Create and show the viechleType menu 
						var viechleTypetMenu = new UI.Menu({
							sections: [{
								title: 'Välj färdsätt:',
							items: viechleType // here is the station list
						}]
					});
					
					// Show the vehicle menu
					viechleTypetMenu.show();
					// Hide the temp splashwindow
					
					// Add an action for SELECT
					viechleTypetMenu.on('select', function(e)
					{
						// What kind of viechle did the user select?
							console.log('Användaren valde '+ viechleType[e.itemIndex].type);
						
						// A counter is neaded to identify the current departureinfoWindow
							var departureinfoWindowCounter = 0;
						
						// This array is needed to simplify the management of the depatrureinfo
						// The array will contain different items depending on
						// what kind of viechle the user selects.
							var depatureItems = [] ;
						
						// If the user selected Buses
						if (viechleType[e.itemIndex].type == 'Buses')
						{
						// Extract the Busses info
							depatureItems = departureData.ResponseData.Buses;
							
						// How many departures were found?
							depatureItemsAmmount = Object.keys(departureData.ResponseData.Buses).length;
							
						// Enchance the informtion and set some additional variables for the Buses content
							depatureItems = depatureItemsShapeUp(depatureItems,viechleType[e.itemIndex].type);
						}	
							
											
						// If the user selected Metros
						if (viechleType[e.itemIndex].type == 'Metros')
						{
						// Extract the Metros info	
							depatureItems = departureData.ResponseData.Metros;
							
						// How many departures were found?
							depatureItemsAmmount = Object.keys(departureData.ResponseData.Metros).length;
							
						// Enchance the informtion and set some additional variables for the Metros content
							depatureItems = depatureItemsShapeUp(depatureItems,viechleType[e.itemIndex].type);
						}												
						
						// Create the departureinfoWindow
							var departureinfoWindow = new UI.Window();
						
						// Create all the elements of the departureinfoWindow
							var departureinfoStationname = new UI.Text({
								position: new Vector2(0, 0),
								size: new Vector2(144, 18),
								text: depatureItems[departureinfoWindowCounter].StopAreaName,
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
								text: depatureItems[departureinfoWindowCounter].TransportModeText ,
								font: 'Gothic 14 Bold',
								color: 'white',
								backgroundColor: 'clear'	
							});
	
						// Create the text object containg line number
						var departureinfoLinenumber = new UI.Text({
								position: new Vector2(0, 30),
								size: new Vector2(144, 44),
								textAlign: 'center',
								text: depatureItems[departureinfoWindowCounter].LineNumber,
								font: 'Bitham 42 Bold',
								color: 'white',
								backgroundColor: 'clear'	
							});
		
						// Create the text object containg destination
							var departureinfoDestination = new UI.Text({
								position: new Vector2(0, 80),
								size: new Vector2(144, 30),
								textAlign: 'center',
								font: depatureItems[departureinfoWindowCounter].DestinationFont,
								text: depatureItems[departureinfoWindowCounter].Destination,
								color: 'white',
								backgroundColor: 'clear'	
							});
			
						// Create the text object containg departure time
							var departureinfoDeparturetime = new UI.Text({
								position: new Vector2(0, 106),
								size: new Vector2(144, 168),
								textAlign: 'center',
								text: depatureItems[departureinfoWindowCounter].DisplayTime,
								font: 'Bitham 42 Bold',
								color: 'white',
								backgroundColor: 'clear'	
							});						
	
						// Add all the elements to the departureinfoWindow
							departureinfoWindow.add(departureinfoStationname);
							departureinfoWindow.add(departureinfoViechle);
							departureinfoWindow.add(departureinfoLinenumber);
							departureinfoWindow.add(departureinfoDestination);
							departureinfoWindow.add(departureinfoDeparturetime);

						
						// Show thw departureinfoWindow	
							departureinfoWindow.show();
						
						// Add a down action to the departureinfoWindow
							departureinfoWindow.on('click', 'down', function() 
							{								
							// Make sure the user has not reached the last departureinfoWindow
								if (departureinfoWindowCounter < (depatureItemsAmmount - 1) )
								{				
									departureinfoWindowCounter++;
									console.log ('Avgång nr '+(departureinfoWindowCounter + 1)+' av '+ depatureItemsAmmount );
									departureinfoLinenumber.text(depatureItems[departureinfoWindowCounter].LineNumber);
									departureinfoDestination.font(depatureItems[departureinfoWindowCounter].DestinationFont);
									departureinfoDestination.text(depatureItems[departureinfoWindowCounter].Destination);
									departureinfoDeparturetime.text(depatureItems[departureinfoWindowCounter].DisplayTime);									
								}
							});
						
						// Add a up action to the departureinfoWindow
							departureinfoWindow.on('click', 'up', function() 
							{								
							// Make sure the user has not reached the last departureinfoWindow
								if (departureinfoWindowCounter > 0 )
								{				
									departureinfoWindowCounter--;
									console.log ('Avgång nr '+(departureinfoWindowCounter + 1)+' av '+ depatureItemsAmmount);
									departureinfoLinenumber.text(depatureItems[departureinfoWindowCounter].LineNumber);
									departureinfoDestination.font(depatureItems[departureinfoWindowCounter].DestinationFont);
									departureinfoDestination.text(depatureItems[departureinfoWindowCounter].Destination);
									departureinfoDeparturetime.text(depatureItems[departureinfoWindowCounter].DisplayTime);									
								}
							});
					});
				}
			);

		});
    // Show the Menu, hide the splash
    stationsMenu.show();
    splashWindow.hide();
		
		
  },
	
  function(error) // Did not find any stations
	{
		console.log('No data found: ' + error);
  }
);

} // end of locationSuccess


function locationError(err) {
  console.log('location error (' + err.code + '): ' + err.message);
}

// Make an asynchronous request
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);