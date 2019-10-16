import React from 'react';
import { Component } from 'react';
import { Exception } from 'handlebars';


class Login extends Component {

  constructor (props) {
    super();
    this.state = {
      name: '',
      email: '',
      password: '',
    }
    this.handleOnChangeValue = this.handleOnChangeValue.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.logout = this.logout.bind(this);
  }

  handleOnChangeValue(e) {
    this.setState({
      [e.target.name]: e.target.value,
    });
  }

  handleSubmit(e) {
    e.preventDefault();
    let url = 'http://localhost/draft-backend/public/api/login';
    if (this.state.email === '' || this.state.password === '') {
      alert('Please enter your E-mail and password.');
      return null;
    }
    fetch(url, {
        method: 'post',
        body: JSON.stringify(this.state),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-type': 'application/json'
        }
    })
    .then((res) => {
      if (!res.ok && res.status === 400) {
        console.log(res);
        alert('Invalid credentials');
        throw new Exception('Invalid credentials');
      }      
      return res.json();
    })
    .then((res) => {
      this.setState({
        name: res.user.name,
      });
      localStorage.setItem('user_id', res.user_id);
      localStorage.setItem('api_token', res.api_token);
      this.props.setLoggedInStatus(true);
    })
    .catch((err) =>console.log('error', err));
  }

  logout() {
    this.props.setLoggedInStatus(false);
    localStorage.removeItem('api_token');
    localStorage.removeItem('user_id');
  }

  render () {
    return (
      <div>
        { this.props.isUserLoggedIn ? (
          
          <div className="row" style={{marginTop: 30}}>
            <div className="col-md-8">
              <h4>
                Welcome { this.state.name }
              </h4>
            </div>
            <div className="col-md-4">
              <button type="button" className="btn btn-outline-primary float-right" onClick={this.logout}> Sign out </button>
            </div>
          </div>
        ) : (
          <div className="row">
            
            <div className="col-md-4 offset-md-4 mx-auto" style={{marginTop: 200}}>

              <h4>
                Login
              </h4>

              <form onSubmit={this.handleSubmit}>
                <input type="text" name="email" placeholder="E-mail" className="form-control" onChange={this.handleOnChangeValue} />
                <br/>
                <input type="password" name="password" placeholder="Password"  className="form-control" onChange={this.handleOnChangeValue} />
                <br/>
                <button type="submit" className="btn btn-outline-primary float-right"> Sign in </button>
                {/* <button type="button" className="btn btn-outline-success"> Sign up </button> */}
              </form>

            </div>

          </div>
        ) }
      </div>
    )
  }

}

export default Login;