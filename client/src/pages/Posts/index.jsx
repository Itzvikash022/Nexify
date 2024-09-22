import React, { useState, useEffect } from "react";
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
import Sidebar2 from "@/components/sidebar/sidebar2";
import { useNavigate } from "react-router-dom";
import { Loader2, Upload, User } from "lucide-react";

const CreatePost = () => {
  const [data, setData] = useState({
    caption: "",
    desc: "",
    img: null,
    location: "",
  });

  const [url, setUrl] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && !file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    setData({ ...data, img: file });
    setPreviewUrl(URL.createObjectURL(file)); // Set preview URL
  };

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      const response = await fetch("https://nexify-backend.vercel.app/api/user", {
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
      console.error("Failed to upload image");
      return "error";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const secure_url = await uploadImage();

    if (secure_url === "error" || !secure_url) {
      setLoading(false);
      alert("Failed to create Post: Image not found");
      return;
    }

    const response = await fetch("https://nexify-backend.vercel.app/api/new-post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("user:token")}`,
      },
      body: JSON.stringify({
        caption: data.caption,
        desc: data.desc,
        url: secure_url,
        location: data.location,
      }),
    });

    if (response.ok) {
      navigate("/");
    } else {
      setLoading(false);
      alert("Failed to create post");
    }
  };

  useEffect(() => {
    if (url) {
      console.log("Updated URL:", url);
    }
  }, [url]);

  return (
    <div className="flex min-h-screen w-full bg-muted items-center">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Sidebar2 />
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex-1 bg-muted/40 px-4 py-6 sm:px-6 sm:py-12"
        >
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-[1fr_2fr]">
            <div className="flex flex-col items-center justify-center rounded-lg bg-background p-6 shadow-sm">
              <Input
                type="file"
                id="image"
                name="PostImage"
                variant="outline"
                className="w-full"
                onChange={handleImageChange}
                required={false}
              />

              {/* Display the image preview after selection */}
              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Selected Preview"
                    className="w-auto h-auto object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Create Post</CardTitle>
                <CardDescription>
                  Share your thoughts, photos, and more with your followers.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    placeholder="Caption..."
                    name="title"
                    value={data.caption}
                    onChange={(e) =>
                      setData({ ...data, caption: e.target.value })
                    }
                    required={true}
                    MaxLength="70"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Add a description..."
                    className="min-h-[100px]"
                    name="Description"
                    value={data.desc}
                    onChange={(e) => setData({ ...data, desc: e.target.value })}
                    required={true}
                    MaxLength="250"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    placeholder="Location..."
                    name="location"
                    value={data.location}
                    onChange={(e) =>
                      setData({ ...data, location: e.target.value })
                    }
                    required={true}
                    MaxLength="30"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Post
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePost;
