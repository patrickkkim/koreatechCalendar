import React from 'react';
import axios from 'axios';
import { Event } from './App.js';
import {
  ModalTemplate, CustomValidInput, renderDateAsString,
} from './util.js';
import {
  Button, Badge, CustomInput, FormGroup, FormText, Label, Modal, ModalHeader, 
  ModalBody, ModalFooter, Input, Col, Row,
} from 'reactstrap';

export class LoginModal extends React.Component {
  // props: toggle, handleClose, toggleAlert
  constructor(props) {
    super(props);
    this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
  }

  handleLoginSubmit(e) {
    e.preventDefault();
    axios.post("user/loginverify/", {
      username: e.target.username.value, 
      password: e.target.password.value
    })
    .then(response => response)
    .then(result => {
      const currentDate = new Date();
      const tokenInfo = {key: result.data.token, date: currentDate};
      localStorage.setItem("token", JSON.stringify(tokenInfo));
      localStorage.setItem("key", JSON.stringify(tokenInfo.key));
      localStorage.setItem("isLoggedIn", "true");
      this.setState({isLoggedIn: "true"});
      window.location.href = "/";
    })
    .catch(error => {
      this.props.handleClose();
      this.props.toggleAlert("로그인 오류: 아이디 혹은 비밀번호가 맞지 않습니다!")
    });
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="md" 
      header="로그인" handleSubmit={this.handleLoginSubmit} 
      modalBody={
        <React.Fragment>
          <FormGroup>
            <Label>아이디</Label>
            <Input type="text" name="username" 
              placeholder="HongGilDong" required />
          </FormGroup>
          <FormGroup>
            <Label>패스워드</Label>
            <Input type="password" name="password" required />
          </FormGroup>
        </React.Fragment>
      } handleClose={this.props.handleClose} />
    );
  }
}

export class LogoutModal extends React.Component {
  // props: toggle, handleClose
  constructor(props) {
    super(props);
    this.handleLogoutSubmit = this.handleLogoutSubmit.bind(this);
  }

  handleLogoutSubmit(e) {
    e.preventDefault();
    const headers = {
      "Authorization": "Token " + JSON.parse(localStorage.getItem("key"))
    }
    axios.get("/user/logout", {headers})
    .then(response => response.data)
    .then(result => {
      localStorage.setItem("token", null);
      localStorage.setItem("key", null);
      localStorage.setItem("isLoggedIn", "false");
      window.location.href = "/"
    })
    .catch(error => {
      localStorage.setItem("token", null);
      localStorage.setItem("key", null);
      localStorage.setItem("isLoggedIn", "false");
      alert(error.response.status);
      window.location.href = "/"
    });
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="md" 
      header="로그아웃" handleSubmit={this.handleLogoutSubmit} 
      modalBody={
        <React.Fragment>
          <Label>정말로 로그아웃 하시겠습니까?</Label>
        </React.Fragment>
      } handleClose={this.props.handleClose}
      submitBtnName="예" cancelBtnName="아니오" />
    );
  }
}

export class BugReportModal extends React.Component {
  // props: toggle, handleClose
  constructor(props) {
    super(props);
    this.handleReportSubmit = this.handleReportSubmit.bind(this);
  }

  handleReportSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="lg" header="버그제보" 
      modalBody={
        <FormGroup>
          <Label>내용</Label>
          <Input type="textarea" name="report" rows={8} required
          placeholder="최대한 자세히 적어주시면 고맙겠습니다 (최대 1000자)."
          maxLength={1000} />
        </FormGroup>
      } handleClose={this.props.handleClose} />
    );
  }
}

export class NicknameChangeModal extends React.Component {
  // props: toggle, handleClose
  constructor(props) {
    super(props);
    this.state = {
      validation: null,
    };
    this.callback = this.callback.bind(this);
  }

  callback(validation) {
    this.setState({validation: validation});
  }

  handleSubmit(e) {}

  render() {
   return (
      <ModalTemplate isOpen={this.props.toggle} size="md" 
      header="닉네임 변경" handleSubmit={this.handleSubmit}
      modalBody={
        <React.Fragment>
          <FormGroup>
           <Label>새 닉네임</Label>
            <CustomValidInput type="text" field="nickname" 
              name="nickname" placeholder=""
              autoComplete="off" callback={this.callback}/>
            <FormText>영문, 숫자를 섞어 5자 이상, 30자 미만이 되어야합니다.</FormText>
          </FormGroup>
        </React.Fragment>
      } handleClose={this.props.handleClose} />
    );
  }
}

