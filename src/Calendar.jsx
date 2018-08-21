import React from 'react';

/* REACT COMPONENT DOC BLOCK

# Calendar

## INHERITED PROPERTIES
month:						The current month (YYYY-MM)
dates:						A list of date objects for the current month

## CALCULATED PROPERTIES
n/a

## STATES
n/a

## INHERITED CRITICAL METHODS
void advanceCalendar:		Move the calendar one forward
void reverseCalendar:		Move the calendar one back
void openCodex:				Open an event in the codex

## COMPONENT CRITICAL METHODS
int getMonthNum:			Use this.props.month to return monthNum
int getYearNum:				Use this.props.month to return yearNum
string getMonthName:		Return string name of 1-12 month


Author:	June McIntyre
Date:	June 27 2018
*/

class Calendar extends React.Component {
	/* Render function */
	// Render will return JSX. It's called on state updates
	render() {
		return (
			<div className="hystori-calendar hystori__calendar">
				<div className="hystori-calendar__month calendar-month">
					<ul className="calendar-month__list">
						<li onClick={() => this.props.reverseCalendar()} className="prev">&#10094;</li>
					    <li onClick={() => this.props.advanceCalendar()} className="next">&#10095;</li>
					    <li className={"calendar-month__title " + 
					    				"calendar-month__title--m" + this.getMonthNum() +
					    				" calendar-month__title--y" + this.getYearNum() +
					    				" calendar-month__title--my" + this.getMonthNum() + this.getYearNum()
					    }>
					    	<img alt="fleur de lys" src="/fleur.svg" className="calendar-month__logo" />
					    	{this.getMonthName(this.getMonthNum())}, {this.getYearNum()}
					    </li>
					</ul>
				</div>

				<ul className="hystori-calendar__weekdays calendar-weekdays">
					<li>dimanche</li>
					<li>lundi</li>
					<li>merdi</li>
					<li>mercredi</li>
					<li>jeudi</li>
					<li>vendredi</li>
					<li>samedi</li>
				</ul>

				<ul className="hystori-calendar__dates calendar-dates">
					{this.props.dates.map(date =>
						<li className={(this.getMonthNum() === date.month ? 'calendar-dates__box calendar-box calendar-box--inMonth' : 'calendar-dates__box calendar-box')} key={date.month + "-" + date.day}>
							<span className="calendar-box__day ">{date.day}</span>
							<ul className="calendar-box__events calendar-events">
								{date.events.map(event =>
									<li className="calendar-events__item" key={event.key} onClick={() => this.props.openCodex(event.key)}>{event.name}</li>
								)}
							</ul>
						</li>
					)}
				</ul>
			</div>
		);
	}

	/* Get month number function */
	// Will use serialized month/year to return the month number
	getMonthNum() {
		return this.props.month.substr(5,6);
	}

	/* Get year number function */
	// Will use serialized month/year to return the year number
	getYearNum() {
		return this.props.month.substr(0,4);
	}

	/* Get month name function */
	// Will return the string name of a month, given its 1-12 index
	getMonthName(num) {
		var monthNames = [
			"janvier",
			"février",
			"Mars",
			"avril",
			"mai",
			"juin",
			"juillet",
			"août",
			"septembre",
			"novembre",
			"décembre"
		];
		return (monthNames[parseInt(num-1, 10)]);
	}
}


export default Calendar;