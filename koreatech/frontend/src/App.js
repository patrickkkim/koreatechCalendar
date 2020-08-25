import React from 'react';
import './App.css';
import RegisterApp from './Register';
import NotepageApp from './Notepage';
import MyPageApp from './MyPage';
import SearchPageApp from './SearchPage';
import CalendarPageApp from './CalendarPage'
import { 
  ModalTemplate, renderTag, renderDateAsString, AlertWindow, 
  isDateEqual,
} from './util.js';
import { 
  LoginModal, LogoutModal, BugReportModal, PostModal, FullEventModal,
} from './Modal';
import axios from 'axios';
import { Switch, Route, Link } from "react-router-dom";
import {
  Button, Badge, Card, CardTitle, CardText, CardBody,
  CardDeck, Label, Navbar, NavbarBrand, NavItem, NavLink, Nav,
  Pagination, PaginationItem, PaginationLink, Tooltip,
} from 'reactstrap';

window.noteMaxLength = 40;
window.cardMinHeight = "400px";

export class Event extends React.Component {
  //prop: event, vote, addDate, noteStyle, toggleAlert
  constructor(props) {
    super(props);
    this.state = {
      hateToggled: false,
      likeToggled: false,
      saveToggled: false,
      mouseOver: false,
      tooltipToggled: false,
      likeCount: 0,
    };
  }

  componentDidMount() {
    this.setVoteButton();
    this.setState({likeCount: this.props.event.likeCount});
  }

  componentDidUpdate(props, state) {
    if (this.props.vote !== props.vote){
      this.setVoteButton();
    }
  }

  isFreshContent() {
    const curDate = new Date()
    const createdDate = new Date(this.props.event.createdDate)
    createdDate.setHours(createdDate.getHours() + 24)
    const value = ((curDate.getTime() < createdDate.getTime()) ? true : false);
    return value;
  }

  setVoteButton() {
    if (!this.props.vote) {
      return;
    }
    if (this.props.vote.saved) {
      this.setState({saveToggled: true});
    }
    const value = this.props.vote.value;
    if (value === 1) {
      this.setState({likeToggled: true});
    }
    else if (value === -1) {
      this.setState({hateToggled: true});
    }
  }

  renderNote() {
    let preview;
    const note = this.props.event.note;
    if (note.length > window.noteMaxLength) {
      preview = note.slice(0, window.noteMaxLength) + " ...";
    } else {
      preview = note;
    }
    return (
      <Label className={"d-inline " + this.props.noteStyle} 
      style={{color: "#404040", overflowWrap: "anywhere"}}>
        { preview }
      </Label>
    );
  }

