import React from 'react';
// import logo from './logo.svg';
// import './App.css';  
import { Component } from 'react';
import './RichEditor.css';

import Login from './components/Login';
import {EditorState, convertToRaw} from 'draft-js';
import EmailsTable from './components/EmailsTable';
import EmailEditor from './components/EmailEditor';
import EmailDetail from './components/EmailDetail';

class App extends Component {

  constructor() {
    super();
    this.state = {
      isUserLoggedIn: false,
      
      editorState: EditorState.createEmpty(),
      view: 'general',
      currentEmail: 0,
    }
    this.setLoggedInStatus = this.setLoggedInStatus.bind(this);
    this.onChange = (editorState) => this.setState({editorState});
    this.focus = () => this.refs.editor.focus();
    
    this.handleOnChangeValue = this.handleOnChangeValue.bind(this);

    this.setView = this.setView.bind(this);

  }

  handleOnChangeValue(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  setLoggedInStatus(value) {
    this.setState({
      isUserLoggedIn: value,
    });
  }

  

  setView(view, currentEmail) {
    this.setState({
      view,
      currentEmail
    });
  }
  
  
  render () {
   
    return (
      <div className="container">
        <Login setLoggedInStatus={this.setLoggedInStatus} isUserLoggedIn={this.state.isUserLoggedIn}/>
        <br/>
        { this.state.isUserLoggedIn && this.state.view === 'general' ? (
          <>
            <EmailsTable setView={this.setView} />
            <EmailEditor/>
          </>
        ) : null }

        { this.state.isUserLoggedIn && this.state.view === 'detail' ? (
          <EmailDetail setView={this.setView} email={this.state.currentEmail}/>
        ) : null }


      </div>
    );
  }

  componentDidMount() {
    if (localStorage.getItem('api_token')) {
      this.setState({
        isUserLoggedIn: true,
      });
    }
  }

}

export default App;
