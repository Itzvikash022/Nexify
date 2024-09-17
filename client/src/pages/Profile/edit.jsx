import { React, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Sidebar from "@/components/sidebar";
import { useNavigate } from "react-router-dom";
import Sidebar2 from "@/components/sidebar/sidebar2";
import { Loader2, Upload, User } from "lucide-react";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [user, setUser] = useState({});
  const [url, setUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const response = await fetch("http://localhost:8000/api/user", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
      });
      const userData = await response.json();
      setUser(userData.user);
      setLoading(false);
    };
    getUsers();
  }, []);
  
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setData({ ...data, img: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file.");
    }
  };

  const uploadImage = async () => {
    setLoading(true);
    if (!data.img) return user.profileImgUrl;

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
      setLoading(false);
      return user.profileImgUrl;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const secure_url = await uploadImage();
    setUrl(secure_url);

    const updatedData = {
      ...(data.username && { username: data.username }),
      ...(data.email && { email: data.email }),
      ...(data.password && { password: data.password }),
      ...(data.occupation && { occupation: data.occupation }),
      ...(data.bio && { bio: data.bio }),
      ...(data.name && { name: data.name }),
      profileImgUrl: secure_url,
    };

    const res = await fetch(`http://localhost:8000/api/edit-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify(updatedData),
    });

    setLoading(false);

    if (res.status === 200) {
      navigate("/profile");
    } else {
      const errorText = await res.text();
      alert(errorText || "Update failed. Please try again later");
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-muted">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <main className="flex-1 overflow-auto grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 p-8">
          <div className="hidden md:block" />
          <div className="flex flex-col gap-6">
            <div className="grid gap-6">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>Edit User Profile</CardTitle>
                  <CardDescription>
                    Update your profile information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="image" className="block text-center">
                    Profile Picture
                  </Label>
                  <div className="flex justify-center">
                    <div
                      className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 cursor-pointer"
                      onClick={() => document.getElementById("image").click()}
                    >
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile preview"
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="image"
                      onChange={handleImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>
                </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" placeholder="Enter your username" 
                    value={data.username || user.username || ""}
                    onChange={(e) => setData({ ...data, username: e.target.value })}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      value={data.name || user.name || ""}
                      onChange={(e) => setData({ ...data, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Occupation</Label>
                    <Input
                      id="name"
                      placeholder="Enter occupation here"
                      value={data.occupation || user.occupation || ""}
                onChange={(e) => setData({ ...data, occupation: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      type="email"
                      value={data.email || user.email || ""}
                      onChange={(e) => setData({ ...data, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      placeholder="Enter your bio"
                      maxLength="150"
                      className="min-h-[100px]"
                      value={data.bio || user.bio || ""}
                      onChange={(e) => setData({ ...data, bio: e.target.value })}
                    /> <p className="text-[10px]">Max - 150 Characters allowed!!</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="ml-auto" onClick={handleSubmit} disabled={loading}>{loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save</Button>
                  <Button className='ml-6' onClick={() => navigate('/')}>Cancel</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
export default EditProfile;
