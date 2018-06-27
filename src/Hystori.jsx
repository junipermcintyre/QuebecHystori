import React from 'react';
import Calendar from './Calendar.jsx';
import Codex from './Codex.jsx';

/* REACT COMPONENT DOC BLOCK

# Hystori

## PROPERTIES
data:			Contains 'HystoriData' in JSON format
calMonths:		Contains unique list of year-months '2018-01' where data.events exist

## STATES
calPos:			Index of current place in interestingMonth
codex:			Either null (not open), or set to an event
codexStack:		Either empty array, or a stac (array) of events (minus codex)

## CRITICAL METHODS
void advanceCal:						Advance the position by one (or flash error if at end)
void reverseCal:						Reverse position by one (or flash error if at 0)
void openEntity(key):					Add codex to codexStack, set codex to getEntity(key)
entity getEntity(key):					Locate a specific entity by key, in data
void setCodexStack(int):				Pop down to int, set the last pop to codex
void closeCodex():						Close the codex (null), empty codex stack
events getEventsByMonth(month):			Get an array of events, when passed a month ("1996-11")
events getEventsByDay(day):				Get an array of events, when passed a day ("1996-11-09")
dates buildCalendarDateObjects(month):	Get an array of dates (month/year/day/events[]) for a given month, with backspill/frontspill on 42(?) day calendar

Author:	June McIntyre
Date:	June 27 2018
*/

class Hystori extends React.Component {
	/* Constructor */
	// constructor will always process/set properties or states for the component
	constructor(props) {							// The only expected props are the HystoriData
		super(props);								// Some React thing idk idc
		var events = this.props.data.events;
		var months = [];
		for (var i = 0; i < events.length; i++) {	// Build a list of months for the calendar based on interesting dates
			if (months.indexOf(events[i].date.substr(0,7)) === -1)	// If it's not already in
				months.push(events[i].date.substr(0,7));
		}
		this.data = this.props.data;	// Set the properties for Hystori
		this.calMonths = months;		// these two are more or less constant
		this.state = {					// Set the states (not constant, should trigger re-render)
			calPos: 0,
			codex: null,
			codexStack: []
		};
		this.openEntity = this.openEntity.bind(this);	// Bind some of the functions, to share them with component children statically
		this.getEntity = this.getEntity.bind(this);
		this.closeCodex = this.closeCodex.bind(this);
		this.advanceCal = this.advanceCal.bind(this);
		this.reverseCal = this.reverseCal.bind(this);
	}

	/* Render function */
	// Render will return JSX. It's called on state updates
	render() {
		var calDates = this.buildCalendarDateObjects(this.calMonths[this.state.calPos]);
		return (
			<div className="hystori">
				<Calendar 
					month={this.calMonths[this.state.calPos]}
					dates={ calDates } 
					advanceCalendar={this.advanceCal} 
					reverseCalendar={this.reverseCal} 
					openCodex={this.openEntity}
				/>
				<Codex 
					entity={this.state.codex}
					codexStack={this.state.codexStack}
					openCodex={this.openEntity}
					closeCodex={this.closeCodex}
					getEntity={this.getEntity}
				/>
			</div>
		);
	}

	/* Advance calendar function */
	// Moves the calendar one forward. Flashes a message in console on error
	advanceCal() {
		if (this.state.calPos < this.calMonths.length - 1)
			this.setState({calPos: this.state.calPos + 1});
		else
			console.error("Out of array bounds exception - Advancing from calPos " + this.state.calPos + ". Total length is " + this.calMonths.length);
	}

	/* Reverse Calendar Function */
	// Moves the calendar one backward. Flashes a message in console on error
	reverseCal() {
		if (this.state.calPos > 0)
			this.setState({calPos: this.state.calPos - 1});
		else
			console.error("Out of array bounds exception - Decreasing from calPos " + this.state.calPos + ". Total length is " + this.calMonths.length);
	}

	/* Get an entity function */
	// Returns an entity from this.data when passed it's key
	getEntity(key) {
		for (var j = 0; j < this.data.events.length; j++)			// Quick 3x loop thru key check
			if (this.data.events[j].key === key)
				return Object.assign({}, this.data.events[j]);		// Events
		for (var k = 0; k < this.data.people.length; k++)
			if (this.data.people[k].key === key)
				return Object.assign(this.data.people[k]);			// People
		for (var l = 0; l < this.data.organizations.length; l++)
			if (this.data.organizations[l].key === key)
				return Object.assign(this.data.organizations[l]);	// Organizations
		return null;
	}

	/* Open an entity function */
	// Opens an entity in the codex
	openEntity(key) {
		var e = this.getEntity(key);
		if (e !== null) {
			var myCodex = Object.assign({}, this.state.codex);	// Copy over our states
			var myCodexStack = JSON.parse(JSON.stringify(this.state.codexStack));

			myCodexStack.push(myCodex);	// Modify them (add the current codex to stack)
			myCodex = e;				// (set current codex to the found one)

			this.setState({codex: myCodex, codexStack: myCodexStack});
		} else {
			console.error("Could not open entity with key " + key);
		}
	}

