import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Sidebar from "@/components/sidebar"
import Sidebar2 from "@/components/sidebar/sidebar2"
import { useNavigate } from "react-router-dom"

const SettingsPage= () => {
  const [isPrivate, setIsPrivate] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [message, setMessage] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  // Optional: Fetch current privacy setting on load (assuming you have a route for this)
  useEffect(() => {
    const fetchPrivacySetting = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/get-privacy", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("user:token")}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch privacy setting");
        }

        const data = await response.json();
        setIsPrivate(data.isPrivate);
      } catch (error) {
        console.error('Error fetching privacy setting:', error);
      }
    };

    fetchPrivacySetting();
  }, []);
  

  const handlePrivacyChange = async (checked) => {
    setIsPrivate(checked);

    try {
      const response = await fetch("http://localhost:8000/api/set-privacy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ isPrivate: checked }),
      });

      if (!response.ok) {
        throw new Error("Failed to update privacy setting");
      }

      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      setMessage(error.message || 'An privacy error occurred');
    }
  };

  const handleChangePassword = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("user:token")}`,
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage('Password updated successfully');
      } else {
        setMessage(data || 'Error updating password');
      }
    } catch (error) {
      setMessage('An pass error occurred');
    }
  };


   // Function to handle delete account
   const handleDeleteAccount = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('user:token')}`,
        },
        body: JSON.stringify({ password: deleteConfirmation }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Account deleted successfully');
        
        localStorage.removeItem("user:token");
        navigate('/account');
        // Optionally, you could log the user out or redirect them after successful deletion
      } else {
        setMessage(data.message || 'Error deleting account');
      }
    } catch (error) {
      setMessage('An error occurred while deleting the account');
    }

   
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
        <Sidebar />
      <div className="md:ml-72">
        <Sidebar2 />
        <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-12">
          {/* Private/Public account switch */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Account Privacy</h2>
              <p className="text-sm text-muted-foreground">Make your account private</p>
            </div>
             <Switch
                checked={isPrivate}
                onCheckedChange={handlePrivacyChange}
                aria-label="Toggle account privacy"
            />
          </div>
            {message && <p className="bg-red-500">{message}</p>}

          {/* Change password section */}
          <div>
      <h2 className="text-lg font-semibold mb-4">Change Password</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="current-password">Current Password</Label>
          <Input 
            type="password" 
            id="current-password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="new-password">New Password</Label>
          <Input 
            type="password" 
            id="new-password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} 
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm New Password</Label>
          <Input 
            type="password" 
            id="confirm-password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} 
          />
        </div>
        <Button onClick={handleChangePassword}>Update Password</Button>
      </div>
    </div>

          {/* About Us section */}
          <Card>
            <CardHeader>
              <CardTitle>About Us</CardTitle>
              <CardDescription>Learn more about our social media app</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Welcome to our innovative social media platform! We're dedicated to connecting people 
                from all walks of life, fostering meaningful conversations, and creating a safe space 
                for self-expression. Our app is built on the principles of privacy, inclusivity, and 
                user empowerment.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Founded in 2023, we've quickly grown to become a vibrant community of millions of users 
                worldwide. Our team is constantly working to improve your experience and introduce new 
                features that matter to you.
              </p>
              <Button className="mt-4">Learn More</Button>
            </CardContent>
          </Card>

          {/* Delete account section */}
          <div className="pt-6 border-t">
      <h2 className="text-lg font-semibold text-destructive mb-4">Delete Account</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Once you delete your account, there is no going back. Please be certain.
      </p>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="mt-4">
            <Label htmlFor="delete-confirmation" className="text-sm font-medium">
              Enter your password to confirm:
            </Label>
            <Input
              id="delete-confirmation"
              type="password"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="mt-1"
            />
          </div>
          {message && <p>{message}</p>} {/* Display the message */}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default SettingsPage;