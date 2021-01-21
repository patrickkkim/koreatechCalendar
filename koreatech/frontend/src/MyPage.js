import React from 'react';
import axios from 'axios';
import { renderTag, renderDateAsString, getUserHeaders } from './util.js';
import { 
  NicknameChangeModal, PasswordChangeModal, AccountDeleteModal,
} from './Modal';
import { Event } from './App.js';
import { BigCalendar } from './CalendarPage.js';
import { Switch, Route, Link, useRouteMatch } from "react-router-dom";
import {
  Button, FormText, Label, Container, Nav, NavItem, NavLink, InputGroupButtonDropdown,
  Input, Col, Row, Badge
} from 'reactstrap';

class Utilities {
  static renderCategoryBorder(text) {
    return(
      <div className="mt-5">
        <Label className="text-muted">
          <small><strong>{text}</strong></small>
        </Label>
        <div className="border-bottom mb-4"></div>
      </div>
    );
  }

  static renderBigTitle(text) {
    return (
      <Label className="mt-5 display-4">{text}</Label>
    );
  }

  static renderPaginateBtn(start, total, handleClick) {
    if (start >= total) {
      return;
    }
    return (
      <Button className="mt-5" color="link" 
      onClick={handleClick}>
        더 보기...
      </Button>
    );
  }
}

class InfoBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      authenticating: true,
      togglePassword: false,
      toggleNickname: false,
      toggleAccountDelete: false,
    };
  }

  componentDidMount() {
    this.authenticateUser();
  }

  authenticateUser() {
    const headers = {"Authorization": "Token " + 
      JSON.parse(localStorage.getItem("key"))}
    axios.get("/authenticate", {
      headers: headers,
    })
    .then(result => {
      this.setState({user: result.data[0], authenticating: false});
    }).catch(error => {
      alert(error);
    });
  }

  render() {
    return (
      <Container className="col-6 d-flex justify-content-center">
        <div className="my-5 px-5 pb-5 border" 
        style={{backgroundColor: "white", minWidth: "800px"}}>
          {Utilities.renderBigTitle("계정 수정")}
          {Utilities.renderCategoryBorder("기본정보 수정")}
          <div>
            <Label className="h6">닉네임 변경</Label>
            <Button outline color="primary" className="float-right"
            onClick={() => this.setState(
              {toggleNickname: !this.state.toggleNickname}
            )}>변경</Button>
            <FormText className="my-0">
              {!this.state.authenticating ? this.state.user.nickname : null}
            </FormText>
          </div><br/>
          <div className="my-4">
            <Label className="h6">비밀번호 변경</Label>
            <Button outline color="primary" className="float-right"
            onClick={() => this.setState(
              {togglePassword: !this.state.togglePassword}
            )}>변경</Button>
          </div>
          <NicknameChangeModal toggle={this.state.toggleNickname} 
          handleClose={() => this.setState(
            {toggleNickname: !this.state.toggleNickname}
          )} />
          <PasswordChangeModal toggle={this.state.togglePassword} 
          handleClose={() => this.setState(
            {togglePassword: !this.state.togglePassword}
          )} />
          {Utilities.renderCategoryBorder("계정 삭제")}
          <div>
            <Label></Label>
            <Button outline color="danger" className="float-right"
            onClick={() => this.setState(
              {toggleAccountDelete: !this.state.toggleAccountDelete}
            )}>계정삭제</Button>
          </div>
          <AccountDeleteModal toggle={this.state.toggleAccountDelete}
          handleClose={() => this.setState(
            {toggleAccountDelete: !this.state.toggleAccountDelete}
          )} />
        </div>
      </Container>
    );
  }
}

class ManagePostBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userEvent: [],
      userVotes: [],
      totalCount: 0,
      orderBy: "recent",
      pagStart: 0,
      pagCount: 5,
    };
    this.handlePaginateClick = this.handlePaginateClick.bind(this);
    this.handleSortOrderChange = this.handleSortOrderChange.bind(this);
  }

  componentDidMount() {
    this.getTotalEventCount();
    this.getEvents();
  }

  getTotalEventCount() {
    axios({
      method: 'get',
      url: '/events/count',
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))}
    })
    .then(result => {
      this.setState({totalCount: result.data})
    })
  }

  getEvents() {
    axios({
      method: 'get',
      url: '/events',
      params: {
        orderBy: this.state.orderBy,
        pagStart: this.state.pagStart,
        pagCount: this.state.pagCount,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
    })
    .then(result => {
      this.setState(
        {
          userEvent: [...this.state.userEvent, ...result.data],
          pagStart: this.state.pagStart + this.state.pagCount,
        },
        this.getVotes(result.data)
      );
    })
    .catch(error => alert(error));
  }

  getVotes(events) {
    let eventIds = [];
    for (let i = 0; i < events.length; ++i) {
      eventIds.push(events[i].id)
    }
    axios({
      method: 'get',
      url: '/votes',
      params: {
        eventIds: JSON.stringify(eventIds),
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))}
    })
    .then(result => {
      this.setState({userVotes: [...this.state.userVotes, ...result.data]});
    })
    .catch(error => alert(error));
  }

  handlePaginateClick(e) {
    e.preventDefault();
    this.getEvents();
  }

  handleSortOrderChange(e) {
    e.preventDefault();
    this.setState({userEvent: [], userVotes: [], pagStart: 0, orderBy: e.target.value}, 
      this.getEvents
    );
  }

  renderUserEvents() {
    return (
      <div className="my-4">
        {this.state.userEvent.map( (event, index) => {
          const createdDate = new Date(event.createdDate);
          return (
            <div key={"event;" + event.id} className="mb-5">
              <Label></Label>
              <Event event={event} vote={this.state.userVotes.find(
              obj => {return obj.event_id === event.id})} 
              addDate={[event.startDate, event.endDate]}
              noteStyle="h6" />
              <FormText className="float-right mt-0"> 
                {"작성날짜: " + renderDateAsString("fullNumeral", createdDate)}
              </FormText>
            </div>
          );
        })}
      </div>
    );
  }

  renderSortForm() {
    return (
      <div>
        <Label></Label>
        <Col className="px-0 float-right" md={2}>
          <InputGroupButtonDropdown addonType="prepend">
            <Input type="select" name="orderBy" onChange={this.handleSortOrderChange}>
              <option value="recent">최신순</option>
              <option value="past">작성날짜순</option>
            </Input>
          </InputGroupButtonDropdown>
        </Col>
      </div>
    );
  }

  render() {
    return (
      <Container className="col-6 d-flex justify-content-center">
        <div className="my-5 px-5 pb-5 border" 
        style={{backgroundColor: "white", minWidth: "800px"}}>
          {Utilities.renderBigTitle("내가 작성한 게시글 관리")}
          {Utilities.renderCategoryBorder()}
          {this.renderSortForm()}
          {this.renderUserEvents()}
          {Utilities.renderPaginateBtn(
            this.state.pagStart, this.state.totalCount, this.handlePaginateClick
          )}
        </div>
      </Container>
    );
  }
}

class ManageCommentBox extends React.Component {
  constructor() {
    super();
    this.state = {
      userComments: [],
      totalCount: null,
      pagStart: 0,
      pagCount: 5,
    };
    this.handlePaginateClick = this.handlePaginateClick.bind(this);
  }

  componentDidMount() {
    this.getTotalCommentCount();
    this.getComments();
  }