	/* Set position in codex stack function */
	// Move codex stack so that top = array index of n (multiple pops)
	setCodexStack(n) {
		if (n < this.state.codexStack.length)	// Throw an error if nothing is going to happen
			console.error("Attempting to set codex stack to " + n + " when length is " + this.state.codexStack.length);
		var myCodexStack = Object.assign({}, this.state.codexStack);
		while (myCodexStack.length > n + 1)			// Pop off the unneeded ones
			myCodexStack.pop();
		this.setState({codexStack: myCodexStack});	// Re-save
	}

	/* Close the codex function */
	// Set the codex to null, the stack to empty
	closeCodex() {
		this.setState({codex: null, codexStack: []});
	}

	/* Get events by yyyy-mm function */
	// Pass it a year/month like "1996-11" and it will return an array of events in the month
	getEventsByMonth(month) {
		var myEvents = this.data.events;							// De-reference everything
		var myEventsArray = [];										// Collect events in here
		for (var i = 0; i < myEvents.length; i++)					// Loop over events
			if (myEvents[i].date.substr(0,7) === month)				// If its a match
				myEventsArray.push(Object.assign({}, myEvents[i]));	// Add it
		if (myEventsArray.length === 0)								// If there weren't any
			console.error("No events found in month " + month);			// Let someone know
		return myEventsArray;										// Fini
	}

	/* Get events by yyyy-mm-dd function */
	// Pass it a year/month/day like "1996-11" and it will return an array of events in the day
	getEventsByDay(day) {
		var ints = day.split('-');		// Ensure the string is formatted correctly
		var fMonth = "0"+ints[1];		// This is just a long-ass way of padding 0s
		fMonth = fMonth.substr(fMonth.length-2);
		var fDay = "0"+ints[2];
		fDay = fDay.substr(fDay.length-2);
		day = ints[0] + '-' + fMonth + '-' + fDay;

		var myEvents = this.data.events;	// This is like the same function as above, except for the padding
		var myEventsArray = [];
		for (var i = 0; i < myEvents.length; i++){
			if (myEvents[i].date === day)	// Except for this line (no subtr)
				myEventsArray.push(Object.assign({}, myEvents[i]));
		}
		/*if (myEventsArray.length === 0)
			console.error("No events found on day " + day);*/ // Little angry..
		return myEventsArray;
	}

	/* Build dates for year, month */
	// Pass in a year and month, and get the date object array w/ backspill and frontspill
	buildCalendarDateObjects(monthStr) {
		var year = monthStr.substr(0,4);
		var month = monthStr.substr(5,6);
		var calendarDates = [];								// Return dates in the month, with some filler on each side

		// This will necessarily spill outside the month and year
		var backspill = new Date(year, month, 0).getDay();	// Backspill = dayofweek for year-month-01 (assuming dayof week starts at 0, Sunday)
		var prevCalendarMonth = month - 1;
		var prevCalendarYear = year;
		if (prevCalendarMonth === 0) {
			prevCalendarMonth = 12;
			prevCalendarYear = prevCalendarYear - 1;
		}

		var daysInMonth = new Date(year, month, 0).getDate();

		var forwardspill = 42 - (backspill + daysInMonth);	// Forwardspill = (42 - (backspill + days in month))
		var postCalendarMonth = parseInt(month, 10) + 1;
		var postCalendarYear = year;
		if (postCalendarMonth === 13) {
			postCalendarMonth = 1;
			postCalendarYear = parseInt(postCalendarYear, 10) + 1;
		}

		// Use the backspill to add "dates", the days, and then the forward spill. Dates look like:
		// {'day' => 1-31, 'month' => 1-12, events: events...}
		var backDaysTotal = new Date(prevCalendarYear, prevCalendarMonth, 0).getDate();
		var backOffset = backDaysTotal - (backspill - 1);
		for (var l = backOffset; l <= backDaysTotal; l++) {
			var myEvents = this.getEventsByDay(prevCalendarYear+'-'+prevCalendarMonth+'-'+l);
			calendarDates.push({day: l, month: prevCalendarMonth, events: myEvents});
		}

		for (var m = 1; m <= daysInMonth; m++) {	// Now do the regular days
			myEvents = this.getEventsByDay(year+'-'+month+'-'+m);
			calendarDates.push({day: m, month: month, events: myEvents});
		}

		for (var n = 1; n <= forwardspill; n++) {	// Now the forwardspill (afterspill?)
			myEvents = this.getEventsByDay(postCalendarYear+'-'+postCalendarMonth+'-'+n);
			calendarDates.push({day: n, month: postCalendarMonth, events: myEvents});
		}

		return calendarDates;
	}
}


export default Hystori;