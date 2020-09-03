import React from 'react';
import {
  Modal, ModalHeader, ModalBody, ModalFooter, Form, Button, Input,
  Alert,
} from 'reactstrap';

export function ModalTemplate(props) {
  // props: 
  // isOpen, size, header, handleSubmit, modalBody, handleClose,
  // submitBtnName, cancelBtnName
  return (
    <div>
      <Modal isOpen={props.isOpen} size={props.size}>
        <ModalHeader style={{backgroundColor: "#f6f6f7"}}>{props.header}</ModalHeader>
        <Form onSubmit={props.handleSubmit}>
          <ModalBody>
          {props.modalBody}
          </ModalBody>
          <ModalFooter style={{backgroundColor: "#f6f6f7"}}>
            <Button color="success">
              {props.submitBtnName ? props.submitBtnName : "입력"}
            </Button>
            <Button color="danger" 
            onClick={props.handleClose}>
              {props.cancelBtnName ? props.cancelBtnName : "취소"}
            </Button>
          </ModalFooter>
        </Form>
      </Modal>
    </div>
  );
}

export class AlertWindow extends React.Component {
  render() {
    return (
      <Alert color="danger" className="my-0 fixed-top" 
      isOpen={this.props.toggle} toggle={this.props.handleClose}>
        {this.props.alertType}
      </Alert>
    );
  }
}

export class CustomValidInput extends React.Component {
  // props: callback, 
  // Input(type, field, name, placeholder, autoComplete)
  constructor(props) {
    super(props);
    this.state = {
      fields: {},
      errors: {},
    };
  }

  handelValidation() {
    let fields = this.state.fields;
    let errors = this.state.errors;
    let isFormValid = true;

    if (typeof fields["username"] !== "undefined") {
      if (!fields["username"].match(/^[\w-]{6,50}$/)) {
        errors["username"] = "Id error.";
        isFormValid = false;
      }
    }
    if (typeof fields["password"] !== "undefined") {
      if (!fields["password"].match(/^[\w`~!@#$%^&*(),.<>/?;:\\+=-]{12,100}$/)) {
        errors["password"] = "Password error.";
        isFormValid = false;
      }
    }
    if (typeof fields["passwordAgain"] !== "undefined") {
      if (!fields["passwordAgain"].match(/^[\w-]{12,100}$/)
        || fields["password"] !== fields["passwordAgain"]) {
        errors["passwordAgain"] = "Former password error.";
        isFormValid = false;
      }
    }
    if (typeof fields["phone"] !== "undefined") {
      if (!fields["phone"].match(/^[0-9]{11}$/)) {
        errors["phone"] = "Phone number error.";
        isFormValid = false;
      }
    }
    if (typeof fields["nickname"] !== "undefined") {
      if (!fields["nickname"].match(/^[\wㄱ-ㅎㅏ-ㅣ가-힣-]{5,30}/)) {
        errors["nickname"] = "Nickname error.";
        isFormValid = false;
      }
    }
    if (isFormValid) {
      return isFormValid;
    } else {
      return errors;
    }
  }

  handelChange(field, e) {
    let fields = this.state.fields;
    fields[field] = e.target.value;
    this.setState({fields: fields}, 
      this.props.callback(this.handelValidation())
    );
  }

  renderInput() {
    return (
      <Input type={this.props.type} name={this.props.name} 
        placeholder={this.props.placeholder} 
        onChange={this.handelChange.bind(this, this.props.field)} 
        value={this.state.fields[this.props.field] || ''} required 
        autoComplete={this.props.autoComplete} 
      />
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.renderInput()}
      </React.Fragment>
    );
  }
}

export function renderTag(tag) {
    let string, color;
    switch(tag) {
      case "important":
        color = "danger"; string = "중요한!"; break;
      case "gather":
        color = "primary"; string = "모집,선발"; break;
      case "bachelor":
        color = "info"; string = "학사"; break;
      case "assignment":
        color = "warning"; string = "과제"; break;
      case "etc":
        color = "secondary"; string = "기타"; break;
      default:
        color = "dark"; string = null;
    }
    return {color: color, string: string};
  }

export function renderDateAsString(dateType, date) {
  if (dateType === "weekday") {
    switch(date) {
      case 0:
        return "일";
      case 1:
        return "월";
      case 2:
        return "화";
      case 3:
        return "수";
      case 4:
        return "목";
      case 5:
        return "금";
      case 6:
        return "토";
      default:
        return -1;
    }
  } 
  else if (dateType === "month") {
    if (date.length >= 2 && date[0] === 0) {
      return date[1] + "월";
    }
    return date + "월";
  }
  else if (dateType === "fullString") {
    return (
      date.getFullYear() + "년 " + (date.getMonth()+1) + "월 " + date.getDate() + "일"
    );
  }
  else if (dateType === "fullNumeral") {
    return (
      ("0" + (date.getMonth() + 1)).slice(-2) + "-" + ("0" + date.getDate()).slice(-2) 
      + "-" + date.getFullYear()
    );
  }
  else {
    return -1;
  }
}

export function getDateDifference(date) {
  const now = new Date();
  const diffInTime = now.getTime() - date.getTime();
  const diffInSecs = Math.floor(diffInTime / 1000);
  const diffInMins = Math.floor(diffInSecs / 60);
  const diffInHours = Math.floor(diffInMins / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInMonths / 12);
  const returnValue = {
    secs: (diffInSecs - diffInMins*60),
    mins: (diffInMins - diffInHours*60),
    hours: (diffInHours - diffInDays*24),
    days: diffInDays,
    months: diffInMonths,
    years: diffInYears
  };
  return returnValue;
}

export function isDateEqual(date1, date2=null) {
  if (date2 === null) { 
    // check today
    date2 = new Date();
  }
  const date1Str = date1.getFullYear().toString()
    + date1.getMonth() + date1.getDate();
  const date2Str = date2.getFullYear().toString() 
    + date2.getMonth() + date2.getDate();

  return (date1Str === date2Str ? true : false);
}

export function getFormattedDate(date) {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const formDate = new Date(date - tzoffset).toISOString().substr(0,10);
  return formDate;
}