export class PasswordChangeModal extends React.Component {
  // props: toggle, handleClose
  constructor(props) {
    super(props);
    this.state = {
      validation: null,
    };
    this.callback = this.callback.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  callback(validation) {
    this.setState({validation: validation});
  }

  handleSubmit(e) {
    e.preventDefault();
    if (this.state.validation === true && 
        e.target.newPassword.value === e.target.retryPassword.value
      ) {
      axios({
      method: 'patch',
      url: 'authenticate/',
      data: {
        newPassword: e.target.newPassword.value,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
    })
    .then(result => {
      //success!
    });
    } else { alert("No"); }
  }

  render() {
    return (
      <React.Fragment>
        <ModalTemplate isOpen={this.props.toggle} size="md" 
        header="비밀번호 변경" onSubmit={this.handleSubmit} 
        modalBody={
          <React.Fragment>
            <FormGroup>
              <Label>예전 비밀번호</Label>
              <CustomValidInput type="password" field="password" 
              name="pastPassword" placeholder=""
              autoComplete="off" callback={this.callback}/>
            </FormGroup>
            <FormGroup className="mt-5">
              <Label>새 비밀번호</Label>
              <CustomValidInput type="password" field="password" 
              name="newPassword" placeholder=""
              autoComplete="off" callback={this.callback}/>
                <FormText>영문, 숫자, 특수문자를 섞어 12자 이상, 100자 미만이 되어야합니다.</FormText>
            </FormGroup>
            <FormGroup>
              <Label>다시한번 입력</Label>
              <CustomValidInput type="password" field="password" 
              name="retryPassword" placeholder=""
              autoComplete="off" callback={this.callback}/>
              <FormText>다시 한번 더 입력해주세요.</FormText>
            </FormGroup>
          </React.Fragment>
        } handleClose={this.props.handleClose} />
      </React.Fragment>
    );
  }
}

export class AccountDeleteModal extends React.Component {
  // props: toggle, handleClose
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete(e) {
    e.preventDefault();
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="md" header="계정 삭제" 
      modalBody={
        <React.Fragment>
          <Label>정말로 계정을 삭제 하시겠습니까? (복구불가)</Label>
        </React.Fragment>
      } handleClose={this.props.handleClose}
      submitBtnName="예" cancelBtnName="아니오!!!"
      />
    );
  }
}

export class PostModal extends React.Component {
  constructor(props) {
    super(props);
    this.handlePostClick = this.handlePostClick.bind(this);
  }

  // props: toggle, handleClose, event(optional)
  handlePostClick(e) {
    e.preventDefault();
    let tag;
    for (let i = 0; i < e.target.tagRadio.length; ++i) {
      if (e.target.tagRadio[i].checked) {
        tag = e.target.tagRadio[i].id;
      }
    }
    let axiosData;
    if (this.props.event) {
      axiosData = {
        method: 'patch',
        url: 'events/',
        data: {
          eventId: this.props.event.id,
          startDate: e.target.startDate.value,
          endDate: e.target.endDate.value,
          note: e.target.note.value,
          bodyText: e.target.bodyText.value,
          link: e.target.link.value,
          tag: tag,
        },
        headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
      };
    } else {
      axiosData = {
        method: 'post',
        url: 'events/',
        data: {
          startDate: e.target.startDate.value,
          endDate: e.target.endDate.value,
          note: e.target.note.value,
          bodyText: e.target.bodyText.value,
          link: e.target.link.value,
          tag: tag,
        },
        headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
      };
    }
    axios(axiosData)
    .catch(error => alert(error))
    .then(
      // 해당 포스트의 날짜 위치로 이동
      window.location.reload(false)
    );
  }

  getCurrentDateFormat() {
    const date = new Date()
    const returnDate = date.toISOString().substr(0,10);
    return returnDate;
  }