  getTotalCommentCount() {
    axios({
      method: 'get',
      url: '/comments/count',
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))}
    })
    .then(result => {
      this.setState({totalCount: result.data})
    })
  }

  getComments() {
    axios({
      method: 'get',
      url: '/comments',
      params: {
        pagStart: this.state.pagStart,
        pagCount: this.state.pagCount,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
    })
    .then(result => {
      this.setState(
        {
          userComments: [...this.state.userComments, ...result.data],
          pagStart: this.state.pagStart + this.state.pagCount,
        },
      );
    })
    .catch(error => alert(error));
  }

  handlePaginateClick(e) {
    e.preventDefault();
    this.getComments();
  }

  renderUserComments() {
    return (
      <div className="my-5">
        {this.state.userComments.map( (comment, index) => {
          const createdDate = new Date(comment.createdDate);
          return (
            <div key={"comment;" + comment.id} className="mb-5">
              <Label></Label>
              <p>{comment.text}</p>
              <FormText className="float-right mt-0"> 
                {"작성날짜: " + renderDateAsString("fullNumeral", createdDate)}
              </FormText>
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <Container className="col-6 d-flex justify-content-center">
        <div className="my-5 px-5 pb-5 border" 
        style={{backgroundColor: "white", minWidth: "800px"}}>
          {Utilities.renderBigTitle("내가 작성한 댓글 관리")}
          {Utilities.renderCategoryBorder()}
          {this.renderUserComments()}
          {Utilities.renderPaginateBtn(
            this.state.pagStart, this.state.totalCount, this.handlePaginateClick
          )}
        </div>
      </Container>
    );
  }
}

class MyCalendar extends React.Component {
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
    const headers = getUserHeaders();
    axios.get("/eventbyusercalendar/", {
      params: {
        startDate: startDate,
        endDate: endDate,
      }, headers
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
    axios.get("/votes/", {
      params: {
        startDate: startDate,
        endDate: endDate,
      }, headers
    })
    .then(response => response)
    .then(result => {
      this.setState({votes: result.data, fetchingVote: false});
    })
    .catch(error => {
      alert(error);
    })
  }

  renderEvent(events) {
    if (events === false) {
      return;
    }
    return (
      <div>
        {events.map( event => {
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
      <Container className="col-6 d-flex justify-content-center">
        <div className="my-5 px-5 pb-5 border" 
        style={{backgroundColor: "white", minWidth: "800px"}}>
          {Utilities.renderBigTitle("마이 캘린더")}
          {Utilities.renderCategoryBorder()}
          <BigCalendar toggleAlert={this.props.toggleAlert} getEvents={this.getEvents}
          getVotes={this.getVotes} events={this.state.events} votes={this.state.votes}
          fetching={this.state.fetching} renderEvent={this.renderEvent} />
        </div>
      </Container>
    );
  }
}

function SideMenuBox() {
  let match = useRouteMatch();
  return (
     <div className="my-5 border" style={{backgroundColor: "white"}}>
      <Nav vertical>
        <NavItem>
          <p className="my-4 ml-3 h5">계정 관리</p>
        </NavItem>
        <NavItem>
          <div className="mx-3 mb-3 border"></div>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to={match.url}>계정 수정</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to={`${match.url}/posts`}>게시글 관리</NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={Link} to={`${match.url}/comments`}>댓글 관리</NavLink>
        </NavItem>
        <NavItem>
          <p className="my-4 ml-3 h5">일정 관리</p>
        </NavItem>
        <NavItem>
          <div className="mx-3 mb-3 border"></div>
        </NavItem>
        <NavItem>
          <NavLink className="mb-3" tag={Link} to={`${match.url}/mycalendar`}>마이 캘린더</NavLink>
        </NavItem>
      </Nav>
     </div>
  );
}

function MyPageApp() {
  let match = useRouteMatch();
  return (
    <Container>
      <Row>
        <Col>
          <SideMenuBox />
        </Col>
        <Col>
          <Switch>
            <Route path={`${match.url}/posts`}>
              <ManagePostBox />
            </Route>
            <Route path={`${match.url}/comments`}>
              <ManageCommentBox />
            </Route>
            <Route path={`${match.url}/mycalendar`}>
              <MyCalendar />
            </Route>
            <Route path={`${match.url}`}>
              <InfoBox />
            </Route>
          </Switch>
        </Col>
      </Row>
    </Container>
  );
}

export default MyPageApp;