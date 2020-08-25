import React from 'react';
import { CustomValidInput } from './util.js';
import { 
	Form, FormGroup, FormText, Label, Row, Col, Button
} from 'reactstrap';

class Register extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameVal: false,
      passwordVal: false,
      retryVal: false,
      phoneVal: false,
      nicknameVal: false,
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();
    const state = this.state;

    for (let key in state) {
      if (state[key] !== true) {
        alert("bad");
        return;
      }
    }
    alert("good");
  }

  render() {
    return (
      <Form className="my-5 mx-5 px-5 py-4" 
        onSubmit={this.handleSubmit}>
        <Row form><Col md={3}>
        	<FormGroup>
        		<Label>아이디</Label>
        		<CustomValidInput type="text" field="username" 
                  name="username" placeholder="hondgildong123" autoComplete="off" 
                  callback={(val) => this.setState({usernameVal: val})}/>
            <FormText>영문과 숫자를 섞어서 6자 이상이 되어야 합니다.</FormText>
        	</FormGroup>
        </Col></Row>
      	<Row form>
      		<Col md={3}>
    	    	<FormGroup>
    	    		<Label>패스워드</Label>
    	    		<CustomValidInput type="password" field="password" 
                name="password" placeholder=""
                autoComplete="off" callback={(val) => this.setState({passwordVal: val})}/>
              <FormText>영문과 숫자를 섞어서 12자 이상이 되어야 합니다.</FormText>
    	    	</FormGroup>
          </Col>
          <Col md={3}>
    	    	<FormGroup>
    	    		<Label>패스워드 재입력</Label>
    	    		<CustomValidInput type="password" field="password" 
                name="retryPassword" placeholder=""
                autoComplete="off" callback={(val) => this.setState({retryVal: val})}/>
    	    	</FormGroup>
          </Col>
          <Label className="h5 my-5">
          "그거 아세요? 12자리 비밀번호는 평균 4년이면 해독이 가능하지만,
          한자리만 늘어나도 100년이 걸릴수 있어요!"</Label>
      	</Row>
        <Row form><Col md={3}>
          <FormGroup>
            <Label>전화번호</Label>
            <CustomValidInput type="tel" field="phone" 
                name="phone" placeholder="01012349876"
                autoComplete="off" callback={(val) => this.setState({phoneVal: val})}/>
          </FormGroup>
        </Col></Row>
        <Row form><Col md={3}>
          <FormGroup>
            <Label>닉네임</Label>
            <CustomValidInput type="text" field="nickname" 
                name="nickname" placeholder="hong123"
                autoComplete="off" callback={(val) => this.setState({nicknameVal: val})}/>
            <FormText>영문과 숫자만을 이용하여 5자 이상, 20자 미만이 되어야 합니다.</FormText>
          </FormGroup>
        </Col></Row>
        <Button color="dark" className="my-4">회원가입</Button>
      </Form>
    );
  }
}

function RegisterApp() {
  return(
    <div>
      <div className="border rounded my-4 mx-2 py-5" 
        style={{backgroundColor: "#8ce1ff"}}>
        <Label className="display-4 my-5 ml-4 pl-5">반갑습니다!</Label>
        <Register />
      </div>
    </div>
  );
}

export default RegisterApp;