  renderRadioBtn(color, id, value) {
    return (
      <CustomInput type="radio" id={id} name="tagRadio"
      label={<Badge color={color}>{value}</Badge>}
      defaultChecked={this.props.event ? (this.props.event.tag === id ? true : false): null} />
    );
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="lg" header="알림작성"
      handleSubmit={this.handlePostClick} 
      modalBody={
        <React.Fragment>
          <FormGroup>
            <Label><strong>*제목</strong></Label>
            <Input type="textarea" name="note" required
            rows="2" placeholder="ex) [생협] 교재구입 택배 주문 안내" 
            defaultValue={this.props.event ? this.props.event.note : null} 
            maxLength={200} />
          </FormGroup>
          <FormGroup>
            <Label>부가내용</Label>
            <Input type="textarea" name="bodyText" required
            rows="7" placeholder="최대 2000자까지 작성 가능합니다."
            defaultValue={this.props.event ? this.props.event.bodyText : null}
            maxLength={2000} />
          </FormGroup>
          <FormGroup>
            <Label>관련 링크</Label>
            <Input type="text" name="link" 
            placeholder="ex) https://portal.koreatech.ac.kr/"
            defaultValue={this.props.event ? this.props.event.link : null}
            maxLength={2000} />
          </FormGroup>
          <FormGroup tag="fieldset">
            <Label>태그 선택</Label>
            {this.renderRadioBtn("danger", "important", "중요!")}
            {this.renderRadioBtn("primary", "gather", "모집, 선발")}
            {this.renderRadioBtn("info", "bachelor", "학사")}
            {this.renderRadioBtn("warning", "assignment", "과제")}
            {this.renderRadioBtn("secondary", "etc", "기타")}
          </FormGroup>
          <Row form>
            <Col>
              <FormGroup>
                <Label><strong>*시작날짜</strong></Label>
                <Input type="date" name="startDate"
                defaultValue={this.props.event ? this.props.event.startDate : this.getCurrentDateFormat()} />
              </FormGroup>
            </Col>
            <Col>
              <FormGroup>
                <Label><strong>*마감날짜</strong></Label>
                <Input type="date" name="endDate"
                defaultValue={this.props.event ? this.props.event.endDate : this.getCurrentDateFormat()}></Input>
              </FormGroup>
            </Col>
          </Row>
        </React.Fragment>
      } handleClose={this.props.handleClose} />
    );
  }
}

export class FullEventModal extends React.Component {
  // PROPS: toggle, handleClose, onClosed
  // events, votes, date, toggleAlert

  renderEvents() {
    if (!this.props.events || !this.props.votes) {
      return;
    }
    return (
      <React.Fragment>
        {this.props.events.map((event, index) => 
          <Event event={event} vote={this.props.votes.find(
            vote => vote.event_id === event.id
          )} key={event.id.toString() + ";더보기"} toggleAlert={this.props.toggleAlert} />
        )}
      </React.Fragment>
    );
  }

  render() {
    return (
      <Modal isOpen={this.props.toggle} onClosed={this.props.onClosed} size="lg">
        <ModalHeader style={{backgroundColor: "#f6f6f7"}}>
          {renderDateAsString("fullString", this.props.date)}
        </ModalHeader>
        <ModalBody>
          {this.renderEvents()}
        </ModalBody>
        <ModalFooter style={{backgroundColor: "#f6f6f7"}}>
          <Button color="danger" onClick={this.props.handleClose}>
            닫기
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export class PostDeleteModal extends React.Component {
  // props: toggle, handleClose, eventid
  constructor(props) {
    super(props);
    this.handleDelete = this.handleDelete.bind(this);
  }

  handleDelete(e) {
    e.preventDefault();
    axios({
      method: 'delete',
      url: '/events/',
      data: {
        eventId: this.props.eventid,
      },
      headers: {"Authorization": "Token " + JSON.parse(localStorage.getItem("key"))},
    })
    .catch(error => alert(error))
    .then(window.location.href = "/");
  }

  render() {
    return (
      <ModalTemplate isOpen={this.props.toggle} size="md" header="일정 삭제" 
      modalBody={
        <React.Fragment>
          <Label>정말로 일정을 삭제 하시겠습니까?</Label>
        </React.Fragment>
      } handleClose={this.props.handleClose} handleSubmit={this.handleDelete}
      submitBtnName="삭제" cancelBtnName="취소"
      />
    );
  }
}