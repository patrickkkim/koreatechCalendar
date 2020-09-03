import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { renderTag, getFormattedDate } from './util.js'
import {
  Container, Badge, Button, Row, Col, Label,
} from 'reactstrap';

class DayContent extends React.Component {
  // prevents component update whenever the mouse is hovering the button
  shouldComponentUpdate(nextProps, nextState) {
    return !this.equals(this.props, nextProps)
  }

  // checks if the current prop and the next updating prop is same
  equals(props, nextProps) {
    if (props.event === nextProps.event && props.position === nextProps.position
      && props.dayString === nextProps.dayString) 
    {
      return true;
    } 
    else {
      return false
    }
  }

  // renders the event badge
  renderEvent() {
    if (this.props.event === false) {
      return;
    }
    return (
      <div>
        {this.props.event.map( event => 
          <Badge className="d-inline-block" key={event.id} 
          color={renderTag(event.tag)["color"]} pill>‏‏‎!</Badge>
        )}
      </div>
    );
  }

  // renders the day label and connects it to a stretched link
  renderDayButton() {
    const position = this.props.position;

    return (
      <div>
        <Label className="m-0"
        style={{color: (position === "prev" || position === "next") ? "#cecece" : ""}}>
          {this.props.dayString}
        </Label>
        <Link className="stretched-link" to="#"></Link>
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderDayButton()}
        {this.renderEvent()}
      </React.Fragment>
    );
  }
}

class DayButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false,
    }
  }

  render() {
    return (
      <Col className="pt-1 pl-1"
      style={{backgroundColor: this.state.mouseOver ? "#e6e6e6" : "#ffffff",
      width: "100px", height: "100px"}}
      onMouseOver={() => this.setState({mouseOver: true})}
      onMouseOut={() => this.setState({mouseOver: false})}>
        <DayContent position={this.props.position} 
        dayString={this.props.dayString} event={this.props.event} />
      </Col>
    );
  }
}

class BigCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(new Date().setDate(1)),
      events: [],
      fetching: true,
    }
  }

  componentDidMount() {
    this.updateEvents();
  }

  handleMonthChange = (e) => {
    e.preventDefault();
    const direction = parseInt(e.target.value);
    if (direction === 0) {
      const date = new Date(new Date().setDate(1));
      this.setState({date: date}, () => this.updateEvents());
      return;
    }
    const date = new Date(this.state.date);
    const newDate = new Date(
      date.getFullYear(), date.getMonth() + direction, 1
    );
    this.setState({date: newDate}, () => this.updateEvents());
  }

  formatEventsByDate(day) {
    if (this.state.fetching) {
      return false;
    }
    const date = this.state.date;
    const dateString = getFormattedDate(new Date(date.getFullYear(), 
      date.getMonth(), (day)))
    const eventList = [];
    const tagList = {"important": false, "gather": false, "bachelor": false, 
      "assignment": false, "etc": false, None: false}
    for (let i = 0; i < this.state.events.length; ++i) {
      if (dateString === this.state.events[i]["startDate"]) {
        if (!tagList[this.state.events[i]["tag"]]) {
          eventList.push(this.state.events[i]);
          tagList[this.state.events[i]["tag"]] = true;
        }
      }
    }
    if (eventList.length > 0) {
      return eventList;
    } else {
      return false;
    }
  }

  getDaysOfMonth(monthRange=0) {
    const days = new Date(
      this.state.date.getFullYear(), this.state.date.getMonth() + monthRange + 1, 0
    );
    return days.getDate();
  }

  getEvents(startDate, endDate) {
    axios.get("eventsbydate/", {
      params: {
        startDate: startDate,
        endDate: endDate,
      }
    })
    .then(response => response)
    .then(result => {
      this.setState({events: result.data, fetching: false})
    })
    .catch(error => alert(error))
  }

  updateEvents() {
    // fetching events from server and storing it
    const daysOfMonth = this.getDaysOfMonth();
    const endDate = new Date(new Date(this.state.date).setDate(daysOfMonth));
    const endDateString = getFormattedDate(endDate);
    const startDateString = getFormattedDate(new Date(this.state.date));
    this.getEvents(startDateString, endDateString);
  }

  renderDate() {
    const daysOfMonth = this.getDaysOfMonth();
    const prevDOM = this.getDaysOfMonth(-1);
    const dayOfWeek = new Date(this.state.date.getFullYear(), 
      this.state.date.getMonth(), 1).getDay();
    let dayCounter = 0; // iterator for days that should be displayed(1~30,31)
    let position = ""; // flag for if the iterator is in previous or next month

    return (
      Array.from(Array(6).keys()).map( weeks => {
        if (dayCounter >= daysOfMonth) {
          return false;
        }
        return (
          <Row className="" key={weeks}>
            {Array.from(Array(7).keys()).map( days => {
              position = "";
              if ((days + weeks*7) >= dayOfWeek) {
                // Increment the dayCounter if it reached 1st of the month.
                dayCounter += 1;
              }
              else {
                position = "prev";
              }
              if (dayCounter > daysOfMonth) {
                position = "next";
              }
              const dayString = (position === "prev") ? (prevDOM - (dayOfWeek-1) 
                + days) : ((position === "next") ? (dayCounter - daysOfMonth) 
                : dayCounter)
              const event = (position === "prev" || position === "next") 
                ? false : this.formatEventsByDate(dayCounter);
              return (
                <DayButton key={days + weeks*7} position={position} 
                dayString={dayString} event={event} />
              );
            })}
          </Row>
        )
      })
    );
  }

  renderCalendar() {
    return (
      <Container className="">
        <div className="mb-3">
          <Button className="mr-2" outline color="secondary" value={-1}
          onClick={this.handleMonthChange}>
            이전
          </Button>
          <Button className="mr-2" outline color="secondary" value={1}
          onClick={this.handleMonthChange}>
            다음
          </Button>
          <Button className="" outline color="info" value={0}
          onClick={this.handleMonthChange}>
            오늘
          </Button>
          <Label className="ml-5 h4 float-right">
            {this.state.date.getFullYear()}년 {this.state.date.getMonth()+1}월
          </Label>
        </div>
        <Container className="border">
          <Row className="">
          {["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"].map( weekday => 
            <Col className="p-1 px-4" key={"weekday;" + weekday}>
              <Label className="m-0 small">{weekday}</Label>
            </Col>
          )}
          </Row>
          {this.renderDate()}
        </Container>
      </Container>
    )
  }

  render() {
    return (
      <div>
        {this.renderCalendar()}
      </div>
    )
  }
}

class CalendarPageApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  render() {
    return (
      <div className="mt-5">
        <Container className="d-flex justify-content-center">
          <BigCalendar />
        </Container>
      </div>
    );
  }
}

export default CalendarPageApp;