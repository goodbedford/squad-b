console.log("validate works");

$("#login-form").validate({
  rules:{
    email: {
      required: true
    },
    password:{
      required: true
    } 
  },
  messages: {
    email:{
      required: "Email is required."
    },
    password:{
      required: "Password is required."
    }
  }
});
$("#signup-form").validate({
  rules:{
    email: {
      required: true
    },
    password:{
      required: true
    },
    passwordMatch:{
      required: true,
      equalTo: "#password"
    } 
  },
  messages: {
    email:{
      required: "Email is required."
    },
    password:{
      required: "Password is required."
    },
    passwordMatch:{
      required: "Password needs to match."
    }
  }
});