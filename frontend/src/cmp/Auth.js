import React, {Component} from 'react';

class Auth extends Component{
    login(){
        console.warn("state",this.state)
        fetch("http://localhost:7900/api/login",{
            method: "POST",
            headers: {
                "Accept" : "application/json",
                "Content-Type" :"application/json",
            },
            body: JSON.stringify(this.state),
            
        }).then((result) => {
            
            result.json().then((resp)=>{
                console.log(resp.token)
                localStorage.setItem("auth",JSON.stringify(resp.token))
                if(!resp.token){
                    alert("invalid credintials")
                }else{
                    alert("you have successfully logged in")
            

                
                }
            })
        })
    }
    render() {
        return (
            
            <body >
            <div class ="loginbox" >
                <img src="data:image/png;base64,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" class="avatar" />
                <h1>Login Here</h1>
                <form>
                    <p>Username</p>
                    <input
            type="text"
            placeholder="Enter email"
            onChange={e => {
              this.setState({ email: e.target.value });
            }}
          />
                    <p>Password</p>
                    <input
            type="password"
            placeholder="Enter password"
            onChange={e => {
              this.setState({ password: e.target.value });
            }}
          />
          <input type ="button" name="" value="Login" onClick={() => this.login()}/>
                    <a href="/Password">Forget Password?</a><br />
                    <a href="/Signup">Don't have an account?</a>
                </form>
                </div>
            
        </body>
        );
      }
    }
    
    export default Auth;
    
