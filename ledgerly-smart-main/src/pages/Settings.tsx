import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Building, Bell, Shield, Download } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

const Settings = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your application preferences and configurations
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Profile Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="admin" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="admin@company.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" defaultValue="+91 98765 43210" />
            </div>
            <Button className="w-full">Update Profile</Button>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Company Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" defaultValue="BillPro Solutions" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyGst">GST Number</Label>
              <Input id="companyGst" defaultValue="29ABCDE1234F1Z5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea id="companyAddress" defaultValue="123 Business Park, Tech City, State 560001" />
            </div>
            <Button className="w-full">Update Company</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notification Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates for important events</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Bill Reminders</Label>
                <p className="text-sm text-muted-foreground">Get notified about upcoming due dates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Overdue Alerts</Label>
                <p className="text-sm text-muted-foreground">Alert when bills become overdue</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Reports</Label>
                <p className="text-sm text-muted-foreground">Receive weekly performance summaries</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Security Settings</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" />
            </div>
            <Button className="w-full">Change Password</Button>
            
            <Separator className="my-4" />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5" />
            <span>Application Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Bill Generation</h4>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="billPrefix">Bill Number Prefix</Label>
                  <Input id="billPrefix" defaultValue="INV-" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gstRate">Default GST Rate (%)</Label>
                  <Input id="gstRate" type="number" defaultValue="18" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Default Due Date (Days)</Label>
                  <Input id="dueDate" type="number" defaultValue="30" />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Preferences</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-calculate Totals</Label>
                    <p className="text-sm text-muted-foreground">Automatically calculate bill totals</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Include GST in Bills</Label>
                    <p className="text-sm text-muted-foreground">Add GST calculations to all bills</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                  </div>
                  <Switch 
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex justify-between">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Download className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Export Data</div>
                <div className="text-sm text-muted-foreground">Download all your data</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Backup Data</div>
                <div className="text-sm text-muted-foreground">Create data backup</div>
              </div>
            </Button>
            <Button variant="outline" className="h-auto p-4">
              <div className="text-center">
                <SettingsIcon className="h-6 w-6 mx-auto mb-2" />
                <div className="font-medium">Import Data</div>
                <div className="text-sm text-muted-foreground">Import from other systems</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;