  handleVoteClick = (e) => {
    if (localStorage.getItem("isLoggedIn") === "false") {
      this.props.toggleAlert("회원만 투표할 수 있습니다! 로그인 혹은 회원가입을 해주세요.")
      return;
    }
    let clicked = parseInt(e.currentTarget.value);
    let save = false;
    let value;
    if (clicked === 1) {
      if (this.state.hateToggled) {
        this.setState({hateToggled: false});
        value = 2;
      }
      else if (this.state.likeToggled) {
        clicked = -1;
        value = -1;
      }
      else {
        value = 1;
      }
      this.setState({likeToggled: !this.state.likeToggled});
    }
    else if (clicked === -1) {
      if (this.state.likeToggled) {
        this.setState({likeToggled: false});
        value = -2;
      }
      else if (this.state.hateToggled) {
        clicked = -1;
        value = 1;
      }
      else {
        value = -1;
      }
      this.setState({hateToggled: !this.state.hateToggled});
    }
    else if (clicked === 2) {
      value = 0;
      if (this.state.saveToggled) {
        save = false;
      }
      else {
        save = true;
      }
      this.setState({saveToggled: !this.state.saveToggled});
    }
    this.setState({likeCount: (this.state.likeCount + value)});
    axios({
      method: 'post',
      url: '/updatevote/',
      data: {
        eventId: this.props.event.id,
        clicked: clicked,
        save: save,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
    })
    .catch(error => alert(error));
  }

  renderVoteButton(color, id, value, isActive, img) {
    return (
      <Button className="float-right shadow-none mr-1" color={color}
      id={id} size="sm" outline value={value} 
      active={isActive} 
      onClick={this.handleVoteClick} 
      style={{fontSize: "8px", zIndex: 2, position: "relative", 
      borderColor: "#ddddde"}}>
        <span role="img" aria-label={id}>{img}</span>
      </Button>
    );
  }

  toggleTooltip(target) {
    this.setState({[target]: !this.state[target]});
  }

  renderTooltip(string, placement, target) {
    return (
      <Tooltip placement={placement} target={target} 
      toggle={() => this.toggleTooltip(target)}
      isOpen={this.state[target]}>
        {string}
      </Tooltip>
    );
  }

  renderAdditionalDate() {
    if (!this.props.addDate) {
      return;
    }
    const start = new Date(this.props.addDate[0]);
    const end = new Date(this.props.addDate[1]);
    return (
      <React.Fragment>
        <br/>
        <span className="d-inline-block mt-3">
          <Label className="text-muted">
            {start.getFullYear() + "년 " + (start.getMonth()+1) + "월 " 
            + start.getDate() + "일"}
          </Label>
          <Label>{'\u00A0'}~{'\u00A0'}</Label>
          <Label className="text-info">
            {(end.getMonth()+1) + "월 " + end.getDate() + "일"}
          </Label>
        </span>
      </React.Fragment>
    );
  }

  render() {
    const tagObj = renderTag(this.props.event.tag);
    return (
      <Card outline color="light" 
      className="shadow rounded pt-2 px-2 mb-3 mx-auto"
      onMouseOver={() => this.setState({mouseOver: true})} 
      onMouseOut={() => this.setState({mouseOver: false})}
      style={{backgroundColor: this.state.mouseOver ? "#f1f1f4" : "#fafafb"}}>
        <Link to={{
          pathname: "/notepage",
          search: "?id=" + this.props.event.id,
          state: { event: this.props.event.id }
        }} className="stretched-link">
        </Link>
        <CardText>
          <Badge className="mr-1" color={tagObj.color} href={"/searchpage?tag=" + this.props.event.tag}
          style={{zIndex: 2, position: "relative"}} id="tag">
            {tagObj.string}
          </Badge>
          {this.renderTooltip("태그 검색하기", "top", "tag")}
          {this.isFreshContent() ? 
            <Badge className="mr-1" color="success">새글!</Badge>: null
          }
          {this.renderNote()}
          {this.renderAdditionalDate()}
          <br/>
          <Label className="text-muted mt-1" style={{fontSize: "14px"}}>
            좋아요: { this.state.likeCount }
          </Label>
          {this.renderVoteButton("danger", "dislikeBtn", "-1",
            this.state.hateToggled, "👎")}
          {this.renderTooltip("싫어요", "bottom", "dislikeBtn")}
          {this.renderVoteButton("primary", "likeBtn", "1", 
            this.state.likeToggled, "👍")}
          {this.renderTooltip("좋아요", "bottom", "likeBtn")}
          {this.renderVoteButton("warning", "saveBtn", "2", 
            this.state.saveToggled, "⭐")}
          {this.renderTooltip("일정 저장", "bottom", "saveBtn")}
        </CardText>
      </Card>
    );
  }
}

class CardLayout extends React.Component {
  //props: votes, events, date, monthInclude
  constructor(props) {
    super(props);
    this.state = {
      toggleFullEvent: false,
    };
  }

  filterVoteByEvent(event) {
    if (this.props.votes === null) {
      return null;
    }
    for (let i = 0; i < this.props.votes.length; ++i) {
      if (event.id === this.props.votes[i].event_id) {
        return this.props.votes[i];
      }
    }
    return null;
  }

  renderEvents() {
    return (
      <div>
        {this.props.events.slice(0,2).map( (event, index) =>
          <Event key={event.startDate.toString() + ";" + event.id.toString()} 
          event={event} vote={this.filterVoteByEvent(event)}
          toggleAlert={this.props.toggleAlert} />
        )}
        {(this.props.events.length > 2) ? (
          <React.Fragment>
            <p className="text-center"
              style={{WebkitTransform:"rotate(90deg)", 
              MozTransform:"rotate(90deg)", OTransfrom:"rotate(90deg)",
              MsTransform:"rotate(90deg)"}}>....</p>
            <Button className="" size="sm" color="link"
            onClick={() => this.setState({toggleFullEvent: true})}>
              <strong>더 보기...</strong>
            </Button>
            <FullEventModal toggle={this.state.toggleFullEvent}
            handleClose={() => this.setState({toggleFullEvent: false})}
            events={this.props.events} votes={this.props.votes}
            date={this.props.date} />
          </React.Fragment>
        ) : null}
      </div>
    );
  }

