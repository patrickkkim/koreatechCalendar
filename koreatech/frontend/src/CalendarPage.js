import React from 'react';
import axios from 'axios';
import { Link } from "react-router-dom";
import { renderTag, getFormattedDate, getUserHeaders } from './util.js'
import { FullEventModal } from './Modal.js'
import {
  Container, Badge, Button, Row, Col, Label,
} from 'reactstrap';

class DayContent extends React.Component {
  // props: toggle, handleClose, onClosed, events, 
  // votes, date, toggleAlert
  constructor(props) {
    super(props);
    this.state = {
      toggleModal: false,
    }
    this.toggleAlert = this.toggleAlert.bind(this);
  }

  // prevents component update whenever the mouse is hovering the button
  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.toggleModal !== nextState.toggleModal) {
      return true;
    }
    return !this.equals(this.props, nextProps)
  }

  // checks if the current prop and the next updating prop is same
  equals(props, nextProps) {
    if (props.events === nextProps.events && props.position === nextProps.position
      && props.dayString === nextProps.dayString) 
    {
      return true;
    } 
    else {
      return false
    }
  }

  toggleAlert(type) {
    this.props.toggleAlert(type);
    this.setState({toggleModal: false});
  }

  handleModalOpen() {
    this.setState({toggleModal: true});
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
        <Link className="stretched-link" to="#"
        onClick={() => this.handleModalOpen()} />
        {(this.props.events !== false) ? (
          <React.Fragment>
            <FullEventModal toggle={this.state.toggleModal} 
            handleClose={() => this.setState({toggleModal: false})}
            onClosed={() => this.props.onClosed()}
            events={this.props.events} votes={this.props.votes}
            date={this.props.date} toggleAlert={this.toggleAlert} />
          </React.Fragment>
          ) : null}
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderDayButton()}
        {this.props.renderEvent(this.props.events)}
      </React.Fragment>
    );
  }
}

class DayButton extends React.Component {
  //props: position, date, dayString, events, votes, toggleAlert, getVotes
  constructor(props) {
    super(props);
    this.state = {
      mouseOver: false,
    }
  }

  onClosed() {
    this.props.updateEvents();
    this.setState({mouseOver: false});
  }

  render() {
    return (
      <Col className="pt-1 pl-1"
      style={{backgroundColor: this.state.mouseOver ? "#e6e6e6" : "#ffffff",
      width: "100px", height: "100px"}}
      onMouseOver={() => this.setState({mouseOver: true})}
      onMouseOut={() => this.setState({mouseOver: false})}>
        <DayContent position={this.props.position} date={this.props.date}
        dayString={this.props.dayString} events={this.props.events} 
        votes={this.props.votes} onClosed={() => this.onClosed()} 
        toggleAlert={this.props.toggleAlert} renderEvent={this.props.renderEvent} />
      </Col>
    );
  }
}

export class BigCalendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      date: new Date(new Date().setDate(1)),
    }
    this.updateEvents = this.updateEvents.bind(this);
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
    if (this.props.fetching) {
      return false;
    }
    const date = this.state.date;
    const dateString = getFormattedDate(new Date(date.getFullYear(), 
      date.getMonth(), (day)))
    const eventList = [];
    for (let i = 0; i < this.props.events.length; ++i) {
      if (dateString === this.props.events[i]["startDate"]) {
        eventList.push(this.props.events[i]);
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

  updateEvents() {
    // fetching events from server and storing it
    const daysOfMonth = this.getDaysOfMonth();
    const endDate = new Date(new Date(this.state.date).setDate(daysOfMonth));
    const endDateString = getFormattedDate(endDate);
    const startDateString = getFormattedDate(new Date(this.state.date));
    this.props.getEvents(startDateString, endDateString);
    this.props.getVotes(startDateString, endDateString);
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
              const events = (position === "prev" || position === "next") 
                ? false : this.formatEventsByDate(dayCounter);
              const dayDate = new Date(new Date(this.state.date).setDate(dayCounter));
              return (
                <DayButton key={days + weeks*7} position={position} 
                dayString={dayString} events={events} votes={this.props.votes}
                date={dayDate} toggleAlert={this.props.toggleAlert}
                updateEvents={this.updateEvents} renderEvent={this.props.renderEvent} />
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
        <div className="mt-3 mb-4">
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
              <Label className={"my-0 small " + (
                (weekday === "일요일" || weekday === "토요일") ?
                (weekday === "일요일" ? "text-danger" : "text-primary") : "")}>
                {weekday}
              </Label>
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
    this.state = {
      events: [],
      votes: [],
      fetching: true,
      fetchingVote: true,
    }
    this.getEvents = this.getEvents.bind(this);
    this.getVotes = this.getVotes.bind(this);
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

  getVotes(startDate, endDate) {
    const headers = getUserHeaders();
    if (!headers) {
      return;
    }
    axios.get("votes/", {
      params: {
        startDate: startDate,
        endDate: endDate,
      },
      headers
    })
    .then(response => response)
    .then(result => {
      this.setState({votes: result.data, fetchingVote: false});
    })
    .catch(error => {
      alert(error);
    })
  }

  // renders the event badge
  renderEvent(events) {
    if (events === false) {
      return;
    }
    const tagList = {"important": false, "gather": false, "bachelor": false, 
      "assignment": false, "etc": false, "null": false};
    return (
      <div>
        {events.map( event => {
          // check for duplicate tag and if they are, ignore them
          if (!tagList[event["tag"]]) {
            tagList[event["tag"]] = true;
          } else if (event["tag"] === null) {
            if (!tagList["null"]) {
              tagList["null"] = true;
            } else {
              return false;
            }
          } else {
            return false;
          }
          return (
            <Badge className="d-inline-block" key={event.id} 
            color={renderTag(event.tag)["color"]} pill>‏‏‎!</Badge>
          );}
        )}
      </div>
    );
  }

  render() {
    return (
      <div className="mt-5">
        <Container className="d-flex justify-content-center">
          <BigCalendar toggleAlert={this.props.toggleAlert} getEvents={this.getEvents}
          getVotes={this.getVotes} events={this.state.events} votes={this.state.votes}
          fetching={this.state.fetching} renderEvent={this.renderEvent} />
        </Container>
      </div>
    );
  }
}

export default CalendarPageApp;