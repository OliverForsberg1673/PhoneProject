const token = localStorage.getItem("token");
if (!token) {
  const signupFormDiv = document.getElementById("signup-form-div");
  signupFormDiv.innerHTML = `
  <h1>Sign Up</h1>
  <form action="post" id="signup-form">
    <label for="signup-email">Email</label>
    <input type="email" name="signup-email" id="signup-email" />
    <label for="signup-password">Password</label>
    <input type="password" name="signup-password" id="signup-password" />
    <input type="submit" value="Sign Up" />
  </form>
  <br />
  <hr />
  `;
  const signupForm = document.getElementById("signup-form");
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    const res = await fetch("http://localhost:3000/signup", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    if (res.status === 200) {
      const token = await res.text();
      localStorage.setItem("token", token);
      location.reload();
    } else {
      alert(await res.text());
      location.reload();
    }
  });

  const loginFormDiv = document.getElementById("login-form-div");
  loginFormDiv.innerHTML = `
    <h1>Login</h1>
      <form action="post" id="login-form">
      <label for="login-email">Email</label>
      <input type="email" name="login-email" id="login-email" />
      <label for="login-password">Password</label>
      <input type="password" name="login-password" id="login-password" />
      <input type="submit" value="Login" />
    </form>
    <br />
    <hr />
  `;
  const loginForm = document.getElementById("login-form");
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let email = document.getElementById("login-email").value;
    let password = document.getElementById("login-password").value;
    const res = await fetch("http://localhost:3000/login", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    if (res.status === 200) {
      const token = await res.text();
      localStorage.setItem("token", token);
      location.reload();
    } else {
      alert(await res.text());
      location.reload();
    }
  });
} else {
  const logoutButtonDiv = document.getElementById("logout-button-div");
  logoutButtonDiv.innerHTML = `
    <button type="button" id="logout-button" >Logout</button>
  `;
  const logoutButton = document.getElementById("logout-button");
  logoutButton.addEventListener("click", (e) => {
    localStorage.removeItem("token");
    location.reload();
  });
}
