import React from 'react';
import axios from 'axios';
import { Event } from './App.js';
import { renderTag } from './util.js'
import {
  Button, Container, Label, InputGroup, Input, InputGroupButtonDropdown,
  Form, FormGroup, FormText, Row, Col,
} from 'reactstrap';

class SearchPageApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      votes: [],
      startDate: null,
      endDate: null,
      orderBy: null,
      tag: null,
      searchString: null,
      pagStart: 0,
      pagCount: 5,
      totalCount: 0,
    };
    this.handleSearchEvent = this.handleSearchEvent.bind(this);
  }
 
  componentDidMount() {
    const searchStr = window.location.search;
    const tagSearch = searchStr.split("tag=")[1];
    if (tagSearch) {
      axios.get("eventbysearch", {
        params: {
          tag: tagSearch,
        }
      })
      .then(result => {
        this.setState({events: result.data})
      })
      .catch(error => alert(error));
    }
  }

  getVotes(events) {
    if (localStorage.getItem("isLoggedIn") !== "true") {
      return;
    }
    const eventIds = [];
    for (let i = 0; i < events.length; ++i) {
      eventIds.push(events[i].id);
    }
    axios.get("votes", {
      params: {
        eventIds: JSON.stringify(eventIds),
      }, 
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("token")).key}
    }).then(result => {
      this.setState({
        votes: result.data
      })
    }).catch(error => alert(error));
  }

  getEvents() {
    axios({
      method: 'get',
      url: '/eventbysearch',
      params: {
        startDate: this.state.startDate,
        endDate: this.state.endDate,
        orderBy: this.state.orderBy,
        tag: this.state.tag,
        searchString: this.state.searchString,
        pagCount: this.state.pagCount,
        pagStart: this.state.pagStart,
      }
    }).then(result => {
      this.setState(
        {
          events: [...this.state.events, ...result.data["events"]],
          pagStart: this.state.pagStart + this.state.pagCount,
          totalCount: result.data["count"],
        }, 
        this.getVotes(result.data["events"])
      );
    }).catch(error => alert(error));
  }

  handleSearchEvent = reset => e => {
    e.preventDefault();
    if (reset){
      this.setState({events: [], pagStart: 0, startDate: e.target.startDate.value,
        endDate: e.target.endDate.value, orderBy: e.target.orderBy.value, 
        tag: e.target.tag.value, searchString: e.target.searchString.value}
        , this.getEvents
      );
    }
    else {
      this.getEvents();
    }
  }

  renderSearchBox() {
    const tags = ["important", "gather", "bachelor", "assignment", "etc"]
    return (
      <Container className="d-flex justify-content-center">
        <div className="my-3 px-5 pb-5 border" 
        style={{backgroundColor: "white", minWidth: "800px"}}>
          <Label className="display-3 mt-5">일정 검색</Label>
          <Form className="my-5" onSubmit={this.handleSearchEvent(true)}>
            <FormGroup>
              <InputGroup>
                <InputGroupButtonDropdown addonType="prepend">
                  <Input type="select" name="orderBy">
                    <option hidden value="default">정렬</option>
                    <option value="popular">인기순</option>
                    <option value="recent">최신순</option>
                    <option value="end">마감날짜순</option>
                    <option value="start">시작날짜순</option>
                  </Input>
                </InputGroupButtonDropdown>
                <InputGroupButtonDropdown addonType="prepend">
                  <Input type="select" name="tag">
                    <option hidden value="default">태그</option>
                    <option value="all">전체</option>
                    {tags.map((tag, index) => {
                      const badgeInfo = renderTag(tag);
                      return (
                        <option key={"badge;" + index} value={tag}>
                          {badgeInfo["string"]}
                        </option>
                      );
                    })}
                  </Input>
                </InputGroupButtonDropdown>
                <Input type="text" placeholder="검색어" name="searchString" />
              </InputGroup>
            </FormGroup>
            <Row form>
              <Col>
                <FormGroup>
                  <FormText>시작 날짜</FormText>
                  <Input type="date" name="startDate" />
                </FormGroup>
              </Col>
              <Col>
                <FormGroup>
                  <FormText>종료 날짜</FormText>
                  <Input type="date" name="endDate" />
                </FormGroup>
              </Col>
            </Row>
            <Button className="float-right" color="primary">검색</Button>
          </Form>
        </div>
      </Container>
    );
  }

  renderEvents() {
    return (
      <div>
        {(this.state.events.length <= 0) ? (
            <Label className="h4 my-3 text-muted">일정 없음</Label>
          ) :
          this.state.events.map( (event, index) => {
          return (
            <div key={"searchEvent;" + event.id} className="mb-4">
              <Label></Label>
              <Event event={event} vote={this.state.votes.find(
              obj => {return obj.event_id === event.id})} 
              addDate={[event.startDate, event.endDate]}
              noteStyle="h6" toggleAlert={this.props.toggleAlert} />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    return (
      <div className="my-4">
        {this.renderSearchBox()}
        <Container className="col-3 d-flex justify-content-center">
          <div className="my-3 px-5 py-3 border" 
          style={{backgroundColor: "white", minWidth: "800px"}}>
            {this.renderEvents()}
            {(this.state.totalCount > this.state.pagStart) ? (
              <Button className="mt-5 mb-3" color="link"
              onClick={this.handleSearchEvent(false)}>더 보기...</Button>
            ) : null}
          </div>
        </Container>
      </div>
    );
  }
}

export default SearchPageApp;