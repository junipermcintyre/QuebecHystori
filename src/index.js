import HystoriData from './hystoridata.json';
import React from 'react';
import ReactDOM from 'react-dom';
import Parser from 'html-react-parser';
import './index.css';

var showdown  = require('showdown'),
    converter = new showdown.Converter();

// Main class
class Hystori extends React.Component {
	constructor(props) {
		super(props);
		// Collect a whole wack of Hystori data
		var years = [];
		var eventsByYear = {};
		for (var i = 0; i < HystoriData.events.length; i++) {

			// Get each year
			if (years.indexOf(getYear(HystoriData.events[i].date)) === -1)
				years.push(getYear(HystoriData.events[i].date));

			// Sort each event by year
			if(!eventsByYear.hasOwnProperty(getYear(HystoriData.events[i].date)))
				eventsByYear[getYear(HystoriData.events[i].date)] = [];
			eventsByYear[getYear(HystoriData.events[i].date)].push(HystoriData.events[i]);
		}

		this.state = {
			years: years,
			currentYear: years[0],
			currentMonth: 1,	// January
			events: HystoriData.events,
			eventsByYear: eventsByYear,
			people: HystoriData.people,
			organizations: HystoriData.organizations,
			codexOpen: false,
			currentEntity: null
		};

		// Bind some stuff explicitly
		this.openCodex = this.openCodex.bind(this);
		this.getEntity = this.getEntity.bind(this);
		this.setCalendar = this.setCalendar.bind(this);
		
	}

	setCalendar(month, year) {
		this.setState({currentMonth: month, currentYear: year});
	}

	// Given a year, set the state to it
	handleYearClick(year) {
		this.setState({currentYear: year});
	}

	// Open the codex state, with the current entity! (both states)
	openCodex(key) {
		this.setState({
			codexOpen: true,
			currentEntity: this.getEntity(key)
		});
	}

	// Return a given entity, depending on key
	getEntity(key) {
		for (var j = 0; j < this.state.events.length; j++) {
			if (this.state.events[j].key === key)
				return Object.assign({}, this.state.events[j]);
		}

		for (var k = 0; k < this.state.people.length; k++) {
			if (this.state.people[k].key === key)
				return Object.assign(this.state.people[k]);
		}

		for (var l = 0; l < this.state.organizations.length; l++) {
			if (this.state.organizations[l].key === key)
				return Object.assign(this.state.organizations[l]);
		}

		return null;
	}

	buildCalendarArray(year, month) {
		// Return dates in the month, with some filler on each side
		var calendarDates = [];

		// This will necessarily spill outside the month and year
		// Backspill = dayofweek for year-month-01 (assuming dayof week starts at 0, Sunday)
		// Forwardspill = (42 - (backspill + days in month))
		var backspill = new Date(year, month, 0).getDay();
		var prevCalendarMonth = month - 1;
		var prevCalendarYear = year;
		if (prevCalendarMonth === 0) {
			prevCalendarMonth = 12;
			prevCalendarYear = prevCalendarYear - 1;
		}

		var daysInMonth = new Date(year, month, 0).getDate();

		var forwardspill = 42 - (backspill + daysInMonth);
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
			var _e = this.getEventsOn(prevCalendarYear, prevCalendarMonth, l);
			calendarDates.push({day: l, month: prevCalendarMonth, events: _e});
		}

		// Now do the regular days
		for (var m = 1; m <= daysInMonth; m++) {
			_e = this.getEventsOn(year, month, m);
			calendarDates.push({day: m, month: month, events: _e});
		}

		// Now the forwardspill (afterspill?)
		for (var n = 1; n <= forwardspill; n++) {
			_e = this.getEventsOn(postCalendarYear, postCalendarMonth, n);
			calendarDates.push({day: n, month: postCalendarMonth, events: _e});
		}

