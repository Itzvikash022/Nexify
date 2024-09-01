import React, { useState } from "react";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { useNavigate } from "react-router-dom";
import bg_img from "../../assets/login_background.jpg";
import login_side from "../../assets/login_side.jpeg";
import ClipLoader from "react-spinners/ClipLoader";

const Form = ({
  // isSignInPage = true
  isSignInPage = window.location.pathname.includes("signin"),
}) => {
  // const [isSignInPage, setisSignInPage] = useState(true)
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    ...(!isSignInPage && { username: "" }),
    email: "",
    password: "",
    occupation: "",
    img: null,
  });
  const [url, setUrl] = useState("");
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    // Validate file type
    if (file && !file.type.startsWith("image/")) {
        alert("Please select a valid image file.");
        return;
    }

    setData({ ...data, img: file });
};
  console.log(data);

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("file", data.img);
    formData.append("upload_preset", "nexify");
    formData.append("cloud_name", "dlam9v1ev");

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dlam9v1ev/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    if (res.ok) {
      console.log("Upload successful");
      const responseJson = await res.json();
      return responseJson.secure_url;
    } else {
      console.error("Failed to upload image");
      return "error";
    }
  };
  let secure_url = null;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log(JSON.stringify(data));
    
    if(!isSignInPage){
      secure_url = await uploadImage();
      
        if (secure_url === "error" || !secure_url) {
            console.error("Failed to retrieve secure URL");
            setLoading(false); // Stop loading if there is an error
            alert("Failed to create Post : Image not found"); // Inform the user about the issue
            return;
        }
        
        if (secure_url) {
            setUrl(secure_url);
            // console.log('URL after setUrl:', secure_url);
        } else {
            console.error("Failed to retrieve secure URL");
        }
    }

    const res = await fetch(
      `http://localhost:8000/api/${isSignInPage ? "login" : "register"}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        
        body: JSON.stringify(
          isSignInPage
            ? {
                email: data.email,
                password: data.password,
              }
            : {
                username: data.username,
                email: data.email,
                password: data.password,
                occupation: data.occupation,
                img: secure_url,
              }
        ),
      }
    );

    console.log(res, "res");

    if (isSignInPage) {
      // Login handling
      if (res.status === 201) {
        const { token, user } = await res.json();
        console.log(token, user, "response");
        localStorage.setItem("user:token", token);
        navigate("/");
      } else if (res.status === 401) {
        const errorText = await res.text();
        setLoading(false)
        alert(errorText || "Invalid Credentials");
      } else {
        setLoading(false);
        alert("Some error occurred... Please try again later");
      }
    } else {
      // Registration handling
      if (res.status === 201) {
        setLoading(false);
        navigate("/ac/signin");
      } else if (res.status === 400) {
        setLoading(false);
        const errorText = await res.text();
        alert(errorText || "User already exists");
      } else {
        setLoading(false);
        alert("Registration failed. Please try again later");
      }
    }

    
  };
  return (
    <div
      className="bg-slate-100 bg-center bg-cover h-screen w-full flex justify-center items-center"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="h-[770px] w-[1500px] rounded-xl opacity-90 bg-white flex justify-center items-center shadow-xl box-border ">
        {loading ? (
          <ClipLoader size={55} />
        ) : (
          <>
            <div
              className={`h-full w-full flex flex-col justify-center items-center  ${
                !isSignInPage && "order-2"
              }`}
            >
              <div className="text-[50px] font-serif font-bold">Welcome</div>
              <div className="font-semibold text-[18px]">Please {isSignInPage ? "Login" : "Sign Up"} to continue...!</div>
              <form
                className="w-[350px]"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {!isSignInPage && (
                  <>
                <div className="mb-4">
                  <Input
                    type="file"
                    id="image"
                    name="Profile Picture"
                    className="hidden"
                    onChange={handleImageChange}
                    required={false}
                  />
                  <label
                    htmlFor="image"
                    className="cursor-pointer p-4 border shadow-sm rounded-md bg-slate-100 hover:bg-gray-200 text-center block"
                  >
                    {data?.img?.name || 'Profile Picture'}
                  </label>
                </div>



                    <Input
                      label="Username"
                      type="text"
                      placeholder="Enter your Username"
                      value={data.username}
                      onChange={(e) =>
                        setData({ ...data, username: e.target.value })
                      }
                    />
                    <Input
                      label="Occupation"
                      type="text"
                      placeholder="Enter your Occupation"
                      value={data.occupation}
                      onChange={(e) =>
                        setData({ ...data, occupation: e.target.value })
                      }
                    />
                  </>
                )}
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter your email"
                  value={data.email}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  value={data.password}
                  onChange={(e) =>
                    setData({ ...data, password: e.target.value })
                  }
                />
                <Button label={isSignInPage ? "Login" : "SignUp"} className="w-full mt-[13px] h-[44px]"/>
              </form>
              <div
                className="cursor-pointer font-semibold mt-[10px] text-[16px] hover:underline"
                onClick={() =>
                  navigate(`${isSignInPage ? "/ac/signup" : "/ac/signin"}`)
                }
              >
                {isSignInPage
                  ? "Create New Account"
                  : "Already a existing user? Signin here"}
              </div>
            </div>
            <div
              className={`bg-gray-200 h-full w-full ${
                !isSignInPage && "order-1"
              }`}
            >
              <div
                className={`h-full w-[750px] bg-gray-200 ${
                  !isSignInPage ? "order-1" : "order-2"
                }`}
                style={{
                  backgroundImage: `url(${login_side})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Form;
