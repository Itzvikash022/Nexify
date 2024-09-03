import React, { useState } from "react";
import Button from "../../components/button/Button";
import Input from "../../components/input/Input";
import { useNavigate } from "react-router-dom";
import bg_img from "../../assets/login_background.jpg";
import login_side from "../../assets/login_side.jpeg";
import ClipLoader from "react-spinners/ClipLoader";
import Modal from "../../components/modal/Modal"; // Import the custom modal component

const Form = ({
  isSignInPage = window.location.pathname.includes("signin"),
}) => {
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
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.type.startsWith("image/")) {
      setModalMessage("Please select a valid image file.");
      setShowModal(true);
      return;
    }
    setData({ ...data, img: file });
  };

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
      const responseJson = await res.json();
      return responseJson.secure_url;
    } else {
      return "error";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let secure_url = null;
    if (!isSignInPage) {
      secure_url = await uploadImage();
      if (secure_url === "error" || !secure_url) {
        setModalMessage("Failed to create Post: Image not found");
        setLoading(false);
        setShowModal(true);
        return;
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

    setLoading(false);

    if (res.status === 201) {
      if (isSignInPage) {
        const { token, user } = await res.json();
        localStorage.setItem("user:token", token);
        navigate("/");
      } else {
        navigate("/ac/signin");
      }
    } else if (res.status === 401 || res.status === 400) {
      const errorText = await res.text();
      setModalMessage(errorText || "Invalid Credentials");
      setShowModal(true);
    } else {
      setModalMessage("Some error occurred... Please try again later");
      setShowModal(true);
    }
  };

  return (
    <div
      className="bg-slate-100 bg-center bg-cover min-h-screen w-full flex justify-center items-center"
      style={{ backgroundImage: `url(${bg_img})` }}
    >
      <div className="h-auto max-w-screen-xl w-full md:h-[770px] rounded-xl opacity-90 bg-white flex flex-col md:flex-row justify-center items-center shadow-xl box-border p-5 md:p-0">
        {loading ? (
          <ClipLoader size={55} />
        ) : (
          <>
            <div
              className={`w-full md:w-1/2 flex flex-col justify-center items-center ${
                !isSignInPage && "order-2"
              }`}
            >
              <div className="text-[36px] md:text-[50px] font-serif font-bold">
                Welcome
              </div>
              <div className="font-semibold text-[16px] md:text-[18px] text-center">
                Please {isSignInPage ? "Login" : "Sign Up"} to continue...!
              </div>
              <form
                className="w-full max-w-[350px]"
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
                  onChange={(e) =>
                    setData({ ...data, email: e.target.value })
                  }
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
                <Button
                  label={isSignInPage ? "Login" : "Sign Up"}
                  className="w-full mt-[13px] h-[44px]"
                />
              </form>
              <div
                className="cursor-pointer font-semibold mt-[10px] text-[16px] hover:underline"
                onClick={() =>
                  navigate(`${isSignInPage ? "/ac/signup" : "/ac/signin"}`)
                }
              >
                {isSignInPage
                  ? "Create New Account"
                  : "Already an existing user? Sign in here"}
              </div>
            </div>
            <div
              className={`h-[250px] md:h-full w-full md:w-1/2 ${
                !isSignInPage && "order-1"
              }`}
            >
              <div
                className="h-full w-full bg-gray-200"
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
      {showModal && (
        <Modal
          message={modalMessage}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default Form;