  render() {
    const weekday = this.props.date.getDay();
    return (
      <Card style={{minHeight: window.cardMinHeight}} className="shadow-sm">
        <CardBody>
          {this.props.monthInclude || this.props.date.getDate() === 1 ? 
            <CardTitle className="display-4 d-inline text-info">
              {this.props.date.getMonth()+1}월‎‎‎‎‏‏‎ ‎
            </CardTitle>
            : <p className="display-4 d-inline">‏‏‎ ‎</p>
          }
          <div className="d-inline float-right">
            <CardTitle className="h1 d-inline text-muted">
              {this.props.date.getDate()}
            </CardTitle>
            <CardTitle className={"h6 d-inline"
              + (weekday === 0 ? " text-danger" : weekday === 6 ?
                " text-primary" : " text-muted")}>
              ({renderDateAsString("weekday", weekday)})
            </CardTitle>
          </div>
          {this.renderEvents()}
        </CardBody>
      </Card>
    );
  }
}

class BoxLayout extends React.Component {
  tzoffset = new Date().getTimezoneOffset() * 60000;
  constructor(props) {
    super(props);
    this.state = {
      dateObj: {},
      events: [],
      votes: [],
      fetchingEvent: true,
      fetchingVote: true,
    };
  }

  componentDidMount() {
    this.renderDate(this.props.loadCount);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.loadCount !== prevProps.loadCount){
      this.renderDate(this.props.loadCount);
    }
  }

  getEvents(dateObj) {
    axios.get("eventsbydate/", {
      params: {
        startDate: dateObj["startDate"],
        endDate: dateObj["endDate"]
      }
    })
    .then(response => response)
    .then(result => {
      this.setState({events: result.data, fetchingEvent: false});
    })
    .catch(error => {
      console.log(error.response)
    })
  }