		return calendarDates;
	}

	getEventsOn(year, month, day) {
		var _ev = [];
		for (var _i = 0; _i < this.state.events.length; _i++) {
			if (this.state.events[_i].date === this.formatDate(year, month, day))
				_ev.push(Object.assign({}, this.state.events[_i]));
		}
		return _ev;
	}

	formatDate(year, month, day) {
		var _month = "0"+month.toString();
		var _day = "0"+day.toString();
		return year.toString() + "-" + _month.substr(_month.length-2) + "-" + _day.substr(_day.length-2);
	}

	// Get JSX for entity with matching key
	getEntityJSX(_k) {
		var _en = this.getEntity(_k);
		if (_en !== null) {
			var _desc = converter.makeHtml(_en.description);
			_desc = Parser(_desc, {
				replace: domNode => {
					console.log(domNode);
					if (domNode.attribs !== undefined && domNode.attribs.type !== undefined && domNode.attribs.type === 'link') {
						var _replaceEvent = this.getEntity(domNode.attribs.key);
						return (<span className="codex-description__link" onClick={() => this.openCodex(_replaceEvent.key)}>{domNode.children[0].data}</span>);
					}
				}
			});

			return (
				<React.Fragment>
					<p className="hystori-codex__title">{_en.name}</p>
					<p className="hystori-codex__key">{_en.key}</p>
					<div className="hystori-codex__description codex-description">{_desc}</div>
				</React.Fragment>
			);
		}

		console.error("Could not build JSX for entity with key: " + _k);
		return null;
	}

	// Simple close codex
	closeCodex() {
		this.setState({
			currentEntity: null,
			codexOpen: false
		});
	}

	render() {
		// Get dats in this month
		var monthDates = this.buildCalendarArray(this.state.currentYear, this.state.currentMonth);

		// Get the entity JSX if it's available
		var entity = <p className="hystori-codex__no-entity">No entry selected!</p>;
		if (this.state.currentEntity !== null)
			entity = this.getEntityJSX(this.state.currentEntity.key)

		return (
			<div className="hystori">
				<div className="hystori-body hystori__body">
					<Calendar dates={monthDates} month={this.state.currentMonth} year={this.state.currentYear} eventClick={this.openCodex} setCalendar={this.setCalendar} />
				</div>
				<div className="hystori-sidebar hystori__sidebar">
					<p className="hystori-sidebar__title">Years</p>
					<ul className="hystori-year-list">
						{this.state.years.map(year =>
							<li onClick={() => this.handleYearClick(year)} key={year} className={(parseInt(this.state.currentYear,10) === parseInt(year,10) ? 'hystori-year-list__item active' : 'hystori-year-list__item')}>{year}</li>
						)}
					</ul>
				</div>
				<div className={this.state.codexOpen ? 'hystori-codex hystori-codex--active' : 'hystori-codex'}>
					<span className="hystori-codex__close" onClick={() => this.closeCodex()}>&times;</span>
					{entity}
				</div>
			</div>
		);

		//<Calendar />
		// <Codex />
	}
}

// Calendar class
class Calendar extends React.Component {
	render() {
		var _nextYear = this.props.year;
		var _prevYear = this.props.year;
		var _nextMonth = parseInt(this.props.month, 10) + 1;
		if (_nextMonth === 13) {
			_nextMonth = 1;
			_nextYear = parseInt(_nextYear, 10) + 1;
		}
		var _prevMonth = this.props.month - 1;
		if (_prevMonth === 0) {
			_prevMonth = 12;
			_prevYear = _prevYear - 1;
		}

		return (
			<div className="hystori-calendar">
				<div className="hystori-calendar__month calendar-month">
					<ul className="calendar-month__list">
						<li onClick={() => this.props.setCalendar(_prevMonth, _prevYear)} className="prev">&#10094;</li>
					    <li onClick={() => this.props.setCalendar(_nextMonth, _nextYear)} className="next">&#10095;</li>
					    <li>{this.getMonthName(this.props.month)}, {this.props.year}</li>
					</ul>
				</div>

				<ul className="hystori-calendar__weekdays calendar-weekdays">
					<li>Sunday</li>
					<li>Monday</li>
					<li>Tuesday</li>
					<li>Wednesday</li>
					<li>Thursday</li>
					<li>Friday</li>
					<li>Saturday</li>
				</ul>

				<ul className="hystori-calendar__dates calendar-dates">
					{this.props.dates.map(date =>
						<li className={(this.props.month === date.month ? 'calendar-dates__box calendar-box calendar-box--inMonth' : 'calendar-dates__box calendar-box')} key={date.month + "-" + date.day}>
							<span className="calendar-box__day ">{date.day}</span>
							<ul className="calendar-box__events calendar-events">
								{date.events.map(event =>
									<li className="calendar-events__item" key={event.key} onClick={() => this.props.eventClick(event.key)}>{event.name}</li>
								)}
							</ul>
						</li>
					)}
				</ul>

				<div className="hystori-calendar__month calendar-month">
					<ul className="calendar-month__list">
						<li onClick={() => this.props.setCalendar(_prevMonth, _prevYear)} className="prev">&#10094;</li>
					    <li onClick={() => this.props.setCalendar(_nextMonth, _nextYear)} className="next">&#10095;</li>
					    <li>{this.getMonthName(this.props.month)}, {this.props.year}</li>
					</ul>
				</div>
			</div>
		);
	}

	getMonthName(num) {
		var _ms = [
			"January",
			"February",
			"March",
			"April",
			"May",
			"June",
			"July",
			"August",
			"September",
			"October",
			"November",
			"December"
		];
		return (_ms[num-1]);
	}
}


// Helpers functions
// d is always date in format YYYY-MM-DD
function getYear(d) {
	return d.slice(0,4); //'YYYY'
}

// Commenting because "no-unused-vars" warning
/*function getMonth(d) {
	return d.slice(5,7); //'MM'
}

function getDay(d) {
	return d.slice(-2); //'DD'
}*/



// Render to root #id
ReactDOM.render(<Hystori />, document.getElementById('root'));
