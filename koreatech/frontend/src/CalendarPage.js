import React from 'react';
import axios from 'axios';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment';
import {
  Container, 
} from 'reactstrap';

moment.locale("ko", {
  weekdays: "월요일_화요일_수요일_목요일_금요일_토요일_일요일".split("_")
})
const localizer = momentLocalizer(moment);
let formats = {
  weekdayFormat: "dddd",
  dayFormat: "dddd(D)",
  dateFormat: "D",
  monthHeaderFormat: "YYYY년 M월"
}

class CalendarPageApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
    }
  }

  render() {
    return (
      <div className="mt-5">
        <Container className="d-flex justify-content-center">
          <Calendar className=""
          localizer={localizer} events={this.state.events} formats={formats}
          views={['month', 'week']} style={{ height: 700, width: 1000}} />
        </Container>
      </div>
    );
  }
}

export default CalendarPageApp;