  getVotes(dateObj) {
    const headers = {"Authorization": "Token " + JSON.parse(localStorage.getItem("token")).key}
    axios.get("votes/", {
      params: {
        startDate: dateObj["startDate"],
        endDate: dateObj["endDate"],
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

  filterEventByDate(date) {
    const events = [];
    for (let i = 0; i < this.state.events.length; ++i) {
      const eventDate = this.state.events[i].endDate;
      const inputDate = new Date(date - this.tzoffset).toISOString().substr(0,10);
      if (eventDate === inputDate) {
        events.push(this.state.events[i]);
      }
    }
    return events;
  }

  renderDateObj(loadCount) {
    let dateObj = {};
    const curDate = new Date();
    const startDate = new Date(curDate.setDate(
      curDate.getDate() + loadCount));
    dateObj.startDate = new Date(startDate - this.tzoffset).toISOString().slice(0,10);
    const endDate = new Date(startDate.setDate(startDate.getDate()
      + this.props.maxLoad - 1));
    dateObj.endDate = new Date(endDate - this.tzoffset).toISOString().slice(0,10);

    const dateArray = [];
    while (curDate <= endDate) {
      dateArray.push(new Date(curDate));
      curDate.setDate(curDate.getDate() + 1);
    }
    dateObj.dateArray = dateArray;
    return dateObj;
  }

  renderDate(loadCount) {
    const dateObj = this.renderDateObj(loadCount);
    this.setState({dateObj: dateObj});
    this.getEvents(dateObj);
    if (localStorage.getItem("isLoggedIn") === "true") {
      this.getVotes(dateObj);
    }
    else{
      this.setState({fetchingVote: false});
    }
  }

  renderCardLayout(start, end, monthInclude=false) {
    if (this.state.fetchingEvent || this.state.fetchingVote) {
      return;
    }
    return (
      <CardDeck className="m-5">
        {this.state.dateObj.dateArray.slice(start, end).map((date, index) => 
          <CardLayout key={date.toString()} date={date} 
          monthInclude={(index === 0 && monthInclude) ? true : false}
          events={this.filterEventByDate(date)} votes={this.state.votes}
          toggleAlert={this.props.toggleAlert} />
        )}
      </CardDeck>
    );
  }

  render() {
    return (
      <div>
        {this.renderCardLayout(0, (this.props.maxLoad/2), true)}
        {this.renderCardLayout((this.props.maxLoad/2), this.props.maxLoad+1)}
      </div>
    );
  }
}

class NavBarLayout extends React.Component {
  // props: toggleAlert
  constructor(props) {
    super(props);
    this.state = {
      loginToggle: false,
      logoutToggle: false,
      reportToggle: false,
    };
    this.handleModalClose = this.handleModalClose.bind(this);
  }

  handleModalClose(modalType) {
    let obj = {};
    obj[modalType] = false;
    this.setState(obj);
  }

  render() {
    return (
      <div id="navbar">
        <Navbar style={{backgroundColor: "#ffaa8c"}} light expand="xs" fixed="top">
          <NavbarBrand href="/">Kor.Cal</NavbarBrand>
          <Nav navbar>
            <NavItem>
              <NavLink tag={Link} to="/searchpage">검색</NavLink>
            </NavItem>
            {localStorage.getItem("isLoggedIn") === "false" ? (
              <React.Fragment>
                <NavItem>
                  <NavLink href="#" onClick={() => 
                  this.setState({loginToggle: !(this.state.loginToggle)})}>
                    로그인
                  </NavLink>
                  <LoginModal toggle={this.state.loginToggle}
                  handleClose={() => this.handleModalClose("loginToggle")}
                  toggleAlert={this.props.toggleAlert} />
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="/register">회원가입</NavLink>
                </NavItem>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <NavItem>
                  <NavLink tag={Link} to="/mypage">마이페이지</NavLink>
                </NavItem>
                <NavItem>
                  <NavLink tag={Link} to="#" onClick={() => 
                  this.setState({logoutToggle: !(this.state.logoutToggle)})}>
                    로그아웃
                  </NavLink>
                  <LogoutModal toggle={this.state.logoutToggle}
                  handleClose={() => this.handleModalClose("logoutToggle")} />
                </NavItem>
              </React.Fragment>
            )}
          </Nav>
          <Nav navbar className="ml-auto">
            <NavItem className="">
              <Button className="" color="danger"
              onClick={() => 
              this.setState({reportToggle: !(this.state.reportToggle)})}>
                버그제보
              </Button>
              <BugReportModal toggle={this.state.reportToggle}
              handleClose={() => this.handleModalClose("reportToggle")} />
            </NavItem>
          </Nav>
        </Navbar>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      maxLoad: 8, // (int)날짜카드 최대 생성 갯수
      loadCount: 0, // (int)생성해야하는 날짜카드 위치
      paginationCount: 7, // (int)최대 페이지 버튼 생성 갯수
      paginationDateList: [], // (list)페이지 버튼에 표시될 날짜
      togglePost: false, //(bool)이벤트 작성 모달 생성 여부
      alertToggle: false, //(bool)오류 생성 여부
      alertType: "", //(string)오류 문자열
    };
    this.handlePageClick = this.handlePageClick.bind(this);
    this.toggleAlert = this.toggleAlert.bind(this);
  }

  componentDidMount() {
    this.setPaginationDateList(0);
  }

  // 페이지 버튼용 날짜 리스트를 생성
  setPaginationDateList(startCount) {
    let dateList = [];
    let date = new Date();
    const centerCount = Math.floor(this.state.paginationCount/2);
    date.setDate(date.getDate() + startCount);
    for (let i = 0; i < this.state.paginationCount; ++i) {
      let dateObj;
      if (i === 0) {
        dateObj = new Date(date.setDate(date.getDate()
          - this.state.maxLoad*centerCount));
      } else {
        dateObj = new Date(date.setDate(date.getDate()
          + this.state.maxLoad));
      }
      dateList.push(dateObj);
    }
    this.setState({paginationDateList: dateList});
  }

  handlePageClick = value => {
    let newLoadCount;
    newLoadCount = parseInt(this.state.loadCount) + parseInt(value);
    this.setState({loadCount: newLoadCount});
    this.setPaginationDateList(newLoadCount);
  }

  // 오류 문자열(type)만 입력하면 어디서든 오류를 생성하게끔 하는 함수
  toggleAlert(type) {
    if (this.state.alertToggle) {
      this.setState({alertToggle: false});
      this.setState({
        alertToggle: true,
        alertType: type,
      });
    }
    else{
      this.setState({
        alertToggle: true,
        alertType: type,
      });
    }
  }

  renderPagination() {
    // 페이지 버튼의 중앙 위치
    const centerPoint = Math.floor(this.state.paginationDateList.length/2);
    // 페이지 버튼 시작지점의 value 값
    const startValue = -(this.state.maxLoad * centerPoint);
    return (
      <Pagination className="d-flex justify-content-center my-5" size="md">
        <PaginationItem>
          <PaginationLink className="text-info" first 
          onClick={() => this.handlePageClick(
            -(this.state.maxLoad * (centerPoint + 1))
          )} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-info" previous
          onClick={() => this.handlePageClick(-this.state.maxLoad)} />
        </PaginationItem>
        {this.state.paginationDateList.map((date, index) => {
          // 중앙 버튼일 경우 active로 변경하게끔 한다
          const isActive = (index === centerPoint);
          const isToday = isDateEqual(date);
          const value = startValue + (index * this.state.maxLoad);
          return (
            <React.Fragment key={date.getMonth()+"월" + date.getDate()+"일"}>
              <PaginationItem 
              active={isActive ? true : false}>
                <PaginationLink 
                className={isActive ? "bg-info text-white" : "text-info"} 
                style={{
                  borderColor: isActive ? "#17a2b8" : null,
                  minWidth: "100px"
                }} onClick={() => this.handlePageClick(value)}>
                  {date.getMonth()+1}월 {date.getDate()}일
                </PaginationLink>
                <Label className=
                "d-flex justify-content-center mt-1 mb-0 text-muted">
                  <small>{isToday ? "Today" : "\u00A0"}</small>
                </Label>
              </PaginationItem>
            </React.Fragment>
          );
        })}
        <PaginationItem>
          <PaginationLink className="text-primary"
          onClick={() => this.handlePageClick(-this.state.loadCount)}>
            홈으로
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-info" next
          onClick={() => this.handlePageClick(this.state.maxLoad)} />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink className="text-info" last 
          onClick={() => this.handlePageClick(
            this.state.maxLoad * (centerPoint + 1)
          )} />
        </PaginationItem>
      </Pagination>
    );
  }

  renderPostButton() {
    return(
      <React.Fragment>
        {localStorage.getItem("isLoggedIn") === "true" ? 
          <React.Fragment>
            <Button className="float-right mb-5 mr-5" color="primary"
            onClick={() => this.setState({togglePost: !this.state.togglePost})}>
              알림작성
            </Button>
            <PostModal toggle={this.state.togglePost} 
            handleClose={() => this.setState({togglePost: false})} />
          </React.Fragment>
          : null
        }
      </React.Fragment>
    );
  }

  renderMainPage() {
    return (
      <React.Fragment>
        <BoxLayout maxLoad={this.state.maxLoad} 
          loadCount={this.state.loadCount} 
          toggleAlert={this.toggleAlert} />
        {this.renderPagination()}
        {this.renderPostButton()}
      </React.Fragment>
    );
  }
  
  render() {
    return (
      <div id="main">
        <NavBarLayout toggleAlert={this.toggleAlert} />
        <AlertWindow toggle={this.state.alertToggle} alertType={this.state.alertType}
        handleClose={() => this.setState({alertToggle: false})} />
        <Switch>
          <Route path="/register">
            <RegisterApp />
          </Route>
          <Route path="/mypage">
            <MyPageApp />
          </Route>
          <Route path="/notepage">
            <NotepageApp />
          </Route>
          <Route path="/searchpage" render={(props) => 
            <SearchPageApp toggleAlert={this.toggleAlert} />}
          />
          <Route path="/calendarpage">
            <CalendarPageApp />
          </Route>
          <Route path="/">
            {this.renderMainPage()}
          </Route>
        </Switch>
      </div>
    );
  }
}

export default App;
export {
  ModalTemplate,
};