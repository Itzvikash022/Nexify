import React, { useState } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Upload, User } from "lucide-react"

export default function LoginSignupForm() {
  const [isSignInPage, setIsSignInPage] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    name: "",
    img: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setData({ ...data, img: file });
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setError("Please select a valid image file.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (!isSignInPage && data.img) {
        const formData = new FormData();
        formData.append("file", data.img);
        formData.append("upload_preset", "nexify");
        formData.append("cloud_name", "dlam9v1ev");

        const res = await fetch("https://api.cloudinary.com/v1_1/dlam9v1ev/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");
        const responseJson = await res.json();
        imageUrl = responseJson.secure_url;
      }

      const res = await fetch(`http://localhost:8000/api/${isSignInPage ? "login" : "register"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isSignInPage
            ? { email: data.email, password: data.password }
            : { ...data, img: imageUrl }
        ),
      });

      if (res.ok) {
        if (isSignInPage) {
          const { token } = await res.json();
          localStorage.setItem("user:token", token);
          window.location.href = "/"; // Redirecting manually
        } else {
          setIsSignInPage(true);
        }
      } else {
        const errorText = await res.text();
        setError(errorText || "An error occurred. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-purple-500 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {isSignInPage ? "Sign In" : "Sign Up"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isSignInPage && (
              <>
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
                <Input
                  placeholder="Username"
                  value={data.username}
                  onChange={(e) => setData({ ...data, username: e.target.value })}
                  required
                />
                <Input
                  placeholder="Name"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </>
            )}
            <Input
              type="email"
              placeholder="Email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
              required
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSignInPage ? "Sign In" : "Sign Up"}
            </Button>
          </form>
          {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
          <p className="mt-4 text-sm text-center">
            {isSignInPage ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setIsSignInPage(!isSignInPage)}
              className="text-blue-500 hover:underline"
            >
              {isSignInPage ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
