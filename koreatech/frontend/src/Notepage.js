import React from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './customcalendar.css';
import { PostDeleteModal, PostModal, } from './Modal.js'
import { renderTag, getDateDifference, isDateEqual, getUserHeaders } from './util.js'
import {
  Label, Container, Media, Form, FormGroup, Input, Button, Tooltip,
  Badge,
} from 'reactstrap';

window.default_image_src = "/images/PixelArt.png";

class CommentLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      reply: false,
    };
    this.handleDeletePost = this.handleDeletePost.bind(this);
    this.handleReplyBtn = this.handleReplyBtn.bind(this);
  }

  handleReplyBtn(e) {
    e.preventDefault();
    this.setState({reply: !this.state.reply});
  }

  handleDeletePost = id => e => {
    e.preventDefault();
    axios({
      method: 'delete',
      url: 'comments/',
      data: {
        commentId: id,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("token")).key}
    }).catch(error => console.log(error));
    window.location.reload(false);
  }

  formatComments() {
    const formattedCom = {}
    this.props.commentArr.map(comment => {
      if (!comment.belongsTo) {
        formattedCom["main"] = comment;
      } else {
        if (!("replies" in formattedCom)){
          formattedCom["replies"] = [comment,];
        }
        else {
          formattedCom["replies"].push(comment);
        }
      }
      return null;
    });
    if (!("main" in formattedCom)) {
      formattedCom["main"] = {user_username: "삭제됨", text: "삭제됨", 
        deleted: true};
    }
    return formattedCom;
  }

  renderReplyBtn() {
    if (!this.props.currentUser) {
      return;
    }
    return (
      <Button className="d-inline float-right" color="white" size="sm"
        onClick={this.handleReplyBtn}>답장</Button>
    );
  }

  renderDelBtn(comment) {
    if (!this.props.currentUser) {
      return;
    }
    else if (this.props.currentUser.username === comment.user_username) {
      return (
        <Button className="d-inline float-right" size="sm" outline
          onClick={this.handleDeletePost(comment.id)} color="danger">
          삭제
        </Button>
      );
    }
  }

  renderComment(comment) {
    return (
      <React.Fragment>
      {comment.belongsTo ? 
        <Media left>
          <Media object src={window.default_image_src} alt="user image" 
            width="25" height="25" />
        </Media>
        : null
      }
      <Media body>
        <Media heading className="h6 ml-1 d-inline">
          {comment.user_username}
        </Media>
        {this.renderDelBtn(comment)}
        {(!comment.belongsTo && !comment.deleted) ? 
          this.renderReplyBtn() : null}
        <p className="mt-1">{comment.text}</p>
      </Media>
      </React.Fragment>
    );
  }

  render() {
    const comments = this.formatComments();
    return (
      <div>
        <Media className="border-top p-3 mx-3">
          <Media left>
            <Media object src={window.default_image_src} alt="user image" 
              width="25" height="25" />
          </Media>
          <Media body>
            {this.renderComment(comments["main"])}
            {(comments["replies"]) ? comments["replies"].map(comment => 
              <Media key={comment.id + comment.event_id}
                className="border-top pt-3 px-3">
                {this.renderComment(comment)}
              </Media>
            ) : null}
          </Media>
        </Media>
        <div className="px-5">
          {this.state.reply ? 
            this.props.renderCommentForm(this.props.eventId) : null}
        </div>
      </div>
    );
  }
}

class CommentBoxLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      comments: [],
      fetching: true,
    };
    this.handlePostComment = this.handlePostComment.bind(this);
  }

  componentDidMount() {
    this.getComments();
  }

  getComments() {
    axios.get("/comments", { 
      params: {
        eventId: this.props.event
      }
    }).then(response => response)
    .then(result => {
      const comments = this.formatComments(result.data);
      this.setState({comments: comments, fetching: false})
    }).catch(error => alert(error));
  }

  handlePostComment = belongsTo => e => {
    e.preventDefault();
    axios({
      method: 'post',
      url: 'comments/',
      data: {
        text: e.target.comment.value,
        eventId: this.props.event,
        belongsTo: belongsTo,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("token")).key},
    })
    .catch(error => alert(error));
    window.location.reload(false);
  }

  updateBelonging(id) {
    this.setState({belongsTo: id});
  }

  formatComments(comments) {
    const allComments = {};
    comments.map(comment => {
      if (comment.belongsTo) {
        if (!(comment.belongsTo in allComments)) {
          allComments[comment.belongsTo] = [comment,];
        } else {
          allComments[comment.belongsTo].push(comment);
        }
      } else {
        if (!(comment.id in allComments)) {
          allComments[comment.id] = [comment,];
        } else {
          allComments[comment.id].push(comment);
        }
      }
      return null;
    });
    return allComments;
  }

  renderComments() { 
    if (this.state.fetching) {
      return;
    }
    return (
      <div className="mt-5" 
        style={{backgroundColor: "white"}} >
        <div>
          {Object.entries(this.state.comments).map(([eventId, commentArr]) => 
            <div key={"comment;" + eventId}>
              <CommentLayout eventId={eventId}
                commentArr={commentArr} currentUser={this.props.user}
                renderCommentForm={this.renderCommentForm.bind(this)}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  renderCommentForm(belongsTo=null) {
    if (!this.props.user) {
      return;
    }
    return (
      <Form className="mb-5 mt-2 mx-3 col-13" 
        onSubmit={this.handlePostComment(belongsTo)}>
        <FormGroup>
          <Label><small>댓글작성</small></Label>
          <Input type="textarea" name="comment" required rows="4"
            placeholder="최대 500자까지 가능합니다." maxLength={500} />
        </FormGroup>
        <div className="">
          <Button>작성</Button>
        </div>
      </Form>
    );
  }

  render() {
    return (
      <div>
        {this.renderComments()}
        {this.renderCommentForm()}
      </div>
    );
  }
}

class BoxLayout extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: null,
      user: null,
      fetching: true,
      authenticating: true,
      togglePostDelete: false,
      togglePostUpdate: false,
      tooltipOpen: false,
      dateTooltipOpen: false,
      error: null,
    };
  }

  componentDidMount() {
    this.getEvent();
  }

  authenticateUser() {
    const headers = getUserHeaders();
    axios.get("/authenticate", {
      params: {
        eventId: this.state.event.id,
      }, headers
    })
    .then(result => {
      this.setState({user: result.data[0],authenticating: false});
    }).catch(error => {
      alert(error);
    });
  }

  getEvent() {
    const searchStr = window.location.search;
    const id = parseInt(searchStr.split("id=")[1]);
    if (id && !isNaN(id)) {
      axios.get("/events", {
        params: {
          eventId: id
        }
      })
      .then(response => response)
      .then(result => {
        this.setState({event: result.data[0], fetching: false}, 
          () => this.authenticateUser());
      }).catch(error => alert(error));
    }
    else {
      // raise 404 error!
    }
  }

  renderDateDifference(dateStr) {
    const createdDate = new Date(dateStr);
    let dateDiff = {};
    dateDiff = getDateDifference(createdDate);
    let renderDate = "";
    if (dateDiff["years"] > 0) {
      renderDate = dateDiff["years"] + "년 전";
    } else if (dateDiff["months"] > 0) {
      renderDate = dateDiff["months"] + "달 전";
    } else if (dateDiff["days"] > 0) {
      renderDate = dateDiff["days"] + "일 전";
    } else if (dateDiff["hours"] > 0) { 
      renderDate = dateDiff["hours"] + "시간 전"; 
    } else if (dateDiff["mins"] > 0) {
      renderDate = dateDiff["mins"] + "분 전";
    } else {
      renderDate = dateDiff["secs"] + "초 전";
    }

    return (
      <Label className="text-muted small">
        <span style={{cursor:"pointer", color: "#3491f8"}} id="dateTip">
          {renderDate}
        </span>
        {'\u00A0'}에{'\u00A0'}
      </Label>
    );
  }

  renderManageBtn() {
    if (this.state.user && this.state.user.username === this.state.event.user_username) {
      return (
        <React.Fragment>
          <Button className="float-right" color="danger"
          onClick={() => this.setState({togglePostDelete: !this.state.togglePostDelete}
          )}>삭제</Button>
          <Button className="float-right mr-2" color="info"
          onClick={() => this.setState({togglePostUpdate: !this.state.togglePostUpdate}
          )}>편집</Button>
          <PostDeleteModal toggle={this.state.togglePostDelete} 
          handleClose={() => this.setState({togglePostDelete: false})} 
          eventid={this.state.event.id} />
          <PostModal toggle={this.state.togglePostUpdate} 
          handleClose={() => this.setState({togglePostUpdate: false})}
          event={this.state.event} />
        </React.Fragment>
      );
    }
    else {
      return;
    }
  }

  renderEvent() {
    if (this.state.fetching || this.state.authenticating) {
      return;
    }
    const tagObj = renderTag(this.state.event.tag);
    return (
      <div style={{backgroundColor: "white"}} className="my-5 border">
        <div className="px-4 pt-4">
          <Container>
            <Label className="mt-3 h4" style={{overflowWrap: "anywhere"}}>
              {this.state.event.note}
            </Label>
            <Media body>
              {this.renderDateDifference(this.state.event.createdDate)}
              <Tooltip placement="bottom" target="dateTip" 
              toggle={
                () => this.setState(
                {dateTooltipOpen: !this.state.dateTooltipOpen})
              }
              isOpen={this.state.dateTooltipOpen} autohide={false}
              style={{maxWidth: "500px"}}>
                {new Date(this.state.event.createdDate).toString()}
              </Tooltip>
              <Label className="my-0 text-muted small">
                유저 '{this.state.event.user_nickname}' 가 작성함
              </Label>
            </Media>
            <div className="mb-3">
              <Badge color={tagObj.color}>{tagObj.string}</Badge>
            </div>
            <div className="mb-5">
              <p style={{whiteSpace: "pre-line"}}>{this.state.event.bodyText}</p>
            </div>
            <div>
              <Button target="_blank" rel="noopener noreferrer" 
              disabled={this.state.event.link ? false : true} outline
              id="LinkTip" color="info" href={this.state.event.link}>
                {this.state.event.link ? '페이지로 이동' : '링크 없음'}
              </Button>
              <Tooltip placement="bottom" target="LinkTip" 
              toggle={() => this.setState({tooltipOpen: !this.state.tooltipOpen})}
              isOpen={this.state.tooltipOpen} autohide={false}
              style={{maxWidth: "300px"}}>
                {this.state.event.link}
              </Tooltip>
              {this.renderManageBtn()}
            </div>
          </Container>
          <CommentBoxLayout event={this.state.event.id} 
          user={this.state.user} />
        </div>
      </div>
    );
  }

  renderCalendar() {
    if (this.state.fetching || this.state.authenticating) {
      return;
    }
    let datelist = [];
    const start = new Date(this.state.event.startDate);
    const end = new Date(this.state.event.endDate);
    const dateListCount = end.getDate() - start.getDate();
    let dateToPush = new Date(start);
    for (let i = 0; i <= dateListCount; ++i) {
      datelist.push(new Date(dateToPush.setDate(start.getDate() + i)));
      dateToPush = new Date(start);
    }
    return (
      <div className="my-5">
        <div className="ml-2">
          <p className="h5 text-muted">시작 날짜</p>
          <p className="display-4 text-info">
            {(start.getMonth()+1) + "월 " + start.getDate() + "일"}
          </p>
          <p className="mt-4 h5 text-muted">끝나는 날짜</p>
          <p className="display-4 text-info">
            {(end.getMonth()+1) + "월 " + end.getDate() + "일"}
          </p>
        </div>
        <Calendar calendarType="US" value={[start, end]}
        className="border" tileContent={
          ({date}) => isDateEqual(date, end) ? 
          <small className="text-muted"><br/>까지</small> 
          : isDateEqual(date, start) ? 
          <small className="text-muted"><br/>부터</small> 
          : isDateEqual(date, new Date()) ? 
          <small className="text-dark"><br/>오늘</small> : null
        } />
      </div>
    );
  }

  handleDayClick(e) {
    e.preventDefault();
  }

  render() {
    return (
      <Container fluid className="w-75">
        <div className="row">
          <div className="col-8" style={{minHeight: "800px"}}>
            {this.renderEvent()}
          </div>
          <div className="col-4" style={{paddingLeft: 0, paddingRight: 0}}>
            {this.renderCalendar()}
          </div>
        </div>
      </Container>
    );
  }
}

class NotepageApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      toggled: true,
    };
  }

  render() {
    return (
      <React.Fragment>
        <BoxLayout />
      </React.Fragment>
    );
  }
}

export default NotepageApp;